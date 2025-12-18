# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A type-safe TypeScript dependency injection framework with decorator-based registration, lifecycle management (Singleton/Transient), and full type inference. Uses Koin-style property injection with `get()` function for easy testing and loose coupling. Built with reflect-metadata.

## Development Commands

- `yarn dev` - Run in development mode with hot reload using tsx
- `yarn build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `yarn start` - Run the compiled JavaScript from `dist/index.js`

## TypeScript Configuration

- **Target**: ES2022
- **Module System**: ES Modules (ESM)
- **Module Resolution**: bundler
- **Strict Mode**: Enabled
- **Experimental Decorators**: Enabled
- **Decorator Metadata**: Enabled
- **Source**: `src/`
- **Output**: `dist/`

**Note**: This is an ESM package. All imports must include `.js` extensions in the source files.

## Project Structure

```
container/              # Core DI framework
├── Container.ts        # Main container with register/resolve
├── context.ts          # Global container context and get() function
├── types.ts            # Token creation, Lifecycle enum
├── decorators.ts       # @injectable, @singleton, @transient
├── metadata.ts         # Metadata utilities
└── errors.ts           # Custom error classes
examples/
├── basic-usage.ts      # Complete usage demonstration
└── testing-pattern.ts  # Testing with mocks demonstration
index.ts                # Public API exports
```

## Key Concepts

### Tokens
- Use `createToken<T>()` to create type-safe tokens for interfaces
- Tokens carry phantom types for compile-time safety

### Decorators
- `@singleton()` - Same instance returned every time
- `@transient()` - New instance created every time
- `@injectable()` - Mark a class as injectable (optional, implied by lifecycle decorators)

### Dependency Injection
- Use `get(Token)` function to resolve dependencies within classes
- Call `setContainer(container)` once at application startup
- Optional constructor parameters enable easy testing with mocks

### Usage Pattern

**Production Code:**
```typescript
const Logger = createToken<Logger>('Logger');

@singleton()
class ConsoleLogger implements Logger {
  log(msg: string) { console.log(msg); }
}

@transient()
class UserService {
  private logger = get(Logger);

  getUser(id: number) {
    this.logger.log(`Getting user ${id}`);
  }
}

const container = new Container();
setContainer(container);  // Set global container
container.register(Logger, ConsoleLogger);
container.register(UserService, UserService);

const service = container.resolve(UserService);
```

**Testing with Mocks:**
```typescript
@transient()
class UserService {
  private logger: Logger;

  // Optional constructor params for testing
  constructor(logger?: Logger) {
    this.logger = logger ?? get(Logger);
  }
}

// In tests: pass mocks directly, no container needed!
const mockLogger = new MockLogger();
const service = new UserService(mockLogger);
```