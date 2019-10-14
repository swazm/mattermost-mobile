// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {logout, setStatus} from 'mattermost-redux/actions/users';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import SettingsSidebar from './settings_sidebar';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state) || {};
    const status = getStatusForUserId(state, currentUser.id);

    return {
        currentUser,
        status,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            logout,
            setStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(SettingsSidebar);
