// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {isTimezoneEnabled} from 'mattermost-redux/selectors/entities/timezone';

import {getAllowedThemes} from 'app/selectors/theme';
import {isThemeSwitchingEnabled} from 'app/utils/theme';
import {isLandscape} from 'app/selectors/device';
import DisplaySettings from './display_settings';

function mapStateToProps(state) {
    const enableTimezone = isTimezoneEnabled(state);
    const enableTheme = isThemeSwitchingEnabled(state) && getAllowedThemes(state).length > 1;

    return {
        enableTheme,
        enableTimezone,
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

export default connect(mapStateToProps)(DisplaySettings);
