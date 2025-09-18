import { Test, TestingModule } from '@nestjs/testing';
import { UrlFetcherService } from './core/url-fetcher.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UrlFetcherService', () => {
  let service: UrlFetcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlFetcherService],
    }).compile();

    service = module.get<UrlFetcherService>(UrlFetcherService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchUrls', () => {
    it('should successfully fetch URLs', async () => {
      const mockResponse = {
        data: '<html><body>Test content</body></html>',
        status: 200,
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const urls = ['https://example.com', 'https://test.com'];
      const results = await service.fetchUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[0].content).toBe(mockResponse.data);
      expect(results[0].responseTime).toBeDefined();
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      const urls = ['https://invalid-url.com'];
      const results = await service.fetchUrls(urls);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('error');
      expect(results[0].error).toBe('Network error');
    });

    it('should handle mixed success and error results', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: 'Success content', status: 200 })
        .mockRejectedValueOnce(new Error('Failed to fetch'));

      const urls = ['https://success.com', 'https://error.com'];
      const results = await service.fetchUrls(urls);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('error');
    });
  });

  describe('getAllResults', () => {
    it('should return all stored results', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Test', status: 200 });
      
      await service.fetchUrls(['https://test1.com', 'https://test2.com']);
      const results = service.getAllResults();

      expect(results).toHaveLength(2);
    });
  });

  describe('getResultsByStatus', () => {
    it('should filter results by status', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: 'Success', status: 200 })
        .mockRejectedValueOnce(new Error('Error'));

      await service.fetchUrls(['https://success.com', 'https://error.com']);
      
      const successResults = service.getResultsByStatus('success');
      const errorResults = service.getResultsByStatus('error');

      expect(successResults).toHaveLength(1);
      expect(errorResults).toHaveLength(1);
    });
  });

  describe('clearResults', () => {
    it('should clear all stored results', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Test', status: 200 });
      
      await service.fetchUrls(['https://test.com']);
      expect(service.getAllResults()).toHaveLength(1);
      
      service.clearResults();
      expect(service.getAllResults()).toHaveLength(0);
    });
  });
});
