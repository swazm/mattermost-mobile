// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {login} from 'mattermost-redux/actions/users';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {isLandscape} from 'app/selectors/device';
import LoginActions from 'app/actions/views/login';

import Login from './login.js';

function mapStateToProps(state) {
    const {login: loginRequest} = state.requests.users;
    const config = getConfig(state);
    const license = getLicense(state);
    return {
        ...state.views.login,
        loginRequest,
        config,
        license,
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            ...LoginActions,
            login,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
