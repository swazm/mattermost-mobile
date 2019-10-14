// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionSheetIOS} from 'react-native';

export default {
    showBottomSheetWithOptions: (options, callback) => {
        return ActionSheetIOS.showActionSheetWithOptions(options, callback);
    },
};
