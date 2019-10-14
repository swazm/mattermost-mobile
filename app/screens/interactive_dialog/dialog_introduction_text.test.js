// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Preferences from 'mattermost-redux/constants/preferences';

import DialogIntroductionText from './dialog_introduction_text.js';

describe('DialogIntroductionText', () => {
    const baseProps = {
        theme: Preferences.THEMES.default,
        value: '**bold** *italic* [link](https://mattermost.com/) <br/> [link target blank](!https://mattermost.com/)',
        isLandscape: false,
    };

    test('should render the introduction text correctly', () => {
        const wrapper = shallow(
            <DialogIntroductionText
                {...baseProps}
            />
        );

        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('should not render the component with an empty value', () => {
        baseProps.value = '';

        const wrapper = shallow(
            <DialogIntroductionText
                {...baseProps}
            />
        );

        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
