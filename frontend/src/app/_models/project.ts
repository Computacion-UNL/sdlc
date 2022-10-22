import { Activity } from "./activity";
import { Iteration  } from "./iteration";
import { Member } from "./member";

export class Project {
    id?: string;
    _id?: string;
    name?: string;
    description?: string;
    status?: string;
    active?: boolean;
    reason?: string;
    image?: string;
    repository?: string;
    iterations?: Iteration[];
    collaborators?: Member[];
    activities_only?: Activity[];
    activities_numbers?: [
        {name?: string, value?: number}?,
        {name?: string, value?: number}?,
        {name?: string, value?: number}?,
    ];
    activities_progress?: number;
    activities_delayed? : number;
    activities_discard?: number;
    is_owner?: boolean;
    can_view_settings?: boolean;
    created_at?: Date;
    updated_at?: Date;
    iteration?: string;
    general_objective?: string;
    specific_objectives?: { name: string, done: boolean }[];
}
