# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Medusa v2** e-commerce platform repository with monorepo architecture using Yarn workspaces and Turbo for build orchestration. Medusa is a headless commerce framework built with Node.js, TypeScript, and PostgreSQL.

## Essential Commands

### Development
- `yarn build` - Build all packages (uses Turbo with 50% concurrency)
- `yarn lint` - Lint all JS/TS files using ESLint
- `yarn test` - Run all unit tests (uses Turbo with 50% concurrency)
- `yarn start:dev` - Start development server
- `yarn start:prod` - Start production server

### Testing
- `yarn test:chunk` - Run workspace unit tests in chunks
- `yarn test:integration:packages:fast` - Run fast integration tests for packages
- `yarn test:integration:packages:slow` - Run slow integration tests for specific modules
- `yarn test:integration:api` - Run API integration tests
- `yarn test:integration:http` - Run HTTP integration tests
- `yarn test:integration:modules` - Run modules integration tests

### Production Deployment
- `npm run security:check` - Run comprehensive security validation
- `npm run deploy:production` - Run database migrations and start production server
- `npm run generate:secrets` - Generate cryptographically secure secrets
- `npm run deploy:check` - Validate deployment readiness

### Development Tools
- `yarn medusa-oas` - Generate OpenAPI specifications
- `yarn openapi:generate` - Generate API documentation

## Architecture Overview

### Monorepo Structure
- **Root**: Yarn workspace configuration with Turbo build system
- **packages/medusa**: Core Medusa application and framework
- **packages/modules/***: Individual commerce modules (auth, cart, order, product, etc.)
- **packages/modules/providers/***: Service providers (Stripe, Redis, S3, etc.)
- **packages/core/***: Core framework libraries (types, utils, workflows, etc.)
- **packages/admin/***: Admin dashboard components and SDK
- **packages/cli/***: Command-line tools and utilities
- **integration-tests/**: Comprehensive integration test suites
- **api/**: API-specific configurations

### Key Configuration Files
- **medusa-config.js**: Main application configuration with environment-based settings
- **app.js**: Production application bootstrap using MedusaApp SDK
- **turbo.json**: Build pipeline configuration for monorepo
- **docker-compose.production.yml**: Production Docker deployment
- **Dockerfile**: Multi-stage production Docker build

### Module System Architecture
Medusa v2 uses a modular architecture where each commerce function (auth, cart, product, etc.) is implemented as a separate module. Modules can be:
- **Internal modules**: Built-in Medusa modules
- **Provider modules**: External service integrations (Redis, Stripe, S3)
- **Custom modules**: User-defined business logic

### Environment Configuration
- **Development**: Uses in-memory cache and local event bus
- **Production**: Requires Redis for caching, event bus, and workflow engine
- **Database**: PostgreSQL with SSL required in production
- **Security**: Enforces cryptographically secure JWT/Cookie secrets

## Security Configuration

### Required Environment Variables (Production)
```bash
JWT_SECRET=<64-char-hex-string>
COOKIE_SECRET=<64-char-hex-string>
DATABASE_URL=<postgres-url-with-ssl>
ADMIN_JWT_SECRET=<64-char-hex-string>
```

### Security Validation
The codebase includes `scripts/security-check.js` which validates:
- Secret strength and entropy
- Database SSL configuration
- CORS origin security
- File permissions
- Configuration file hardcoded values
- Node.js version compatibility

### CORS Configuration
- Development: Allows localhost origins
- Production: Must specify allowed origins in `CORS_ORIGIN` environment variable

## Development Workflow

### Making Changes
1. Work in appropriate package directory (`packages/medusa`, `packages/modules/*`, etc.)
2. Run `yarn lint` to ensure code style compliance
3. Run relevant tests: `yarn test` for unit tests, specific integration tests for affected modules
4. Use `yarn build` to ensure all packages compile successfully

### Testing Strategy
- **Unit Tests**: Package-level tests in each workspace
- **Integration Tests**: Multi-module interaction tests
- **API Tests**: End-to-end API functionality tests
- **Chunked Testing**: Large test suites run in parallel chunks for performance

### Module Development
When working with modules:
- Each module has its own package.json with dependencies
- Modules export services, repositories, and models
- Use dependency injection pattern with Awilix container
- Follow established patterns in existing modules

## Production Deployment

### Docker Deployment
- Multi-stage Dockerfile optimizes build and runtime
- Uses Node.js 20 Alpine for production
- Implements proper security (non-root user, health checks)
- Supports environment-based configuration

### Database Setup
- Requires PostgreSQL with SSL in production
- Run `npx medusa db:migrate` before starting server
- Database connection pooling configured for production load

### Redis Configuration (Optional but Recommended)
- Production benefits from Redis for caching, events, and workflows
- Falls back to in-memory implementations if Redis unavailable
- Configure via `REDIS_URL` environment variable

## Key Technical Decisions

### Build System
- **Turbo**: Manages monorepo build pipeline with dependency graph awareness
- **TypeScript**: All packages use TypeScript with shared configuration
- **Concurrency**: Build and test tasks use 50% CPU concurrency by default

### Database ORM
- Uses MikroORM for database operations
- Entity-based approach with repositories
- Migration system for schema evolution

### Module Resolution
- Uses Yarn workspaces for package linking
- Exports defined in package.json for clean module boundaries
- Framework modules are peer dependencies

### Security-First Approach
- Mandatory security validation before production deployment
- Environment variable validation at startup
- Secure defaults with production overrides