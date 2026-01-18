import { apiClient } from './apiClient';
import { PaginatedResponse } from '../../types/Entity';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CustomMethodConfig {
  path: string;
  method: HttpMethod;
}

type CustomMethodValue<T = unknown> =
  | CustomMethodConfig
  | ((basePath: string) => (...args: unknown[]) => Promise<T>);

export interface CrudApiConfig<TRecord, TForm> {
  basePath: string;
  mapListResponse?: (payload: PaginatedResponse<TRecord>) => PaginatedResponse<TRecord>;
  mapCreateInput?: (payload: TForm) => unknown;
  mapUpdateInput?: (payload: Partial<TForm>) => unknown;
  customMethods?: Record<string, CustomMethodValue>;
}

export const createCrudApi = <
  TRecord extends Record<string, unknown>,
  TForm extends Record<string, unknown> = TRecord,
  TParams = Record<string, unknown>
>({
  basePath,
  mapListResponse,
  mapCreateInput,
  mapUpdateInput,
  customMethods
}: CrudApiConfig<TRecord, TForm>) => {
  const list = async (params: TParams) => {
    const { data } = await apiClient.get<PaginatedResponse<TRecord>>(basePath, { params });
    return mapListResponse ? mapListResponse(data) : data;
  };

  const search = async (params: TParams) => {
    const { data } = await apiClient.post<PaginatedResponse<TRecord>>(`${basePath}/search`, params);
    return mapListResponse ? mapListResponse(data) : data;
  };

  const create = async (payload: TForm) => {
    const body = mapCreateInput ? mapCreateInput(payload) : payload;
    const queryParams = await setQueryParams(payload);
    const { data } = await apiClient.post<TRecord>(`${basePath}?${queryParams.toString()}`, body);
    return data;
  };

  const setQueryParams = async (payload: Partial<TForm> = {}) => {
    const includeParam: Record<string, string> = {};
    if (payload.include) {
      includeParam.include = String(payload.include);
    }
    const queryParams = new URLSearchParams(includeParam);
    return queryParams;
  };

  const update = async (id: string, payload: Partial<TForm> = {}) => {
    const body = mapUpdateInput ? mapUpdateInput(payload) : payload;
    const queryParams = await setQueryParams(payload);
    const { data } = await apiClient.put<TRecord>(`${basePath}/${id}?${queryParams.toString()}`, body);
    return data;
  };

  const show = async (id: string, params?: Partial<TForm>) => {
    const { data } = await apiClient.get<{ data: TRecord }>(`${basePath}/${id}`, { params });
    return data.data;
  };

  const remove = async (id: string) => {
    await apiClient.delete(`${basePath}/${id}`);
    return id;
  };

  const report = async (params: TParams) => {
    const response = await apiClient.post(`/customReport`, params, {
      responseType: 'blob', // Important for file downloads
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Extract filename - prioritize _title from params for consistency
    let filename = 'report.xlsx';

    // First, check if params has _title (most reliable)
    if (params && typeof params === 'object' && '_title' in params) {
      const title = (params as { _title?: string })._title;
      if (title) {
        // Sanitize filename to ensure it's valid
        filename = `${title.replace(/[^A-Za-z0-9_\-\s]/g, '_')}.xlsx`;
      }
    } else {
      // Fallback to content-disposition header
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        // Try different patterns for filename extraction
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response;
  };

  const baseMethods = { list, search, show, create, update, remove, report } as const;

  // Procesar customMethods
  if (customMethods) {
    const processedMethods = Object.entries(customMethods).reduce((acc, [methodName, methodValue]) => {
      // Si es un objeto con path y method, generar método automático
      if (typeof methodValue === 'object' && 'path' in methodValue && 'method' in methodValue) {
        const config = methodValue as CustomMethodConfig;
        acc[methodName] = async (payload?: unknown) => {
          switch (config.method) {
            case 'GET': {
              const { data } = await apiClient.get(`${basePath}/${config.path}`, { params: payload });
              return data;
            }
            case 'POST': {
              const queryParams = payload ? await setQueryParams(payload as TForm) : new URLSearchParams();
              const url = `${basePath}/${config.path}?${queryParams.toString()}`;
              const { data } = await apiClient.post(url, payload);
              return data;
            }
            case 'PUT': {
              const queryParams = payload ? await setQueryParams(payload as TForm) : new URLSearchParams();
              const url = `${basePath}/${config.path}?${queryParams.toString()}`;
              const { data } = await apiClient.put(url, payload);
              return data;
            }
            case 'PATCH': {
              const queryParams = payload ? await setQueryParams(payload as TForm) : new URLSearchParams();
              const url = `${basePath}/${config.path}?${queryParams.toString()}`;
              const { data } = await apiClient.patch(url, payload);
              return data;
            }
            case 'DELETE': {
              const queryParams = payload ? await setQueryParams(payload as TForm) : new URLSearchParams();
              const url = `${basePath}/${config.path}?${queryParams.toString()}`;
              const { data } = await apiClient.delete(url, { data: payload });
              return data;
            }
            default:
              throw new Error(`Unsupported HTTP method: ${config.method}`);
          }
        };
      }
      // Si es una función, ejecutarla pasando basePath
      else if (typeof methodValue === 'function') {
        acc[methodName] = methodValue(basePath);
      }

      return acc;
    }, {} as Record<string, (...args: unknown[]) => Promise<unknown>>);

    return { ...baseMethods, ...processedMethods };
  }

  return baseMethods;
};
