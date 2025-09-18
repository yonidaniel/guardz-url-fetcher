import { Test, TestingModule } from '@nestjs/testing';
import { UrlFetcherController } from './core/url-fetcher.controller';
import { UrlFetcherService } from './core/url-fetcher.service';

describe('UrlFetcherController', () => {
  let controller: UrlFetcherController;
  let service: UrlFetcherService;

  const mockUrlFetcherService = {
    fetchUrls: jest.fn(),
    getAllResults: jest.fn(),
    getResultsByStatus: jest.fn(),
    clearResults: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlFetcherController],
      providers: [
        {
          provide: UrlFetcherService,
          useValue: mockUrlFetcherService,
        },
      ],
    }).compile();

    controller = module.get<UrlFetcherController>(UrlFetcherController);
    service = module.get<UrlFetcherService>(UrlFetcherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchUrls', () => {
    it('should call service.fetchUrls and return results', async () => {
      const fetchUrlsDto = { urls: ['https://example.com'] };
      const mockResults = [
        {
          url: 'https://example.com',
          status: 'success',
          content: 'Test content',
          timestamp: new Date(),
        },
      ];

      mockUrlFetcherService.fetchUrls.mockResolvedValue(mockResults);

      const result = await controller.fetchUrls(fetchUrlsDto);

      expect(service.fetchUrls).toHaveBeenCalledWith(fetchUrlsDto.urls);
      expect(result).toEqual({
        message: 'Processing 1 URLs',
        results: mockResults,
      });
    });
  });

  describe('getAllResults', () => {
    it('should return all results with summary', async () => {
      const mockResults = [
        { url: 'https://test1.com', status: 'success', timestamp: new Date() },
        { url: 'https://test2.com', status: 'error', timestamp: new Date() },
      ];

      mockUrlFetcherService.getAllResults.mockReturnValue(mockResults);

      const result = await controller.getAllResults();

      expect(service.getAllResults).toHaveBeenCalled();
      expect(result).toEqual({
        results: mockResults,
        summary: {
          total: 2,
          pending: 0,
          success: 1,
          error: 1,
        },
      });
    });
  });

  describe('getStatus', () => {
    it('should return status with summary', async () => {
      const mockResults = [
        { url: 'https://test1.com', status: 'success', timestamp: new Date() },
      ];

      mockUrlFetcherService.getAllResults.mockReturnValue(mockResults);

      const result = await controller.getStatus();

      expect(result.status).toBe('running');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.summary).toEqual({
        total: 1,
        pending: 0,
        success: 1,
        error: 0,
      });
    });
  });
});
