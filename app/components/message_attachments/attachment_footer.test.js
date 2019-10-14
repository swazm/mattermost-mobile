// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {MAX_ATTACHMENT_FOOTER_LENGTH} from 'app/constants/attachment';
import AttachmentFooter from './attachment_footer';

import Preferences from 'mattermost-redux/constants/preferences';

describe('AttachmentFooter', () => {
    const baseProps = {
        text: 'This is the footer!',
        icon: 'https://images.com/image.png',
        theme: Preferences.THEMES.default,
    };

    test('it matches snapshot when no footer is provided', () => {
        const props = {
            ...baseProps,
            text: undefined,
            icon: undefined,
        };

        const wrapper = shallow(<AttachmentFooter {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('it matches snapshot when footer text is provided', () => {
        const props = {
            ...baseProps,
            icon: undefined,
        };

        const wrapper = shallow(<AttachmentFooter {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('it matches snapshot when only the footer icon is provided', () => {
        const props = {
            ...baseProps,
            text: undefined,
        };

        const wrapper = shallow(<AttachmentFooter {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('it matches snapshot when both footer and footer_icon are provided', () => {
        const wrapper = shallow(<AttachmentFooter {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('it matches snapshot when the footer is longer than the maximum length', () => {
        const props = {
            ...baseProps,
            text: 'a'.repeat(MAX_ATTACHMENT_FOOTER_LENGTH + 1),
        };

        const wrapper = shallow(<AttachmentFooter {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
