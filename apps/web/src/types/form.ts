export type Option = {
    label: string;
    value: string;
};

export type VariableType = 'select' | 'text' | 'number' | 'textarea' | 'radio';

export interface ValidationRules {
    required?: boolean | string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: {
        value: RegExp;
        message: string;
    } | RegExp;
    validate?: (value: any) => boolean | string;
}

export interface VariableConfig {
    name: string;
    type: VariableType;
    defaultValue?: string | number;
    description?: string;
    required?: boolean;
    options?: Option[];
    placeholder?: string;
    validation?: ValidationRules;
}

export type VariablesConfig = Record<string, VariableConfig>;

export interface DynamicConfigFormProps {
    variables: VariablesConfig;
    defaultValues?: Record<string, any>;
    className?: string;
    onChange?: (data: Record<string, any>) => void;
    onValidityChange?: (isValid: boolean) => void;
}
