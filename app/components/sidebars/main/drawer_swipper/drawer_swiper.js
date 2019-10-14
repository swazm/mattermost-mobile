// Copyright (c) 2015-present SWAZM, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {changeOpacity} from 'app/utils/theme';

import Swiper from 'app/components/swiper';

export default class DrawerSwiper extends Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        drawerOpened: PropTypes.bool,
        drawerWidth: PropTypes.number.isRequired,
        hasSafeAreaInsets: PropTypes.bool,
        onPageSelected: PropTypes.func,
        showTeams: PropTypes.bool.isRequired,
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        onPageSelected: () => true,
        openDrawerOffset: 0,
    };

    swiperRef = React.createRef();

    shouldComponentUpdate(nextProps) {
        const {drawerWidth, showTeams, theme} = this.props;
        return nextProps.drawerWidth !== drawerWidth ||
            nextProps.showTeams !== showTeams ||
            nextProps.theme !== theme ||
            nextProps.drawerOpened !== this.props.drawerOpened;
    }

    runOnLayout = (shouldRun = true) => {
        if (this.refs.swiper) {
            this.refs.swiper.runOnLayout = shouldRun;
        }
    };

    resetPage = (animated = false) => {
        if (this.swiperRef?.current) {
            this.swiperRef.current.scrollToIndex(1, animated);
        }
    };

    scrollToStart = () => {
        if (this.swiperRef?.current) {
            this.swiperRef.current.scrollToStart();
        }
    };

    scrollToInitial = () => {
        if (this.swiperRef?.current) {
            this.swiperRef.current.scrollToInitial();
        }
    }

    swiperPageSelected = (index) => {
        this.props.onPageSelected(index);
    };

    showTeamsPage = () => {
        if (this.swiperRef?.current) {
            this.swiperRef.current.scrollToIndex(0, true);
        }
    };

    render() {
        const {
            children,
            drawerWidth,
            showTeams,
            theme,
        } = this.props;

        const initialPage = React.Children.count(children) - 1;

        return (
            <Swiper
                ref={this.swiperRef}
                initialPage={initialPage}
                onIndexChanged={this.swiperPageSelected}
                width={drawerWidth}
                style={{backgroundColor: theme.sidebarBg}}
                paginationBackgroundColor={changeOpacity(theme.sidebarText, 0.1)}
                activeDotColor={theme.sidebarText}
                dotColor={changeOpacity(theme.sidebarText, 0.3)}
                scrollEnabled={showTeams}
                showsPagination={showTeams}
                keyboardShouldPersistTaps={'always'}
            >
                {children}
            </Swiper>
        );
    }
}
