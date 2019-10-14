// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Alert, Clipboard, StyleSheet, View} from 'react-native';
import {intlShape} from 'react-intl';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import SlideUpPanel from 'app/components/slide_up_panel';
import {BOTTOM_MARGIN} from 'app/components/slide_up_panel/slide_up_panel';
import {t} from 'app/utils/i18n';
import {showModal, dismissModal} from 'app/actions/navigation';

import {OPTION_HEIGHT, getInitialPosition} from './post_options_utils';
import PostOption from './post_option';

export default class PostOptions extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            addReaction: PropTypes.func.isRequired,
            deletePost: PropTypes.func.isRequired,
            flagPost: PropTypes.func.isRequired,
            pinPost: PropTypes.func.isRequired,
            removePost: PropTypes.func.isRequired,
            unflagPost: PropTypes.func.isRequired,
            unpinPost: PropTypes.func.isRequired,
        }).isRequired,
        canAddReaction: PropTypes.bool,
        canReply: PropTypes.bool,
        canCopyPermalink: PropTypes.bool,
        canCopyText: PropTypes.bool,
        canDelete: PropTypes.bool,
        canFlag: PropTypes.bool,
        canPin: PropTypes.bool,
        canEdit: PropTypes.bool,
        canEditUntil: PropTypes.number.isRequired,
        currentTeamUrl: PropTypes.string.isRequired,
        deviceHeight: PropTypes.number.isRequired,
        isFlagged: PropTypes.bool,
        isMyPost: PropTypes.bool,
        post: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        isLandscape: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    close = async (cb) => {
        dismissModal();

        if (typeof cb === 'function') {
            setTimeout(cb, 300);
        }
    };

    closeWithAnimation = (cb) => {
        if (this.slideUpPanel) {
            this.slideUpPanel.closeWithAnimation(cb);
        } else {
            this.close(cb);
        }
    };

    getOption = (key, icon, message, onPress, destructive = false) => {
        const {formatMessage} = this.context.intl;
        const {isLandscape, theme} = this.props;

        return (
            <PostOption
                key={key}
                icon={icon}
                text={formatMessage(message)}
                onPress={onPress}
                isLandscape={isLandscape}
                destructive={destructive}
                theme={theme}
            />
        );
    }

    getAddReactionOption = () => {
        const {canAddReaction} = this.props;

        if (canAddReaction) {
            const key = 'reaction';
            const icon = 'emoji';
            const message = {id: t('mobile.post_info.add_reaction'), defaultMessage: 'Add Reaction'};
            const onPress = this.handleAddReaction;

            return this.getOption(key, icon, message, onPress);
        }

        return null;
    };

    getReplyOption = () => {
        const {canReply} = this.props;

        if (canReply) {
            const key = 'reply';
            const icon = 'reply';
            const message = {id: t('mobile.post_info.reply'), defaultMessage: 'Reply'};
            const onPress = this.handleReply;

            return this.getOption(key, icon, message, onPress);
        }

        return null;
    }

    getCopyPermalink = () => {
        const {canCopyPermalink} = this.props;

        if (canCopyPermalink) {
            const key = 'permalink';
            const icon = 'link';
            const message = {id: t('get_post_link_modal.title'), defaultMessage: 'Copy Permalink'};
            const onPress = this.handleCopyPermalink;

            return this.getOption(key, icon, message, onPress);
        }

        return null;
    };

    getCopyText = () => {
        const {canCopyText} = this.props;

        if (canCopyText) {
            const key = 'copy';
            const icon = 'copy';
            const message = {id: t('mobile.post_info.copy_text'), defaultMessage: 'Copy Text'};
            const onPress = this.handleCopyText;

            return this.getOption(key, icon, message, onPress);
        }

        return null;
    };

    getDeleteOption = () => {
        const {canDelete} = this.props;

        if (canDelete) {
            const key = 'delete';
            const icon = 'trash';
            const message = {id: t('post_info.del'), defaultMessage: 'Delete'};
            const onPress = this.handlePostDelete;
            const destructive = true;

            return this.getOption(key, icon, message, onPress, destructive);
        }

        return null;
    };

    getEditOption = () => {
        const {canEdit, canEditUntil} = this.props;

        if (canEdit && (canEditUntil === -1 || canEditUntil > Date.now())) {
            const key = 'edit';
            const icon = 'edit';
            const message = {id: t('post_info.edit'), defaultMessage: 'Edit'};
            const onPress = this.handlePostEdit;

            return this.getOption(key, icon, message, onPress);
        }

        return null;
    };

    getFlagOption = () => {
        const {canFlag, isFlagged} = this.props;

        if (!canFlag) {
            return null;
        }

        let key;
        let message;
        let onPress;
        const icon = 'flag';

        if (isFlagged) {
            key = 'unflag';
            message = {id: t('mobile.post_info.unflag'), defaultMessage: 'Unflag'};
            onPress = this.handleUnflagPost;
        } else {
            key = 'flagged';
            message = {id: t('mobile.post_info.flag'), defaultMessage: 'Flag'};
            onPress = this.handleFlagPost;
        }

        return this.getOption(key, icon, message, onPress);
    };

    getPinOption = () => {
        const {canPin, post} = this.props;

        if (!canPin) {
            return null;
        }

        let key;
        let message;
        let onPress;
        const icon = 'pin';

        if (post.is_pinned) {
            key = 'unpin';
            message = {id: t('mobile.post_info.unpin'), defaultMessage: 'Unpin from Channel'};
            onPress = this.handleUnpinPost;
        } else {
            key = 'pin';
            message = {id: t('mobile.post_info.pin'), defaultMessage: 'Pin to Channel'};
            onPress = this.handlePinPost;
        }

        return this.getOption(key, icon, message, onPress);
    };

    getMyPostOptions = () => {
        const actions = [
            this.getEditOption(),
            this.getReplyOption(),
            this.getFlagOption(),
            this.getPinOption(),
            this.getAddReactionOption(),
            this.getCopyPermalink(),
            this.getCopyText(),
            this.getDeleteOption(),
        ];

        return actions.filter((a) => a !== null);
    };

    getOthersPostOptions = () => {
        const actions = [
            this.getReplyOption(),
            this.getFlagOption(),
            this.getAddReactionOption(),
            this.getPinOption(),
            this.getCopyPermalink(),
            this.getCopyText(),
            this.getEditOption(),
            this.getDeleteOption(),
        ];

        return actions.filter((a) => a !== null);
    };

    getPostOptions = () => {
        const {isMyPost} = this.props;

        return isMyPost ? this.getMyPostOptions() : this.getOthersPostOptions();
    };

    handleAddReaction = () => {
        const {theme} = this.props;
        const {formatMessage} = this.context.intl;

        this.close(() => {
            MaterialIcon.getImageSource('close', 20, theme.sidebarHeaderTextColor).then((source) => {
                const screen = 'AddReaction';
                const title = formatMessage({id: 'mobile.post_info.add_reaction', defaultMessage: 'Add Reaction'});
                const passProps = {
                    closeButton: source,
                    onEmojiPress: this.handleAddReactionToPost,
                };

                showModal(screen, title, passProps);
            });
        });
    };

    handleReply = () => {
        const {post} = this.props;
        this.closeWithAnimation(() => {
            EventEmitter.emit('goToThread', post);
        });
    };

    handleAddReactionToPost = (emoji) => {
        const {actions, post} = this.props;

        actions.addReaction(post.id, emoji);
    };

    handleCopyPermalink = () => {
        const {currentTeamUrl, post} = this.props;
        const permalink = `${currentTeamUrl}/pl/${post.id}`;

        Clipboard.setString(permalink);
        this.closeWithAnimation();
    };

    handleCopyText = () => {
        const {message} = this.props.post;

        Clipboard.setString(message);
        this.closeWithAnimation();
    };

    handleFlagPost = () => {
        const {actions, post} = this.props;

        this.closeWithAnimation();
        requestAnimationFrame(() => {
            actions.flagPost(post.id);
        });
    };

    handlePinPost = () => {
        const {actions, post} = this.props;

        this.closeWithAnimation();
        requestAnimationFrame(() => {
            actions.pinPost(post.id);
        });
    };

    handlePostDelete = () => {
        const {formatMessage} = this.context.intl;
        const {actions, post} = this.props;

        Alert.alert(
            formatMessage({id: 'mobile.post.delete_title', defaultMessage: 'Delete Post'}),
            formatMessage({
                id: 'mobile.post.delete_question',
                defaultMessage: 'Are you sure you want to delete this post?',
            }),
            [{
                text: formatMessage({id: 'mobile.post.cancel', defaultMessage: 'Cancel'}),
                style: 'cancel',
            }, {
                text: formatMessage({id: 'post_info.del', defaultMessage: 'Delete'}),
                style: 'destructive',
                onPress: () => {
                    this.closeWithAnimation(() => {
                        actions.deletePost(post);
                        actions.removePost(post);
                    });
                },
            }]
        );
    };

    handlePostEdit = () => {
        const {theme, post} = this.props;
        const {intl} = this.context;

        this.close(() => {
            MaterialIcon.getImageSource('close', 20, theme.sidebarHeaderTextColor).then((source) => {
                const screen = 'EditPost';
                const title = intl.formatMessage({id: 'mobile.edit_post.title', defaultMessage: 'Editing Message'});
                const passProps = {
                    post,
                    closeButton: source,
                };

                showModal(screen, title, passProps);
            });
        });
    };

    handleUnflagPost = () => {
        const {actions, post} = this.props;

        this.closeWithAnimation();
        requestAnimationFrame(() => {
            actions.unflagPost(post.id);
        });
    };

    handleUnpinPost = () => {
        const {actions, post} = this.props;

        this.closeWithAnimation();
        requestAnimationFrame(() => {
            actions.unpinPost(post.id);
        });
    };

    refSlideUpPanel = (r) => {
        this.slideUpPanel = r;
    };

    render() {
        const {deviceHeight, theme} = this.props;
        const options = this.getPostOptions();
        if (!options || !options.length) {
            return null;
        }

        const marginFromTop = deviceHeight - BOTTOM_MARGIN - ((options.length + 1) * OPTION_HEIGHT);
        const initialPosition = getInitialPosition(deviceHeight, marginFromTop);

        return (
            <View style={style.container}>
                <SlideUpPanel
                    allowStayMiddle={false}
                    ref={this.refSlideUpPanel}
                    marginFromTop={marginFromTop > 0 ? marginFromTop : 0}
                    onRequestClose={this.close}
                    initialPosition={initialPosition}
                    key={marginFromTop}
                    theme={theme}
                >
                    {options}
                </SlideUpPanel>
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
});
