import { Dimensions } from 'react-native';

let scaleOfLogicalPixelsToDesignerPixels;
let widthOfDesigner = 750;
let windowWidth = null;
let windowHeight = null;
resetScaleOfLogicalPixelsToDesignerPixels(widthOfDesigner);
function resetScaleOfLogicalPixelsToDesignerPixels(width) {
    widthOfDesigner = width || widthOfDesigner;
    windowWidth = Dimensions.get('window').width;
    windowHeight = Dimensions.get('window').height;
<<<<<<< HEAD:lib/convert_pixel.js
    scaleOfLogicalPixelsToDesignerPixels = (widthOfDesigner > 600 ? 412 : widthOfDesigner) / widthOfDesigner;
=======
    scaleOfLogicalPixelsToDesignerPixels = (windowWidth > 600 ? 412 : windowWidth) / widthOfDesigner;
>>>>>>> 1d6c2c520d4950c19d96332c3c6aa9ad1a2c4823:src/lib/convert_pixel.js
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
