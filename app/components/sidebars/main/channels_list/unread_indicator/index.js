// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableWithoutFeedback,
    View,
    ViewPropTypes,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';

import Fade from 'app/components/fade';
import FormattedText from 'app/components/formatted_text';
import {makeStyleSheetFromTheme} from 'app/utils/theme';

export default class UnreadIndicator extends PureComponent {
    static propTypes = {
        show: PropTypes.bool,
        style: ViewPropTypes.style,
        onPress: PropTypes.func,
        theme: PropTypes.object.isRequired,
        textStyle: ViewPropTypes.style,
    };

    static defaultProps = {
        onPress: () => true,
    };

    render() {
        const {onPress, show, theme} = this.props;
        const style = getStyleSheet(theme);
        return (
            <Fade
                visible={show}
                style={style.container}
                duration={150}
                disableScale={true}
            >
                <TouchableWithoutFeedback onPress={onPress}>
                    <View style={[style.wrapper, this.props.style]}>
                        <FormattedText
                            style={[style.indicatorText, this.props.textStyle]}
                            id='sidebar.unreads'
                            defaultMessage='More unreads'
                        />
                        <IonIcon
                            size={14}
                            name='md-arrow-round-up'
                            color={theme.mentionColor}
                            style={style.arrow}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Fade>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        arrow: {
            position: 'relative',
            bottom: -1,
        },
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            position: 'absolute',
            right: 0,
            left: 0,
        },
        indicatorText: {
            backgroundColor: 'transparent',
            color: theme.mentionColor,
            fontSize: 14,
            paddingVertical: 2,
            paddingHorizontal: 4,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        wrapper: {
            borderRadius: 15,
            height: 25,
            flexDirection: 'row',
            paddingLeft: 10,
            paddingRight: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
    };
});
