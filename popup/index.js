import React from 'react';
import { TouchableWithoutFeedback, TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

import withQueuingModal, { QueuingModalContext } from '../with_queuing_modal';

import { convertPixel as cp } from '../lib/convert_pixel';

class Popup extends React.PureComponent {
    static contextType = QueuingModalContext;
    render () {
        return (
            <TouchableWithoutFeedback onPress={this.context.close}>
                <View style={style.modal}>
                    <View style={style.container}>
                        {
                            typeof this.props.content === 'string' ?
                            <Text>{this.props.content}</Text>
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
Popup = withQueuingModal(Popup);
let style = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    container: {
        maxHeight: '100%',
        backgroundColor: '#fff'
    }
});

class PopupHeader extends React.PureComponent {
    static contextType = QueuingModalContext;
    render () {
        return (
            <View style={headerStyle.header}>
                <View style={headerStyle.leftSide}>
                    {
                        this.props.hasOwnProperty('left') ?
                        typeof this.props.right === 'string' ? <Text style={headerStyle.title}>{this.props.right}</Text> : typeof this.props.right === 'function' ? <this.props.right/> : this.props.right
                        :
                        (
                            <TouchableOpacity onPress={this.context.close}>
                                <Image source={require('./images/icon_close.png')} style={headerStyle.close}/>
                            </TouchableOpacity>
                        )
                    }
                </View>
                <View style={headerStyle.main}>
                    {typeof this.props.children === 'string' ? <Text style={headerStyle.title}>{this.props.children}</Text> : typeof this.props.children === 'function' ? <this.props.children/> : this.props.children }
                </View>
                <View style={headerStyle.rightSide}>
                    {typeof this.props.right === 'string' ? <Text style={headerStyle.title}>{this.props.right}</Text> : typeof this.props.right === 'function' ? <this.props.right/> : this.props.right }
                </View>
            </View>
        )
    }
}
let headerStyle = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: cp(24),
        borderBottomWidth: cp(1),
        borderBottomColor: '#ccc',
        backgroundColor: '#fff'
    },
    leftSide: {
        flex: 1,
        flexDirection: 'row'
    },
    rightSide: {
        flex: 1,
        flexDirection: 'row-reverse'
    },
    title: {
        textAlign: 'center',
        fontSize: cp(28),
        lineHeight: cp(42),
        color: '#333'
    },
    close: {
        width: cp(26),
        height: cp(26)
    },
    extend: {
        fontSize: (24),
        color: '#aaa'
    }
})

export { Popup as default, PopupHeader };