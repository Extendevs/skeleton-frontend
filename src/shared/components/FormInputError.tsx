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
        return 'Este campo es requerido';
      
      case 'email':
        return 'Por favor ingresa una dirección de email válida';
      
      case 'minLength':
        return `La longitud mínima es ${error.message?.split(' ')[4] || 'requerida'}`;
      
      case 'maxLength':
        return `La longitud máxima es ${error.message?.split(' ')[4] || 'excedida'}`;
      
      case 'min':
        return `El valor mínimo es ${error.message?.split(' ')[4] || 'requerido'}`;
      
      case 'max':
        return `El valor máximo es ${error.message?.split(' ')[4] || 'excedido'}`;
      
      case 'pattern':
        return 'Por favor ingresa un formato válido';
      
      case 'url':
        return 'Por favor ingresa una URL válida';
      
      case 'validate':
        return error.message || 'Valor inválido';
      
      default:
        return error.message || 'Campo inválido';
    }
  };

  return (
    <div className="text-rose-600 text-xs">
      <div>{getErrorMessage(error)}</div>
      {children}
    </div>
  );
};
