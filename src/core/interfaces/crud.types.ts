/**
 * Professional CRUD Management Types
 * Based on Angular BaseCrudService architecture
 */

// Entity base interface
export interface IEntity {
    id: string | number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    [key: string]: any;
}

// Form state management
export interface IFormState<T> {
    values: Partial<T>;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    submitted: boolean;
    isDirty: boolean;
    isValid: boolean;
    isSaving: boolean;
}

// CRUD configuration
export interface ICrudConfig<T> {
    resourceKey?: string;
    mode?: 'create' | 'edit' | 'detail';
    entity?: T | null;
    additionalSave?: boolean;
    readOnly?: boolean;
    actionSave?: string;
    actionUpdate?: string;
    with?: string[];

    // Callbacks
    beforeSave?: (values: Partial<T>) => Partial<T> | Promise<Partial<T>>;
    afterSave?: (entity: T) => void | Promise<void>;
    beforeUpdate?: (values: Partial<T>) => Partial<T> | Promise<Partial<T>>;
    afterUpdate?: (entity: T) => void | Promise<void>;
    onError?: (error: Error) => void;
    onSuccess?: (entity: T) => void;

    // Messages
    messages?: {
        saveSuccess?: string;
        saveError?: string;
        updateSuccess?: string;
        updateError?: string;
        validationError?: string;
    };
}

// CRUD actions
export interface ICrudActions<T> {
    // Form operations
    setValue: (field: keyof T, value: any) => void;
    setValues: (values: Partial<T>) => void;
    setError: (field: keyof T, error: string) => void;
    clearErrors: () => void;
    touch: (field: keyof T) => void;
    reset: () => void;
    pristine: () => void;

    // CRUD operations
    save: () => Promise<T | null>;
    update: () => Promise<T | null>;
    delete: (id: string | number) => Promise<boolean>;
    restore: (id: string | number) => Promise<T | null>;

    // Validation
    validate: () => boolean;
    validateField: (field: keyof T) => boolean;
}

// Select/dropdown data management
export interface ISelectData {
    [key: string]: ISelectOption[];
}

export interface ISelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    data?: any;
}

// Error response structure
export interface IErrorResponse {
    status: number;
    message?: string;
    errors?: Record<string, string[]>;
    body?: any;
}

// Success response structure
export interface ISuccessResponse<T> {
    data: T;
    message?: string;
    meta?: any;
}
