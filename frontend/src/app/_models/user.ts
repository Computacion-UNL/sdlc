export class User {
  id?: string;
  _id?: string;
  name?: string;
  lastname?: string;
  email?: string;
  image?: string;

  password?: string;

  created_at?: Date;
  updated_at?: Date;

  active?: boolean;
  verified?: boolean;
  pending?: boolean;
  admin?: boolean;

  token?: string;
}
