import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // With global prefix 'api', this handles GET /api
  @Get()
  getApiRoot() {
    return {
      message: 'Guardz URL Fetcher Service',
      docs: '/api/docs',
      endpoints: {
        status: '/api/urls/status',
        results: '/api/urls',
        submit: '/api/urls/fetch',
      },
    };
  }
}


