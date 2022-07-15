import { Test, TestingModule } from '@nestjs/testing';
import { UserCourseController } from './user-course.controller';
import { UserCourseService } from './user-course.service';

describe('UserCourseController', () => {
  let controller: UserCourseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCourseController],
      providers: [UserCourseService],
    }).compile();

    controller = module.get<UserCourseController>(UserCourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
