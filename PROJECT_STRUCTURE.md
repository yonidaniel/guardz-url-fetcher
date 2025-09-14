# Project Structure Overview

## 📁 Directory Organization

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
├── node_modules/                   # Dependencies (generated)
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Dependency lock file
├── tsconfig.json                   # TypeScript configuration
├── nest-cli.json                   # NestJS CLI configuration
├── .gitignore                      # Git ignore rules
├── README.md                       # Main documentation
└── PROJECT_STRUCTURE.md            # This file
```

## 🗂️ File Categories

### Core Application Files
- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root module
- `src/url-fetcher/` - Main service implementation

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS CLI configuration
- `.gitignore` - Git ignore rules

### Testing
- `test/` - End-to-end tests
- `src/**/*.spec.ts` - Unit tests

### Scripts & Deployment
- `scripts/deploy.sh` - GCP deployment script

### Documentation
- `README.md` - Main documentation
- `PROJECT_STRUCTURE.md` - This file

### Generated Files (excluded from git)
- `dist/` - Compiled JavaScript
- `node_modules/` - Dependencies
- `coverage/` - Test coverage reports

## 🚫 Excluded Files

The following files are excluded from the repository:
- SSH keys (`id_ed25519`, `*.pem`, `*.key`)
- Environment files (`.env*`)
- Build artifacts (`dist/`, `node_modules/`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Test coverage (`coverage/`)
- Log files (`*.log`)

## 📋 Quick Commands

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build for production
npm run build

# Run tests
npm test

# Deploy to GCP
./scripts/deploy.sh
```
