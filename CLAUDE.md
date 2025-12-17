# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A type-safe TypeScript dependency injection framework with decorator-based registration, lifecycle management (Singleton/Transient), and full type inference. Built with reflect-metadata for automatic constructor dependency resolution.

## Development Commands

- `yarn dev` - Run in development mode with hot reload using tsx
- `yarn build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `yarn start` - Run the compiled JavaScript from `dist/index.js`

## TypeScript Configuration

- **Target**: ES2022
- **Module System**: CommonJS
- **Strict Mode**: Enabled
- **Experimental Decorators**: Enabled
- **Decorator Metadata**: Enabled
- **Source**: `src/`
- **Output**: `dist/`

## Project Structure

```
src/
├── container/          # Core DI framework
│   ├── Container.ts    # Main container with register/resolve
│   ├── types.ts        # Token creation, Lifecycle enum
│   ├── decorators.ts   # @injectable, @singleton, @transient, @inject
│   ├── metadata.ts     # Metadata utilities
│   └── errors.ts       # Custom error classes
├── examples/
│   └── basic-usage.ts  # Complete usage demonstration
└── index.ts            # Public API exports
```

## Key Concepts

### Tokens
- Use `createToken<T>()` to create type-safe tokens for interfaces
- Tokens carry phantom types for compile-time safety

### Decorators
- `@singleton()` - Same instance returned every time
- `@transient()` - New instance created every time
- `@inject(token)` - Specify which token to inject for each parameter

### Usage Pattern
```typescript
const Logger = createToken<Logger>('Logger');

@singleton()
class ConsoleLogger implements Logger {
  log(msg: string) { console.log(msg); }
}

@transient()
class UserService {
  constructor(@inject(Logger) private logger: Logger) {}
}

const container = new Container();
container.register(Logger, ConsoleLogger);
container.register(UserService, UserService);

const service = container.resolve(UserService);
```