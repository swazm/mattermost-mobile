// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import MockAsyncStorage from 'mock-async-storage';
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({adapter: new Adapter()});

const mockImpl = new MockAsyncStorage();
jest.mock('@react-native-community/async-storage', () => mockImpl);
global.window = {};
global.fetch = jest.fn(() => Promise.resolve());

/* eslint-disable no-console */

jest.mock('NativeModules', () => {
    return {
        UIManager: {
            RCTView: {
                directEventTypes: {},
            },
        },
        BlurAppScreen: () => true,
        MattermostManaged: {
            getConfig: jest.fn(),
        },
        PlatformConstants: {
            forceTouchAvailable: false,
        },
        RNGestureHandlerModule: {
            State: {
                BEGAN: 'BEGAN',
                FAILED: 'FAILED',
                ACTIVE: 'ACTIVE',
                END: 'END',
            },
        },
        RNKeychainManager: {
            SECURITY_LEVEL_ANY: 'ANY',
            SECURITY_LEVEL_SECURE_SOFTWARE: 'SOFTWARE',
            SECURITY_LEVEL_SECURE_HARDWARE: 'HARDWARE',
        },
        RNCNetInfo: {
            addEventListener: jest.fn(),
            getCurrentState: jest.fn().mockResolvedValue({isConnected: true}),
        },
        RNReactNativeHapticFeedback: {
            trigger: jest.fn(),
        },
        StatusBarManager: {
            getHeight: jest.fn(),
        },
    };
});
jest.mock('NativeEventEmitter');

jest.mock('react-native-device-info', () => {
    return {
        getVersion: () => '0.0.0',
        getBuildNumber: () => '0',
        getModel: () => 'iPhone X',
        isTablet: () => false,
        getApplicationName: () => 'Mattermost',
        getDeviceLocale: () => 'en-US',
    };
});

jest.mock('react-native-cookies', () => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: jest.fn(),
}));

jest.mock('react-native-navigation', () => {
    const RNN = require.requireActual('react-native-navigation');
    return {
        ...RNN,
        Navigation: {
            ...RNN.Navigation,
            events: () => ({
                registerAppLaunchedListener: jest.fn(),
                bindComponent: jest.fn(),
            }),
            setRoot: jest.fn(),
            pop: jest.fn(),
            push: jest.fn(),
            showModal: jest.fn(),
            dismissModal: jest.fn(),
            dismissAllModals: jest.fn(),
            popToRoot: jest.fn(),
            mergeOptions: jest.fn(),
            showOverlay: jest.fn(),
            dismissOverlay: jest.fn(),
        },
    };
});

jest.mock('app/actions/navigation', () => ({
    resetToChannel: jest.fn(),
    resetToSelectServer: jest.fn(),
    resetToTeams: jest.fn(),
    goToScreen: jest.fn(),
    popTopScreen: jest.fn(),
    showModal: jest.fn(),
    showModalOverCurrentContext: jest.fn(),
    showSearchModal: jest.fn(),
    peek: jest.fn(),
    setButtons: jest.fn(),
    showOverlay: jest.fn(),
    mergeNavigationOptions: jest.fn(),
    popToRoot: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(() => Promise.resolve()),
    dismissAllModals: jest.fn(() => Promise.resolve()),
    dismissOverlay: jest.fn(() => Promise.resolve()),
}));

let logs;
let warns;
let errors;
beforeAll(() => {
    console.originalLog = console.log;
    console.log = jest.fn((...params) => {
        console.originalLog(...params);
        logs.push(params);
    });

    console.originalWarn = console.warn;
    console.warn = jest.fn((...params) => {
        console.originalWarn(...params);
        warns.push(params);
    });

    console.originalError = console.error;
    console.error = jest.fn((...params) => {
        console.originalError(...params);
        errors.push(params);
    });
});

beforeEach(() => {
    logs = [];
    warns = [];
    errors = [];
});

afterEach(() => {
    if (logs.length > 0 || warns.length > 0 || errors.length > 0) {
        throw new Error('Unexpected console logs' + logs + warns + errors);
    }
});

jest.mock('rn-fetch-blob', () => ({
    fs: {
        dirs: {
            DocumentDir: () => jest.fn(),
            CacheDir: () => jest.fn(),
        },
        exists: jest.fn(),
        existsWithDiffExt: jest.fn(),
        unlink: jest.fn(),
        mv: jest.fn(),
    },
    fetch: jest.fn(),
    config: jest.fn(),
}));

jest.mock('rn-fetch-blob/fs', () => ({
    dirs: {
        DocumentDir: () => jest.fn(),
        CacheDir: () => jest.fn(),
    },
    exists: jest.fn(),
    existsWithDiffExt: jest.fn(),
    unlink: jest.fn(),
    mv: jest.fn(),
}));

global.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
};
