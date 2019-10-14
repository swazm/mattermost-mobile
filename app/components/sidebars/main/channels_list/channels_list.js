// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Platform,
    View,
} from 'react-native';
import {intlShape} from 'react-intl';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import SearchBar from 'app/components/search_bar';
import {ViewTypes} from 'app/constants';
import {paddingHorizontal as padding} from 'app/components/safe_area_view/iphone_x_spacing';
import {
    changeOpacity,
    makeStyleSheetFromTheme,
    getKeyboardAppearanceFromTheme,
} from 'app/utils/theme';

import List from './list';
import SwitchTeamsButton from './switch_teams_button';

const {ANDROID_TOP_PORTRAIT} = ViewTypes;
let FilteredList = null;

export default class ChannelsList extends PureComponent {
    static propTypes = {
        onJoinChannel: PropTypes.func.isRequired,
        onSearchEnds: PropTypes.func.isRequired,
        onSearchStart: PropTypes.func.isRequired,
        onSelectChannel: PropTypes.func.isRequired,
        onShowTeams: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        drawerOpened: PropTypes.bool,
        previewChannel: PropTypes.func,
        isLandscape: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            searching: false,
            term: '',
        };

        MaterialIcon.getImageSource('close', 20, this.props.theme.sidebarHeaderTextColor).then((source) => {
            this.closeButton = source;
        });
    }

    cancelSearch = () => {
        if (this.refs.search_bar) {
            this.refs.search_bar.cancel();
        }
    };

    onSelectChannel = (channel, currentChannelId) => {
        if (channel.fake) {
            this.props.onJoinChannel(channel, currentChannelId);
        } else {
            this.props.onSelectChannel(channel, currentChannelId);
        }

        this.cancelSearch();
    };

    onSearch = (term) => {
        this.setState({term});
    };

    onSearchFocused = () => {
        if (!FilteredList) {
            FilteredList = require('./filtered_list').default;
        }
        this.setState({searching: true});
        this.props.onSearchStart();
    };

    onSearchCancel = () => {
        this.props.onSearchEnds();
        this.setState({searching: false});
        this.onSearch('');
    };

    render() {
        const {intl} = this.context;
        const {
            onShowTeams,
            theme,
            previewChannel,
            isLandscape,
        } = this.props;

        const {searching, term} = this.state;
        const styles = getStyleSheet(theme);

        let list;
        if (searching) {
            list = (
                <FilteredList
                    onSelectChannel={this.onSelectChannel}
                    styles={styles}
                    term={term}
                    previewChannel={previewChannel}
                />
            );
        } else {
            list = (
                <List
                    onSelectChannel={this.onSelectChannel}
                    styles={styles}
                    previewChannel={previewChannel}
                />
            );
        }

        const searchBarInput = {
            backgroundColor: changeOpacity(theme.sidebarHeaderTextColor, 0.2),
            color: theme.sidebarHeaderTextColor,
            fontSize: 15,
            ...Platform.select({
                android: {
                    marginBottom: -5,
                },
            }),
        };

        const title = (
            <View style={[styles.searchContainer, padding(isLandscape)]}>
                <SearchBar
                    ref='search_bar'
                    placeholder={intl.formatMessage({id: 'mobile.channel_drawer.search', defaultMessage: 'Jump to...'})}
                    cancelTitle={intl.formatMessage({id: 'mobile.post.cancel', defaultMessage: 'Cancel'})}
                    inputCollapsedMargin={0}
                    backgroundColor='transparent'
                    inputHeight={33}
                    inputStyle={searchBarInput}
                    placeholderTextColor={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                    tintColorSearch={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                    tintColorDelete={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                    titleCancelColor={theme.sidebarHeaderTextColor}
                    selectionColor={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                    onSearchButtonPress={this.onSearch}
                    onCancelButtonPress={this.onSearchCancel}
                    onChangeText={this.onSearch}
                    onFocus={this.onSearchFocused}
                    searchIconCollapsedMargin={5}
                    searchIconExpandedMargin={5}
                    keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                    value={term}
                    leftComponent={(
                        <SwitchTeamsButton
                            onShowTeams={onShowTeams}
                        />
                    )}
                    positionRightDelete={5}
                />
            </View>
        );

        return (
            <View
                style={styles.container}
            >
                <View style={styles.headerContainer}>
                    {title}
                </View>
                {list}
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        above: {
            backgroundColor: theme.mentionBg,
            top: 40,
        },
        action: {
            color: changeOpacity(theme.sidebarText, 0.4),
            fontSize: 26,
            fontWeight: '100',
        },
        actionContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        container: {
            backgroundColor: theme.sidebarBg,
            flex: 1,
        },
        header: {
            color: theme.sidebarHeaderTextColor,
            flex: 1,
            fontSize: 17,
            fontWeight: 'normal',
            paddingLeft: 16,
        },
        headerContainer: {
            alignItems: 'center',
            paddingLeft: 13,
            backgroundColor: theme.sidebarBg,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: changeOpacity(theme.sidebarHeaderTextColor, 0.10),
            ...Platform.select({
                android: {
                    height: ANDROID_TOP_PORTRAIT,
                },
                ios: {
                    height: 54,
                },
            }),
        },
        hitSlop: {
            bottom: 10,
            left: 10,
            right: 10,
            top: 10,
        },
        searchContainer: {
            flex: 1,
            paddingRight: 10,
            ...Platform.select({
                android: {
                    marginBottom: 1,
                },
                ios: {
                    marginBottom: 3,
                },
            }),
        },
        separator: {
            backgroundColor: changeOpacity(theme.sidebarHeaderTextColor, 0.1),
            height: 1,
            width: '100%',
        },
        separatorContainer: {
            flex: 1,
            justifyContent: 'center',
            marginHorizontal: 16,
        },
        switchContainer: {
            position: 'relative',
            top: -1,
        },
        title: {
            color: theme.sidebarText,
            opacity: 0.4,
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.2,
            lineHeight: 18,
            fontFamily: 'Open Sans',
        },
        titleContainer: { // These aren't used by this component, but they are passed down to the list component
            alignItems: 'center',
            backgroundColor: theme.sidebarBg,
            flex: 1,
            flexDirection: 'row',
            height: 40,
            paddingLeft: 16,
        },
    };
});
