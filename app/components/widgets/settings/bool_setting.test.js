// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import Preferences from 'mattermost-redux/constants/preferences';

import BoolSetting from './bool_setting.js';

describe('components/widgets/settings/TextSetting', () => {
    const theme = Preferences.THEMES.default;
    test('onChange', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <BoolSetting
                id='elementid'
                label='Can you please check below'
                value={true}
                placeholder='This is a boolean setting.'
                optional={false}
                theme={theme}
                onChange={onChange}
                isLandscape={false}
            />
        );

        wrapper.instance().handleChange(false);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('elementid', 'false');

        wrapper.instance().handleChange(true);
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenCalledWith('elementid', 'true');
    });
});
