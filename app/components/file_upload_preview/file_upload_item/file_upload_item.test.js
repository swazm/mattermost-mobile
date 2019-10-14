// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import ImageCacheManager from 'app/utils/image_cache_manager';
import FileUploadItem from './file_upload_item';

describe('FileUploadItem', () => {
    const props = {
        actions: {
            handleRemoveFile: jest.fn(),
            retryFileUpload: jest.fn(),
            uploadComplete: jest.fn(),
            uploadFailed: jest.fn(),
        },
        channelId: 'channel-id',
        file: {
            loading: false,
        },
        theme: {},
    };

    describe('downloadAndUploadFile', () => {
        test('should upload file', async () => {
            const component = shallow(<FileUploadItem {...props}/>);
            component.instance().uploadFile = jest.fn();
            await component.instance().downloadAndUploadFile({
                localPath: 'path/to/file',
            });
            expect(component.instance().uploadFile).toHaveBeenCalledWith({
                localPath: 'path/to/file',
            });
        });

        test('should download file if file path is http', async () => {
            jest.spyOn(ImageCacheManager, 'cache').mockReturnValue('path/to/downloaded/image');
            const component = shallow(<FileUploadItem {...props}/>);
            component.instance().uploadFile = jest.fn();
            await component.instance().downloadAndUploadFile({
                localPath: 'https://path.to/file',
            });
            expect(component.instance().uploadFile).toHaveBeenCalledWith({
                localPath: 'path/to/downloaded/image',
            });
        });
    });
});
