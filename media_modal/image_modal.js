import React from 'react';
import {  Image, View, StyleSheet, Animated } from 'react-native';

import Dialogs from '../plain_dialogs';
import TouchHandler from '../lib/RN_touch_handler';

class ImageModal extends React.PureComponent {
    constructor (props) {
        super(props);
        this.retrieveContainerDimensions = this.retrieveContainerDimensions.bind(this);
        this.retrieveImageDimensions = this.retrieveImageDimensions.bind(this);
        this.clickHandle = this.clickHandle.bind(this);
        this.image = React.createRef();
        this.maxScale = 1.5;
        this.minScale = 0.5;
        this.dimensions = {
            container: {
                ready: false,
                width: null,
                height: null
            },
            image: {
                ready: false,
                originalWidth: null,
                originalHeight: null,
                x: null,
                y: null,
                maxX: null,
                minX: null,
                maxY: null,
                minY: null,
                width: null,
                height: null
            }
        };
        this.touchHandler = new TouchHandler({
            name: 'image',
            onTouchStart: this.startHandle.bind(this),
            onTouchMove: this.moveHandle.bind(this),
            onClick: this.clickHandle.bind(this),
            onDoubleClick: this.doubleClickHandle.bind(this),
            onResponderTerminationRequest: this.terminatResponderhandle.bind(this)
        });
        this.gestureRecord = {
            prev: []/*nativeEvent.touches*/
        };
        this.state = {
            offsetLeft: new Animated.Value(0),
            offsetTop: new Animated.Value(0),
            width: new Animated.Value(0),
            height: new Animated.Value(0)
        };
        this.state.offsetLeft.addListener((x) => { this.dimensions.image.x = x.value });
        this.state.offsetTop.addListener((y) => { this.dimensions.image.y = y.value });
        this.state.width.addListener((width) => { this.dimensions.image.width = width.value });
        this.state.height.addListener((height) => { this.dimensions.image.height = height.value });
        this.animate = null;
        this.retrieveImageDimensions();
    }
    terminatResponderhandle (evt) {
        let offset = this.dimensions.image.x + evt.nativeEvent.touches[0].pageX - this.gestureRecord.prev[0].pageX;
        if ( evt.nativeEvent.touches.length === 1 && ( offset >= this.dimensions.image.maxX || offset <= this.dimensions.image.minX ) ) {
            return true;
        } else {
            return false;
        }
    }
    startHandle (evt) {
        this.animate && this.animate.stop();
        this.gestureRecord.prev = [evt.nativeEvent];
    }
    moveHandle (evt) {
        if ( evt.nativeEvent.touches.length === 1 && this.gestureRecord.prev.length === 1 ) {
            this.translateImage(evt.nativeEvent.touches[0].pageX - this.gestureRecord.prev[0].pageX, evt.nativeEvent.touches[0].pageY - this.gestureRecord.prev[0].pageY);
        } else if ( evt.nativeEvent.touches.length > 1 && this.gestureRecord.prev.length > 1 ) {
            this.scaleImage(evt.nativeEvent.touches, this.gestureRecord.prev);
        }
        this.gestureRecord.prev = evt.nativeEvent.touches;
    }
    clickHandle (evt) {
        this.props.close();
    }
    doubleClickHandle (evt) {
        this.resolveImageDimensions('center', this.dimensions.image.width / this.dimensions.image.originalWidth === this.minScale ? 1 : this.minScale, true);
    }
    retrieveContainerDimensions (event) {
        this.dimensions.container = {
            ...this.dimensions.container,
            ready: true,
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height
        };
        this.init();
    }
    retrieveImageDimensions (...args) {
        Image.getSize(this.props.source.uri, (width, height) => {
            this.dimensions.image = {
                ...this.dimensions.image,
                ready: true,
                originalWidth: width,
                originalHeight: height,
                width,
                height
            };
            this.state.width.setValue(width);
            this.state.height.setValue(height);
            this.init();
        }, (err) => {
            Dialogs.open('图片加载失败');
        });
    }
    init () {
        if ( this.dimensions.container.ready && this.dimensions.image.ready ) {
            let container = this.dimensions.container;
            let image = this.dimensions.image;
            if ( image.width < container.width && image.height < container.height ) {
                this.minScale = 1;
            } else {
                this.minScale = container.width / container.height > image.width / image.height ? container.height / image.height : container.width / image.width;
            }
            this.resolveImageDimensions('center', this.minScale);
        }
    }
    resolveImageDimensions (position, scale, animated) {
        let image = this.dimensions.image;
        let container = this.dimensions.container;
        if ( +scale === scale ) {
            let $scale = scale > this.maxScale ? this.maxScale : scale < this.minScale ? this.minScale : scale;
            image.width = image.originalWidth * $scale;
            image.height = image.originalHeight * $scale;
            if ( container.width - image.width > 0 ) {
                image.maxX = image.minX = ( container.width - image.width ) / 2
            } else {
                image.maxX = 0;
                image.minX = container.width - image.width;
            }
            if ( container.height - image.height > 0 ) {
                image.maxY = image.minY = ( container.height - image.height ) / 2;
            } else {
                image.maxY = 0;
                image.minY = container.height - image.height;
            }
        }
        if ( position === 'center' ) {
            image.x = ( container.width - image.width ) / 2;
            image.y = ( container.height - image.height ) / 2;
        } else {
            image.x = position.x > image.maxX ? image.maxX : position.x < image.minX ? image.minX : position.x;
            image.y = position.y > image.maxY ? image.maxY : position.y < image.minY ? image.minY : position.y;
        }
        if ( animated ) {
            this.animate = Animated.parallel([
                Animated.timing(this.state.offsetLeft, { toValue: image.x, duration: 300 }),
                Animated.timing(this.state.offsetTop, { toValue: image.y, duration: 300 }),
                Animated.timing(this.state.width, { toValue: image.width, duration: 300 }),
                Animated.timing(this.state.height, { toValue: image.height, duration: 300 })
            ]);
            this.animate.start();
        } else {
            this.state.offsetLeft.setValue(image.x);
            this.state.offsetTop.setValue(image.y);
            this.state.width.setValue(image.width);
            this.state.height.setValue(image.height);
        }
    }
    translateImage (x, y) {
        let positionX = x + this.dimensions.image.x;
        let positionY = y + this.dimensions.image.y;
        this.resolveImageDimensions({
            x: positionX > this.dimensions.image.maxX ? this.dimensions.image.maxX : positionX < this.dimensions.image.minX ? this.dimensions.image.minX : positionX,
            y: positionY > this.dimensions.image.maxY ? this.dimensions.image.maxY : positionY < this.dimensions.image.minY ? this.dimensions.image.minY : positionY
        });
    }
    scaleImage (current, prev) {
        let image = this.dimensions.image;
        let x1 = current[0].pageX - current[current.length - 1].pageX;
        let y1 = current[0].pageY - current[current.length - 1].pageY;
        let midpoint1 = {
            x: current[0].pageX - ( x1 ) / 2,
            y: current[0].pageY - ( y1 ) / 2
        };
        let x2 = prev[0].pageX - prev[prev.length - 1].pageX;
        let y2 = prev[0].pageY - prev[prev.length - 1].pageY;
        let midpoint2 = {
            x: prev[0].pageX - ( x2 ) / 2,
            y: prev[0].pageY - ( y2 ) / 2
        };
        let $scale = ( Math.sqrt(x1 * x1 + y1 * y1) - Math.sqrt(x2 * x2 + y2 * y2) ) / image.width;
        let scale = image.width / image.originalWidth + $scale;
        let position = {
            x: image.x + ( midpoint1.x - midpoint2.x ) - $scale * image.width * ( midpoint2.x - image.x ) / image.width,
            y: image.y + ( midpoint1.y - midpoint2.y ) - $scale * image.height * ( midpoint2.y - image.y ) / image.height
        };
        this.resolveImageDimensions(position, scale);
    }
    componentDidUpdate (prevProps) {
        if ( prevProps.source !== this.props.source ) {
            this.dimensions.image.ready = false;
        }
    }
    componentWillUnmount () {
        this.animate && this.animate.stop();
    }
    render () {
        return (
            <View onLayout={this.retrieveContainerDimensions} style={imageModalStyle.container}>
                <Animated.Image ref={this.image} style={[imageModalStyle.image, { top: this.state.offsetTop, left: this.state.offsetLeft, width: this.state.width, height: this.state.height }]} {...this.touchHandler.responderHandle} {...this.props}/>
            </View>
        )
    }
}
let imageModalStyle = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
    },
    image: {
        position: 'absolute',
        resizeMode: 'stretch'
    }
});

export default ImageModal;