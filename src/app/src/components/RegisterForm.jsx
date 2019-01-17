import React, { Component } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import AppGrid from '../containers/AppGrid';
import ShowOnly from './ShowOnly';
import Button from './Button';
import RegisterFormField from './RegisterFormField';

import {
    updateSignUpFormInput,
    submitSignUpForm,
    resetAuthFormState,
} from '../actions/auth';

import {
    OTHER,
    registrationFieldsEnum,
    registrationFormFields,
    authLoginFormRoute,
} from '../util/constants';

import {
    registrationFormValuesPropType,
    registrationFormInputHandlersPropType,
    userPropType,
} from '../util/propTypes';

import {
    getValueFromEvent,
    getCheckedFromEvent,
} from '../util/util';

class RegisterForm extends Component {
    componentDidUpdate() {
        const {
            user,
            history,
        } = this.props;

        return user
            ? history.push(`/profile/${user.id}`)
            : null;
    }

    componentWillUnmount() {
        return this.props.clearForm();
    }

    render() {
        const {
            fetching,
            error,
            form,
            inputUpdates,
            submitForm,
            sessionFetching,
        } = this.props;

        if (sessionFetching) {
            return null;
        }

        const errorMessages = error && error.length
            ? (
                <ShowOnly
                    showChildren
                    style={{
                        display: 'block',
                        fontSize: '12px',
                        margin: '8px 0 0 0',
                        color: '#FF2D55',
                        width: '100%',
                    }}
                >
                    <ul>
                        {
                            error.map(err => (
                                <li key={err}>
                                    {err}
                                </li>
                            ))
                        }
                    </ul>
                </ShowOnly>)
            : null;

        const formInputs = registrationFormFields
            .map(field => (
                <RegisterFormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    type={field.type}
                    link={field.link}
                    hint={field.hint}
                    required={field.required}
                    options={field.options}
                    value={form[field.id]}
                    handleChange={inputUpdates[field.id]}
                    isHidden={
                        form.contributorType !== OTHER &&
                        field.id === registrationFieldsEnum.otherContributorType
                    }
                />));

        return (
            <AppGrid title="Register">
                <p>
                    Already have an account?{' '}
                    <Link
                        to={authLoginFormRoute}
                        href={authLoginFormRoute}
                        className="link-underline"
                    >
                        Log In
                    </Link>
                    .
                </p>
                {errorMessages}
                <Grid container className="margin-bottom-100">
                    <Grid item xs={12} sm={8}>
                        <p>
                            Thank you for contributing to the OAR. Every
                            contribution further improves the accuracy of the
                            database. Create an account to begin:
                        </p>
                        {formInputs}
                        <Button
                            text="Register"
                            onClick={submitForm}
                            disabled={fetching}
                        />
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }
}

RegisterForm.defaultProps = {
    error: null,
    user: null,
};

RegisterForm.propTypes = {
    clearForm: func.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    form: registrationFormValuesPropType.isRequired,
    inputUpdates: registrationFormInputHandlersPropType.isRequired,
    submitForm: func.isRequired,
    sessionFetching: bool.isRequired,
    user: userPropType,
    history: shape({
        push: func.isRequired,
    }).isRequired,
};

function mapStateToProps({
    auth: {
        fetching,
        error,
        session: {
            fetching: sessionFetching,
        },
        signup: {
            form,
        },
        user: {
            user,
        },
    },
}) {
    return {
        fetching,
        error,
        form,
        sessionFetching,
        user,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        inputUpdates: {
            [registrationFieldsEnum.email]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.email,
                })),
            [registrationFieldsEnum.name]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.name,
                })),
            [registrationFieldsEnum.description]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.description,
                })),
            [registrationFieldsEnum.website]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.website,
                })),
            [registrationFieldsEnum.contributorType]: value =>
                dispatch(updateSignUpFormInput({
                    value,
                    field: registrationFieldsEnum.contributorType,
                })),
            [registrationFieldsEnum.otherContributorType]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.otherContributorType,
                })),
            [registrationFieldsEnum.password]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.password,
                })),
            [registrationFieldsEnum.confirmPassword]: e =>
                dispatch(updateSignUpFormInput({
                    value: getValueFromEvent(e),
                    field: registrationFieldsEnum.confirmPassword,
                })),
            [registrationFieldsEnum.tos]: e =>
                dispatch(updateSignUpFormInput({
                    value: getCheckedFromEvent(e),
                    field: registrationFieldsEnum.tos,
                })),
            [registrationFieldsEnum.newsletter]: e =>
                dispatch(updateSignUpFormInput({
                    value: getCheckedFromEvent(e),
                    field: registrationFieldsEnum.newsletter,
                })),
        },
        submitForm: () => dispatch(submitSignUpForm()),
        clearForm: () => dispatch(resetAuthFormState()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
