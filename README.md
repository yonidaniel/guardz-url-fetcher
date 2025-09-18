# Guardz URL Fetcher Service

A NestJS-based microservice that fetches content from HTTP URLs and provides a REST API to submit URLs and view the results.

## 🚀 Features

- **Parallel URL Fetching**: Submit multiple URLs via POST request and fetch their content concurrently
- **Intelligent Caching**: In-memory cache with TTL and size limits to avoid duplicate requests
- **Rate Limiting**: Per-host concurrency and RPS controls to prevent overwhelming servers
- **Admission Control**: Smart request queuing and throttling to manage server load
- **Link Discovery**: Automatic extraction and following of same-domain links with configurable depth
- **Progress Tracking**: Real-time status updates and comprehensive result metadata
- **REST API**: Clean REST endpoints for URL submission, result retrieval, and configuration
- **Error Handling**: Comprehensive error handling with retry logic and detailed error reporting
- **Response Time Tracking**: Measures and stores response times for each URL
- **Status Monitoring**: Track pending, successful, and failed requests
- **CORS Enabled**: Cross-origin requests supported
- **Comprehensive Testing**: Unit tests, integration tests, and e2e tests
- **API Documentation**: Swagger/OpenAPI docs available at `/api/docs`

## 📋 Requirements

- Node.js (v18 or higher)
- npm or yarn
- TypeScript

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd guardz-url-fetcher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run start:prod
```

### Build and Run
```bash
npm run build
npm run start
```

The service will be available at:
- **Local**: `http://localhost:8080`
- **API Base**: `http://localhost:8080/api`
- **API Documentation**: `http://localhost:8080/api/docs`
- **Production**: `http://34.135.82.223:8080/api`

## 📡 API Endpoints

### Root Information
**GET** `/api`
Returns service information and available endpoints.

**Response:**
```json
{
  "message": "Guardz URL Fetcher Service",
  "docs": "/api/docs",
  "endpoints": {
    "status": "/api/urls/status",
    "results": "/api/urls",
    "submit": "/api/urls/fetch",
    "config": "/api/config"
  }
}
```

### 1. Service Status
**GET** `/api/urls/status`

Get the current status of the service and runtime statistics.

**Response:**
```json
{
  "status": "running",
  "timestamp": "2025-09-18T17:08:55.567Z",
  "summary": {
    "total": 0,
    "pending": 0,
    "success": 0,
    "error": 0
  },
  "depthCounts": {}
}
```

### 2. Submit URLs for Fetching
**POST** `/api/urls/fetch`

Submit URLs to be fetched and processed with parallel execution and link discovery.

**Request Body:**
```json
{
  "urls": [
    "https://httpbin.org/json",
    "https://httpbin.org/xml",
    "https://api.github.com/users/octocat"
  ]
}
```

**Response:**
```json
{
  "message": "Processing 1 URLs with depth 0",
  "limits": {
    "maxDepth": 3,
    "maxPagesPerDepth": 5,
    "maxUrlsPerRequest": 5
  },
  "pagesCrawled": 1,
  "depthCounts": {
    "0": 1
  },
  "results": [
    {
      "url": "https://httpbin.org/json",
      "status": "success",
      "timestamp": "2025-09-18T17:10:09.374Z",
      "responseTime": 438,
      "contentType": "application/json",
      "content": {...},
      "depth": 0
    }
  ],
  "totalUniqueLinksFound": 0,
  "totalLinksVisited": 1
}
```

### 3. Get All Results
**GET** `/api/urls`

Retrieve all processed results with comprehensive metadata.

**Response:**
```json
{
  "results": [
    {
      "url": "https://httpbin.org/json",
      "status": "success",
      "timestamp": "2025-09-18T17:10:09.374Z",
      "responseTime": 438,
      "contentType": "application/json",
      "content": {...},
      "depth": 0
    }
  ],
  "summary": {
    "total": 1,
    "pending": 0,
    "success": 1,
    "error": 0
  }
}
```

### 4. View Configuration
**GET** `/api/config`

Get current service configuration including concurrency, rate limits, and cache settings.

**Response:**
```json
{
  "crawl": {
    "maxDepth": 2,
    "maxPagesPerDepth": 10,
    "maxUrlsPerRequest": 5,
    "jobConcurrency": 5,
    "perDepthBatchSize": 3
  },
  "concurrency": {
    "maxConcurrency": 10
  },
  "perHost": {
    "perHostConcurrency": 3,
    "perHostRps": 2,
    "perHostBurst": 5
  },
  "cache": {
    "ttlMs": 600000,
    "maxItems": 10000
  }
}
```

### 5. API Documentation
**GET** `/api/docs`

Interactive Swagger/OpenAPI documentation for all endpoints.

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run End-to-End Tests
```bash
npm run test:e2e
```

## 📝 Example Usage

### Using curl

1. **Check service status:**
   ```bash
   curl http://localhost:8080/api/urls/status
   ```

2. **Submit URLs for fetching:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"urls": ["https://httpbin.org/json", "https://httpbin.org/xml"]}' \
     http://localhost:8080/api/urls/fetch
   ```

3. **Get all results:**
   ```bash
   curl http://localhost:8080/api/urls
   ```

4. **View configuration:**
   ```bash
   curl http://localhost:8080/api/config
   ```

5. **Access API documentation:**
   Open `http://localhost:8080/api/docs` in your browser

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

// Submit URLs
const response = await axios.post('http://localhost:8080/api/urls/fetch', {
  urls: ['https://httpbin.org/json', 'https://example.com']
});

console.log(response.data);

// Get results
const results = await axios.get('http://localhost:8080/api/urls');
console.log(results.data);
```

## 🏗️ Project Structure

```
guardz-url-fetcher/
├── src/                              # Source code
│   ├── url-fetcher/                  # Main service module
│   │   ├── core/                     # Core business logic
│   │   │   ├── crawl-config.ts       # Centralized configuration
│   │   │   ├── link-scheduling.policy.ts # Link discovery policy
│   │   │   ├── runtime.ts            # Runtime state management
│   │   │   ├── url-fetcher.controller.ts # REST API controller
│   │   │   └── url-fetcher.service.ts # Main business logic
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   └── fetch-urls.dto.ts
│   │   ├── interfaces/               # TypeScript interfaces
│   │   │   └── url-result.interface.ts
│   │   ├── services/                 # Supporting services
│   │   │   ├── admission-control.service.ts # Request queuing
│   │   │   ├── cache.service.ts      # In-memory caching
│   │   │   ├── concurrency.service.ts # Concurrency management
│   │   │   ├── host-limiter.service.ts # Per-host rate limiting
│   │   │   ├── http-client.service.ts # HTTP client wrapper
│   │   │   └── link-extractor.service.ts # Link extraction
│   │   ├── url-fetcher.module.ts     # NestJS module
│   │   ├── url-fetcher.controller.spec.ts # Controller tests
│   │   └── url-fetcher.service.spec.ts # Service tests
│   ├── app.controller.ts             # Root API controller
│   ├── app.module.ts                 # Main application module
│   └── main.ts                      # Application entry point
├── test/                            # End-to-end tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── scripts/                         # Deployment and utility scripts
│   ├── deploy.sh                    # GCP deployment script
│   ├── clean-and-deploy.sh          # Clean deployment script
│   ├── check-logs.sh                # Remote log checking
│   └── view-logs.sh                 # Remote log viewing
├── dist/                           # Compiled JavaScript (generated)
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── nest-cli.json                   # NestJS CLI configuration
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## 🔧 Configuration

The service supports extensive configuration via environment variables. All settings have sensible defaults and can be viewed via `GET /api/config`.

### Core Settings
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)

### Crawl Configuration
- `CRAWL_MAX_DEPTH`: How many link-hops to follow from each input URL (0 = only inputs)
- `CRAWL_MAX_PAGES_PER_DEPTH`: Per page cap for links queued to the next depth
- `CRAWL_MAX_URLS_PER_REQUEST`: Max root URLs accepted per API call
- `CRAWL_JOB_CONCURRENCY`: In-flight page fetches per crawl job
- `CRAWL_PER_DEPTH_BATCH_SIZE`: Concurrent URLs processed within a depth layer

### Admission Control
- `MAX_ACTIVE_JOBS`: Crawl jobs processed simultaneously
- `MAX_QUEUED_JOBS`: Queue size before returning 429 (Too Many Requests)

### Concurrency Management
- `MAX_CONCURRENCY`: Global cap on in-flight HTTP requests across the server

### Per-Host Rate Limiting
- `PER_HOST_CONCURRENCY`: Max simultaneous requests to any single host
- `PER_HOST_RPS`: Sustained requests-per-second limit to any single host
- `PER_HOST_BURST`: Short-term burst allowance per host (token bucket capacity)

### HTTP Client Settings
- `HTTP_MAX_ATTEMPTS`: Maximum retry attempts for HTTP requests
- `HTTP_BASE_DELAY_MS`: Initial backoff between retries (doubles with each attempt)
- Per-request timeout: 10 seconds (fixed)
- User-Agent: `Guardz-URL-Fetcher/1.0`

### Cache Configuration
- `CACHE_TTL_MS`: How long cached fetch results are kept before expiring (default: 600000ms = 10 minutes)
- `CACHE_MAX_ITEMS`: Maximum number of cached URL entries held in memory (default: 10000)

### View Current Configuration
```bash
curl http://localhost:8080/api/config
```

## 🚀 Deployment

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
CMD ["node", "dist/main"]
```

### Google Cloud Platform

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to GCP Compute Engine:**
   ```bash
   # Place your SSH private key in the project root as 'id_ed25519'
   # Then run the deployment script
   ./scripts/deploy.sh
   
   # Or clean deployment (stops existing service first)
   ./scripts/clean-and-deploy.sh
   ```

3. **Access the service:**
   - **Production**: `http://34.135.82.223:8080/api`
   - **API Documentation**: `http://34.135.82.223:8080/api/docs`
   - **Status**: `http://34.135.82.223:8080/api/urls/status`

4. **Monitor the service:**
   ```bash
   # Check logs on the server
   ./scripts/check-logs.sh
   
   # View logs in real-time
   ./scripts/view-logs.sh 50 follow
   ```

## 📊 Monitoring

The service provides built-in monitoring through the status endpoint:

- **Total requests**: Number of URLs processed
- **Success rate**: Percentage of successful fetches
- **Error tracking**: Failed requests with error messages
- **Response times**: Performance metrics for each request

## 🐛 Debugging

The application includes comprehensive debugging tools:

### VS Code Debugging

1. Open the project in VS Code
2. Set breakpoints by clicking in the left margin
3. Press F5 or go to Run > Start Debugging
4. Select "Debug NestJS App"

### Command Line Debugging

```bash
# Start with debugging enabled
npm run debug

# Start with breakpoints (waits for debugger)
npm run debug:break

# Debug tests
npm run test:debug
```

### Chrome DevTools

1. Start debug mode: `npm run debug`
2. Open Chrome and go to `chrome://inspect`
3. Click "Open dedicated DevTools for Node"

### Available Scripts

```bash
# Deploy to production
./scripts/deploy.sh

# Clean deployment (stops existing service first)
./scripts/clean-and-deploy.sh

# Check remote logs
./scripts/check-logs.sh

# View remote logs in real-time
./scripts/view-logs.sh [lines] [follow]
```

### Debug Features

- ✅ **VS Code Integration** - Full debugging support
- ✅ **Breakpoint Support** - Set breakpoints anywhere
- ✅ **Variable Inspection** - View and modify variables
- ✅ **Step-through Debugging** - Line-by-line execution
- ✅ **Enhanced Logging** - Detailed debug logs
- ✅ **Real-time Monitoring** - Watch logs as you debug

## 📋 Logging

### Application Logs
The service logs all activities to `app.log` on the server:

```bash
# Check logs and system status
./scripts/check-logs.sh

# View last 50 lines
./scripts/view-logs.sh

# View last 100 lines
./scripts/view-logs.sh 100

# Follow logs in real-time
./scripts/view-logs.sh 50 follow
```

### Log Locations
- **Application logs**: `/home/candidate/app/app.log`
- **NPM logs**: `/home/candidate/app/npm-debug.log`
- **System logs**: `/var/log/syslog` (requires sudo)

### Log Content
The application logs include:
- Service startup with configuration summary
- URL fetch start/completion messages with response times
- Cache hits and misses
- Error messages for failed requests with retry attempts
- Concurrency and rate limiting events
- Link discovery and depth processing
- Service health and resource usage

## 🛡️ Security Features

- **CORS enabled**: Cross-origin requests supported
- **Input validation**: URL validation and sanitization with DTO validation
- **Rate limiting**: Per-host concurrency and RPS controls to prevent abuse
- **Admission control**: Request queuing and throttling to manage server load
- **Error handling**: Secure error messages without sensitive data
- **Timeout protection**: Prevents hanging requests (10-second timeout)
- **Host restrictions**: Configurable domain allowlists
- **Retry logic**: Exponential backoff for transient failures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For questions or issues, please contact: candidate@guardz.com

---

**Built with ❤️ using NestJS**
