import 'reflect-metadata';
import { Lifecycle, Token } from './types.js';

// Metadata keys for dependency injection
export const INJECTABLE_KEY = Symbol('injectable');
export const LIFECYCLE_KEY = Symbol('lifecycle');
export const PARAM_TYPES_KEY = 'design:paramtypes';
export const INJECT_TOKENS_KEY = Symbol('inject_tokens');

/**
 * Check if a class is marked as injectable
 */
export function isInjectable(target: Function): boolean {
  return Reflect.getMetadata(INJECTABLE_KEY, target) === true;
}

/**
 * Mark a class as injectable
 */
export function markInjectable(target: Function): void {
  Reflect.defineMetadata(INJECTABLE_KEY, true, target);
}

/**
 * Get the lifecycle of a class
 */
export function getLifecycle(target: Function): Lifecycle | undefined {
  return Reflect.getMetadata(LIFECYCLE_KEY, target);
}

/**
 * Set the lifecycle of a class
 */
export function setLifecycle(target: Function, lifecycle: Lifecycle): void {
  Reflect.defineMetadata(LIFECYCLE_KEY, lifecycle, target);
}

/**
 * Get constructor parameter types using reflect-metadata
 */
export function getParamTypes(target: Function): Function[] {
  return Reflect.getMetadata(PARAM_TYPES_KEY, target) || [];
}

/**
 * Get injection tokens for constructor parameters
 */
export function getInjectTokens(target: Function): Token<any>[] | undefined {
  return Reflect.getMetadata(INJECT_TOKENS_KEY, target);
}

/**
 * Set injection token for a specific constructor parameter
 */
export function setInjectToken(target: Function, parameterIndex: number, token: Token<any>): void {
  const existingTokens: Token<any>[] = Reflect.getMetadata(INJECT_TOKENS_KEY, target) || [];
  existingTokens[parameterIndex] = token;
  Reflect.defineMetadata(INJECT_TOKENS_KEY, existingTokens, target);
}
