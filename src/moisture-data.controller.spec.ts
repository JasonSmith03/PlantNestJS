import { Test, TestingModule } from '@nestjs/testing';
import { MoistureDataController } from './moisture-data.controller';
import { MoistureDataService } from './moisture-data.service';

describe('MoistureDataController', () => {
  let controller: MoistureDataController;
  let service: MoistureDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoistureDataController],
      providers: [
        {
          provide: MoistureDataService,
          useValue: {
            saveMoistureData: jest.fn(),
            getAllMoistureData: jest.fn(() => [
              {
                name: 'Plant A',
                moisture_pct: 45.5,
                status_msg: 'Moderate moisture',
              },
            ]),
          },
        },
      ],
    }).compile();

    controller = module.get<MoistureDataController>(MoistureDataController);
    service = module.get<MoistureDataService>(MoistureDataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllMoistureData', () => {
    it('should return an array of moisture data', async () => {
      const result = await controller.getAllMoistureData();
      expect(result).toEqual([
        {
          name: 'Plant A',
          moisture_pct: 45.5,
          status_msg: 'Moderate moisture',
        },
      ]);
    });
  });

  describe('saveMoistureData', () => {
    it('should call saveMoistureData with the correct data', async () => {
      const body = {
        name: 'Plant A',
        moisture_pct: 50.0,
        status_msg: 'Dry',
      };

      const saveMoistureDataSpy = jest.spyOn(service, 'saveMoistureData');
      await controller.saveMoistureData(body);

      expect(saveMoistureDataSpy).toHaveBeenCalledWith(body);
    });
  });
});
