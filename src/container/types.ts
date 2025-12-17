/**
 * Token interface with phantom type for compile-time type safety
 */
export interface Token<T> {
  readonly symbol: symbol;
  readonly description: string;
}

/**
 * Create a type-safe token for dependency injection
 */
export function createToken<T>(description: string): Token<T> {
  return {
    symbol: Symbol(description),
    description,
  };
}

/**
 * Lifecycle strategies for dependency management
 */
export enum Lifecycle {
  Singleton = 'singleton',
  Transient = 'transient',
}

/**
 * Constructor type for class instantiation
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * Binding represents a registered dependency in the container
 */
export interface Binding<T = any> {
  implementation: Constructor<T>;
  lifecycle: Lifecycle;
  token: Token<T>;
}
