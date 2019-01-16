import React from 'react';
import { arrayOf, bool, func, oneOf, oneOfType, string } from 'prop-types';

import ControlledTextInput from '../components/inputs/ControlledTextInput';
import ControlledSelectInput from '../components/inputs/ControlledSelectInput';

import {
    inputTypesEnum,
    registrationFieldsEnum,
    contributorTypeOptions,
} from '../util/constants';

export default function RegisterFormField({
    id,
    label,
    type,
    options,
    required,
    hint,
    value,
    handleChange,
    isHidden,
}) {
    if (isHidden) {
        return null;
    }

    // For now the TOS & Newsletter checkboxes are created
    // inline in the RegisterForm component
    if (type === inputTypesEnum.checkbox) {
        return null;
    }

    const requiredIndicator = required
        ? (
            <span style={{ color: 'red' }}>
                {' *'}
            </span>)
        : null;

    if (type === inputTypesEnum.select) {
        return (
            <div className="form__field">
                <label
                    htmlFor={id}
                    className="form__label"
                >
                    {label}
                    {requiredIndicator}
                </label>
                <ControlledSelectInput
                    handleChange={handleChange}
                    options={options}
                    value={value}
                />
            </div>
        );
    }

    return (
        <div className="form__field">
            <label
                htmlFor={id}
                className="form__label"
            >
                {label}
                {requiredIndicator}
            </label>
            <ControlledTextInput
                value={value}
                onChange={handleChange}
                id={id}
                hint={hint}
                type={type}
            />
        </div>
    );
}

RegisterFormField.defaultProps = {
    required: false,
    hint: null,
    value: '',
    options: null,
};

RegisterFormField.propTypes = {
    id: oneOf(Object.values(registrationFieldsEnum)).isRequired,
    label: string.isRequired,
    type: oneOf(Object.values(inputTypesEnum)).isRequired,
    options: arrayOf(oneOf(contributorTypeOptions)),
    required: bool,
    hint: string,
    value: oneOfType([bool, string]),
    handleChange: func.isRequired,
    isHidden: bool.isRequired,
};
