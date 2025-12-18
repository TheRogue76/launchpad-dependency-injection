import { Token } from './types.js';

/**
 * Error thrown when a requested dependency is not registered in the container
 */
export class DependencyNotFoundError extends Error {
  constructor(token: Token<any>) {
    super(
      `Dependency not found: ${token.description} (${token.symbol.toString()})`
    );
    this.name = 'DependencyNotFoundError';
    Object.setPrototypeOf(this, DependencyNotFoundError.prototype);
  }
}

/**
 * Error thrown when a circular dependency is detected
 */
export class CircularDependencyError extends Error {
  constructor(chain: Token<any>[]) {
    const chainStr = chain.map((t) => t.description).join(' -> ');
    super(`Circular dependency detected: ${chainStr}`);
    this.name = 'CircularDependencyError';
    Object.setPrototypeOf(this, CircularDependencyError.prototype);
  }
}

/**
 * Error thrown when a constructor or implementation is invalid
 */
export class InvalidConstructorError extends Error {
  constructor(token: Token<any>, message: string) {
    super(`Invalid constructor for ${token.description}: ${message}`);
    this.name = 'InvalidConstructorError';
    Object.setPrototypeOf(this, InvalidConstructorError.prototype);
  }
}

/**
 * Error thrown when a class is not marked as injectable
 */
export class NotInjectableError extends Error {
  constructor(className: string) {
    super(
      `Class ${className} is not marked as injectable. Use @injectable(), @singleton(), or @transient() decorator.`
    );
    this.name = 'NotInjectableError';
    Object.setPrototypeOf(this, NotInjectableError.prototype);
  }
}
