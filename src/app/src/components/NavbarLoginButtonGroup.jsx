import React from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import COLOURS from '../util/COLOURS';

import Translate from './Translate';
import NavbarDropdown from './NavbarDropdown';

import { submitLogOut } from '../actions/auth';

import { userPropType } from '../util/propTypes';

import {
    authLoginFormRoute,
    authRegisterFormRoute,
} from '../util/constants';

const componentStyles = Object.freeze({
    containerStyle: Object.freeze({
        display: 'flex',
        marginLeft: 'auto',
        overflow: 'auto',
    }),
    logoContainer: Object.freeze({
        borderRadius: '100%',
        width: '40px',
        height: '40px',
        border: '2px solid',
        borderColor: COLOURS.GREY,
        marginRight: '10px',
        display: 'inline-flex',
        justifyContent: 'middle',
        overflow: 'hidden',
        cursor: 'pointer',
    }),
    logoSpacer: Object.freeze({
        width: '30px',
        height: '30px',
        marginTop: '5px',
        marginLeft: '5px',
        display: 'inline-flex',
    }),
    logo: Object.freeze({
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '100%',
    }),
});

const createUserDropdownLinks = (user, logoutAction) => Object.freeze([
    Object.freeze({
        text: 'My Profile',
        url: `/profile/${user.id}`,
        type: 'link',
    }),
    Object.freeze({
        text: 'My Lists',
        url: '/lists',
        type: 'link',
    }),
    Object.freeze({
        text: 'Log Out',
        type: 'button',
        action: logoutAction,
    }),
]);

function NavbarLoginButtonGroup({
    user,
    logout,
    sessionFetching,
}) {
    if (!user || sessionFetching) {
        return (
            <div style={componentStyles.containerStyle}>
                <Translate />
                <Link
                    to={authRegisterFormRoute}
                    href={authRegisterFormRoute}
                    className="navButton"
                    disabled={sessionFetching}
                >
                    REGISTER
                </Link>
                <Link
                    to={authLoginFormRoute}
                    href={authLoginFormRoute}
                    className="navButton"
                    disabled={sessionFetching}
                >
                    LOG IN
                </Link>
            </div>
        );
    }

    return (
        <div style={componentStyles.containerStyle}>
            <span
                style={{ display: 'inline-flex', justifyContent: 'middle' }}
                className="line-height"
            >
                <Translate />
                <div
                    style={componentStyles.logoContainer}
                    onClick={() => window.console.dir('Profile button was clicked')}
                    onKeyPress={() => window.console.dir('Profile button keypress')}
                    role="button"
                    tabIndex={0}
                >
                    <div style={componentStyles.logoSpacer}>
                        <img
                            src={user.photo}
                            style={componentStyles.logo}
                            alt=""
                        />
                    </div>
                </div>
                <NavbarDropdown
                    title={user.email.toUpperCase()}
                    links={createUserDropdownLinks(user, logout)}
                />
            </span>
        </div>
    );
}

NavbarLoginButtonGroup.defaultProps = {
    user: null,
};

NavbarLoginButtonGroup.propTypes = {
    user: userPropType,
    logout: func.isRequired,
    sessionFetching: bool.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
        session: {
            fetching: sessionFetching,
        },
    },
}) {
    return {
        user,
        sessionFetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        logout: () => dispatch(submitLogOut()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarLoginButtonGroup);
