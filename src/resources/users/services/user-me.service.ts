import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCourseService } from 'src/resources/user-course/user-course.service';
import { User, UserDocument } from '../schemas/user.schema';
import { UsersService } from '../users.service';
import { RolesService } from './../../roles/roles.service';

@Injectable()
export class UserMeService extends UsersService {
    constructor(
        @InjectModel(User.name) protected userModel: Model<UserDocument>,
        protected userCourseService: UserCourseService,
        protected rolesService: RolesService
    ) {
        super(userModel, userCourseService);
    }
    async switchToInstructor(userId: string) {
        const studentRole = await this.rolesService.model.findOne({
            name: 'Instructor',
        });
        return this.model.updateOne(
            {
                _id: userId,
            },
            {
                $set: {
                    role: studentRole._id,
                },
            }
        );
    }
}
