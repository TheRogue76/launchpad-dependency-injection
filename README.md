# TypeScript Dependency Injection Framework

A lightweight, type-safe dependency injection container for TypeScript with Koin-style property injection, decorator-based registration, and lifecycle management. Perfect for testing with easy mock injection!

## Features

- 🔒 **Type-Safe** - Full TypeScript type inference with no `any` types
- 🎯 **Koin-Style Injection** - Clean property injection using `get()` function
- 🧪 **Test-Friendly** - Trivial to test with mock dependencies via optional constructor params
- 🔄 **Lifecycle Management** - Built-in singleton and transient lifecycle support
- 🛡️ **Error Handling** - Descriptive errors for missing dependencies and circular dependency detection
- 📦 **ESM Native** - Modern ES Modules support
- 🪶 **Lightweight** - Minimal dependencies (only reflect-metadata)

## Installation

```bash
yarn add launchpad-dependency-injection
# or
npm install launchpad-dependency-injection
```

## Quick Start

```typescript
import 'reflect-metadata';
import { Container, createToken, singleton, transient, get, setContainer } from 'dependency-injection';

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

// 3. Use property injection with get()
@transient()
class UserService {
  private logger = get(Logger);

  getUser(id: number): void {
    this.logger.log(`Getting user ${id}`);
  }
}

// 4. Setup the container
const container = new Container();
setContainer(container);  // Set as global container
container.register(Logger, ConsoleLogger);
container.register(UserService, UserService);

// 5. Resolve and use
const userService = container.resolve(UserService);
userService.getUser(1); // [LOG] Getting user 1
```

## Why Koin-Style? Testing Made Trivial!

The Koin-style property injection pattern makes testing incredibly easy. Simply use optional constructor parameters:

```typescript
@transient()
class UserService {
  private logger: Logger;

  // Optional constructor params for testing
  constructor(logger?: Logger) {
    this.logger = logger ?? get(Logger);
  }
}

// Production: Container handles everything
const container = new Container();
setContainer(container);
container.register(Logger, ConsoleLogger);
const service = container.resolve(UserService);

// Testing: Just pass mocks - NO CONTAINER NEEDED!
const mockLogger = new MockLogger();
const service = new UserService(mockLogger);  // Easy!
```

No more coupling your tests to the DI framework. No more complex test setup. Just plain TypeScript constructors!

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

### Property Injection

Use the `get()` function to resolve dependencies within your classes:

```typescript
@singleton()
class UserRepository {
  private db = get(Database);
  private logger = get(Logger);

  save(user: User): void {
    this.logger.log('Saving user...');
    this.db.query('INSERT INTO users ...');
  }
}
```

For test-friendly classes, use optional constructor parameters:

```typescript
@singleton()
class UserRepository {
  private db: Database;
  private logger: Logger;

  // Optional params enable easy testing!
  constructor(db?: Database, logger?: Logger) {
    this.db = db ?? get(Database);
    this.logger = logger ?? get(Logger);
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

#### `setContainer(container: Container): void`

Set the global active container. Call this once at application startup.

```typescript
const container = new Container();
setContainer(container);
```

#### `getContainer(): Container`

Get the current active container. Throws `NoActiveContainerError` if no container has been set.

```typescript
const container = getContainer();
```

#### `get<T>(token: Token<T>): T`

Resolve a dependency from the active container. This is the primary way to inject dependencies.

```typescript
class UserService {
  private logger = get(Logger);
}
```

### Decorators

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
  private logger = get(Logger);
  private db = get(Database);
  private cache = get(Cache);

  // All dependencies resolved automatically!
}
```

### Testing with Mocks

The optional constructor parameter pattern makes testing incredibly easy:

```typescript
// Your service with test-friendly constructor
@transient()
class UserService {
  private logger: Logger;
  private db: Database;

  constructor(logger?: Logger, db?: Database) {
    this.logger = logger ?? get(Logger);
    this.db = db ?? get(Database);
  }

  getUser(id: number): User {
    this.logger.log(`Getting user ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// In your tests: just pass mocks, NO CONTAINER NEEDED!
class MockLogger implements Logger {
  logs: string[] = [];
  log(msg: string) { this.logs.push(msg); }
}

const mockLogger = new MockLogger();
const mockDb = new MockDatabase();
const service = new UserService(mockLogger, mockDb);

// Test the service
service.getUser(123);
assert(mockLogger.logs.includes('Getting user 123'));
```

### Alternative: Testing with Container

You can also use a test container with mock implementations:

```typescript
@singleton()
class MockLogger implements Logger {
  log(message: string): void {
    // Mock implementation
  }
}

const testContainer = new Container();
setContainer(testContainer);
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

## Examples

- **[Basic Usage](examples/basic-usage.ts)** - Complete demonstration of Koin-style DI with lifecycle management
- **[Testing Patterns](examples/testing-pattern.ts)** - Shows how to test with mocks (production, testing, and hybrid approaches)

## License

MIT © Parsa Nasirimehr

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
