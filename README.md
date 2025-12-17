# TypeScript Dependency Injection Framework

A lightweight, type-safe dependency injection container for TypeScript with decorator-based registration, automatic constructor injection, and lifecycle management.

## Features

- 🔒 **Type-Safe** - Full TypeScript type inference with no `any` types
- 🎯 **Decorator-Based** - Clean syntax using `@singleton()`, `@transient()`, and `@inject()`
- 🔄 **Lifecycle Management** - Built-in singleton and transient lifecycle support
- 🛡️ **Error Handling** - Descriptive errors for missing dependencies and circular dependency detection
- 🧪 **Test-Friendly** - Easy to mock and swap implementations
- 📦 **ESM Native** - Modern ES Modules support
- 🪶 **Lightweight** - Minimal dependencies (only reflect-metadata)

## Installation

```bash
yarn add dependency-injection
# or
npm install dependency-injection
```

## Quick Start

```typescript
import 'reflect-metadata';
import { Container, createToken, singleton, transient, inject } from 'dependency-injection';

// 1. Define your interfaces and create tokens
interface Logger {
  log(message: string): void;
}
const Logger = createToken<Logger>('Logger');

// 2. Implement your classes with decorators
@singleton()
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

// 3. Use dependency injection with @inject
@transient()
class UserService {
  constructor(@inject(Logger) private logger: Logger) {}

  getUser(id: number): void {
    this.logger.log(`Getting user ${id}`);
  }
}

// 4. Setup the container
const container = new Container();
container.register(Logger, ConsoleLogger);
container.register(UserService, UserService);

// 5. Resolve and use
const userService = container.resolve(UserService);
userService.getUser(1); // [LOG] Getting user 1
```

## Core Concepts

### Tokens

Tokens are type-safe identifiers for your dependencies. Use `createToken<T>()` to create tokens that carry TypeScript's phantom types:

```typescript
interface Database {
  query(sql: string): any[];
}
const Database = createToken<Database>('Database');
```

### Lifecycle Decorators

Control the lifecycle of your dependencies:

- **`@singleton()`** - Single instance shared across all resolutions
- **`@transient()`** - New instance created on every resolution
- **`@injectable()`** - Base decorator (lifecycle determined at registration)

```typescript
@singleton()
class DatabaseConnection {
  constructor() {
    console.log('Database connected'); // Only called once
  }
}

@transient()
class RequestHandler {
  constructor() {
    console.log('Handler created'); // Called every time
  }
}
```

### Constructor Injection

Use `@inject(token)` to specify which dependencies to inject:

```typescript
@singleton()
class UserRepository {
  constructor(
    @inject(Database) private db: Database,
    @inject(Logger) private logger: Logger
  ) {
    // Fully typed constructor parameters!
  }
}
```

## API Reference

### Container

#### `register<T>(token: Token<T>, implementation: Constructor<T>): void`

Register a dependency with the container. The lifecycle is determined by the decorator on the implementation class.

```typescript
container.register(Logger, ConsoleLogger);
```

#### `resolve<T>(token: Token<T>): T`

Resolve and return an instance of the dependency. Returns a cached instance for singletons or creates a new instance for transients.

```typescript
const logger = container.resolve(Logger);
```

#### `isRegistered<T>(token: Token<T>): boolean`

Check if a token is registered in the container.

```typescript
if (container.isRegistered(Logger)) {
  // ...
}
```

#### `clear(): void`

Clear all singleton instances (useful for testing).

```typescript
container.clear();
```

#### `reset(): void`

Reset the entire container (clears all bindings and singletons).

```typescript
container.reset();
```

### Functions

#### `createToken<T>(description: string): Token<T>`

Create a type-safe token for a dependency.

```typescript
const MyService = createToken<MyService>('MyService');
```

### Decorators

#### `@inject(token: Token<T>)`

Parameter decorator to specify which token to inject for a constructor parameter.

```typescript
constructor(@inject(Logger) private logger: Logger) {}
```

#### `@singleton()`

Class decorator marking a class as a singleton (one instance for the lifetime of the container).

```typescript
@singleton()
class DatabaseConnection {}
```

#### `@transient()`

Class decorator marking a class as transient (new instance on every resolution).

```typescript
@transient()
class RequestHandler {}
```

#### `@injectable()`

Base class decorator marking a class as injectable (lifecycle determined elsewhere).

```typescript
@injectable()
class Service {}
```

## Advanced Usage

### Multiple Dependencies

```typescript
@singleton()
class UserService {
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(Database) private db: Database,
    @inject(Cache) private cache: Cache
  ) {}
}
```

### Testing with Mocks

```typescript
// Create a mock implementation
@singleton()
class MockLogger implements Logger {
  log(message: string): void {
    // Mock implementation
  }
}

// Register the mock in your test
const testContainer = new Container();
testContainer.register(Logger, MockLogger);
testContainer.register(UserService, UserService);

const service = testContainer.resolve(UserService);
// Service now uses MockLogger
```

### Error Handling

The framework provides descriptive errors:

```typescript
// Dependency not found
try {
  container.resolve(UnregisteredToken);
} catch (error) {
  // DependencyNotFoundError: Dependency not found: UnregisteredService
}

// Circular dependency detected
try {
  // ServiceA depends on ServiceB, ServiceB depends on ServiceA
  container.resolve(ServiceA);
} catch (error) {
  // CircularDependencyError: Circular dependency detected: ServiceA -> ServiceB -> ServiceA
}
```

## Requirements

- TypeScript 4.0 or higher
- Enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

- Import `reflect-metadata` at the entry point of your application:

```typescript
import 'reflect-metadata';
```

## Example

See the [complete example](./src/examples/basic-usage.ts) for a full demonstration of all features.

## License

MIT © Parsa Nasirimehr

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
