import React, { useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { DynamicConfigFormProps } from '@/types/form';
import { FormFieldRenderer } from '@/components/prompt-template/form-field-renderer';

export interface DynamicFormRef {
    validate: () => Promise<boolean>;
    getData: () => Record<string, any>;
    reset: () => void;
}

const DynamicConfigForm = forwardRef<DynamicFormRef, DynamicConfigFormProps>(({
                                                                                  variables,
                                                                                  defaultValues = {},
                                                                                  className = '',
                                                                                  onChange,
                                                                                  onValidityChange
                                                                              }, ref) => {
    const mergedDefaultValues = useMemo(() => {
        return Object.entries(variables).reduce((acc, [name, config]) => {
            if (defaultValues.hasOwnProperty(name)) {
                acc[name] = defaultValues[name];
            } else if (config.defaultValue !== undefined) {
                acc[name] = config.defaultValue;
            } else {
                acc[name] = config.type === 'number' ? 0 : '';
            }
            return acc;
        }, {} as Record<string, any>);
    }, [variables, defaultValues]);

    const validationRules = useMemo(() => {
        const rules: Record<string, any> = {};

        Object.entries(variables).forEach(([name, config]) => {
            const fieldRules: any = {};

            // 必填验证
            if (config.required) {
                fieldRules.required = '此项为必填';
            }

            // 自定义验证规则
            if (config.validation) {
                if (config.validation.required !== undefined) {
                    fieldRules.required = config.validation.required || '此项为必填';
                }
                if (config.validation.minLength !== undefined) {
                    fieldRules.minLength = {
                        value: config.validation.minLength,
                        message: `最少${config.validation.minLength}个字符`
                    };
                }
                if (config.validation.maxLength !== undefined) {
                    fieldRules.maxLength = {
                        value: config.validation.maxLength,
                        message: `最多${config.validation.maxLength}个字符`
                    };
                }
                if (config.validation.min !== undefined) {
                    fieldRules.min = {
                        value: config.validation.min,
                        message: `最小值为${config.validation.min}`
                    };
                }
                if (config.validation.max !== undefined) {
                    fieldRules.max = {
                        value: config.validation.max,
                        message: `最大值为${config.validation.max}`
                    };
                }
                if (config.validation.pattern) {
                    fieldRules.pattern = {
                        value: config.validation.pattern instanceof RegExp
                            ? config.validation.pattern
                            : config.validation.pattern.value,
                        message: config.validation.pattern instanceof RegExp
                            ? '格式不正确'
                            : config.validation.pattern.message
                    };
                }
                if (config.validation.validate) {
                    fieldRules.validate = config.validation.validate;
                }
            }

            rules[name] = fieldRules;
        });

        return rules;
    }, [variables]);

    const form = useForm({
        defaultValues: mergedDefaultValues,
        mode: 'onChange'
    });

    const { isValid, errors } = useFormState({
        control: form.control
    });

    // 主动触发验证的方法
    const validateForm = async (): Promise<boolean> => {
        const result = await form.trigger();
        return result;
    };

    // 获取表单数据的方法
    const getFormData = (): Record<string, any> => {
        return form.getValues();
    };

    // 重置表单的方法
    const resetForm = (): void => {
        form.reset(mergedDefaultValues);
    };

    // 通过 ref 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        validate: validateForm,
        getData: getFormData,
        reset: resetForm
    }));

    useEffect(() => {
        const subscription = form.watch((data) => {
            onChange?.(data);
        });
        return () => subscription.unsubscribe();
    }, [form, onChange]);

    useEffect(() => {
        onValidityChange?.(isValid);
    }, [isValid, onValidityChange]);

    const validVariables = useMemo(() => {
        return Object.entries(variables).filter(([_, config]) => {
            if (config.type === 'select' || config.type === 'radio') {
                return config.options && config.options.length > 0;
            }
            return true;
        });
    }, [variables]);

    if (validVariables.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validVariables.map(([name, config]) => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            rules={validationRules[name]}
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel
                                        className={`text-sm font-medium ${config.required ? 'flex items-center' : ''}`}>
                                        {config.description || name}
                                        {config.required && (
                                            <span className="text-destructive ml-1 text-xs">*</span>
                                        )}
                                    </FormLabel>

                                    <FormControl>
                                        <FormFieldRenderer config={config} field={field} />
                                    </FormControl>

                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </Form>
        </div>
    );
});
DynamicConfigForm.displayName = 'DynamicConfigForm';

export { DynamicConfigForm };
