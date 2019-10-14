// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable new-cap */

import React, {PureComponent} from 'react';
import {TouchableNativeFeedback, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import PropTypes from 'prop-types';

import CustomPropTypes from 'app/constants/custom_prop_types';

export default class TouchableWithFeedbackAndroid extends PureComponent {
    static propTypes = {
        children: CustomPropTypes.Children,
        underlayColor: PropTypes.string,
        type: PropTypes.oneOf(['native', 'opacity', 'none']),
    };

    static defaultProps = {
        type: 'native',
    };

    render() {
        const {children, underlayColor, type, ...props} = this.props;

        switch (type) {
        case 'native':
            return (
                <TouchableNativeFeedback
                    {...props}
                    background={TouchableNativeFeedback.Ripple(underlayColor || '#000', false)}
                >
                    <View>
                        {children}
                    </View>
                </TouchableNativeFeedback>
            );
        case 'opacity':
            return (
                <TouchableOpacity
                    {...props}
                >
                    {children}
                </TouchableOpacity>
            );
        case 'none':
            return (
                <TouchableWithoutFeedback
                    {...props}
                >
                    {children}
                </TouchableWithoutFeedback>
            );
        }

        return null;
    }
}
