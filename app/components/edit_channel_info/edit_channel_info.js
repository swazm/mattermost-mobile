// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Platform,
    TouchableWithoutFeedback,
    View,
    findNodeHandle,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {General} from 'mattermost-redux/constants';

import Autocomplete from 'app/components/autocomplete';
import ErrorText from 'app/components/error_text';
import FormattedText from 'app/components/formatted_text';
import Loading from 'app/components/loading';
import StatusBar from 'app/components/status_bar';
import TextInputWithLocalizedPlaceholder from 'app/components/text_input_with_localized_placeholder';
import {paddingHorizontal as padding} from 'app/components/safe_area_view/iphone_x_spacing';

import {
    changeOpacity,
    makeStyleSheetFromTheme,
    getKeyboardAppearanceFromTheme,
} from 'app/utils/theme';

import {t} from 'app/utils/i18n';
import {popTopScreen, dismissModal} from 'app/actions/navigation';

export default class EditChannelInfo extends PureComponent {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        deviceWidth: PropTypes.number.isRequired,
        deviceHeight: PropTypes.number.isRequired,
        channelType: PropTypes.string,
        enableRightButton: PropTypes.func,
        saving: PropTypes.bool.isRequired,
        editing: PropTypes.bool,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        displayName: PropTypes.string,
        currentTeamUrl: PropTypes.string,
        channelURL: PropTypes.string,
        purpose: PropTypes.string,
        header: PropTypes.string,
        onDisplayNameChange: PropTypes.func,
        onChannelURLChange: PropTypes.func,
        onPurposeChange: PropTypes.func,
        onHeaderChange: PropTypes.func,
        oldDisplayName: PropTypes.string,
        oldChannelURL: PropTypes.string,
        oldHeader: PropTypes.string,
        oldPurpose: PropTypes.string,
        isLandscape: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        editing: false,
    };

    constructor(props) {
        super(props);

        this.nameInput = React.createRef();
        this.urlInput = React.createRef();
        this.purposeInput = React.createRef();
        this.headerInput = React.createRef();
        this.lastText = React.createRef();
        this.scroll = React.createRef();
    }

    blur = () => {
        if (this.nameInput?.current) {
            this.nameInput.current.blur();
        }

        // TODO: uncomment below once the channel URL field is added
        // if (this.urlInput?.current) {
        //     this.urlInput.current.blur();
        // }

        if (this.purposeInput?.current) {
            this.purposeInput.current.blur();
        }
        if (this.headerInput?.current) {
            this.headerInput.current.blur();
        }

        if (this.scroll?.current) {
            this.scroll.current.scrollToPosition(0, 0, true);
        }
    };

    close = (goBack = false) => {
        if (goBack) {
            popTopScreen();
        } else {
            dismissModal();
        }
    };

    canUpdate = (displayName, channelURL, purpose, header) => {
        const {
            oldDisplayName,
            oldChannelURL,
            oldPurpose,
            oldHeader,
        } = this.props;

        return displayName !== oldDisplayName || channelURL !== oldChannelURL ||
            purpose !== oldPurpose || header !== oldHeader;
    };

    enableRightButton = (enable = false) => {
        this.props.enableRightButton(enable);
    };

    onDisplayNameChangeText = (displayName) => {
        const {editing, onDisplayNameChange} = this.props;
        onDisplayNameChange(displayName);

        if (editing) {
            const {channelURL, purpose, header} = this.props;
            const canUpdate = this.canUpdate(displayName, channelURL, purpose, header);
            this.enableRightButton(canUpdate);
            return;
        }

        const displayNameExists = displayName && displayName.length >= 2;
        this.props.enableRightButton(displayNameExists);
    };

    onPurposeChangeText = (purpose) => {
        const {editing, onPurposeChange} = this.props;
        onPurposeChange(purpose);

        if (editing) {
            const {displayName, channelURL, header} = this.props;
            const canUpdate = this.canUpdate(displayName, channelURL, purpose, header);
            this.enableRightButton(canUpdate);
        }
    };

    onHeaderChangeText = (header) => {
        const {editing, onHeaderChange} = this.props;
        onHeaderChange(header);

        if (editing) {
            const {displayName, channelURL, purpose} = this.props;
            const canUpdate = this.canUpdate(displayName, channelURL, purpose, header);
            this.enableRightButton(canUpdate);
        }
    };

    scrollToEnd = () => {
        if (this.scroll?.current && this.lastText?.current) {
            this.scroll.current.scrollToFocusedInput(findNodeHandle(this.lastText.current));
        }
    };

    render() {
        const {
            theme,
            channelType,
            deviceWidth,
            deviceHeight,
            displayName,
            header,
            purpose,
            isLandscape,
        } = this.props;
        const {error, saving} = this.props;

        const style = getStyleSheet(theme);

        const displayHeaderOnly = channelType === General.DM_CHANNEL ||
            channelType === General.GM_CHANNEL;

        if (saving) {
            return (
                <View style={style.container}>
                    <StatusBar/>
                    <Loading/>
                </View>
            );
        }

        let displayError;
        if (error) {
            displayError = (
                <View style={[style.errorContainer, {width: deviceWidth}]}>
                    <View style={[style.errorWrapper, padding(isLandscape)]}>
                        <ErrorText error={error}/>
                    </View>
                </View>
            );
        }

        return (
            <React.Fragment>
                <StatusBar/>
                <KeyboardAwareScrollView
                    ref={this.scroll}
                    style={style.container}
                    keyboardShouldPersistTaps={'always'}
                >
                    {displayError}
                    <TouchableWithoutFeedback onPress={this.blur}>
                        <View style={[style.scrollView, {height: deviceHeight + (Platform.OS === 'android' ? 200 : 0)}]}>
                            {!displayHeaderOnly && (
                                <View>
                                    <View>
                                        <FormattedText
                                            style={[style.title, padding(isLandscape)]}
                                            id='channel_modal.name'
                                            defaultMessage='Name'
                                        />
                                    </View>
                                    <View style={[style.inputContainer, padding(isLandscape)]}>
                                        <TextInputWithLocalizedPlaceholder
                                            ref={this.nameInput}
                                            value={displayName}
                                            onChangeText={this.onDisplayNameChangeText}
                                            style={style.input}
                                            autoCapitalize='none'
                                            autoCorrect={false}
                                            placeholder={{id: t('channel_modal.nameEx'), defaultMessage: 'E.g.: "Bugs", "Marketing", "客户支持"'}}
                                            placeholderTextColor={changeOpacity(theme.centerChannelColor, 0.5)}
                                            underlineColorAndroid='transparent'
                                            disableFullscreenUI={true}
                                            maxLength={64}
                                            keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                                        />
                                    </View>
                                </View>
                            )}
                            {!displayHeaderOnly && (
                                <View>
                                    <View style={[style.titleContainer30, padding(isLandscape)]}>
                                        <FormattedText
                                            style={style.title}
                                            id='channel_modal.purpose'
                                            defaultMessage='Purpose'
                                        />
                                        <FormattedText
                                            style={style.optional}
                                            id='channel_modal.optional'
                                            defaultMessage='(optional)'
                                        />
                                    </View>
                                    <View style={[style.inputContainer, padding(isLandscape)]}>
                                        <TextInputWithLocalizedPlaceholder
                                            ref={this.purposeInput}
                                            value={purpose}
                                            onChangeText={this.onPurposeChangeText}
                                            style={[style.input, {height: 110}]}
                                            autoCapitalize='none'
                                            autoCorrect={false}
                                            placeholder={{id: t('channel_modal.purposeEx'), defaultMessage: 'E.g.: "A channel to file bugs and improvements"'}}
                                            placeholderTextColor={changeOpacity(theme.centerChannelColor, 0.5)}
                                            multiline={true}
                                            blurOnSubmit={false}
                                            textAlignVertical='top'
                                            underlineColorAndroid='transparent'
                                            disableFullscreenUI={true}
                                            keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                                        />
                                    </View>
                                    <View>
                                        <FormattedText
                                            style={[style.helpText, padding(isLandscape)]}
                                            id='channel_modal.descriptionHelp'
                                            defaultMessage='Describe how this channel should be used.'
                                        />
                                    </View>
                                </View>
                            )}
                            <View style={[style.titleContainer15, padding(isLandscape)]}>
                                <FormattedText
                                    style={style.title}
                                    id='channel_modal.header'
                                    defaultMessage='Header'
                                />
                                <FormattedText
                                    style={style.optional}
                                    id='channel_modal.optional'
                                    defaultMessage='(optional)'
                                />
                            </View>
                            <Autocomplete
                                cursorPosition={header.length}
                                maxHeight={200}
                                onChangeText={this.onHeaderChangeText}
                                value={header}
                                nestedScrollEnabled={true}
                            />
                            <View style={[style.inputContainer, padding(isLandscape)]}>
                                <TextInputWithLocalizedPlaceholder
                                    ref={this.headerInput}
                                    value={header}
                                    onChangeText={this.onHeaderChangeText}
                                    style={[style.input, {height: 110}]}
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    placeholder={{id: t('channel_modal.headerEx'), defaultMessage: 'E.g.: "[Link Title](http://example.com)"'}}
                                    placeholderTextColor={changeOpacity(theme.centerChannelColor, 0.5)}
                                    multiline={true}
                                    blurOnSubmit={false}
                                    onFocus={this.scrollToEnd}
                                    textAlignVertical='top'
                                    underlineColorAndroid='transparent'
                                    disableFullscreenUI={true}
                                    keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                                />
                            </View>
                            <View ref={this.lastText}>
                                <FormattedText
                                    style={[style.helpText, padding(isLandscape)]}
                                    id='channel_modal.headerHelp'
                                    defaultMessage={'Set text that will appear in the header of the channel beside the channel name. For example, include frequently used links by typing [Link Title](http://example.com).'}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAwareScrollView>
            </React.Fragment>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        scrollView: {
            flex: 1,
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.06),
            paddingTop: 30,
        },
        errorContainer: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.06),
        },
        errorWrapper: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        inputContainer: {
            marginTop: 10,
            backgroundColor: theme.centerChannelBg,
        },
        input: {
            color: theme.centerChannelColor,
            fontSize: 14,
            height: 40,
            paddingHorizontal: 15,
        },
        titleContainer30: {
            flexDirection: 'row',
            marginTop: 30,
        },
        titleContainer15: {
            flexDirection: 'row',
            marginTop: 15,
        },
        title: {
            fontSize: 14,
            color: theme.centerChannelColor,
            marginLeft: 15,
        },
        optional: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 14,
            marginLeft: 5,
        },
        helpText: {
            fontSize: 14,
            color: changeOpacity(theme.centerChannelColor, 0.5),
            marginTop: 10,
            marginHorizontal: 15,
        },
    };
});
