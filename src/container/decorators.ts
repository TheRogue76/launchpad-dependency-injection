import { Lifecycle, Token } from './types';
import { markInjectable, setLifecycle } from './metadata';

const INJECT_TOKENS_KEY = Symbol('inject_tokens');

/**
 * Store injection tokens for constructor parameters
 */
function setInjectTokens(target: Function, tokens: Token<any>[]): void {
  Reflect.defineMetadata(INJECT_TOKENS_KEY, tokens, target);
}

/**
 * Get injection tokens for constructor parameters
 */
export function getInjectTokens(target: Function): Token<any>[] | undefined {
  return Reflect.getMetadata(INJECT_TOKENS_KEY, target);
}

/**
 * Parameter decorator to specify which token to inject
 */
export function inject<T>(token: Token<T>): ParameterDecorator {
  return function (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens: Token<any>[] = Reflect.getMetadata(INJECT_TOKENS_KEY, target) || [];
    existingTokens[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_TOKENS_KEY, existingTokens, target);
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
