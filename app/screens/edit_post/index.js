// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {editPost} from 'mattermost-redux/actions/posts';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getDimensions, isLandscape} from 'app/selectors/device';

import EditPost from './edit_post';

function mapStateToProps(state, ownProps) {
    const {editPost: editPostRequest} = state.requests.posts;

    return {
        ...getDimensions(state),
        editPostRequest,
        post: ownProps.post,
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            editPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPost);
