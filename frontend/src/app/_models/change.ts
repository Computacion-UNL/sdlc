import { User } from "./user";

export class Change {
    _id?: string;
    attribute_type?: string;
    previous_value?: string;
    new_value?: string;
    author?: User;
    activity?: string;

    created_at?: Date;
    updated_at?: Date;
}
