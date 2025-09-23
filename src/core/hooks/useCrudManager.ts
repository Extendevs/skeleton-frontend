import { useCallback, useReducer, useRef, useState } from 'react';
import { useToast } from '../../shared/components/ToastProvider';
import {
  ICrudConfig,
  ICrudActions,
  IFormState,
  IEntity,
  ISelectData,
  IErrorResponse,
  ISuccessResponse
} from '../interfaces/crud.types';

// Form action types
enum FormActionType {
  SET_VALUE = 'SET_VALUE',
  SET_VALUES = 'SET_VALUES',
  SET_ERROR = 'SET_ERROR',
  SET_ERRORS = 'SET_ERRORS',
  CLEAR_ERRORS = 'CLEAR_ERRORS',
  TOUCH = 'TOUCH',
  TOUCH_ALL = 'TOUCH_ALL',
  SET_SUBMITTED = 'SET_SUBMITTED',
  SET_SAVING = 'SET_SAVING',
  RESET = 'RESET',
  PRISTINE = 'PRISTINE'
}

type FormAction<T> =
  | { type: FormActionType.SET_VALUE; field: keyof T; value: any }
  | { type: FormActionType.SET_VALUES; values: Partial<T> }
  | { type: FormActionType.SET_ERROR; field: keyof T; error: string }
  | { type: FormActionType.SET_ERRORS; errors: Record<string, string[]> }
  | { type: FormActionType.CLEAR_ERRORS }
  | { type: FormActionType.TOUCH; field: keyof T }
  | { type: FormActionType.TOUCH_ALL }
  | { type: FormActionType.SET_SUBMITTED; submitted: boolean }
  | { type: FormActionType.SET_SAVING; saving: boolean }
  | { type: FormActionType.RESET; initialValues?: Partial<T> }
  | { type: FormActionType.PRISTINE };

/**
 * Form state reducer
 */
function formReducer<T>(state: IFormState<T>, action: FormAction<T>): IFormState<T> {
  switch (action.type) {
    case FormActionType.SET_VALUE:
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        isDirty: true
      };

    case FormActionType.SET_VALUES:
      return {
        ...state,
        values: { ...state.values, ...action.values },
        isDirty: true
      };

    case FormActionType.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.field as string]: [action.error] },
        isValid: false
      };

    case FormActionType.SET_ERRORS:
      return {
        ...state,
        errors: action.errors,
        isValid: Object.keys(action.errors).length === 0
      };

    case FormActionType.CLEAR_ERRORS:
      return {
        ...state,
        errors: {},
        isValid: true
      };

    case FormActionType.TOUCH:
      return {
        ...state,
        touched: { ...state.touched, [action.field as string]: true }
      };

    case FormActionType.TOUCH_ALL:
      const allTouched: Record<string, boolean> = {};
      Object.keys(state.values).forEach(key => {
        allTouched[key] = true;
      });
      return {
        ...state,
        touched: allTouched
      };

    case FormActionType.SET_SUBMITTED:
      return {
        ...state,
        submitted: action.submitted
      };

    case FormActionType.SET_SAVING:
      return {
        ...state,
        isSaving: action.saving
      };

    case FormActionType.RESET:
      return {
        values: action.initialValues || {},
        errors: {},
        touched: {},
        submitted: false,
        isDirty: false,
        isValid: true,
        isSaving: false
      };

    case FormActionType.PRISTINE:
      return {
        ...state,
        touched: {},
        submitted: false,
        isDirty: false
      };

    default:
      return state;
  }
}

/**
 * Professional CRUD Management Hook
 * Inspired by Angular BaseCrudService but properly adapted to React
 */
export function useCrudManager<T extends IEntity>(
  resource: {
    save?: (data: Partial<T>) => Promise<ISuccessResponse<T>>;
    update?: (id: string | number, data: Partial<T>) => Promise<ISuccessResponse<T>>;
    delete?: (id: string | number) => Promise<void>;
    restore?: (id: string | number) => Promise<ISuccessResponse<T>>;
    getSelects?: (params: any) => Promise<ISelectData>;
  },
  config: ICrudConfig<T> = {}
) {
  const {
    mode = 'create',
    entity = null,
    additionalSave = false,
    readOnly = false,
    actionSave = 'save',
    actionUpdate = 'update',
    with: withFields = [],
    beforeSave,
    afterSave,
    beforeUpdate,
    afterUpdate,
    onError,
    onSuccess,
    messages = {}
  } = config;

  const { notify } = useToast();
  const [selects, setSelects] = useState<ISelectData>({});
  const [loadingSelects, setLoadingSelects] = useState(false);

  // Initialize form state
  const initialFormState: IFormState<T> = {
    values: entity || {} as Partial<T>,
    errors: {},
    touched: {},
    submitted: false,
    isDirty: false,
    isValid: true,
    isSaving: false
  };

  const [formState, dispatch] = useReducer(formReducer<T>, initialFormState);
  const validationRules = useRef<Record<keyof T, (value: any) => string | null>>({} as any);

  // Default messages
  const {
    saveSuccess = 'Saved successfully',
    saveError = 'Failed to save',
    updateSuccess = 'Updated successfully',
    updateError = 'Failed to update',
    validationError = 'Please fix validation errors'
  } = messages;

  /**
   * Clean params before sending to API
   */
  const cleanParams = useCallback((params: Partial<T>): Partial<T> => {
    const cleaned = { ...params };

    // Remove undefined/null id for new entities
    if ('id' in cleaned && !cleaned.id) {
      delete cleaned.id;
    }

    // Add 'with' fields if specified
    if (withFields.length > 0) {
      (cleaned as any)._with = withFields;
    }

    return cleaned;
  }, [withFields]);

  /**
   * Handle API errors
   */
  const handleError = useCallback((error: any) => {
    if (error.status === 422 && error.errors) {
      // Validation errors
      dispatch({ type: FormActionType.SET_ERRORS, errors: error.errors });

      const errorMessages: string[] = [];
      Object.entries(error.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          errorMessages.push(`${field}: ${messages.join(', ')}`);
        }
      });

      notify({
        type: 'error',
        title: validationError,
        description: errorMessages.join('\n')
      });
    } else {
      notify({
        type: 'error',
        title: error.message || 'An error occurred',
        description: error.body?.message
      });
    }

    onError?.(error);
  }, [notify, validationError, onError]);

  /**
   * Validate all fields
   */
  const validate = useCallback((): boolean => {
    const errors: Record<string, string[]> = {};

    Object.keys(formState.values).forEach(field => {
      const validator = validationRules.current[field as keyof T];
      if (validator) {
        const error = validator(formState.values[field as keyof T]);
        if (error) {
          errors[field] = [error];
        }
      }
    });

    dispatch({ type: FormActionType.SET_ERRORS, errors });
    return Object.keys(errors).length === 0;
  }, [formState.values]);

  /**
   * Validate single field
   */
  const validateField = useCallback((field: keyof T): boolean => {
    const validator = validationRules.current[field];
    if (!validator) return true;

    const error = validator(formState.values[field]);
    if (error) {
      dispatch({ type: FormActionType.SET_ERROR, field, error });
      return false;
    }

    // Clear error for this field
    const newErrors = { ...formState.errors };
    delete newErrors[field as string];
    dispatch({ type: FormActionType.SET_ERRORS, errors: newErrors });

    return true;
  }, [formState.values, formState.errors]);

  /**
   * Save entity
   */
  const save = useCallback(async (): Promise<T | null> => {
    if (readOnly || !resource.save) return null;

    dispatch({ type: FormActionType.SET_SUBMITTED, submitted: true });

    if (!validate()) {
      notify({ type: 'error', title: validationError });
      return null;
    }

    dispatch({ type: FormActionType.SET_SAVING, saving: true });

    try {
      let params = formState.values;

      // Process params
      if (beforeSave) {
        params = await beforeSave(params);
      }
      params = cleanParams(params);

      // Call API
      const response = await resource.save(params);
      const savedEntity = response.data;

      // Success handling
      notify({ type: 'success', title: saveSuccess });

      if (afterSave) {
        await afterSave(savedEntity);
      }

      onSuccess?.(savedEntity);

      // Reset form if not additional save
      if (!additionalSave) {
        dispatch({ type: FormActionType.PRISTINE });
      }

      return savedEntity;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      dispatch({ type: FormActionType.SET_SAVING, saving: false });
    }
  }, [
    readOnly,
    resource,
    formState.values,
    validate,
    beforeSave,
    afterSave,
    cleanParams,
    notify,
    saveSuccess,
    validationError,
    additionalSave,
    onSuccess,
    handleError
  ]);

  /**
   * Update entity
   */
  const update = useCallback(async (): Promise<T | null> => {
    if (readOnly || !resource.update || !entity?.id) return null;

    dispatch({ type: FormActionType.SET_SUBMITTED, submitted: true });

    if (!validate()) {
      notify({ type: 'error', title: validationError });
      return null;
    }

    dispatch({ type: FormActionType.SET_SAVING, saving: true });

    try {
      let params = formState.values;

      // Process params
      if (beforeUpdate) {
        params = await beforeUpdate(params);
      }
      params = cleanParams(params);

      // Call API
      const response = await resource.update(entity.id, params);
      const updatedEntity = response.data;

      // Success handling
      notify({ type: 'success', title: updateSuccess });

      if (afterUpdate) {
        await afterUpdate(updatedEntity);
      }

      onSuccess?.(updatedEntity);

      // Mark as pristine
      dispatch({ type: FormActionType.PRISTINE });

      return updatedEntity;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      dispatch({ type: FormActionType.SET_SAVING, saving: false });
    }
  }, [
    readOnly,
    resource,
    entity,
    formState.values,
    validate,
    beforeUpdate,
    afterUpdate,
    cleanParams,
    notify,
    updateSuccess,
    validationError,
    onSuccess,
    handleError
  ]);

  /**
   * Delete entity
   */
  const deleteEntity = useCallback(async (id: string | number): Promise<boolean> => {
    if (!resource.delete) return false;

    try {
      await resource.delete(id);
      notify({ type: 'success', title: 'Deleted successfully' });
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [resource, notify, handleError]);

  /**
   * Restore entity
   */
  const restore = useCallback(async (id: string | number): Promise<T | null> => {
    if (!resource.restore) return null;

    try {
      const response = await resource.restore(id);
      notify({ type: 'success', title: 'Restored successfully' });
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [resource, notify, handleError]);

  /**
   * Load select options
   */
  const loadSelects = useCallback(async (params: any) => {
    if (!resource.getSelects) return;

    setLoadingSelects(true);

    try {
      const data = await resource.getSelects(params);
      setSelects(prev => ({ ...prev, ...data }));
      return data;
    } catch (error) {
      console.error('Failed to load selects', error);
      return {};
    } finally {
      setLoadingSelects(false);
    }
  }, [resource]);

  /**
   * Set validation rules for fields
   */
  const setValidationRules = useCallback((
    rules: Record<keyof T, (value: any) => string | null>
  ) => {
    validationRules.current = rules;
  }, []);

  // Actions
  const actions: ICrudActions<T> = {
    setValue: (field, value) => dispatch({ type: FormActionType.SET_VALUE, field, value }),
    setValues: (values) => dispatch({ type: FormActionType.SET_VALUES, values }),
    setError: (field, error) => dispatch({ type: FormActionType.SET_ERROR, field, error }),
    clearErrors: () => dispatch({ type: FormActionType.CLEAR_ERRORS }),
    touch: (field) => dispatch({ type: FormActionType.TOUCH, field }),
    reset: () => dispatch({ type: FormActionType.RESET, initialValues: entity || undefined }),
    pristine: () => dispatch({ type: FormActionType.PRISTINE }),
    save,
    update,
    delete: deleteEntity,
    restore,
    validate,
    validateField
  };

  return {
    // Form state
    formState,

    // Actions
    actions,

    // Select data
    selects,
    loadingSelects,
    loadSelects,

    // Validation
    setValidationRules,

    // Computed
    isEdit: mode === 'edit',
    isCreate: mode === 'create',
    isDetail: mode === 'detail',
    canSave: !readOnly && formState.isValid && !formState.isSaving,
    isDirty: formState.isDirty
  };
}

export type CrudManager<T extends IEntity> = ReturnType<typeof useCrudManager<T>>;
