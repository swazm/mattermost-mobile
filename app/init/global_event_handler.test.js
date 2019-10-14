// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import intitialState from 'app/initial_state';
import PushNotification from 'app/push_notifications';
import * as I18n from 'app/i18n';

import GlobalEventHandler from './global_event_handler';

jest.mock('app/init/credentials', () => ({
    getCurrentServerUrl: jest.fn().mockResolvedValue(''),
    getAppCredentials: jest.fn(),
    removeAppCredentials: jest.fn(),
}));

jest.mock('app/utils/error_handling', () => ({
    default: {
        initializeErrorHandling: jest.fn(),
    },
}));

jest.mock('react-native-notifications', () => ({
    addEventListener: jest.fn(),
    cancelAllLocalNotifications: jest.fn(),
    setBadgesCount: jest.fn(),
    NotificationAction: jest.fn(),
    NotificationCategory: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const store = mockStore(intitialState);
GlobalEventHandler.store = store;

// TODO: Add Android test as part of https://mattermost.atlassian.net/browse/MM-17110
describe('GlobalEventHandler', () => {
    it('should clear notifications and reset moment locale on logout', async () => {
        const clearNotifications = jest.spyOn(PushNotification, 'clearNotifications');
        const resetMomentLocale = jest.spyOn(I18n, 'resetMomentLocale');

        await GlobalEventHandler.onLogout();
        expect(clearNotifications).toHaveBeenCalled();
        expect(resetMomentLocale).toHaveBeenCalledWith();
    });

    it('should call onAppStateChange after configuration', () => {
        const onAppStateChange = jest.spyOn(GlobalEventHandler, 'onAppStateChange');

        GlobalEventHandler.configure({store});
        expect(GlobalEventHandler.store).not.toBeNull();
        expect(onAppStateChange).toHaveBeenCalledWith('active');
    });

    it('should handle onAppStateChange to active if the store set', () => {
        const appActive = jest.spyOn(GlobalEventHandler, 'appActive');
        const appInactive = jest.spyOn(GlobalEventHandler, 'appInactive');
        expect(GlobalEventHandler.store).not.toBeNull();

        GlobalEventHandler.onAppStateChange('active');
        expect(appActive).toHaveBeenCalled();
        expect(appInactive).not.toHaveBeenCalled();
    });

    it('should handle onAppStateChange to background if the store set', () => {
        const appActive = jest.spyOn(GlobalEventHandler, 'appActive');
        const appInactive = jest.spyOn(GlobalEventHandler, 'appInactive');
        expect(GlobalEventHandler.store).not.toBeNull();

        GlobalEventHandler.onAppStateChange('background');
        expect(appActive).not.toHaveBeenCalled();
        expect(appInactive).toHaveBeenCalled();
    });

    it('should not handle onAppStateChange if the store is not set', () => {
        const appActive = jest.spyOn(GlobalEventHandler, 'appActive');
        const appInactive = jest.spyOn(GlobalEventHandler, 'appInactive');
        GlobalEventHandler.store = null;

        GlobalEventHandler.onAppStateChange('active');
        expect(appActive).not.toHaveBeenCalled();
        expect(appInactive).not.toHaveBeenCalled();

        GlobalEventHandler.onAppStateChange('background');
        expect(appActive).not.toHaveBeenCalled();
        expect(appInactive).not.toHaveBeenCalled();
    });
});
