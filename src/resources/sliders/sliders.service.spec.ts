import { Test, TestingModule } from '@nestjs/testing';
import { SlidersService } from './sliders.service';

describe('SlidersService', () => {
  let service: SlidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlidersService],
    }).compile();

    service = module.get<SlidersService>(SlidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
