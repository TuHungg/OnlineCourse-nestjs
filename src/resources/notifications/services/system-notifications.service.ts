import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment';
import { Model } from 'mongoose';
import IJwtUser from 'src/auth/interfaces/jwt-user.interface';
import { TApproveStatus } from 'src/resources/courses/dto/approve-course.dto';
import { User } from 'src/resources/users/schemas/user.schema';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { ActivityLog } from './../../activity-logs/schemas/activity-logs.schema';
import { Comment, CommentDocument } from './../../comments/schemas/comment.schema';
import { Course, CourseDocument } from './../../courses/schemas/course.schema';
import { Payment, PaymentDocument } from './../../payments/schemas/payment.schema';
import { UserDocument } from './../../users/schemas/user.schema';
import { NotificationsService } from './notifications.service';

@Injectable()
export class SystemNotificationsService {
    constructor(
        @InjectModel(Notification.name) protected notificationModel: Model<NotificationDocument>,
        @InjectModel(Course.name) protected courseModel: Model<CourseDocument>,
        @InjectModel(Payment.name) protected paymentModel: Model<PaymentDocument>,
        @InjectModel(User.name) protected userModel: Model<UserDocument>,
        @InjectModel(Comment.name) protected commentModel: Model<CommentDocument>,
        private readonly notificationsService: NotificationsService
    ) {}

    // NEW ACTIVITY
    private async getNewActivityData(activityLog: ActivityLog): Promise<Partial<Notification>> {
        const name = !!activityLog.user ? activityLog.user.profile.fullName : 'unknown';
        const data: Partial<Notification> = {
            sourceId: activityLog._id.toString(),
            sourceType: 'new-activity',
            collectionName: 'activitylogs',
            receiver: process.env.OWNER_ID as any,
            content: this.genContent([
                {
                    text: 'New activity - ',
                },
                {
                    strong: name,
                },
            ]),
        };
        return data;
    }
    async newActivitty(activityLog: ActivityLog): Promise<Notification> {
        const data = await this.getNewActivityData(activityLog);
        return this.saveNotification(data);
    }

    // NEW COMMENT
    private async getCommentNotificationData(
        sender: User,
        course: Course,
        comment: Comment
    ): Promise<Partial<Notification>> {
        const parentComment = await this.commentModel.findById(comment.parent).populate('user');
        const data: Partial<Notification> = {
            sourceId: comment._id.toString(),
            sourceSlug: course.basicInfo.slug,
            sourceType: 'new-comment',
            collectionName: 'comments',
            receiver: parentComment.user._id,
            content: this.genContent([
                {
                    strong: sender.profile.fullName,
                },
                {
                    text: 'replied your comment on',
                },
                {
                    strong: course.basicInfo.title,
                },
                {
                    text: 'course.',
                },
            ]),
            thumb: sender.profile.avatar,
        };
        return data;
    }
    private async getStudentCommentNotificationData(
        sender: User,
        instructor: User,
        course: Course,
        comment: Comment
    ): Promise<Partial<Notification>> {
        const data: Partial<Notification> = {
            sourceId: comment._id.toString(),
            sourceSlug: course.basicInfo.slug,
            sourceType: 'new-comment',
            collectionName: 'comments',
            receiver: instructor._id.toString() as any,
            content: this.genContent([
                {
                    strong: sender.profile.fullName,
                },
                {
                    text: 'commented on ',
                },
                {
                    strong: course.basicInfo.title,
                },
                {
                    text: 'course.',
                },
            ]),
            thumb: sender.profile.avatar,
        };
        return data;
    }
    async newComment(comment: CommentDocument): Promise<Notification> {
        const course = await this.courseModel.findById(comment.course);
        const instructor = await this.userModel.findById(course.history.createdBy);
        const sender = await this.userModel.findById(comment.user);
        let data: Partial<Notification>;
        if (instructor._id.toString() == comment.user.toString()) {
            if (!!comment.parent) {
                // instructor replied
                data = await this.getCommentNotificationData(sender, course, comment);
            }
        } else {
            // student comment
            data = await this.getStudentCommentNotificationData(
                sender,
                instructor,
                course,
                comment
            );
        }
        if (!!data) {
            // has data
            return this.saveNotification(data);
        }
    }
    // SWITCH TO INSTRUCTOR
    private getSwitchToInstructorNotificationData(user: User) {
        const data: Partial<Notification> = {
            sourceType: 'message',
            receiver: user._id as any,
            content: this.genContent([
                {
                    text: 'Welcome',
                },
                {
                    strong: user.profile.fullName,
                },
                {
                    text: 'to',
                },
                {
                    strong: 'Instructor Community',
                },
                {
                    text: 'lets create your first course.',
                },
            ]),
        };
        return data;
    }
    async switchToInstructor(jwtUser: IJwtUser) {
        const user = await this.userModel.findById(jwtUser._id);
        const data = await this.getSwitchToInstructorNotificationData(user);
        return this.saveNotification(data);
    }
    // APPROVE COURSE
    private getApproveCourseNotificationData(user: User, course: Course, status: TApproveStatus) {
        const statusStr = status == 'active' ? 'approved' : 'rejected';
        const data: Partial<Notification> = {
            sourceId: course._id.toString(),
            sourceSlug: course.basicInfo.slug,
            sourceType: 'course-approval',
            collectionName: 'courses',
            content: this.genContent([
                {
                    text: 'Your submitted course',
                },
                {
                    strong: course.basicInfo.title,
                },
                {
                    text: `has ${statusStr}.`,
                },
            ]),
            receiver: user._id as any,
        };
        return data;
    }
    async approveCourse(user: User, courseId: string, status: TApproveStatus) {
        const course = await this.courseModel.findById(courseId);
        const data = this.getApproveCourseNotificationData(user, course, status);
        return this.saveNotification(data);
    }
    // PAY
    private getNewPaidPaymentNotificationData(payment: Payment) {
        const data: Partial<Notification> = {
            sourceId: payment._id.toString(),
            sourceType: 'payment-paid',
            collectionName: 'payments',
            content: this.genContent([
                {
                    text: 'You got paid for',
                },
                {
                    strong: moment(payment.history.createdAt).format('MMM, YYYY'),
                },
            ]),
            receiver: payment.user._id as any,
        };
        return data;
    }
    async newPaidPayment(paymentId: string) {
        const payment = await this.paymentModel.findById(paymentId).populate('user');
        const data = this.getNewPaidPaymentNotificationData(payment);
        return this.saveNotification(data);
    }

    // NEW ENROLLMENT
    private getNewEnrollmentNotificationData(student: User, instructor: User, course: Course) {
        const data: Partial<Notification> = {
            sourceId: student._id.toString(),
            contextId: course._id.toString(),
            sourceType: 'new-enrollment',
            collectionName: 'users',
            content: this.genContent([
                {
                    strong: student.profile.fullName,
                },
                {
                    text: 'has enrolled',
                },
                {
                    strong: course.basicInfo.title,
                },
            ]),
            receiver: instructor._id as any,
            thumb: student.profile.avatar,
        };
        return data;
    }
    async newEnrollment(userId: string, courseId: string) {
        const student = await this.userModel.findById(userId);
        const course = await this.courseModel.findById(courseId).populate('history.createdBy');
        const instructor = course.history.createdBy;
        if (student._id.toString() != instructor._id.toString()) {
            const data = this.getNewEnrollmentNotificationData(student, instructor, course);
            return this.saveNotification(data);
        }
    }
    // HELPERS
    private async saveNotification(payload: Partial<Notification>): Promise<Notification> {
        const data = this.notificationsService.attachHistoryData(payload, 'create');
        const notification = await new this.notificationModel(data).save();
        return notification;
    }

    private genContent(
        contents: {
            text?: string;
            strong?: string;
        }[]
    ) {
        const contentStr = contents.reduce((prev, current) => {
            if (!!current.text) return `${prev} ${current.text}`;
            if (!!current.strong) return `${prev} <strong>${current.strong}</strong>`;
        }, '');
        return contentStr;
    }
}
