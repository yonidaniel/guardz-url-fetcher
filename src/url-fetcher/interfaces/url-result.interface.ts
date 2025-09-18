export interface UrlResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  depth?: number;
  linkCount?: number;
  content?: string;
  error?: string;
  timestamp: Date;
  responseTime?: number;
  contentType?: string;
}
