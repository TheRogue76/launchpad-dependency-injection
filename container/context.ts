import { Container } from './Container.js';
import { Token } from './types.js';

/**
 * Error thrown when trying to resolve dependencies without an active container
 */
export class NoActiveContainerError extends Error {
  constructor() {
    super(
      'No active container. Call setContainer() before using get(), or ensure resolve() has been called.'
    );
    this.name = 'NoActiveContainerError';
    Object.setPrototypeOf(this, NoActiveContainerError.prototype);
  }
}

// Global container instance
let activeContainer: Container | null = null;

/**
 * Set the global active container
 * This is typically called once at application startup
 *
 * @example
 * const container = new Container();
 * setContainer(container);
 */
export function setContainer(container: Container): void {
  activeContainer = container;
}

/**
 * Get the current active container
 * @throws NoActiveContainerError if no container has been set
 */
export function getContainer(): Container {
  if (!activeContainer) {
    throw new NoActiveContainerError();
  }
  return activeContainer;
}

/**
 * Resolve a dependency from the active container
 * This is the primary way to inject dependencies in the new pattern
 *
 * @example
 * class UserService {
 *   private logger = get(Logger);
 *   private db = get(Database);
 * }
 */
export function get<T>(token: Token<T>): T {
  return getContainer().resolve(token);
}
