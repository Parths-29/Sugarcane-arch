import { User } from "../models/user.model";
export const UserRepository = {
  findByPhone: (phone: string) => User.findOne({ phone }),
  create: (data: { name: string; phone: string; password: string; village?: string; language?: string }) =>
    User.create(data),
};
