// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    Text,
    View,
} from 'react-native';
import {makeStyleSheetFromTheme} from 'app/utils/theme';

import CustomListRow from 'app/components/custom_list/custom_list_row';

export default class OptionListRow extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        theme: PropTypes.object.isRequired,
        ...CustomListRow.propTypes,
        isLandscape: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    static defaultProps = {
        isLandscape: false,
    };

    onPress = () => {
        if (this.props.onPress) {
            this.props.onPress(this.props.id, this.props.item);
        }
    };

    render() {
        const {
            enabled,
            selectable,
            selected,
            theme,
            item,
            isLandscape,
        } = this.props;

        const {text, value} = item;
        const style = getStyleFromTheme(theme);

        return (
            <CustomListRow
                id={value}
                onPress={this.onPress}
                enabled={enabled}
                selectable={selectable}
                selected={selected}
                isLandscape={isLandscape}
            >
                <View style={style.textContainer}>
                    <View>
                        <Text style={style.optionText}>
                            {text}
                        </Text>
                    </View>
                </View>
            </CustomListRow>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flexDirection: 'row',
            height: 65,
            paddingHorizontal: 15,
            alignItems: 'center',
            backgroundColor: theme.centerChannelBg,
        },
        textContainer: {
            marginLeft: 10,
            justifyContent: 'center',
            flexDirection: 'column',
            flex: 1,
        },
        optionText: {
            fontSize: 15,
            color: theme.centerChannelColor,
        },
    };
});
