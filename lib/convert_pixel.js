import { Dimensions } from 'react-native';

let scaleOfLogicalPixelsToDesignerPixels;
let widthOfDesigner = 750;
let windowWidth = null;
let windowHeight = null;
resetScaleOfLogicalPixelsToDesignerPixels();
function resetScaleOfLogicalPixelsToDesignerPixels(width) {
    widthOfDesigner = width || widthOfDesigner;
    windowWidth = Dimensions.get('window').width;
    windowHeight = Dimensions.get('window').height;
    scaleOfLogicalPixelsToDesignerPixels = (widthOfDesigner > 600 ? 412 : widthOfDesigner) / widthOfDesigner;
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