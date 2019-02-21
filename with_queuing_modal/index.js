import React from 'react';
import { Modal } from 'react-native';

let QueuingModalContext = React.createContext({
    close: () => {}
});

function getComponentName (Component) {
	return Component.displayName || Component.name || 'Component';
}

function withModalQueuing (Component, options) {
    return class QueuingModal extends React.PureComponent {
        static displayName = `withModalQueuing(${getComponentName(Component)})`;
        static setGlobalInstance (instance) {
            if ( QueuingModal._globalInstance ) {
                throw new Error(`Global ${getComponentName(Component)} is already registered.`);
            } else {
                QueuingModal._globalInstance = instance;
            }
        }
        static open (content, options) {
            QueuingModal._globalInstance.open(content, options);
        }
        static close () {
            QueuingModal._globalInstance.close();
        }
        static getDerivedStateFromProps (props, state) {
            return {
                visible: props.hasOwnProperty('visible') ? props.visible : state.visible,
                content: props.hasOwnProperty('content') ? props.content : state.content,
                options: props.hasOwnProperty('options') ? props.options : state.options
            }
        }
        constructor (props) {
            super(props);
            this.process = this.process.bind(this);
            this.open = this.open.bind(this);
            this.close = this.close.bind(this)
            this.state = {
                visible: false,
                content: null,
                options: null
            }
            this.queue = [];
        }
        process (action) {
            this.setState({
                visible: true,
                ...action
            });
        }
        beforOpen (content, options) {
            return {
                content,
                options
            }
        }
        open (content, options) {
            let action = this.beforOpen(content, options);
            if ( this.state.visible ) {
                this.queue.push(action);
            } else {
                this.process(action);
            }
        }
        beforClose (currentAction) {
            if ( currentAction.options && typeof currentAction.options.onClose === 'function' ) {
                currentAction.options.onClose();
            }
        }
        close () {
            let nextAction = this.queue.shift();
            let { visible, ...currentAction } = this.state;
            this.beforClose(currentAction, nextAction);
            if ( nextAction ) {
                this.process(nextAction);
            } else {
                this.setState({
                    visible: false
                });
            }
        }
        componentWillUnmount () {
            if ( QueuingModal._globalInstance === this ) {
                QueuingModal._globalInstance = null;
            }
        }
        render () {
            return (
                <Modal visible={this.state.visible} transparent presentationStyle="overFullScreen" animationType="fade" onRequestClose={this.state.options && this.state.options.closeByUser === false ? undefined : this.close}>
                    <QueuingModalContext.Provider value={{ close: this.close }}>
                        <Component {...this.state} {...this.props}/>
                    </QueuingModalContext.Provider>
                </Modal>
            )
        }
    }
}

export { withModalQueuing as default, QueuingModalContext };