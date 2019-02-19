import isFunction from './is_function';

const DOUBLECLICK_INTERVAL = 500;
const CLICK_INTERVAL = 100;

export default class {
    constructor (props) {
        this.props = props;
        this.startTime = null;
        this.doubleClick = null;
        this.doubleClickTimeoutID = null;
        this.responderHandle = {
            onStartShouldSetResponder: this.onStartShouldSetResponder.bind(this),
            onMoveShouldSetResponder: this.onMoveShouldSetResponder.bind(this),
            onResponderTerminationRequest: this.onResponderTerminationRequest.bind(this),
            onResponderGrant: this.onResponderGrant.bind(this),
            onResponderMove: this.onResponderMove.bind(this),
            onResponderRelease: this.onResponderRelease.bind(this)
        };
        this.lastTouches = null;
    }
    onStartShouldSetResponder (evt) {
        if ( isFunction(this.props.onTouchStart) || isFunction(this.props.onTouchMove) || isFunction(this.props.onTouchEnd) || isFunction(this.props.onClick) || isFunction(this.props.onDoubleClick) ) {
            this.doubleClick = evt.nativeEvent.timestamp - this.startTime < DOUBLECLICK_INTERVAL;
            this.startTime = evt.nativeEvent.timestamp;
            this.lastTouches = evt.nativeEvent.touches;
            return true;
        } else {
            return false;
        }
    }
    onMoveShouldSetResponder (evt) {
        if ( isFunction(this.props.onTouchMove) ) {
            return true;
        } else {
            return false;
        }
    }
    onResponderTerminationRequest (evt) {
        let terminate = this.checkWhetherAnyTouchMove(evt.nativeEvent.touches, this.lastTouches) && isFunction(this.props.onTouchMove) && isFunction(this.props.onResponderTerminationRequest) && this.props.onResponderTerminationRequest(evt);
        terminate && isFunction(this.props.onTouchEnd) && this.props.onTouchEnd(evt);
        return terminate;
    }
    onResponderGrant (evt) {
        isFunction(this.props.onTouchStart) && this.props.onTouchStart(evt);
        this.lastTouches = evt.nativeEvent.touches;
    }
    onResponderMove (evt) {
        isFunction(this.props.onTouchMove) && this.props.onTouchMove(evt);
        this.lastTouches = evt.nativeEvent.touches;
    }
    onResponderRelease (evt) {
        isFunction(this.props.onTouchEnd) && this.props.onTouchEnd(evt);
        if ( evt.nativeEvent.timestamp - this.startTime < CLICK_INTERVAL ) {
            if ( isFunction(this.props.onDoubleClick) ) {
                this.doubleClickTimeoutID !== null && clearTimeout(this.doubleClickTimeoutID);
                if ( this.doubleClick ) {
                    this.props.onDoubleClick(evt);
                } else if ( isFunction(this.props.onClick) ) {
                    this.doubleClickTimeoutID = setTimeout(() => { this.props.onClick(evt) }, DOUBLECLICK_INTERVAL);
                }
            } else if ( isFunction(this.props.onClick) ) {
                this.props.onClick(evt);
            }
        }
        this.lastTouches = null;
    }
    checkWhetherAnyTouchMove (currentTouches, lastTouches) {
        let moved = false;
        for ( let i = 0; i < currentTouches.length; i++ ) {
            for ( let j = 0; j < lastTouches.length; j++ ) {
                if ( lastTouches[j] && currentTouches[i].identifier === lastTouches[j].identifier && ( currentTouches[i].pageY !== lastTouches[j].pageY || currentTouches[i].pageX !== lastTouches[j].pageX ) ) {
                    moved = true;
                    break;
                }
            }
            if ( moved ) {
                break;
            }
        }
        return moved;
    }
    terminate () {
        this.doubleClickTimeoutID !== null && clearTimeout(this.doubleClickTimeoutID);
    }
}