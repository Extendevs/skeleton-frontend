import { apiClient } from './apiClient';
import { PaginatedResponse } from '../../types/Entity';

export interface CrudApiConfig<TRecord, TForm> {
  basePath: string;
  mapListResponse?: (payload: PaginatedResponse<TRecord>) => PaginatedResponse<TRecord>;
  mapCreateInput?: (payload: TForm) => unknown;
  mapUpdateInput?: (payload: TForm) => unknown;
}

export const createCrudApi = <TRecord, TForm = TRecord, TParams = Record<string, unknown>>({
  basePath,
  mapListResponse,
  mapCreateInput,
  mapUpdateInput
}: CrudApiConfig<TRecord, TForm>) => {
  const list = async (params: TParams) => {
    const { data } = await apiClient.get<PaginatedResponse<TRecord>>(basePath, { params });
    return mapListResponse ? mapListResponse(data) : data;
  };

  const create = async (payload: TForm) => {
    const body = mapCreateInput ? mapCreateInput(payload) : payload;
    const { data } = await apiClient.post<TRecord>(basePath, body);
    return data;
  };

  const update = async (id: string, payload: TForm) => {
    const body = mapUpdateInput ? mapUpdateInput(payload) : payload;
    const { data } = await apiClient.put<TRecord>(`${basePath}/${id}`, body);
    return data;
  };

  const remove = async (id: string) => {
    await apiClient.delete(`${basePath}/${id}`);
    return id;
  };

  return { list, create, update, remove } as const;
};
