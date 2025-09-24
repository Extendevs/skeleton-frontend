import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputErrorProps {
  error?: FieldError;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * FormInputError Component
 * Replaces the inline error display with a reusable component
 * Similar to Angular's FormInputErrorComponent
 */
export const FormInputError = ({ 
  error, 
  disabled = false, 
  children 
}: FormInputErrorProps) => {
  // Don't show errors if disabled or no error
  if (disabled || !error) {
    return null;
  }

  const getErrorMessage = (error: FieldError): string => {
    switch (error.type) {
      case 'required':
        return 'This field is required';
      
      case 'email':
        return 'Please enter a valid email address';
      
      case 'minLength':
        return `Minimum length is ${error.message?.split(' ')[4] || 'required'}`;
      
      case 'maxLength':
        return `Maximum length is ${error.message?.split(' ')[4] || 'exceeded'}`;
      
      case 'min':
        return `Minimum value is ${error.message?.split(' ')[4] || 'required'}`;
      
      case 'max':
        return `Maximum value is ${error.message?.split(' ')[4] || 'exceeded'}`;
      
      case 'pattern':
        return 'Please enter a valid format';
      
      case 'url':
        return 'Please enter a valid URL';
      
      case 'validate':
        return error.message || 'Invalid value';
      
      default:
        return error.message || 'Invalid field';
    }
  };

  return (
    <div className="text-rose-600 text-xs">
      <div>{getErrorMessage(error)}</div>
      {children}
    </div>
  );
};
