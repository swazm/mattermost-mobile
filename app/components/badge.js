// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    PanResponder,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    ViewPropTypes,
} from 'react-native';

export default class Badge extends PureComponent {
    static defaultProps = {
        extraPaddingHorizontal: 10,
        minHeight: 20,
        minWidth: 20,
    };

    static propTypes = {
        containerStyle: ViewPropTypes.style,
        count: PropTypes.number.isRequired,
        extraPaddingHorizontal: PropTypes.number,
        style: ViewPropTypes.style,
        countStyle: Text.propTypes.style,
        minHeight: PropTypes.number,
        minWidth: PropTypes.number,
        onPress: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.mounted = false;
        this.layoutReady = false;

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onStartShouldSetResponderCapture: () => true,
            onMoveShouldSetResponderCapture: () => true,
            onResponderMove: () => false,
        });
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.count !== this.props.count) {
            this.layoutReady = false;
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handlePress = () => {
        if (this.props.onPress) {
            this.props.onPress();
        }
    };

    setBadgeRef = (ref) => {
        this.badgeContainerRef = ref;
    };

    setNativeProps = (props) => {
        if (this.mounted && this.badgeContainerRef) {
            this.badgeContainerRef.setNativeProps(props);
        }
    };

    onLayout = (e) => {
        if (!this.layoutReady) {
            let width;

            if (e.nativeEvent.layout.width <= e.nativeEvent.layout.height) {
                width = e.nativeEvent.layout.height;
            } else {
                width = e.nativeEvent.layout.width + this.props.extraPaddingHorizontal;
            }
            width = Math.max(this.props.count < 10 ? width : width + 10, this.props.minWidth);
            const borderRadius = width / 2;
            this.setNativeProps({
                style: {
                    width,
                    borderRadius,
                    opacity: 1,
                },
            });
            this.layoutReady = true;
        }
    };

    renderText = () => {
        const {containerStyle, count, style} = this.props;
        let unreadCount = null;
        let unreadIndicator = null;
        if (count < 0) {
            unreadIndicator = (
                <View
                    style={[styles.text, this.props.countStyle]}
                    onLayout={this.onLayout}
                >
                    <View style={styles.verticalAlign}>
                        <View style={[styles.unreadIndicator, {backgroundColor: this.props.countStyle.color}]}/>
                    </View>
                </View>
            );
        } else {
            let mentionCount = count;
            if (count > 99) {
                mentionCount = '99+';
            }

            unreadCount = (
                <View style={styles.verticalAlign}>
                    <Text
                        style={[styles.text, this.props.countStyle]}
                        onLayout={this.onLayout}
                    >
                        {mentionCount.toString()}
                    </Text>
                </View>
            );
        }

        return (
            <View style={[styles.badgeContainer, containerStyle]}>
                <View
                    ref={this.setBadgeRef}
                    style={[styles.badge, style, {opacity: 0}]}
                >
                    <View style={styles.wrapper}>
                        {unreadCount}
                        {unreadIndicator}
                    </View>
                </View>
            </View>
        );
    };

    render() {
        if (!this.props.count) {
            return null;
        }

        return (
            <TouchableWithoutFeedback
                {...this.panResponder.panHandlers}
                onPress={this.handlePress}
            >
                {this.renderText()}
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: '#444',
        height: 20,
        padding: 12,
        paddingTop: 3,
        paddingBottom: 3,
    },
    badgeContainer: {
        borderRadius: 20,
        position: 'absolute',
        right: 30,
        top: 2,
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    text: {
        fontSize: 14,
        color: 'white',
    },
    unreadIndicator: {
        height: 5,
        width: 5,
        backgroundColor: '#444',
        borderRadius: 5,
    },
    verticalAlign: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical: 'center',
    },
});
