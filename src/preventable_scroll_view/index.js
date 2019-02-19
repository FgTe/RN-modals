import React from 'react';
import { StyleSheet, Animated } from 'react-native';

import TouchHandler from '../touch_handler';

class PreventableScrollView extends React.Component {
    static getDerivedStateFromProps (props, state) {
        return {
            horizontalPage: props.hasOwnProperty('horizontalPage') ? props.horizontalPage : state.horizontalPage,
            verticalPage: props.hasOwnProperty('verticalPage') ? props.verticalPage : state.verticalPage
        }
    }
    constructor (props) {
        super(props);
        this.retrieveDimensionOfScroll = this.retrieveDimensionOfScroll.bind(this);
        this.retrieveDimensionOfContainer = this.retrieveDimensionOfContainer.bind(this);
        this.resolveDimensions = this.resolveDimensions.bind(this);
        this.moveHandle = this.moveHandle.bind(this);
        this.endHandle = this.endHandle.bind(this);
        this.lastTouches = null;
        this.scroll = React.createRef();
        this.container = React.createRef();
        this.dimensions = {
            scroll: {
                width: 0,
                height: 0
            },
            container: {
                minOffsetTop: 0,
                minOffsetLeft: 0,
                offsetTop: 0,
                offsetLeft: 0,
                width: 0,
                height: 0
            }
        };
        this.state = {
            horizontalPage: props.defaultHorizontalPage || 0,
            verticalPage: props.defaultVerticalPage || 0,
            offsetLeft: new Animated.Value(this.dimensions.container.offsetLeft),
            offsetTop: new Animated.Value(this.dimensions.container.offsetTop)
        };
        this.state.offsetLeft.addListener((x) => { this.dimensions.container.offsetLeft = x.value; });
        this.state.offsetTop.addListener((y) => { this.dimensions.container.offsetTop = y.value; });
        this.animate = null;
    }
    retrieveDimensionOfScroll (evt) {
        this.dimensions.scroll.width = evt.nativeEvent.layout.width;
        this.dimensions.scroll.height = evt.nativeEvent.layout.height;
        this.init();
    }
    retrieveDimensionOfContainer (evt) {
        this.dimensions.container.offsetLeft = evt.nativeEvent.layout.x;
        this.dimensions.container.offsetTop = evt.nativeEvent.layout.y;
        this.dimensions.container.width = evt.nativeEvent.layout.width;
        this.dimensions.container.height = evt.nativeEvent.layout.height;
        this.init();
    }
    init () {
        this.calculateScrollange();
        this.resolveDimensions({
            x: this.dimensions.container.offsetLeft = this.state.horizontalPage * -this.dimensions.scroll.width,
            y: this.dimensions.container.offsetTop = this.state.verticalPage * -this.dimensions.scroll.height
        });
    }
    calculateScrollange () {
        let top = this.dimensions.scroll.height - this.dimensions.container.height;
        let left = this.dimensions.scroll.width - this.dimensions.container.width;
        this.dimensions.container.minOffsetTop = top > 0 ? 0 : top;
        this.dimensions.container.minOffsetLeft = left > 0 ? 0 : left;
    }
    resolveDimensions (position) {
        this.state.offsetTop.setValue(position.y);
        this.state.offsetLeft.setValue(position.x);
    }
    startHandle (evt) {
        this.animate && this.animate.stop();
    }
    moveHandle (evt) {
        if ( this.lastTouches !== null ) {
            let last = this.lastTouches[this.lastTouches.length - 1];
            let current = evt.nativeEvent.touches[evt.nativeEvent.touches.length - 1];
            let top = this.dimensions.container.offsetTop + current.pageY - last.pageY;
            let left = this.dimensions.container.offsetLeft + current.pageX - last.pageX;
            this.dimensions.container.offsetTop = top > 0 ? 0 : top > this.dimensions.container.minOffsetTop ? top : this.dimensions.container.minOffsetTop;
            this.dimensions.container.offsetLeft = left > 0 ? 0 : left > this.dimensions.container.minOffsetLeft ? left : this.dimensions.container.minOffsetLeft;
            this.resolveDimensions({
                x: this.dimensions.container.offsetLeft,
                y: this.dimensions.container.offsetTop
            });
        }
        this.lastTouches = evt.nativeEvent.touches;
    }
    endHandle (evt) {
        if ( this.props.pagingEnabled ) {
            this.resolvePage({
                x: this.dimensions.container.offsetLeft,
                y: this.dimensions.container.offsetTop
            });
        }
        this.lastTouches = null;
    }
    resolvePage (position) {
        let horizontalPage = Math.floor(-position.x / this.dimensions.scroll.width) + ( position.x % this.dimensions.scroll.width / this.dimensions.scroll.width > ( position.x + this.state.horizontalPage * this.dimensions.scroll.width > 0 ? -0.8 : -0.2 ) ? 0 : 1 );
        let verticalPage = Math.floor(-position.y / this.dimensions.scroll.height) + ( position.y % this.dimensions.scroll.height / this.dimensions.scroll.height > ( position.y + this.state.verticalPage * this.dimensions.scroll.height > 0 ? -0.8 : -0.2 ) ? 0 : 1 );
        this.setState({
            horizontalPage,
            verticalPage
        });
        typeof this.props.onPageChange === 'function' && this.props.onPageChange({
            horizontalPage,
            verticalPage
        });
    }
    scrollAnimate (position) {
        if( position.x !== this.dimensions.container.offsetLeft || position.y !== this.dimensions.container.offsetTop ) {
            this.animate = Animated.parallel([
                Animated.timing(this.state.offsetLeft, { toValue: position.x, duration: 300 }),
                Animated.timing(this.state.offsetTop, { toValue: position.y, duration: 300 })
            ]);
            this.animate.start();
        }
    }
    componentDidUpdate (prevProps, prevState) {
        if ( this.props.pagingEnabled ) {
            this.scrollAnimate({
                x: this.state.horizontalPage * -this.dimensions.scroll.width,
                y: this.state.verticalPage * -this.dimensions.scroll.height
            });
        }
    }
    componentWillUnmount () {
        this.animate && this.animate.stop();
    }
    render () {
        let { style, onLayout, contentContainerStyle, children, ...rest } = this.props;
        return (
            <TouchHandler ref={this.scroll} onLayout={this.retrieveDimensionOfScroll} name="scroll" onTouchMove={this.moveHandle} onTouchEnd={this.endHandle} {...rest} style={[scrollView.scroll, style]}>
                <Animated.View ref={this.container} onLayout={this.retrieveDimensionOfContainer} style={[scrollView.container, contentContainerStyle, { transform: [{ translateX: this.state.offsetLeft }, { translateY: this.state.offsetTop }]}]}>
                    {children}
                </Animated.View>
            </TouchHandler>
        )
    }
}
let scrollView = StyleSheet.create({
    scroll: {
        overflow: 'hidden',
        flex: 1
    },
    container: {
        alignSelf: 'flex-start',
        overflow: 'hidden'
    }
});

export default PreventableScrollView;