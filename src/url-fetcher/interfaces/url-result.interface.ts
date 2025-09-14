export interface UrlResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  content?: string;
  error?: string;
  timestamp: Date;
  responseTime?: number;
}
