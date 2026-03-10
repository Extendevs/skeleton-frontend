import type { IUser, UserFormValues } from '@/modules/user/schema'
import { createCrudApi } from '@/shared/api/resourceApi'

export const UserResource = createCrudApi<IUser, UserFormValues>({
  basePath: '/user',
});
