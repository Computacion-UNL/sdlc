import { Activity } from "./activity";

export class Iteration {
    _id?: string;
    name?: string;
    start_date?: Date;
    finish_date?: Date;
    finished_at?: Date;
    objective?: string;
    score?: string;
    active?: boolean;
    started?: boolean;
    finished?: boolean;
    password?: string;
    project?: string;
    activities?: Activity[];
    activities_numbers?: [
        {name?: string, value?: number},
        {name?: string, value?: number},
        {name?: string, value?: number},
    ];

    counta?: number = 0;
    countf?: number = 0;

    planning?: Activity[];
    design?: Activity[];
    coding?: Activity[];
    testing?: Activity[];

    phase?: number;

    created_at?: Date;
    updated_at?: Date;
}
