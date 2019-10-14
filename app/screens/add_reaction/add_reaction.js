// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';

import EmojiPicker from 'app/components/emoji_picker';
import {emptyFunction} from 'app/utils/general';
import {setNavigatorStyles} from 'app/utils/theme';
import {dismissModal, setButtons} from 'app/actions/navigation';

export default class AddReaction extends PureComponent {
    static propTypes = {
        componentId: PropTypes.string,
        closeButton: PropTypes.object,
        onEmojiPress: PropTypes.func,
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        onEmojiPress: emptyFunction,
    };

    leftButton = {
        id: 'close-edit-post',
    };

    constructor(props) {
        super(props);

        setButtons(props.componentId, {
            leftButtons: [{...this.leftButton, icon: props.closeButton}],
        });
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.theme !== prevProps.theme) {
            setNavigatorStyles(this.props.componentId, this.props.theme);
        }
    }

    navigationButtonPressed({buttonId}) {
        if (buttonId === 'close-edit-post') {
            this.close();
        }
    }

    close = () => {
        dismissModal();
    };

    handleEmojiPress = (emoji) => {
        this.props.onEmojiPress(emoji);
        this.close();
    }

    render() {
        return (
            <View style={styles.container}>
                <EmojiPicker onEmojiPress={this.handleEmojiPress}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
