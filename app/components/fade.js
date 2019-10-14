// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Animated} from 'react-native';

export const FADE_DURATION = 100;

export default class Fade extends PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,
        duration: PropTypes.number,
        style: PropTypes.object,
        visible: PropTypes.bool.isRequired,
        disableScale: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            fadeAnim: new Animated.Value(props.visible ? 1 : 0),
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible) {
            Animated.timing(
                this.state.fadeAnim,
                {
                    toValue: prevProps.visible ? 0 : 1,
                    duration: this.props.duration || FADE_DURATION,
                    useNativeDriver: true,
                }
            ).start();
        }
    }

    render() {
        const {disableScale} = this.props;
        const {fadeAnim} = this.state;

        return (
            <Animated.View
                style={{
                    ...this.props.style,
                    opacity: fadeAnim,
                    transform: disableScale ? [] : [{scale: fadeAnim}],
                }}
            >
                {this.props.children}
            </Animated.View>
        );
    }
}
