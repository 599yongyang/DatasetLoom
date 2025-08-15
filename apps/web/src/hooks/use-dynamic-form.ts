import { useState, useCallback } from 'react';

interface UseDynamicFormReturn {
    formData: Record<string, any>;
    isFormValid: boolean;
    handleFormChange: (data: Record<string, any>) => void;
    handleValidityChange: (isValid: boolean) => void;
    getFormData: () => Record<string, any>;
    resetFormData: () => void;
    setFormData: (data: Record<string, any>) => void;
}

export const useDynamicForm = (initialData: Record<string, any> = {}): UseDynamicFormReturn => {
    const [formData, setFormDataState] = useState<Record<string, any>>(initialData);
    const [isFormValid, setIsFormValid] = useState<boolean>(true);

    const handleFormChange = useCallback((data: Record<string, any>) => {
        setFormDataState(data);
    }, []);

    const handleValidityChange = useCallback((isValid: boolean) => {
        setIsFormValid(isValid);
    }, []);

    const getFormData = useCallback(() => formData, [formData]);

    const resetFormData = useCallback(() => {
        setFormDataState(initialData);
    }, [initialData]);

    const setFormData = useCallback((data: Record<string, any>) => {
        setFormDataState(data);
    }, []);

    return {
        formData,
        isFormValid,
        handleFormChange,
        handleValidityChange,
        getFormData,
        resetFormData,
        setFormData,
    };
};
