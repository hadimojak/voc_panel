import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { openEnumValues } from '../types/open-enum';

/**
 * Accepts known enum values *and* any other string.
 * Unknown CRM values must not fail validation / inserts / upserts.
 * Null/undefined are allowed (pair with `@IsOptional()`).
 */
@ValidatorConstraint({ name: 'isOpenEnum', async: false })
export class IsOpenEnumConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (value === null || value === undefined) return true;
    return typeof value === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    const enumObject = args.constraints[0] as Record<string, string> | undefined;
    const known = enumObject ? openEnumValues(enumObject).join(', ') : '';
    return known
      ? `${args.property} must be a string (known values include: ${known})`
      : `${args.property} must be a string`;
  }
}

export function IsOpenEnum(
  enumObject: Record<string, string>,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [enumObject],
      validator: IsOpenEnumConstraint,
    });
  };
}
