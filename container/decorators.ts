import { Lifecycle } from './types.js';
import { markInjectable, setLifecycle } from './metadata.js';

/**
 * Mark a class as injectable with automatic dependency resolution
 * Dependencies should be resolved using get() within the class
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
