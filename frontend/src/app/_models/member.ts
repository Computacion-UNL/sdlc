export class Member {
    id?: string;
    _id?: string;
    date_admission?: Date;
    owner?: boolean;
    active?: boolean;
    removed?: boolean;
    reason?: boolean;

    user?: any;
    project?: any;
    role?: any;

    assigned?: boolean;

    created_at?: Date;
    updated_at?: Date;
}
