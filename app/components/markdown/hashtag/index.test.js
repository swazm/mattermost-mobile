// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import * as NavigationActions from 'app/actions/navigation';

import Hashtag from './index';

describe('Hashtag', () => {
    const baseProps = {
        hashtag: 'test',
        linkStyle: {color: 'red'},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<Hashtag {...baseProps}/>);

        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('handlePress should open hashtag search', async () => {
        const dismissAllModals = jest.spyOn(NavigationActions, 'dismissAllModals');
        const popToRoot = jest.spyOn(NavigationActions, 'popToRoot');
        const showSearchModal = jest.spyOn(NavigationActions, 'showSearchModal');

        const props = {
            ...baseProps,
        };

        const wrapper = shallow(<Hashtag {...props}/>);

        await wrapper.instance().handlePress();

        expect(dismissAllModals).toHaveBeenCalled();
        expect(popToRoot).toHaveBeenCalled();
        expect(showSearchModal).toHaveBeenCalledWith('#test');
    });

    test('handlePress should call onHashtagPress if provided', async () => {
        const dismissAllModals = jest.spyOn(NavigationActions, 'dismissAllModals');
        const popToRoot = jest.spyOn(NavigationActions, 'popToRoot');
        const showSearchModal = jest.spyOn(NavigationActions, 'showSearchModal');

        const props = {
            ...baseProps,
            onHashtagPress: jest.fn(),
        };

        const wrapper = shallow(<Hashtag {...props}/>);

        await wrapper.instance().handlePress();

        expect(dismissAllModals).not.toBeCalled();
        expect(popToRoot).not.toBeCalled();
        expect(showSearchModal).not.toBeCalled();

        expect(props.onHashtagPress).toBeCalled();
    });
});
