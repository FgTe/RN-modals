import { Dimensions } from 'react-native';

let scaleOfLogicalPixelsToDesignerPixels;
let widthOfDesigner = 750;
let windowWidth = null;
let windowHeight = null;
resetScaleOfLogicalPixelsToDesignerPixels();
function resetScaleOfLogicalPixelsToDesignerPixels(width) {
    widthOfDesigner = width;
    windowWidth = Dimensions.get('window').width;
    windowHeight = Dimensions.get('window').height;
    scaleOfLogicalPixelsToDesignerPixels = (LogicalWidth > 600 ? 412 : LogicalWidth) / widthOfDesigner;
}
function convertDesignerPixelsToLogicalPixels(DesignerPixels) {
    return scaleOfLogicalPixelsToDesignerPixels * DesignerPixels;
}

module.exports = {
    resetScale: resetScaleOfLogicalPixelsToDesignerPixels,
    convertPixel: convertDesignerPixelsToLogicalPixels,
    vw: windowWidth,
    vh: windowHeight
};