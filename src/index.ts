// Import reflect-metadata at the top for the entire library
import 'reflect-metadata';

// Export container
export { Container } from './container/Container';

// Export types
export { Token, Lifecycle, Constructor, Binding, createToken } from './container/types';

// Export decorators
export { injectable, singleton, transient, inject } from './container/decorators';

// Export errors
export {
  DependencyNotFoundError,
  CircularDependencyError,
  InvalidConstructorError,
  NotInjectableError,
} from './container/errors';
