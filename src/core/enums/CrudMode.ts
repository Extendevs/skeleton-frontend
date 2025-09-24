/**
 * CRUD Mode Enum
 */
export enum CrudMode {
    CREATE = 'create',
    EDIT = 'edit',
    DETAIL = 'detail'
}

export type CrudModeType = keyof typeof CrudMode;
