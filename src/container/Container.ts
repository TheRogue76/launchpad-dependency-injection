import 'reflect-metadata';
import { Token, Constructor, Binding, Lifecycle } from './types';
import {
  DependencyNotFoundError,
  CircularDependencyError,
  InvalidConstructorError,
  NotInjectableError,
} from './errors';
import { isInjectable, getLifecycle, getParamTypes } from './metadata';

/**
 * Dependency injection container
 */
export class Container {
  private bindings = new Map<symbol, Binding>();
  private singletons = new Map<symbol, any>();
  private resolutionStack: Token<any>[] = [];
  private typeToTokenMap = new Map<Function, Token<any>>();

  /**
   * Register a dependency with its implementation
   * Lifecycle is read from the decorator metadata (default: Transient)
   */
  register<T>(token: Token<T>, implementation: Constructor<T>): void {
    // Validate implementation is a constructor
    if (typeof implementation !== 'function') {
      throw new InvalidConstructorError(
        token,
        'Implementation must be a constructor function'
      );
    }

    // Check if class is marked as injectable
    if (!isInjectable(implementation)) {
      throw new NotInjectableError(implementation.name);
    }

    // Get lifecycle from metadata (default to Transient)
    const lifecycle = getLifecycle(implementation) || Lifecycle.Transient;

    // Store binding
    const binding: Binding<T> = {
      implementation,
      lifecycle,
      token,
    };
    this.bindings.set(token.symbol, binding);

    // Map implementation type to token for auto-resolution
    this.typeToTokenMap.set(implementation, token);
  }

  /**
   * Resolve a dependency by its token
   */
  resolve<T>(token: Token<T>): T {
    // Check if dependency is registered
    const binding = this.bindings.get(token.symbol);
    if (!binding) {
      throw new DependencyNotFoundError(token);
    }

    // Check for circular dependency
    if (this.resolutionStack.some((t) => t.symbol === token.symbol)) {
      const chain = [...this.resolutionStack, token];
      throw new CircularDependencyError(chain);
    }

    // Return cached singleton if exists
    if (binding.lifecycle === Lifecycle.Singleton) {
      if (this.singletons.has(token.symbol)) {
        return this.singletons.get(token.symbol);
      }
    }

    // Create instance with dependency injection
    this.resolutionStack.push(token);
    try {
      const instance = this.createInstance(token, binding.implementation);

      // Cache singleton
      if (binding.lifecycle === Lifecycle.Singleton) {
        this.singletons.set(token.symbol, instance);
      }

      return instance;
    } finally {
      this.resolutionStack.pop();
    }
  }

  /**
   * Create an instance with automatic constructor dependency injection
   */
  private createInstance<T>(token: Token<T>, ctor: Constructor<T>): T {
    // Import getInjectTokens dynamically to avoid circular dependency
    const { getInjectTokens } = require('./decorators');

    // Get inject tokens from @inject decorators
    const injectTokens: Token<any>[] | undefined = getInjectTokens(ctor);

    // If no @inject decorators, try to instantiate without dependencies
    if (!injectTokens || injectTokens.length === 0) {
      try {
        return new ctor();
      } catch (error) {
        throw new InvalidConstructorError(
          token,
          `Failed to instantiate (no dependencies declared with @inject): ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Resolve each dependency
    const resolvedDeps = injectTokens.map((depToken) => {
      if (!depToken) {
        throw new InvalidConstructorError(
          token,
          'Missing @inject decorator for constructor parameter'
        );
      }

      // Check if dependency is registered
      if (!this.bindings.has(depToken.symbol)) {
        throw new DependencyNotFoundError(depToken);
      }

      // Recursively resolve the dependency
      return this.resolve(depToken);
    });

    // Instantiate with resolved dependencies
    try {
      return new ctor(...resolvedDeps);
    } catch (error) {
      throw new InvalidConstructorError(
        token,
        `Failed to instantiate: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Check if a token is registered
   */
  isRegistered<T>(token: Token<T>): boolean {
    return this.bindings.has(token.symbol);
  }

  /**
   * Clear all singleton instances (useful for testing)
   */
  clear(): void {
    this.singletons.clear();
    this.resolutionStack = [];
  }

  /**
   * Reset the entire container
   */
  reset(): void {
    this.bindings.clear();
    this.singletons.clear();
    this.resolutionStack = [];
    this.typeToTokenMap.clear();
  }
}
