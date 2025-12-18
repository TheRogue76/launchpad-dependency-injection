import { Lifecycle, Token } from './types.js';
import { markInjectable, setLifecycle, setInjectToken } from './metadata.js';

/**
 * Parameter decorator to specify which token to inject
 */
export function inject<T>(token: Token<T>): ParameterDecorator {
  return function (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    setInjectToken(target as Function, parameterIndex, token);
  };
}

/**
 * Mark a class as injectable with automatic dependency resolution
 * Constructor parameters will be resolved from the container
 */
export function injectable(): ClassDecorator {
  return function (target: Function) {
    markInjectable(target);
  };
}

/**
 * Mark a class as a singleton
 * The same instance will be returned on every resolve call
 */
export function singleton(): ClassDecorator {
  return function (target: Function) {
    markInjectable(target);
    setLifecycle(target, Lifecycle.Singleton);
  };
}

/**
 * Mark a class as transient
 * A new instance will be created on every resolve call
 */
export function transient(): ClassDecorator {
  return function (target: Function) {
    markInjectable(target);
    setLifecycle(target, Lifecycle.Transient);
  };
}
