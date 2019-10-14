// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    Alert,
    NativeModules,
    Platform,
    StyleSheet,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import DeviceInfo from 'react-native-device-info';
import AndroidOpenSettings from 'react-native-android-open-settings';

import Icon from 'react-native-vector-icons/Ionicons';
import {DocumentPicker} from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import Permissions from 'react-native-permissions';

import {lookupMimeType} from 'mattermost-redux/utils/file_utils';

import TouchableWithFeedback from 'app/components/touchable_with_feedback';
import {PermissionTypes} from 'app/constants';
import {changeOpacity} from 'app/utils/theme';
import {t} from 'app/utils/i18n';
import {showModalOverCurrentContext} from 'app/actions/navigation';

const ShareExtension = NativeModules.MattermostShare;

export default class AttachmentButton extends PureComponent {
    static propTypes = {
        blurTextBox: PropTypes.func.isRequired,
        browseFileTypes: PropTypes.string,
        validMimeTypes: PropTypes.array,
        canBrowseFiles: PropTypes.bool,
        canBrowsePhotoLibrary: PropTypes.bool,
        canBrowseVideoLibrary: PropTypes.bool,
        canTakePhoto: PropTypes.bool,
        canTakeVideo: PropTypes.bool,
        children: PropTypes.node,
        fileCount: PropTypes.number,
        maxFileCount: PropTypes.number.isRequired,
        maxFileSize: PropTypes.number.isRequired,
        onShowFileMaxWarning: PropTypes.func,
        onShowFileSizeWarning: PropTypes.func,
        onShowUnsupportedMimeTypeWarning: PropTypes.func,
        theme: PropTypes.object.isRequired,
        uploadFiles: PropTypes.func.isRequired,
        wrapper: PropTypes.bool,
        extraOptions: PropTypes.arrayOf(PropTypes.object),
    };

    static defaultProps = {
        browseFileTypes: Platform.OS === 'ios' ? 'public.item' : '*/*',
        validMimeTypes: [],
        canBrowseFiles: true,
        canBrowsePhotoLibrary: true,
        canBrowseVideoLibrary: true,
        canTakePhoto: true,
        canTakeVideo: true,
        maxFileCount: 5,
        extraOptions: null,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    getPermissionDeniedMessage = (source, mediaType = '') => {
        const {formatMessage} = this.context.intl;
        const applicationName = DeviceInfo.getApplicationName();
        switch (source) {
        case 'camera': {
            if (mediaType === 'video') {
                return {
                    title: formatMessage({
                        id: 'mobile.camera_video_permission_denied_title',
                        defaultMessage: '{applicationName} would like to access your camera',
                    }, {applicationName}),
                    text: formatMessage({
                        id: 'mobile.camera_video_permission_denied_description',
                        defaultMessage: 'Take videos and upload them to your Mattermost instance or save them to your device. Open Settings to grant Mattermost Read and Write access to your camera.',
                    }),
                };
            }

            return {
                title: formatMessage({
                    id: 'mobile.camera_photo_permission_denied_title',
                    defaultMessage: '{applicationName} would like to access your camera',
                }, {applicationName}),
                text: formatMessage({
                    id: 'mobile.camera_photo_permission_denied_description',
                    defaultMessage: 'Take photos and upload them to your Mattermost instance or save them to your device. Open Settings to grant Mattermost Read and Write access to your camera.',
                }),
            };
        }
        case 'storage':
            return {
                title: formatMessage({
                    id: 'mobile.storage_permission_denied_title',
                    defaultMessage: '{applicationName} would like to access your files',
                }, {applicationName}),
                text: formatMessage({
                    id: 'mobile.storage_permission_denied_description',
                    defaultMessage: 'Upload files to your Mattermost instance. Open Settings to grant Mattermost Read and Write access to files on this device.',
                }),
            };
        case 'video':
            return {
                title: formatMessage({
                    id: 'mobile.android.videos_permission_denied_title',
                    defaultMessage: '{applicationName} would like to access your videos',
                }, {applicationName}),
                text: formatMessage({
                    id: 'mobile.android.videos_permission_denied_description',
                    defaultMessage: 'Upload videos to your Mattermost instance or save them to your device. Open Settings to grant Mattermost Read and Write access to your video library.',
                }),
            };
        case 'photo':
        default: {
            if (Platform.OS === 'android') {
                return {
                    title: formatMessage({
                        id: 'mobile.android.photos_permission_denied_title',
                        defaultMessage: '{applicationName} would like to access your photos',
                    }, {applicationName}),
                    text: formatMessage({
                        id: 'mobile.android.photos_permission_denied_description',
                        defaultMessage: 'Upload photos to your Mattermost instance or save them to your device. Open Settings to grant Mattermost Read and Write access to your photo library.',
                    }),
                };
            }

            return {
                title: formatMessage({
                    id: 'mobile.ios.photos_permission_denied_title',
                    defaultMessage: '{applicationName} would like to access your photos',
                }, {applicationName}),
                text: formatMessage({
                    id: 'mobile.ios.photos_permission_denied_description',
                    defaultMessage: 'Upload photos and videos to your Mattermost instance or save them to your device. Open Settings to grant Mattermost Read and Write access to your photo and video library.',
                }),
            };
        }
        }
    }

    attachPhotoFromCamera = () => {
        return this.attachFileFromCamera('camera', 'photo');
    };

    attachFileFromCamera = async (source, mediaType) => {
        const {formatMessage} = this.context.intl;
        const {title, text} = this.getPermissionDeniedMessage('camera', mediaType);
        const options = {
            quality: 0.8,
            videoQuality: 'high',
            noData: true,
            mediaType,
            storageOptions: {
                cameraRoll: true,
                waitUntilSaved: true,
            },
            permissionDenied: {
                title,
                text,
                reTryTitle: formatMessage({
                    id: 'mobile.permission_denied_retry',
                    defaultMessage: 'Settings',
                }),
                okTitle: formatMessage({id: 'mobile.permission_denied_dismiss', defaultMessage: 'Don\'t Allow'}),
            },
        };

        const hasCameraPermission = await this.hasPhotoPermission(source, mediaType);

        if (hasCameraPermission) {
            ImagePicker.launchCamera(options, (response) => {
                if (response.error || response.didCancel) {
                    return;
                }

                this.uploadFiles([response]);
            });
        }
    };

    attachFileFromLibrary = async () => {
        const {formatMessage} = this.context.intl;
        const {title, text} = this.getPermissionDeniedMessage('photo');
        const options = {
            quality: 0.8,
            noData: true,
            permissionDenied: {
                title,
                text,
                reTryTitle: formatMessage({
                    id: 'mobile.permission_denied_retry',
                    defaultMessage: 'Settings',
                }),
                okTitle: formatMessage({id: 'mobile.permission_denied_dismiss', defaultMessage: 'Don\'t Allow'}),
            },
        };

        if (Platform.OS === 'ios') {
            options.mediaType = 'mixed';
        }

        const hasPhotoPermission = await this.hasPhotoPermission('photo');

        if (hasPhotoPermission) {
            ImagePicker.launchImageLibrary(options, (response) => {
                if (response.error || response.didCancel) {
                    return;
                }

                this.uploadFiles([response]);
            });
        }
    };

    attachVideoFromCamera = () => {
        return this.attachFileFromCamera('camera', 'video');
    };

    attachVideoFromLibraryAndroid = () => {
        const {formatMessage} = this.context.intl;
        const {title, text} = this.getPermissionDeniedMessage('video');
        const options = {
            videoQuality: 'high',
            mediaType: 'video',
            noData: true,
            permissionDenied: {
                title,
                text,
                reTryTitle: formatMessage({
                    id: 'mobile.permission_denied_retry',
                    defaultMessage: 'Settings',
                }),
                okTitle: formatMessage({id: 'mobile.permission_denied_dismiss', defaultMessage: 'Don\'t Allow'}),
            },
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.error || response.didCancel) {
                return;
            }

            this.uploadFiles([response]);
        });
    };

    attachFileFromFiles = async () => {
        const {browseFileTypes} = this.props;
        const hasPermission = await this.hasStoragePermission();

        if (hasPermission) {
            DocumentPicker.show({
                filetype: [browseFileTypes],
            }, async (error, res) => {
                if (error) {
                    return;
                }

                if (Platform.OS === 'android') {
                    // For android we need to retrieve the realPath in case the file being imported is from the cloud
                    const newUri = await ShareExtension.getFilePath(res.uri);
                    if (newUri.filePath) {
                        res.uri = newUri.filePath;
                    } else {
                        return;
                    }
                }

                // Decode file uri to get the actual path
                res.uri = decodeURIComponent(res.uri);

                this.uploadFiles([res]);
            });
        }
    };

    hasPhotoPermission = async (source, mediaType = '') => {
        if (Platform.OS === 'ios') {
            const {formatMessage} = this.context.intl;
            let permissionRequest;
            const targetSource = source || 'photo';
            const hasPermissionToStorage = await Permissions.check(targetSource);

            switch (hasPermissionToStorage) {
            case PermissionTypes.UNDETERMINED:
                permissionRequest = await Permissions.request(targetSource);
                if (permissionRequest !== PermissionTypes.AUTHORIZED) {
                    return false;
                }
                break;
            case PermissionTypes.DENIED: {
                const canOpenSettings = await Permissions.canOpenSettings();
                let grantOption = null;
                if (canOpenSettings) {
                    grantOption = {
                        text: formatMessage({
                            id: 'mobile.permission_denied_retry',
                            defaultMessage: 'Settings',
                        }),
                        onPress: () => Permissions.openSettings(),
                    };
                }

                const {title, text} = this.getPermissionDeniedMessage(source, mediaType);

                Alert.alert(
                    title,
                    text,
                    [
                        grantOption,
                        {
                            text: formatMessage({
                                id: 'mobile.permission_denied_dismiss',
                                defaultMessage: 'Don\'t Allow',
                            }),
                        },
                    ]
                );
                return false;
            }
            }
        }

        return true;
    };

    hasStoragePermission = async () => {
        if (Platform.OS === 'android') {
            const {formatMessage} = this.context.intl;
            let permissionRequest;
            const hasPermissionToStorage = await Permissions.check('storage');

            switch (hasPermissionToStorage) {
            case PermissionTypes.UNDETERMINED:
                permissionRequest = await Permissions.request('storage');
                if (permissionRequest !== PermissionTypes.AUTHORIZED) {
                    return false;
                }
                break;
            case PermissionTypes.DENIED: {
                const {title, text} = this.getPermissionDeniedMessage('storage');

                Alert.alert(
                    title,
                    text,
                    [
                        {
                            text: formatMessage({
                                id: 'mobile.permission_denied_dismiss',
                                defaultMessage: 'Don\'t Allow',
                            }),
                        },
                        {
                            text: formatMessage({
                                id: 'mobile.permission_denied_retry',
                                defaultMessage: 'Settings',
                            }),
                            onPress: () => AndroidOpenSettings.appDetailsSettings(),
                        },
                    ]
                );
                return false;
            }
            }
        }

        return true;
    };

    uploadFiles = async (files) => {
        const file = files[0];
        if (!file.fileSize | !file.fileName) {
            const path = (file.path || file.uri).replace('file://', '');
            const fileInfo = await RNFetchBlob.fs.stat(path);
            file.fileSize = fileInfo.size;
            file.fileName = fileInfo.filename;
        }

        if (!file.type) {
            file.type = lookupMimeType(file.fileName);
        }

        const {validMimeTypes} = this.props;
        if (validMimeTypes.length && !validMimeTypes.includes(file.type)) {
            this.props.onShowUnsupportedMimeTypeWarning();
        } else if (file.fileSize > this.props.maxFileSize) {
            this.props.onShowFileSizeWarning(file.fileName);
        } else {
            this.props.uploadFiles(files);
        }
    };

    showFileAttachmentOptions = () => {
        const {
            canBrowseFiles,
            canBrowsePhotoLibrary,
            canBrowseVideoLibrary,
            canTakePhoto,
            canTakeVideo,
            fileCount,
            maxFileCount,
            onShowFileMaxWarning,
            extraOptions,
        } = this.props;

        if (fileCount === maxFileCount) {
            onShowFileMaxWarning();
            return;
        }

        this.props.blurTextBox();
        const items = [];

        if (canTakePhoto) {
            items.push({
                action: this.attachPhotoFromCamera,
                text: {
                    id: t('mobile.file_upload.camera_photo'),
                    defaultMessage: 'Take Photo',
                },
                icon: 'camera',
            });
        }

        if (canTakeVideo) {
            items.push({
                action: this.attachVideoFromCamera,
                text: {
                    id: t('mobile.file_upload.camera_video'),
                    defaultMessage: 'Take Video',
                },
                icon: 'video-camera',
            });
        }

        if (canBrowsePhotoLibrary) {
            items.push({
                action: this.attachFileFromLibrary,
                text: {
                    id: t('mobile.file_upload.library'),
                    defaultMessage: 'Photo Library',
                },
                icon: 'photo',
            });
        }

        if (canBrowseVideoLibrary && Platform.OS === 'android') {
            items.push({
                action: this.attachVideoFromLibraryAndroid,
                text: {
                    id: t('mobile.file_upload.video'),
                    defaultMessage: 'Video Library',
                },
                icon: 'file-video-o',
            });
        }

        if (canBrowseFiles) {
            items.push({
                action: this.attachFileFromFiles,
                text: {
                    id: t('mobile.file_upload.browse'),
                    defaultMessage: 'Browse Files',
                },
                icon: 'file',
            });
        }

        if (extraOptions) {
            extraOptions.forEach((option) => {
                if (option !== null) {
                    items.push(option);
                }
            });
        }

        showModalOverCurrentContext('OptionsModal', {items});
    };

    render() {
        const {theme, wrapper, children} = this.props;

        if (wrapper) {
            return (
                <TouchableWithFeedback
                    onPress={this.showFileAttachmentOptions}
                    type={'opacity'}
                >
                    {children}
                </TouchableWithFeedback>
            );
        }

        return (
            <TouchableWithFeedback
                onPress={this.showFileAttachmentOptions}
                style={style.buttonContainer}
                type={'opacity'}
            >
                <Icon
                    size={30}
                    style={style.attachIcon}
                    color={changeOpacity(theme.centerChannelColor, 0.9)}
                    name='md-add'
                />
            </TouchableWithFeedback>
        );
    }
}

const style = StyleSheet.create({
    attachIcon: {
        marginTop: Platform.select({
            ios: 2,
            android: 0,
        }),
    },
    buttonContainer: {
        height: Platform.select({
            ios: 34,
            android: 36,
        }),
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
