import React from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { PopupHeader } from '../popup';
import { QueuingModalContext } from '../with_queuing_modal';

import { convertPixel as cp } from '../lib/convert_pixel'

class PopupSelector extends React.PureComponent {
    static contextType = QueuingModalContext;
    static getDerivedStateFromProps(props, state) {
        if ( props.hasOwnProperty('value') ) {
            return {
                selected: props.value
            }
        } else {
            return state
        }
    }
    constructor (props) {
        super(props);
        this.changeHandler = this.changeHandler.bind(this);
        this.renderOption = this.renderOption.bind(this);
        this.renderHeaderRight = this.renderHeaderRight.bind(this);
        this.state = {
            selected: this.props.defaultValue || this.props.data && this.props.data[0] && this.props.data[0].value
        }
    }
    pressHandler (selected) {
        typeof this.props.onPress === 'function' && this.props.onPress(selected);
        this.setState({
            selected
        });
    }
    changeHandler () {
        typeof this.props.onChange === 'function' && this.props.onChange(this.state.selected);
        this.context.close();
    }
    renderOption (option) {
        let active = option.value === this.state.selected;
        return this.props.renderOption ? this.props.renderOption(option, active, this.context.close) : (
            <TouchableOpacity key={option.label + active} onPress={() => this.pressHandler(option.value)} style={style.item}>
                <View style={style.tick}>
                    {active ? <Image source={require('./images/icon_tick.png')} style={style.tickIcon}/> : null}
                </View>
                {
                    typeof this.props.renderLabel === 'function' ?
                    this.props.renderLabel(option, active, this.context.close)
                    :
                    <Text style={[style.label, active && style.active]}>{option.label}</Text>
                }
            </TouchableOpacity>
        );
    }
    renderHeaderRight () {
        return this.props.renderHeaderRight ? this.props.renderHeaderRight(this.context.close) : null;
    }
    render () {
        return (
            <View style={style.container}>
                {this.props.title ? <PopupHeader right={this.renderHeaderRight}>{this.props.title}</PopupHeader> : null}
                <ScrollView style={style.options}>
                    {this.props.data ? this.props.data.map(this.renderOption) : null}
                </ScrollView>
                {this.props.children}
            </View>
        )
    }
}
let style = StyleSheet.create({
    container: {
        maxHeight: '100%'
    },
    options: {
        minHeight: cp(260)
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: cp(1),
        borderBottomColor: '#ccc',
        paddingVertical: cp(22),
        paddingHorizontal: cp(36)
    },
    tick: {
        marginRight: cp(28),
        width: cp(30),
        height: cp(30)
    },
    tickIcon: {
        width: cp(30),
        height: cp(30)
    },
    label: {
        flex: 1,
        fontSize: cp(28),
        lineHeight: cp(42),
        color: '#666'
    },
    active: {
        color: '#fe8c5a'
    },
    button: {
        alignSelf: 'center',
        marginVertical: cp(32),
        borderRadius: cp(86),
        paddingVertical: cp(18),
        paddingHorizontal: cp(48),
        width: cp(690)
    }
});

export default PopupSelector;