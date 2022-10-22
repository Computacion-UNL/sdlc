import { Permission } from "./permission";
export class Role {
    id?: string;
    _id?:string;
    name: string;
    slug?: string;
    active?: boolean;
    project: string;
    permissions?: Number[];
    permission_detail?: Permission[];
    created_at?: Date;
    updated_at?: Date;
}
