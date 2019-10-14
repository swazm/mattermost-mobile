// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import Preferences from 'mattermost-redux/constants/preferences';
import {TouchableOpacity} from 'react-native';
import RadioSetting from './radio_setting.js';
import CheckMark from 'app/components/checkmark';

describe('components/widgets/settings/RadioSetting', () => {
    const theme = Preferences.THEMES.default;
    const options = [
        {text: 'this is engineering', value: 'Engineering'},
        {text: 'this is sales', value: 'Sales'},
        {text: 'this is administration', value: 'Administration'},
    ];

    test('onChange', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <RadioSetting
                id='string.id'
                label='some label'
                options={options}
                default={'Administration'}
                onChange={onChange}
                theme={theme}
            />
        );
        wrapper.find(TouchableOpacity).at(1).props().onPress();

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('string.id', 'Sales');
    });

    test('should match snapshot when error is present', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <RadioSetting
                id='string.id'
                label='some label'
                options={options}
                errorText={'some error message'}
                default={'Administration'}
                onChange={onChange}
                theme={theme}
            />
        );

        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('no option should be checked when the value is not in provided options', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <RadioSetting
                id='string.id'
                label='some label'
                options={options}
                default={'invalid-option-value'}
                onChange={onChange}
                theme={theme}
            />
        );

        expect(wrapper.find(CheckMark)).toHaveLength(0);
    });
});
