// Debug configuration for Guardz URL Fetcher Service
module.exports = {
  // Enable debug logging
  debug: true,
  
  // Log levels
  logLevel: 'debug',
  
  // Debug ports
  debugPort: 9229,
  
  // Service ports
  servicePort: 3001,
  
  // Debug settings
  settings: {
    // Enable source maps
    sourceMaps: true,
    
    // Enable breakpoints
    breakOnStart: false,
    
    // Debug timeout
    timeout: 30000,
    
    // Enable verbose logging
    verbose: true
  },
  
  // Debug endpoints
  endpoints: {
    health: '/api/urls/status',
    fetch: '/api/urls/fetch',
    results: '/api/urls'
  },
  
  // Test URLs for debugging
  testUrls: [
    'https://httpbin.org/json',
    'https://httpbin.org/xml',
    'https://httpbin.org/html',
    'https://api.github.com/users/octocat',
    'https://jsonplaceholder.typicode.com/posts/1'
  ]
};
