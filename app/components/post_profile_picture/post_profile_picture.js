// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Image, Platform, StyleSheet, View} from 'react-native';

import AppIcon from 'app/components/app_icon';
import ProfilePicture from 'app/components/profile_picture';
import TouchableWithFeedback from 'app/components/touchable_with_feedback';
import {emptyFunction} from 'app/utils/general';
import webhookIcon from 'assets/images/icons/webhook.jpg';
import {ViewTypes} from 'app/constants';

export default class PostProfilePicture extends PureComponent {
    static propTypes = {
        enablePostIconOverride: PropTypes.bool,
        fromWebHook: PropTypes.bool,
        isSystemMessage: PropTypes.bool,
        fromAutoResponder: PropTypes.bool,
        overrideIconUrl: PropTypes.string,
        onViewUserProfile: PropTypes.func,
        theme: PropTypes.object,
        userId: PropTypes.string,
        isBot: PropTypes.bool,
        isEmoji: PropTypes.bool,
    };

    static defaultProps = {
        onViewUserProfile: emptyFunction,
    };

    render() {
        const {
            enablePostIconOverride,
            fromWebHook,
            isSystemMessage,
            fromAutoResponder,
            onViewUserProfile,
            overrideIconUrl,
            theme,
            userId,
            isBot,
            isEmoji,
        } = this.props;

        if (isSystemMessage && !fromAutoResponder && !isBot) {
            return (
                <View style={style.buffer}>
                    <AppIcon
                        color={theme.centerChannelColor}
                        height={ViewTypes.PROFILE_PICTURE_SIZE}
                        width={ViewTypes.PROFILE_PICTURE_SIZE}
                    />
                </View>
            );
        }

        if (fromWebHook && enablePostIconOverride) {
            const icon = overrideIconUrl ? {uri: overrideIconUrl} : webhookIcon;
            const frameSize = ViewTypes.PROFILE_PICTURE_SIZE;
            const pictureSize = isEmoji ? ViewTypes.PROFILE_PICTURE_EMOJI_SIZE : ViewTypes.PROFILE_PICTURE_SIZE;
            const borderRadius = isEmoji ? 0 : ViewTypes.PROFILE_PICTURE_SIZE / 2;
            return (
                <View
                    style={[{
                        borderRadius,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: frameSize,
                        width: frameSize,
                    }, style.buffer]}
                >
                    <Image
                        source={icon}
                        style={{
                            height: pictureSize,
                            width: pictureSize,
                        }}
                    />
                </View>
            );
        }

        const showProfileStatus = !fromAutoResponder;
        let component = (
            <ProfilePicture
                userId={userId}
                size={ViewTypes.PROFILE_PICTURE_SIZE}
                showStatus={showProfileStatus}
            />
        );

        if (!fromWebHook) {
            component = (
                <TouchableWithFeedback
                    onPress={onViewUserProfile}
                    type={'opacity'}
                >
                    {component}
                </TouchableWithFeedback>
            );
        }

        return component;
    }
}

const style = StyleSheet.create({
    buffer: {
        ...Platform.select({
            android: {
                marginRight: 2,
            },
            ios: {
                marginRight: 3,
            },
        }),
    },
});
