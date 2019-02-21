import React from 'react';
import { TouchableWithoutFeedback, View, Text, TouchableHighlight, StyleSheet } from 'react-native';

import withQueuingModal, { QueuingModalContext } from '../with_queuing_modal';

import { convertPixel as cp } from '../lib/convert_pixel';

class DialogsButton extends React.PureComponent {
    render () {
        return (
            <TouchableHighlight onPress={this.props.onPress} underlayColor="#ccc" style={buttonStyle.button}>
                <Text style={this.props.highlight ? [buttonStyle.text, buttonStyle.zHighlight] : buttonStyle.text}>{this.props.text}</Text>
            </TouchableHighlight>
        )
    }
}
let buttonStyle = StyleSheet.create({
    button: {
        flex: 1,
        marginLeft: -cp(1),
        borderTopWidth: cp(1),
        borderLeftWidth: cp(1),
        borderColor: '#d3d3d5',
        padding: cp(22)
    },
    text: {
        textAlign: 'center',
        fontSize: cp(36),
        lineHeight: cp(54),
        color: '#333'
    },
    zHighlight: {
        color: '#fe895d'
    }
})

class Dialogs extends React.PureComponent {
    static contextType = QueuingModalContext;
    render () {
        let customButtons = this.props.options && this.props.options.buttons && this.props.options.buttons.length;
        return (
            <TouchableWithoutFeedback onPress={this.context.close}>
                <View style={style.modal}>
                    <View style={style.dialogs}>
                        <View style={style.content}>
                            {
                                typeof this.props.content === 'string' ?
                                <Text>{this.props.content}</Text>
                                : typeof this.props.content === 'function' ?
                                <this.props.content/>
                                :
                                this.props.content
                            }
                        </View>
                        <View style={style.buttons}>
                            <DialogsButton highlight={!customButtons} text={customButtons ? '取消' : '确定'} onPress={this.context.close}/>
                            {
                                customButtons ?
                                this.props.options.buttons.map((button) => { return <DialogsButton key={button} highlight text={button.text} onPress={() => { button.onPress(); this.context.close() }}/> })
                                :
                                null
                            }
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
Dialogs = withQueuingModal(Dialogs);
let style = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    dialogs: {
        overflow: 'hidden',
        borderRadius: cp(8),
        backgroundColor: '#fff'
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: cp(20),
        minWidth: cp(560),
        minHeight: cp(190)
    },
    buttons: {
        flexDirection: 'row',
    }
})

export default Dialogs;