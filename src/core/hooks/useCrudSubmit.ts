import { useCallback } from 'react';
import { useToast } from '../../shared/components/ToastProvider';

type CrudUpdatePayload<TForm> = {
  id: string;
  values: TForm;
};

interface CrudSubmitMessages {
  successCreate?: string;
  successUpdate?: string;
  error?: string;
}

interface CrudSubmitOptions<TRecord, TForm> {
  mode: 'create' | 'edit';
  resource: {
    create: (values: TForm) => Promise<TRecord>;
    update: (payload: CrudUpdatePayload<TForm>) => Promise<TRecord>;
  };
  entityId?: string;
  onSuccess?: (record: TRecord) => void;
  onError?: (error: unknown) => void;
  messages?: CrudSubmitMessages;
}

const isValidationError = (error: unknown): error is { response?: { status?: number; data?: { errors?: Record<string, string[]> } } } => {
  return Boolean((error as { response?: unknown })?.response);
};

export const useCrudSubmit = <TRecord, TForm>({
  mode,
  resource,
  entityId,
  onSuccess,
  onError,
  messages
}: CrudSubmitOptions<TRecord, TForm>) => {
  const { notify } = useToast();

  const handleSubmit = useCallback(
    async (values: TForm) => {
      try {
        let result: TRecord;
        if (mode === 'edit') {
          if (!entityId) {
            throw new Error('Missing entity id for update operation');
          }
          result = await resource.update({ id: entityId, values });
          notify({ type: 'success', title: messages?.successUpdate ?? 'Changes saved successfully' });
        } else {
          result = await resource.create(values);
          notify({ type: 'success', title: messages?.successCreate ?? 'Created successfully' });
        }
        onSuccess?.(result);
        return result;
      } catch (error) {
        let description: string | undefined;
        if (isValidationError(error) && error.response?.status === 422) {
          const fieldErrors = error.response?.data?.errors;
          if (fieldErrors) {
            description = Object.entries(fieldErrors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
          }
        }

        notify({
          type: 'error',
          title: messages?.error ?? 'Unable to complete the operation',
          description
        });
        onError?.(error);
        throw error;
      }
    },
    [entityId, messages?.error, messages?.successCreate, messages?.successUpdate, mode, notify, onError, onSuccess, resource]
  );

  return { handleSubmit };
};
