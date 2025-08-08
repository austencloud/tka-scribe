# The Kinetic Constructor - Web App Root

This is the root directory for all TKA web applications. You can run any of the web apps from this directory using the npm scripts.

## Quick Start

### Run the Legacy Web App (Default)
```bash
npm run dev
# or specifically
npm run dev:legacy
```

### Run the Modern Web App
```bash
npm run dev:modern
```

### Clean Start (clears cache)
```bash
npm run dev:legacy-clean
```

## Available Applications

- **Legacy Web** (`legacy_web/`) - The original Svelte-based web application
- **Modern Web** (`modern_web/`) - The new modern web application
- **Legacy Desktop** (`legacy_desktop/`) - Python/PyQt desktop application
- **Modern Desktop** (`modern_desktop/`) - Modern Python desktop application
- **Shared** (`shared/`) - Shared code and services

## Available Scripts

### Development
- `npm run dev` - Start legacy web app (default)
- `npm run dev:legacy` - Start legacy web app
- `npm run dev:modern` - Start modern web app
- `npm run dev:legacy-clean` - Start legacy web app with clean cache

### Building
- `npm run build` - Build all web apps
- `npm run build:legacy` - Build legacy web app
- `npm run build:modern` - Build modern web app

### Testing
- `npm run test` - Run tests for all web apps
- `npm run test:legacy` - Run legacy web app tests
- `npm run test:modern` - Run modern web app tests

### Maintenance
- `npm run install:all` - Install dependencies for all web apps
- `npm run clean` - Clean all web apps
- `npm run lint` - Lint all web apps
- `npm run format` - Format all web apps

### Desktop Apps
- `npm run desktop:legacy` - Run legacy desktop app (requires Python)
- `npm run desktop:modern` - Run modern desktop app (requires Python)

### Status
- `npm run status` - Show status and available URLs

## URLs

When running:
- **Legacy Web**: http://localhost:5173
- **Modern Web**: http://localhost:5174

## Setup

1. Install dependencies for all apps:
   ```bash
   npm run install:all
   ```

2. Start development:
   ```bash
   npm run dev
   ```

## VS Code Debugging

Use F5 to debug any of the web applications. The launch configurations are available in `.vscode/launch.json`.

## Directory Structure

```
src/web_app/
├── legacy_web/          # Legacy Svelte web app
├── modern_web/          # Modern web app
├── legacy_desktop/      # Legacy Python desktop app
├── modern_desktop/      # Modern Python desktop app
├── shared/              # Shared code and services
├── static/              # Static assets
└── package.json         # Root package manager
```
