import React from 'react';
import { TouchableWithoutFeedback, View, Image, Text, StyleSheet } from 'react-native';

import withQueuingModal, { QueuingModalContext } from '../with_queuing_modal';

import { convertPixel as cp } from '../lib/convert_pixel';

class Toast extends React.Component {
    static contextType = QueuingModalContext;
    autoClose (prevProps) {
        if ( this.timeoutId !== undefined ) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        if ( this.props.visible === true && ( !prevProps || this.props.content !== prevProps.content || this.props.options !== prevProps.options ) ) {
            this.timeoutId = setTimeout(this.context.close, 3000);
        }
    }
    componentDidMount () {
        this.autoClose();
    }
    componentDidUpdate (prevProps) {
        this.autoClose(prevProps);
    }
    componentWillUnmount () {
        this.timeoutId && clearTimeout(this.timeoutId);
    }
    render () {
        return (
            <TouchableWithoutFeedback onPress={this.context.close}>
                <View style={toastStyle.modal}>
                    <View style={toastStyle.container}>
                        {
                            this.props.options ?
                                this.props.options.icon === 'success' ? 
                                <Image source={require('./images/icon_success.png')} style={toastStyle.icon}/>
                                : null
                            : null
                        }
                        {
                            typeof this.props.content === 'string' ?
                            <Text style={toastStyle.text}>{this.props.content}</Text>
                            : typeof this.props.content === 'function' ?
                            <this.props.content/>
                            :
                            this.props.content
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
Toast = withQueuingModal(Toast);
let toastStyle = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        borderRadius: cp(8),
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: cp(20)
    },
    text: {
        color: '#fff'
    },
    icon: {
        alignSelf: 'center',
        marginBottom: cp(12),
        width: cp(36),
        height: cp(36)
    }
});

export default Toast;