import React from 'react';
import { View, StyleSheet } from 'react-native';

import TouchHandler from '../lib/RN_touch_handler';

export default class extends React.Component {
    constructor (props) {
        super(props);
        let { name, onTouchStart, onTouchMove, onTouchEnd, onClick, onDoubleClick, onResponderTerminationRequest } = props;
        this.touchHandler = new TouchHandler({
            name,
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onClick,
            onDoubleClick,
            onResponderTerminationRequest
        });
    }
    componentDidUpdate () {
        let { onTouchStart, onTouchMove, onTouchEnd, onClick, onDoubleClick, onResponderTerminationRequest } = this.props;
        this.touchHandler.props.onTouchStart = onTouchStart;
        this.touchHandler.props.onTouchMove = onTouchMove;
        this.touchHandler.props.onTouchEnd = onTouchEnd;
        this.touchHandler.props.onClick = onClick;
        this.touchHandler.props.onDoubleClick = onDoubleClick;
        this.touchHandler.props.onResponderTerminationRequest = onResponderTerminationRequest;
    }
    componentWillUnmount () {
        this.doubleClickTimeoutID !== null && clearTimeout(this.doubleClickTimeoutID);
    }
    render () {
        let { onTouchStart, onTouchMove, onTouchEnd, onClick, onDoubleClick, onResponderTerminationRequest, children, style, ...rest } = this.props;
        return (
            <View {...this.touchHandler.responderHandle} style={[defaultStyle.touchbleView].concat(style)} {...rest}>
                {children}
            </View>
        );
    }
}
let defaultStyle = StyleSheet.create({
    touchbleView: {
        flex: 1
    }
});