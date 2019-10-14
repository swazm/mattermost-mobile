// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {StyleSheet} from 'react-native';
import tinyColor from 'tinycolor2';

import * as ThemeUtils from 'mattermost-redux/utils/theme_utils';

import {mergeNavigationOptions} from 'app/actions/navigation';

export function makeStyleSheetFromTheme(getStyleFromTheme) {
    return ThemeUtils.makeStyleFromTheme((theme) => {
        return StyleSheet.create(getStyleFromTheme(theme));
    });
}

export const changeOpacity = ThemeUtils.changeOpacity;

export const blendColors = ThemeUtils.blendColors;

export function concatStyles(...styles) {
    return [].concat(styles);
}

export function setNavigatorStyles(componentId, theme) {
    const options = {
        topBar: {
            title: {
                color: theme.sidebarHeaderTextColor,
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
            leftButtonColor: theme.sidebarHeaderTextColor,
            rightButtonColor: theme.sidebarHeaderTextColor,
            backButton: {
                color: theme.sidebarHeaderTextColor,
            },
        },
        layout: {
            backgroundColor: theme.centerChannelBg,
        },
    };

    mergeNavigationOptions(componentId, options);
}

export function isThemeSwitchingEnabled(state) {
    const {config} = state.entities.general;
    return config.EnableThemeSelection === 'true';
}

export function getKeyboardAppearanceFromTheme(theme) {
    return tinyColor(theme.centerChannelBg).isLight() ? 'light' : 'dark';
}
