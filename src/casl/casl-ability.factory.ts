import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/resources/users/schemas/user.schema';
import {
    BASIC_PERMISSIONS,
    TDocumentName,
    TPermission,
} from './../common/utils/constants/role.constant';

type Subjects = TDocumentName | 'all';

export type AppAbility = Ability<[TPermission, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<Ability<[TPermission, Subjects]>>(
            Ability as AbilityClass<AppAbility>
        );

        // SET PERMISSIONS
        const permissionObj = {};
        user.role.permissions.forEach((item) => {
            permissionObj[item.documentPermission.name] = item.enabledPermissions;
            this.setPermissions(
                can,
                item.documentPermission.name,
                item.enabledPermissions,
                item.onlyForCreator
            );
        });
        // cannot(Action.Delete, Course, { isPublished: true });

        return build();
    }

    private setPermissions(
        can: any,
        documentName: TDocumentName,
        permissions: TPermission[],
        onlyForCreator: boolean
    ) {
        permissions.forEach((permission) => {
            if (BASIC_PERMISSIONS.includes(permission as any)) {
                can(`${permission}-own`, documentName);
                if (!onlyForCreator) {
                    can(`${permission}`, documentName);
                }
            } else {
                can(permission, documentName);
            }
        });
    }
}
