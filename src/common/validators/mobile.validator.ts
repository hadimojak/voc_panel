import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/** Iranian mobile in Latin digits: 09XXXXXXXXX — matches smart-dashboard. */
export const IRAN_MOBILE_PATTERN = /^09\d{9}$/;

export function isValidMobile(mobile: string): boolean {
  return IRAN_MOBILE_PATTERN.test(mobile);
}

@ValidatorConstraint({ name: 'isIranMobile', async: false })
export class IsIranMobileConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isValidMobile(value);
  }

  defaultMessage() {
    return 'mobile must be a valid Iranian mobile number (09XXXXXXXXX)';
  }
}

export function IsIranMobile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsIranMobileConstraint,
    });
  };
}
