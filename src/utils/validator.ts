/**
 * Validator Class
 *
 * A utility class for validating input fields with multiple conditions in a chained manner.
 * Supports validations for emails, numbers, string lengths, character counts,
 * custom regular expressions, and more.
 *
 * @example
 *
 * const isValidPassword = verify('Password123!')
 *  .has({ numbers: { count: 2, operator: '>=' }, lowercase: { count: 6, operator: '==' } });
 *
 * console.log(isValidPassword.result); // true or false based on the validation
 */
export class Validator<T = unknown> {
  private value: T; // Value to validate

  private _isValid: boolean = true; // Internal validation state

  /**
   * Creates a new instance of Validator.
   * @param value - The value to validate.
   *
   * @example
   * const validator = new Validator('test@example.com');
   */
  constructor(value: T) {
    this.value = value;
  }

  /**
   * Getter to retrieve the validation result.
   */
  get result(): boolean {
    return this._isValid;
  }

  /**
   * Checks if the value contains a specified substring.
   * @param substring - The substring to look for.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('hello world').contains('world');
   */
  contains(substring: string): this {
    if (typeof this.value === 'string') {
      this._isValid = this._isValid && this.value.includes(substring);
    } else {
      this._isValid = false;
    }
    return this;
  }

  /**
   * Validates if the value is an email.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('test@example.com').isEmail();
   */
  isEmail(): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this._isValid = this._isValid && emailRegex.test(String(this.value));
    return this;
  }

  /**
   * Validates if the value is numeric.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify(10).isNumeric();
   */
  isNumeric(): this {
    // eslint-disable-next-line no-restricted-globals
    this._isValid = this._isValid && !isNaN(Number(this.value));
    return this;
  }

  /**
   * Validates if the value is a string with a minimum length.
   * @param minLength - The minimum required length.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('hello').minLength(3);
   */
  minLength(minLength: number): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      this.value.length >= minLength;
    return this;
  }

  /**
   * Validates if the value is a string with a maximum length.
   * @param maxLength - The maximum allowed length.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('hello').maxLength(10);
   */
  maxLength(maxLength: number): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      this.value.length <= maxLength;
    return this;
  }

  /**
   * Validates that the string contains a defined number of certain types of characters.
   * Allows specifying whether the count should be `>=`, `<=`, or `==`.
   * @param conditions - Object specifying the required counts for numbers,
   * lowercase letters, uppercase letters, and special characters.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('Password123!').has({ numbers: { count: 2, operator: '>=' }, lowercase: { count: 6, operator: '==' } });
   */
  has(conditions: {
    numbers?: { count: number; operator?: '>=' | '<=' | '==' };
    lowercase?: { count: number; operator?: '>=' | '<=' | '==' };
    uppercase?: { count: number; operator?: '>=' | '<=' | '==' };
    special?: { count: number; operator?: '>=' | '<=' | '==' };
  }): this {
    if (typeof this.value !== 'string') {
      this._isValid = false;
      return this;
    }

    const checkCondition = (
      actual: number,
      expected: number,
      operator: string,
    ) => {
      switch (operator) {
        case '<=':
          return actual <= expected;
        case '==':
          return actual === expected;
        default:
          return actual >= expected;
      }
    };

    if (conditions.numbers) {
      const count = (this.value.match(/[0-9]/g) || []).length;
      this._isValid =
        this._isValid &&
        checkCondition(
          count,
          conditions.numbers.count,
          conditions.numbers.operator || '>=',
        );
    }
    if (conditions.lowercase) {
      const count = (this.value.match(/[a-z]/g) || []).length;
      this._isValid =
        this._isValid &&
        checkCondition(
          count,
          conditions.lowercase.count,
          conditions.lowercase.operator || '>=',
        );
    }
    if (conditions.uppercase) {
      const count = (this.value.match(/[A-Z]/g) || []).length;
      this._isValid =
        this._isValid &&
        checkCondition(
          count,
          conditions.uppercase.count,
          conditions.uppercase.operator || '>=',
        );
    }
    if (conditions.special) {
      const count = (this.value.match(/[^a-zA-Z0-9]/g) || []).length;
      this._isValid =
        this._isValid &&
        checkCondition(
          count,
          conditions.special.count,
          conditions.special.operator || '>=',
        );
    }
    return this;
  }

  /**
   * Validates that the value matches a custom regular expression.
   * @param regex - The regular expression to test.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('abc123').matches(/^[a-z0-9]+$/);
   */
  matches(regex: RegExp): this {
    this._isValid = this._isValid && regex.test(String(this.value));
    return this;
  }

  /**
   * Validates that the numeric value is within a range (inclusive).
   * @param min - Minimum value.
   * @param max - Maximum value.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify(5).between(1, 10);
   */
  between(min: number, max: number): this {
    const num = Number(this.value);
    // eslint-disable-next-line no-restricted-globals
    this._isValid = this._isValid && !isNaN(num) && num >= min && num <= max;
    return this;
  }

  /**
   * Validates if the value is a boolean.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify(true).isBoolean();
   */
  isBoolean(): this {
    this._isValid = this._isValid && typeof this.value === 'boolean';
    return this;
  }

  /**
   * Validates if the value is a valid URL.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('https://example.com').isURL();
   */
  isURL(): this {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z]{2,6})(:[0-9]{1,5})?(\/[\w.-]*)*\/?$/;
    this._isValid = this._isValid && urlRegex.test(String(this.value));
    return this;
  }

  /**
   * Validates if the value is a date in YYYY-MM-DD format.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('2023-10-05').isDate();
   */
  isDate(): this {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    this._isValid = this._isValid && dateRegex.test(String(this.value));
    return this;
  }

  /**
   * Validates if the value is an array.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify([1, 2, 3]).isArray();
   */
  isArray(): this {
    this._isValid = this._isValid && Array.isArray(this.value);
    return this;
  }

  /**
   * Validates if the value is an object (not an array and not null).
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify({ key: 'value' }).isObject();
   */
  isObject(): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'object' &&
      !Array.isArray(this.value) &&
      this.value !== null;
    return this;
  }

  /**
   * Validates if the value is null or undefined.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify(null).isNullOrUndefined();
   */
  isNullOrUndefined(): this {
    this._isValid =
      this._isValid && (this.value === null || this.value === undefined);
    return this;
  }

  /* Additional verification methods */

  /**
   * Validates if the value contains only alphabetic characters (a-z, A-Z).
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('HelloWorld').isAlpha();
   */
  isAlpha(): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      /^[A-Za-z]+$/.test(this.value);
    return this;
  }

  /**
   * Validates if the value contains only alphanumeric characters (letters and numbers).
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('Hello123').isAlphanumeric();
   */
  isAlphanumeric(): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      /^[A-Za-z0-9]+$/.test(this.value);
    return this;
  }

  /**
   * Validates if the string is in uppercase.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('HELLO').isUpperCase();
   */
  isUpperCase(): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      this.value === this.value.toUpperCase();
    return this;
  }

  /**
   * Validates if the string is in lowercase.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('hello').isLowerCase();
   */
  isLowerCase(): this {
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      this.value === this.value.toLowerCase();
    return this;
  }

  /**
   * Validates if the value is empty.
   * For strings, arrays, or objects, checks that they do not contain elements or properties.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('').isEmpty();
   * verify([]).isEmpty();
   * verify({}).isEmpty();
   */
  isEmpty(): this {
    if (typeof this.value === 'string' || Array.isArray(this.value)) {
      this._isValid = this._isValid && this.value.length === 0;
    } else if (
      typeof this.value === 'object' &&
      this.value !== null &&
      !Array.isArray(this.value)
    ) {
      this._isValid = this._isValid && Object.keys(this.value).length === 0;
    } else {
      this._isValid = false;
    }
    return this;
  }

  /**
   * Validates if the value is NOT empty.
   * For strings, arrays, or objects, checks that they contain at least one element or property.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('Hello').isNotEmpty();
   * verify([1]).isNotEmpty();
   * verify({ key: 'value' }).isNotEmpty();
   */
  isNotEmpty(): this {
    if (typeof this.value === 'string' || Array.isArray(this.value)) {
      this._isValid = this._isValid && this.value.length > 0;
    } else if (
      typeof this.value === 'object' &&
      this.value !== null &&
      !Array.isArray(this.value)
    ) {
      this._isValid = this._isValid && Object.keys(this.value).length > 0;
    } else {
      this._isValid = false;
    }
    return this;
  }

  /**
   * Validates that the value is within a set of allowed values.
   * @param allowed - Array of allowed values.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('red').isIn(['red', 'green', 'blue']);
   */
  isIn(allowed: Array<T>): this {
    this._isValid = this._isValid && allowed.includes(this.value);
    return this;
  }

  /**
   * Validates if the value is a UUID (version 4).
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('550e8400-e29b-41d4-a716-446655440000').isUUID();
   */
  isUUID(): this {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      uuidRegex.test(this.value);
    return this;
  }

  /**
   * Validates if the value is a hexadecimal color.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('#FF5733').isHexColor();
   */
  isHexColor(): this {
    const hexColorRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      hexColorRegex.test(this.value);
    return this;
  }

  /**
   * Validates if the value is a date and time in ISO 8601 format.
   * @returns The same instance to allow chaining.
   *
   * @example
   * verify('2023-10-05T14:48:00.000Z').isDateTime();
   */
  isDateTime(): this {
    const dateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
    this._isValid =
      this._isValid &&
      typeof this.value === 'string' &&
      dateTimeRegex.test(this.value);
    return this;
  }
}

/**
 * Validator Class
 *
 * A utility class for validating input fields with multiple conditions in a chained manner.
 * Supports validations for emails, numbers, string lengths, character counts,
 * custom regular expressions, and more.
 *
 * @example
 *
 * const isValidPassword = verify('Password123!')
 *    .has({ numbers: { count: 2, operator: '>=' }, lowercase: { count: 6, operator: '==' } });
 *
 * console.log(isValidPassword.result); // true or false based on the validation
 */
export function verify<T = unknown>(value: T): Validator<T> {
  return new Validator(value);
}
