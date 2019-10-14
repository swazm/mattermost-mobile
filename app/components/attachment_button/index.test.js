// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import Permissions from 'react-native-permissions';
import {Alert} from 'react-native';

import Preferences from 'mattermost-redux/constants/preferences';

import {VALID_MIME_TYPES} from 'app/screens/edit_profile/edit_profile';
import {PermissionTypes} from 'app/constants';

import AttachmentButton from './index';

jest.mock('react-intl');

jest.mock('Platform', () => {
    const Platform = require.requireActual('Platform');
    Platform.OS = 'ios';
    return Platform;
});

describe('AttachmentButton', () => {
    const formatMessage = jest.fn();
    const baseProps = {
        theme: Preferences.THEMES.default,
        blurTextBox: jest.fn(),
        maxFileSize: 10,
        uploadFiles: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AttachmentButton {...baseProps}/>
        );

        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('should not upload file with invalid MIME type', () => {
        const props = {
            ...baseProps,
            validMimeTypes: VALID_MIME_TYPES,
            onShowUnsupportedMimeTypeWarning: jest.fn(),
        };

        const wrapper = shallow(
            <AttachmentButton {...props}/>
        );

        const file = {
            type: 'image/gif',
            fileSize: 10,
            fileName: 'test',
        };
        wrapper.instance().uploadFiles([file]);
        expect(props.onShowUnsupportedMimeTypeWarning).toHaveBeenCalled();
        expect(props.uploadFiles).not.toHaveBeenCalled();
    });

    test('should upload file with valid MIME type', () => {
        const props = {
            ...baseProps,
            validMimeTypes: VALID_MIME_TYPES,
            onShowUnsupportedMimeTypeWarning: jest.fn(),
        };

        const wrapper = shallow(
            <AttachmentButton {...props}/>
        );

        const file = {
            fileSize: 10,
            fileName: 'test',
        };
        VALID_MIME_TYPES.forEach((mimeType) => {
            file.type = mimeType;
            wrapper.instance().uploadFiles([file]);
            expect(props.onShowUnsupportedMimeTypeWarning).not.toHaveBeenCalled();
            expect(props.uploadFiles).toHaveBeenCalled();
        });
    });

    test('should show permission denied alert if permission is denied in iOS', async () => {
        expect.assertions(1);

        jest.spyOn(Permissions, 'check').mockReturnValue(PermissionTypes.DENIED);
        jest.spyOn(Permissions, 'canOpenSettings').mockReturnValue(true);
        jest.spyOn(Alert, 'alert').mockReturnValue(true);

        const wrapper = shallow(
            <AttachmentButton {...baseProps}/>,
            {context: {intl: {formatMessage}}},
        );

        await wrapper.instance().hasPhotoPermission('camera');
        expect(Alert.alert).toBeCalled();
    });
});
