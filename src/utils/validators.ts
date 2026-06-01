import { ReactScrewError } from '../errors';
import type { RuntimeValidator } from '../types';

export const runValidator = <TValue>(
  validator: RuntimeValidator<TValue> | undefined,
  value: TValue,
  code: string,
  message: string
): TValue => {
  if (!validator) {
    return value;
  }

  try {
    const result = validator(value);
    return (result === undefined ? value : result) as TValue;
  } catch (error) {
    throw new ReactScrewError(message, {
      code,
      cause: error
    });
  }
};
