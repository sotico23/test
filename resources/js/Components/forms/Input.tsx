import { forwardRef   } from 'react';
import type {InputHTMLAttributes, ReactNode} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { label, error, hint, leftIcon, rightIcon, className = '', ...props },
        ref,
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {props.required && (
                            <span className="ml-1 text-red-500">*</span>
                        )}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`focus:border-primary-500 focus:ring-primary-500 block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
                            error
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                        } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                {hint && !error && (
                    <p className="mt-1 text-sm text-gray-500">{hint}</p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {props.required && (
                            <span className="ml-1 text-red-500">*</span>
                        )}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`focus:border-primary-500 focus:ring-primary-500 block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                    } ${className}`}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                {hint && !error && (
                    <p className="mt-1 text-sm text-gray-500">{hint}</p>
                )}
            </div>
        );
    },
);

Textarea.displayName = 'Textarea';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        { label, error, hint, options, placeholder, className = '', ...props },
        ref,
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {props.required && (
                            <span className="ml-1 text-red-500">*</span>
                        )}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`focus:border-primary-500 focus:ring-primary-500 block w-full rounded-lg border px-3 py-2 text-gray-900 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${
                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                    } ${className}`}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                {hint && !error && (
                    <p className="mt-1 text-sm text-gray-500">{hint}</p>
                )}
            </div>
        );
    },
);

Select.displayName = 'Select';

interface CheckboxProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    label?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="flex items-center">
                <input
                    ref={ref}
                    type="checkbox"
                    className={`text-primary-500 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 ${
                        error ? 'border-red-500' : ''
                    } ${className}`}
                    {...props}
                />
                {label && (
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                {error && <p className="ml-2 text-sm text-red-500">{error}</p>}
            </div>
        );
    },
);

Checkbox.displayName = 'Checkbox';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export function Toggle({
    checked,
    onChange,
    label,
    disabled = false,
}: ToggleProps) {
    return (
        <label className="flex cursor-pointer items-center">
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
                <div
                    className={`h-6 w-11 rounded-full transition-colors ${
                        checked
                            ? 'bg-primary-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                />
                <div
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </div>
            {label && (
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {label}
                </span>
            )}
        </label>
    );
}
