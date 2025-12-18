import 'reflect-metadata';
import { Token, Constructor, Binding, Lifecycle } from './types.js';
import {
  DependencyNotFoundError,
  CircularDependencyError,
  InvalidConstructorError,
  NotInjectableError,
} from './errors.js';
import { isInjectable, getLifecycle } from './metadata.js';
import { setContainer, getContainer } from './context.js';

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
   * Automatically sets this container as the active container during resolution
   * so that nested get() calls work correctly
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

    // Store the previous active container (if any)
    let previousContainer: Container | null = null;
    try {
      previousContainer = getContainer();
    } catch {
      // No active container yet, that's fine
    }

    // Set this container as active for nested get() calls
    setContainer(this);

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

      // Restore previous container context
      if (previousContainer) {
        setContainer(previousContainer);
      }
    }
  }

  /**
   * Create an instance without automatic constructor dependency injection
   * Dependencies should be resolved using get() within the class
   */
  private createInstance<T>(token: Token<T>, ctor: Constructor<T>): T {
    try {
      // Simply instantiate the class - it will use get() for dependencies
      return new ctor();
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
