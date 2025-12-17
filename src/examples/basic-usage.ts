import 'reflect-metadata';
import { Container, createToken, injectable, singleton, transient, inject } from '../index';

// ============================================
// 1. Define interfaces and create tokens
// ============================================

interface Logger {
  log(message: string): void;
  error(message: string): void;
}

interface Database {
  connect(): void;
  query(sql: string): any[];
}

interface UserService {
  getUser(id: number): void;
  createUser(name: string): void;
}

// Create type-safe tokens
const Logger = createToken<Logger>('Logger');
const Database = createToken<Database>('Database');
const UserService = createToken<UserService>('UserService');

// ============================================
// 2. Implement classes with decorators
// ============================================

@singleton()
class ConsoleLogger implements Logger {
  constructor() {
    console.log('[ConsoleLogger] Instance created');
  }

  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

@singleton()
class PostgresDatabase implements Database {
  // Constructor parameters are fully typed with @inject!
  constructor(@inject(Logger) private logger: Logger) {
    this.logger.log('PostgresDatabase instance created');
  }

  connect(): void {
    this.logger.log('Connecting to PostgreSQL...');
  }

  query(sql: string): any[] {
    this.logger.log(`Executing query: ${sql}`);
    return [];
  }
}

@transient()
class UserServiceImpl implements UserService {
  // Multiple dependencies, all fully typed with @inject!
  constructor(
    @inject(Logger) private logger: Logger,
    @inject(Database) private database: Database
  ) {
    this.logger.log('UserService instance created');
  }

  getUser(id: number): void {
    this.logger.log(`Getting user with ID: ${id}`);
    this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }

  createUser(name: string): void {
    this.logger.log(`Creating user: ${name}`);
    this.database.query(`INSERT INTO users (name) VALUES ('${name}')`);
  }
}

// ============================================
// 3. Setup and use the container
// ============================================

function main() {
  console.log('=== Dependency Injection Framework Demo ===\n');

  // Create container
  const container = new Container();

  // Register dependencies
  console.log('--- Registering dependencies ---');
  container.register(Logger, ConsoleLogger);
  container.register(Database, PostgresDatabase);
  container.register(UserService, UserServiceImpl);
  console.log('All dependencies registered!\n');

  // Resolve and use UserService
  console.log('--- Resolving UserService (1st time) ---');
  const userService1 = container.resolve(UserService);
  userService1.getUser(1);
  userService1.createUser('Alice');
  console.log('');

  // Resolve UserService again (Transient - new instance)
  console.log('--- Resolving UserService (2nd time) ---');
  const userService2 = container.resolve(UserService);
  userService2.getUser(2);
  console.log('');

  // Check if instances are different (Transient)
  console.log('--- Lifecycle Demo ---');
  console.log(`UserService1 === UserService2? ${userService1 === userService2}`);
  console.log('(false because UserService is @transient)\n');

  // Logger is singleton - same instance
  const logger1 = container.resolve(Logger);
  const logger2 = container.resolve(Logger);
  console.log(`Logger1 === Logger2? ${logger1 === logger2}`);
  console.log('(true because Logger is @singleton)\n');

  // Test error handling
  console.log('--- Error Handling Demo ---');
  try {
    const unknownToken = createToken<any>('UnknownService');
    container.resolve(unknownToken);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Caught error: ${error.message}`);
    }
  }

  console.log('\n=== Demo Complete ===');
}

// Run the example
main();
