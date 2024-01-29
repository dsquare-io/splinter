import type {Message, RegisterOptions, ValidationRule, ValidationValueMessage} from 'react-hook-form';

export const patternsMap = {
  email: {
    value: /^([^\s@#])+@(([^\s@.#])+\.)+([^\s.]{2,})+$/i,
    message: 'Invalid email address',
  },
  url: {
    value:
      /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/i,
    message: 'Invalid url',
  },
} as const;

export interface InputRules {
  required: Message | ValidationRule<boolean>;
  min: ValidationRule<number | string>;
  max: ValidationRule<number | string>;
  maxLength: ValidationRule<number>;
  minLength: ValidationRule<number>;
  pattern: ValidationRule<RegExp | string> | keyof typeof patternsMap;
}

export interface OutputRules {
  required: ValidationValueMessage<boolean>;
  min: ValidationValueMessage<number | string>;
  max: ValidationValueMessage<number | string>;
  maxLength: ValidationValueMessage<number>;
  minLength: ValidationValueMessage<number>;
  pattern: ValidationValueMessage<RegExp>;
}

export function messagifyValidationRules(
  rules: Partial<InputRules> | undefined
): Partial<OutputRules> | undefined {
  if (!rules) return undefined;

  const pattern =
    typeof rules.pattern === 'string' && (patternsMap as any)[rules.pattern]
      ? (patternsMap as any)[rules.pattern]
      : (rules.pattern as RegisterOptions['pattern']);

  return {
    required: ['boolean', 'string'].includes(typeof rules.required)
      ? {
          value: !!rules.required,
          message: 'Field is required',
        }
      : (rules.required as ValidationValueMessage<boolean>),
    pattern:
      pattern instanceof RegExp
        ? {
            value: pattern,
            message: 'Invalid pattern',
          }
        : pattern,
    minLength:
      typeof rules.minLength === 'number'
        ? {
            value: rules.minLength,
            message: `Should be at least ${rules.minLength} character long`,
          }
        : rules.minLength,
    maxLength:
      typeof rules.maxLength === 'number'
        ? {
            value: rules.maxLength,
            message: `Should be less than ${rules.maxLength} character long`,
          }
        : rules.maxLength,
    min:
      typeof rules.min === 'number' || typeof rules.min === 'string'
        ? {
            value: rules.min,
            message: `Should be greater or equal to ${rules.min}`,
          }
        : rules.min,
    max:
      typeof rules.max === 'number' || typeof rules.max === 'string'
        ? {
            value: rules.max,
            message: `Should be lesser or equal to ${rules.max}`,
          }
        : rules.max,
  };
}
