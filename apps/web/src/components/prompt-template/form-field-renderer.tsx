import React from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VariableConfig } from '@/types/form';

interface FormFieldRendererProps {
    config: VariableConfig;
    field: ControllerRenderProps<FieldValues, string>;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = React.memo(({ config, field }) => {
    const placeholder = config.placeholder || config.description || config.name;

    switch (config.type) {
        case 'select':
            return (
                <div className="space-y-2">
                    <Select
                        onValueChange={field.onChange}
                        value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {config.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );

        case 'radio':
            if (!config.options) return null;
            return (
                <RadioGroup
                    className="space-y-2"
                    value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                    onValueChange={field.onChange}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {config.options.map((option) => (
                            <div
                                key={option.value}
                                className="border border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`${config.name}-${option.value}`}
                                        className="border-2"
                                    />
                                    <Label
                                        htmlFor={`${config.name}-${option.value}`}
                                        className="font-normal cursor-pointer text-sm"
                                    >
                                        {option.label}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
            );

        case 'textarea':
            return (
                <Textarea
                    placeholder={placeholder}
                    {...field}
                    value={field.value || ''}
                    className="min-h-[100px] resize-none"
                />
            );

        case 'number':
            return (
                <Input
                    type="number"
                    placeholder={placeholder}
                    {...field}
                    value={field.value || ''}
                    className="w-full"
                />
            );

        case 'text':
        default:
            return (
                <Input
                    type="text"
                    placeholder={placeholder}
                    {...field}
                    value={field.value || ''}
                    className="w-full"
                />
            );
    }
});

FormFieldRenderer.displayName = 'FormFieldRenderer';
