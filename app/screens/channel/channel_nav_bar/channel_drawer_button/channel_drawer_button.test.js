// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import NotificationsIOS from 'react-native-notifications';

import Preferences from 'mattermost-redux/constants/preferences';

import Badge from 'app/components/badge';
import PushNotification from 'app/push_notifications/push_notifications.ios';

import ChannelDrawerButton from './channel_drawer_button';

jest.mock('react-native-notifications', () => {
    let badgesCount = 0;
    let deliveredNotifications = {};

    return {
        getBadgesCount: jest.fn((callback) => callback(badgesCount)),
        setBadgesCount: jest.fn((count) => {
            badgesCount = count;
        }),
        addEventListener: jest.fn(),
        setDeliveredNotifications: jest.fn((notifications) => {
            deliveredNotifications = notifications;
        }),
        getDeliveredNotifications: jest.fn(async (callback) => {
            await callback(deliveredNotifications);
        }),
        removeDeliveredNotifications: jest.fn((ids) => {
            deliveredNotifications = deliveredNotifications.filter((n) => !ids.includes(n.identifier));
        }),
        cancelAllLocalNotifications: jest.fn(),
        NotificationAction: jest.fn(),
        NotificationCategory: jest.fn(),
    };
});

describe('ChannelDrawerButton', () => {
    const baseProps = {
        openDrawer: jest.fn(),
        badgeCount: 0,
        theme: Preferences.THEMES.default,
        visible: false,
    };

    afterEach(() => NotificationsIOS.setBadgesCount(0));

    test('should match, full snapshot', () => {
        const wrapper = shallow(
            <ChannelDrawerButton {...baseProps}/>
        );

        // no badge to show
        expect(wrapper.getElement()).toMatchSnapshot();
        expect(wrapper.find(Badge).length).toEqual(0);

        // badge should render
        wrapper.setProps({badgeCount: 1, visible: true});
        expect(wrapper.getElement()).toMatchSnapshot();
        expect(wrapper.find(Badge).length).toEqual(1);
    });

    test('should not set app icon badge on mount', () => {
        const setApplicationIconBadgeNumber = jest.spyOn(PushNotification, 'setApplicationIconBadgeNumber');
        const props = {
            ...baseProps,
            badgeCount: 0,
        };

        shallow(
            <ChannelDrawerButton {...props}/>
        );
        expect(setApplicationIconBadgeNumber).not.toBeCalled();
        NotificationsIOS.getBadgesCount((count) => expect(count).toBe(0));
    });

    test('should set app icon badge on mount', () => {
        const setApplicationIconBadgeNumber = jest.spyOn(PushNotification, 'setApplicationIconBadgeNumber');
        const props = {
            ...baseProps,
            badgeCount: 1,
        };

        shallow(
            <ChannelDrawerButton {...props}/>
        );
        expect(setApplicationIconBadgeNumber).toHaveBeenCalledTimes(1);
        NotificationsIOS.getBadgesCount((count) => expect(count).toBe(1));
    });

    test('should set app icon badge update', () => {
        const setApplicationIconBadgeNumber = jest.spyOn(PushNotification, 'setApplicationIconBadgeNumber');
        const props = {
            ...baseProps,
            badgeCount: 0,
        };

        const wrapper = shallow(
            <ChannelDrawerButton {...props}/>
        );
        NotificationsIOS.getBadgesCount((count) => expect(count).toBe(0));

        wrapper.setProps({badgeCount: 2});
        expect(setApplicationIconBadgeNumber).toHaveBeenCalledTimes(1);
        expect(setApplicationIconBadgeNumber).toHaveBeenCalledWith(2);
        NotificationsIOS.getBadgesCount((count) => expect(count).toBe(2));
    });

    test('should set remove icon badge on update', () => {
        const setApplicationIconBadgeNumber = jest.spyOn(PushNotification, 'setApplicationIconBadgeNumber');
        const props = {
            ...baseProps,
            badgeCount: 0,
        };

        const wrapper = shallow(
            <ChannelDrawerButton {...props}/>
        );
        wrapper.setProps({badgeCount: 2});
        expect(setApplicationIconBadgeNumber).toHaveBeenCalledWith(2);
        NotificationsIOS.getBadgesCount((count) => expect(count).toBe(2));

        wrapper.setProps({badgeCount: -1});
        expect(setApplicationIconBadgeNumber).toHaveBeenCalledWith(-1);
        NotificationsIOS.getBadgesCount((count) => expect(count).toBe(0));
    });
});
