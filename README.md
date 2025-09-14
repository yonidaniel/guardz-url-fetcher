# Guardz URL Fetcher Service

A NestJS-based microservice that fetches content from HTTP URLs and provides a REST API to submit URLs and view the results.

## 🚀 Features

- **URL Fetching**: Submit multiple URLs via POST request and fetch their content
- **Result Storage**: In-memory storage of fetch results with status tracking
- **REST API**: Clean REST endpoints for URL submission and result retrieval
- **Error Handling**: Comprehensive error handling for failed requests
- **Response Time Tracking**: Measures and stores response times for each URL
- **Status Monitoring**: Track pending, successful, and failed requests
- **CORS Enabled**: Cross-origin requests supported
- **Comprehensive Testing**: Unit tests, integration tests, and e2e tests

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

## 📡 API Endpoints

### 1. Submit URLs for Fetching
**POST** `/api/urls/fetch`

Submit URLs to be fetched and processed.

**Request Body:**
```json
{
  "urls": [
    "https://httpbin.org/json",
    "https://httpbin.org/xml",
    "https://example.com"
  ]
}
```

**Response:**
```json
{
  "message": "Processing 3 URLs",
  "results": [
    {
      "url": "https://httpbin.org/json",
      "status": "success",
      "content": "{...}",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "responseTime": 150
    }
  ]
}
```

### 2. Get All Results
**GET** `/api/urls`

Retrieve all URL fetch results with summary statistics.

**Response:**
```json
{
  "results": [...],
  "summary": {
    "total": 10,
    "pending": 2,
    "success": 7,
    "error": 1
  }
}
```

### 3. Get Service Status
**GET** `/api/urls/status`

Get the current status of the service and summary statistics.

**Response:**
```json
{
  "status": "running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "summary": {
    "total": 10,
    "pending": 2,
    "success": 7,
    "error": 1
  }
}
```

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

1. **Submit URLs for fetching:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"urls": ["https://httpbin.org/json", "https://httpbin.org/xml"]}' \
     http://localhost:8080/api/urls/fetch
   ```

2. **Get all results:**
   ```bash
   curl http://localhost:8080/api/urls
   ```

3. **Check service status:**
   ```bash
   curl http://localhost:8080/api/urls/status
   ```

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
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   └── fetch-urls.dto.ts
│   │   ├── interfaces/               # TypeScript interfaces
│   │   │   └── url-result.interface.ts
│   │   ├── url-fetcher.controller.ts # REST API controller
│   │   ├── url-fetcher.service.ts    # Business logic service
│   │   ├── url-fetcher.module.ts     # NestJS module
│   │   ├── url-fetcher.controller.spec.ts # Controller tests
│   │   └── url-fetcher.service.spec.ts   # Service tests
│   ├── app.module.ts                 # Main application module
│   └── main.ts                      # Application entry point
├── test/                            # End-to-end tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── scripts/                         # Deployment and utility scripts
│   └── deploy.sh                    # GCP deployment script
├── dist/                           # Compiled JavaScript (generated)
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── nest-cli.json                   # NestJS CLI configuration
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)

### Timeout Settings

- URL fetch timeout: 10 seconds
- User-Agent: `Guardz-URL-Fetcher/1.0`

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
   
   # Or manually deploy:
   # Copy files to server
   scp -i your-key -r . candidate@your-server-ip:/home/candidate/app
   
   # SSH to server
   ssh -i your-key candidate@your-server-ip
   
   # Install dependencies and start
   cd /home/candidate/app
   npm install
   npm run start:prod
   ```

3. **Access the service:**
   - `http://your-server-ip:8080/api`

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

### Debug Helper Script

```bash
# Interactive debugging menu
./scripts/debug.sh
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
# Check logs
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
- URL fetch start/completion messages
- Response times for each request
- Error messages for failed requests
- Service startup and shutdown events

## 🛡️ Security Features

- **CORS enabled**: Cross-origin requests supported
- **Input validation**: URL validation and sanitization
- **Error handling**: Secure error messages without sensitive data
- **Timeout protection**: Prevents hanging requests

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
