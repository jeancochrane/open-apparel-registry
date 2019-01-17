import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import { func } from 'prop-types';
import history from './util/history';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
// import Profile from './containers/Profile';
import UserProfile from './components/UserProfile';
import Contribute from './containers/Contribute';
import Map from './containers/Map';
// import BetaAccessLogin from './containers/BetaAccessLogin'
import requireAuth from './requireAuth';
import Lists from './containers/Lists';
import ErrorBoundary from './components/ErrorBoundary';
import Maintenance from './containers/Maintenance';
import 'react-toastify/dist/ReactToastify.css'; // eslint-disable-line import/first
import './App.css';

import { sessionLogin } from './actions/auth';

import { userPropType } from './util/propTypes';

const styles = {
    root: {
        flexGrow: 1,
    },
};

class App extends Component {
    componentDidMount() {
        return this.props.logIn();
    }

    render() {
        const { user } = this.props;
        const isMaintenance = process.env.REACT_APP_MAINTENANCE;

        if (isMaintenance) {
            return (
                <ErrorBoundary>
                    <div>
                        <Maintenance />
                    </div>
                </ErrorBoundary>
            );
        }

        return (
            <ErrorBoundary>
                <div>
                    <div>
                        {/* { user.betaAccess ? ( */}
                        <Router history={history}>
                            <div className="App">
                                <Navbar user={user} />
                                <div>
                                    <Switch>
                                        <Route
                                            exact
                                            path="/"
                                            component={Map}
                                        />
                                        <Route
                                            path="/auth/register"
                                            component={RegisterForm}
                                        />
                                        <Route
                                            path="/auth/login"
                                            component={LoginForm}
                                        />
                                        <Route
                                            path="/profile/:id"
                                            component={UserProfile}
                                        />
                                        <Route
                                            path="/contribute"
                                            component={requireAuth(Contribute)}
                                        />
                                        <Route
                                            path="/lists"
                                            component={requireAuth(Lists)}
                                        />
                                    </Switch>
                                </div>
                                <Footer />
                                <ToastContainer
                                    position="bottom-center"
                                    transition={Slide}
                                />
                            </div>
                        </Router>
                        {/* <BetaAccessLogin checkAccess={ checkAccess } /> */}
                    </div>
                </div>
            </ErrorBoundary>
        );
    }
}

App.defaultProps = {
    user: null,
};

App.propTypes = {
    user: userPropType,
    logIn: func.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
    },
}) {
    return {
        user,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        logIn: () => dispatch(sessionLogin()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App));
