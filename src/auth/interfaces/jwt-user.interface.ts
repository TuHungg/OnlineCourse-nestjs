import { Permission } from 'src/resources/roles/schemas/role.schema';

export default interface IJwtUser {
    _id: string;
    email: string;
    // profile: Profile
    role: {
        _id: string;
        name: string;
        permissions: Permission[];
    };
}
