import { Change } from "./change";
import { Task } from "./task";
export class Activity {
    _id?: string;
    name?: string;
    description?: string;
    status?: string;
    resource?: string;
    priority?: string;
    start_date?: Date;
    finish_date?: Date;
    finish_real_date?: any;
    incidence?: boolean;
    active?: boolean;
    discard?: boolean;
    reason_discard?: string;
    tasks?: Task[];
    parent?: string;
    iteration?: any;
    project?: any;
    change?: Change;
    responsable?: any[];
    roles?: { user: string, role: string }[];
    type?: string;
    created_by_manager?: boolean;
    created_at?: Date;
    updated_at?: Date;
    phase?: string;
}
