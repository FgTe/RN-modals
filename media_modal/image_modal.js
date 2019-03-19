import React from 'react';
import { Image, View, StyleSheet, Animated } from 'react-native';

import withTimer from '../with_timer';
import Dialogs from '../plain_dialogs';
import TouchHandler from '../../utilities/RN_touch_handler';

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
                width: 0,
                height: 0
            },
            image: {
                ready: false,
                originalWidth: 0,
                originalHeight: 0,
                maxWidth: 0,
                minWidth: 0,
                maxHeight: 0,
                minHeight: 0,
                maxX: 0,
                minX: 0,
                maxY: 0,
                minY: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0
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
        this.animate = new Animated.Value(0);
        this.animatedTo = {
            position: {
                $x: 0,
                $y: 0,
                x: 0,
                y: 0
            },
            $scale: 1,
            scale: 1
        };
        this.animate.addListener((evt) => {
            var progress = evt.value / 100;
            this.resolveImageDimensions({
                x: this.animatedTo.position.x + this.animatedTo.position.$x * progress,
                y: this.animatedTo.position.y + this.animatedTo.position.$y * progress
            }, {
                width: this.animatedTo.size.width + this.animatedTo.size.$width * progress,
                height: this.animatedTo.size.height + this.animatedTo.size.$height * progress
            });
        });
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
        this.animate && this.animate.stopAnimation();
        this.gestureRecord.prev = [evt.nativeEvent];
    }
    moveHandle (evt) {
        if ( evt.nativeEvent.touches.length === 1 && this.gestureRecord.prev.length === 1 ) {
            this.translateImage(evt.nativeEvent.touches, this.gestureRecord.prev);
        } else if ( evt.nativeEvent.touches.length > 1 && this.gestureRecord.prev.length > 1 ) {
            this.scaleImage(evt.nativeEvent.touches, this.gestureRecord.prev);
        }
        this.gestureRecord.prev = evt.nativeEvent.touches;
    }
    clickHandle (evt) {
        this.props.close();
    }
    doubleClickHandle (evt) {
        let size = {
            width: this.dimensions.image.width === this.dimensions.image.originalWidth ? this.dimensions.image.minWidth : this.dimensions.image.originalWidth,
            height: this.dimensions.image.height === this.dimensions.image.originalHeight ? this.dimensions.image.minHeight : this.dimensions.image.originalHeight
        };
        this.animationStart(this.centerPosition(size), size);
    }
    centerPosition (image) {
        return {
            x: ( this.dimensions.container.width - image.width ) / 2,
            y: ( this.dimensions.container.height - image.height ) / 2
        }
    }
    retrieveContainerDimensions (event) {
        this.dimensions.container = {
            ready: true,
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height
        };
        this.init();
    }
    retrieveImageDimensions (...args) {
        Image.getSize(this.props.source.uri, (width, height) => {
            this.dimensions.image.ready = true
            this.dimensions.image.originalWidth = width;
            this.dimensions.image.originalHeight = height;
            this.dimensions.image.width = width;
            this.dimensions.image.height = height;
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
            this.dimensions.image.maxWidth = this.dimensions.image.originalWidth * this.maxScale;
            this.dimensions.image.minWidth = this.dimensions.image.originalWidth * this.minScale;
            this.dimensions.image.maxHeight = this.dimensions.image.originalHeight * this.maxScale;
            this.dimensions.image.minHeight = this.dimensions.image.originalHeight * this.minScale;
            this.resolveImageDimensions(this.centerPosition(this.dimensions.image), {
                width: this.dimensions.image.minWidth,
                height: this.dimensions.image.minHeight
            });
        }
    }
    resolveImageDimensions (position, size) {
        let image = this.dimensions.image;
        let container = this.dimensions.container;
        if ( size ) {
            size.width = size.width > image.maxWidth ? image.maxWidth : size.width < image.minWidth ? image.minWidth : size.width;
            size.height = size.height > image.maxHeight ? image.maxHeight : size.height < image.minHeight ? image.minHeight : size.height;
            if ( container.width - size.width > 0 ) {
                image.maxX = image.minX = ( container.width - size.width ) / 2
            } else {
                image.maxX = 0;
                image.minX = container.width - size.width;
            }
            if ( container.height - image.height > 0 ) {
                image.maxY = image.minY = ( container.height - size.height ) / 2;
            } else {
                image.maxY = 0;
                image.minY = container.height - size.height;
            }
            image.width = size.width;
            image.height = size.height;
        }
        if ( position ) {
            image.x = position.x > image.maxX ? image.maxX : position.x < image.minX ? image.minX : position.x;
            image.y = position.y > image.maxY ? image.maxY : position.y < image.minY ? image.minY : position.y;
        }
        this.setUpDimensions(image);
    }
    animationStart (position, size) {
        this.animatedTo = {
            position: {
                $x: position.x - this.dimensions.image.x,
                $y: position.y - this.dimensions.image.y,
                x: this.dimensions.image.x,
                y: this.dimensions.image.y
            },
            size: {
                $width: size.width - this.dimensions.image.width,
                $height: size.height - this.dimensions.image.height,
                width: this.dimensions.image.width,
                height: this.dimensions.image.height
            }
        }
        this.animate.setValue(0);
        Animated.timing(this.animate, { toValue: 100, duration: 300}).start();
    }
    setUpDimensions (dimensions) {
        this.state.offsetLeft.setValue(dimensions.x);
        this.state.offsetTop.setValue(dimensions.y);
        this.state.width.setValue(dimensions.width);
        this.state.height.setValue(dimensions.height);
    }
    translateImage (current, prev) {
        this.resolveImageDimensions({
            x: current[0].pageX - prev[0].pageX + this.dimensions.image.x,
            y: current[0].pageY - prev[0].pageY + this.dimensions.image.y
        });
    }
    scaleImage (current, prev) {
        let image = this.dimensions.image;
        let x1 = current[0].pageX - current[current.length - 1].pageX;
        let y1 = current[0].pageY - current[current.length - 1].pageY;
        let x2 = prev[0].pageX - prev[prev.length - 1].pageX;
        let y2 = prev[0].pageY - prev[prev.length - 1].pageY;
        let size = {
            width: image.width + x1 - x2,
            height: image.height + y1 - y2
        }
        let position = {
            x: image.x + prev[0].pageX - current[0].pageX,
            y: image.y + prev[0].pageY - current[0].pageY
        };
        this.resolveImageDimensions(position, size);
    }
    componentDidUpdate (prevProps) {
        if ( prevProps.source !== this.props.source ) {
            this.dimensions.image.ready = false;
        }
    }
    componentWillUnmount () {
        this.animate && this.animate.stopAnimation();
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

export default withTimer(ImageModal);