// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import shallowEqual from 'shallow-equals';

import Emoji from 'app/components/emoji';

export default class EmojiPickerRow extends Component {
    static propTypes = {
        emojiGutter: PropTypes.number.isRequired,
        emojiSize: PropTypes.number.isRequired,
        items: PropTypes.array.isRequired,
        onEmojiPress: PropTypes.func.isRequired,
    }

    shouldComponentUpdate(nextProps) {
        return !shallowEqual(this.props.items, nextProps.items);
    }

    renderEmojis = (emoji, index, emojis) => {
        const {emojiGutter, emojiSize} = this.props;

        const size = emojiSize + 5;
        const style = [
            styles.emoji,
            {
                width: size,
                height: size,
                marginHorizontal: emojiGutter,
            },
        ];
        if (index === 0) {
            style.push(styles.emojiLeft);
        } else if (index === emojis.length - 1) {
            style.push(styles.emojiRight);
        }

        if (!emoji) {
            return (
                <View
                    key={index}
                    style={style}
                />
            );
        }

        return (
            <TouchableOpacity
                key={emoji.name}
                style={style}
                onPress={() => {
                    this.props.onEmojiPress(emoji.name);
                }}
            >
                <Emoji
                    emojiName={emoji.name}
                    textStyle={styles.emojiText}
                    size={emojiSize}
                />
            </TouchableOpacity>
        );
    };

    render() {
        const {emojiGutter, items} = this.props;

        return (
            <View style={[styles.columnStyle, {marginVertical: emojiGutter}]}>
                {items.map(this.renderEmojis)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    columnStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    emoji: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    emojiText: {
        color: '#000',
        fontWeight: 'bold',
    },
    emojiLeft: {
        marginLeft: 0,
    },
    emojiRight: {
        marginRight: 0,
    },
});
