import React from 'react';
import { View, StyleSheet, } from 'react-native';

import withQueuingModal, { QueuingModalContext } from '../with_queuing_modal';
import PreventableScrollView from '../preventable_scroll_view';
import ImageModal from './image_modal';

import { vw } from '../lib/convert_pixel';

class MediaModal extends React.PureComponent {
    static contextType = QueuingModalContext;
    renderMediaControllers () {
        let controllers = [];
        this.props.content.forEach((source, index) => {
            if ( source.type ) {
                if ( source.type === 'image' ) {
                    controllers.push(<View style={mediaStyle.modal} key={index}><ImageModal source={source.source} close={this.context.close}/></View>);
                }
            };
        });
        if ( !controllers.length ) {
            this.context.close();
        }
        return controllers;
    }
    render () {
        return (
            <PreventableScrollView horizontal pagingEnabled defaultHorizontalPage={this.props.options.currentPage} onClick={this.context.close} style={mediaStyle.scroll} contentContainerStyle={mediaStyle.contentContainer}>
                { this.renderMediaControllers() }
            </PreventableScrollView>
        )
    }
}
MediaModal = withQueuingModal(MediaModal);
let mediaStyle = StyleSheet.create({
    scroll: {
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 1)'
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    modal: {
        width: vw
    }
});

export default MediaModal;