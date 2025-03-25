import { verify } from '../src/utils/validator';

/**
 * Demonstrates the usage of the `verify` function for various types of validation.
 *
 * This example showcases:
 * - Email validation
 * - Numeric value validation
 * - String length validation
 * - Password complexity validation
 * - Object type validation
 * - URL validation
 */

/**
 * Validate an email address.
 *
 * @returns {boolean} True if the email is valid, otherwise false.
 */
const emailValidation = verify('test@example.com').isEmail();
console.log('Valid Email:', emailValidation.result); // true

/**
 * Validate a numeric value.
 *
 * @returns {boolean} True if the value is numeric, otherwise false.
 */
const numberValidation = verify(12345).isNumeric();
console.log('Valid Número:', numberValidation.result); // true

/**
 * Validate if a string meets a minimum length requirement.
 *
 * @param {string} value - The string to validate.
 * @param {number} minLength - The required minimum length.
 * @returns {boolean} True if the string length meets the requirement, otherwise false.
 */
const minLengthValidation = verify('hello').minLength(3);
console.log('Minimun 3 characters:', minLengthValidation.result); // true

/**
 * Validate a password against specific complexity rules.
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} True if the password meets the criteria, otherwise false.
 */
const passwordValidation = verify('Password123!').has({
  numbers: { count: 2, operator: '>=' },
  lowercase: { count: 6, operator: '==' },
});
console.log('Valid password:', passwordValidation.result); // true o false

/**
 * Validate if a value is an object.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is an object, otherwise false.
 */
const objectValidation = verify({ key: 'value' }).isObject();
console.log('Is a object:', objectValidation.result); // true

/**
 * Validate if a URL is well-formed.
 *
 * @param {string} url - The URL to validate.
 * @returns {boolean} True if the URL is valid, otherwise false.
 */
const urlValidation = verify('https://example.com').isURL();
console.log('Valid URL:', urlValidation.result); // true
