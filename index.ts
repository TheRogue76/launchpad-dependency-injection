// Import reflect-metadata at the top for the entire library
import 'reflect-metadata';

// Export container
export { Container } from './container/Container.js';

// Export types
export type { Token, Constructor, Binding } from './container/types.js';
export { Lifecycle, createToken } from './container/types.js';

// Export decorators
export { injectable, singleton, transient } from './container/decorators.js';

// Export context functions
export { setContainer, getContainer, get, NoActiveContainerError } from './container/context.js';

// Export errors
export {
  DependencyNotFoundError,
  CircularDependencyError,
  InvalidConstructorError,
  NotInjectableError,
} from './container/errors.js';
