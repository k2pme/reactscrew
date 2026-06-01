import type { RuntimeValidator } from '../types';
export declare const runValidator: <TValue>(validator: RuntimeValidator<TValue> | undefined, value: TValue, code: string, message: string) => TValue;
