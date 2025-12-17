import 'reflect-metadata';
import { Lifecycle } from './types';

// Metadata keys for dependency injection
export const INJECTABLE_KEY = Symbol('injectable');
export const LIFECYCLE_KEY = Symbol('lifecycle');
export const PARAM_TYPES_KEY = 'design:paramtypes';

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
