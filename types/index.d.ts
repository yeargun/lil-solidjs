export type Setter<T> = (value: T | ((previous: T) => T)) => T
export type Accessor<T> = () => T
export type Equals<T> = (previous: T, next: T) => boolean

export interface SignalOptions<T> {
  equals?: Equals<T> | false
}

export function createSignal<T>(initial: T, options?: SignalOptions<T>): [Accessor<T>, Setter<T>]
export function createMemo<T>(compute: () => T | PromiseLike<T>, options?: SignalOptions<T> & { lazy?: boolean }): Accessor<T> & { refresh?: () => void }
export function createEffect<T>(compute: () => T, apply: ((value: T) => void | (() => void)) | { effect?: (value: T) => void; error?: (error: unknown) => void; defer?: boolean }, options?: { defer?: boolean }): void
export function createEffect(compute: () => void): void
export function createStore<T extends object>(initial: T): [() => T, (updater: ((draft: T) => void) | T) => void]
export function createOptimistic<T>(initial: T, options?: SignalOptions<T>): [Accessor<T>, Setter<T>]
export function createOptimisticStore<T extends object>(initial: T): [() => T, (updater: ((draft: T) => void) | T) => void]
export function action<Args extends unknown[], R>(
  fn: (...args: Args) => Generator<unknown, R, unknown> | AsyncGenerator<unknown, R, unknown> | Promise<R> | R,
): (...args: Args) => Promise<R>
export function lazy<T extends (props: any) => unknown>(
  loader: () => Promise<{ default: T }>,
): T & { preload: () => Promise<void> }
export function children<T>(fn: () => T): Accessor<T> & { toArray: () => unknown[] }
export function createUniqueId(): string
export function getOwner(): number
export function runWithOwner<T>(owner: number, callback: () => T): T
export function createRoot<T>(callback: (dispose: () => void) => T): T
export function flush(): void
export function untrack<T>(callback: () => T): T
export function onCleanup(callback: () => void): void
export function onSettled(callback: () => void): void
export function isPending(source: Accessor<unknown> | { asyncPending?: boolean } | { _signal?: unknown }): boolean
export function latest<T>(source: Accessor<T> | { read(): T }): T
export function createContext<T>(defaultValue?: T): unknown
export function useContext<T>(context: unknown): T
export function provideContext<T, U>(context: unknown, value: T, child: () => U): U
export function createIntSignal(initial: number): unknown
export function createBoolSignal(initial: boolean): unknown
export function createStringSignal(initial: string): unknown
export function createJsSignal(initial: unknown): unknown
export function createIntMemo(compute: () => number): unknown
export function createBoolMemo(compute: () => boolean): unknown
export function createStringMemo(compute: () => string): unknown
export function createUserEffect(callback: () => void): number
export function createRenderEffect(callback: () => void): number
export function createRenderEffect<T>(compute: () => T, apply: (value: T) => void): void
export function createSelector(source: { read(): number; peek(): number }): unknown
export function selectorMatch(selector: unknown, value: number): boolean
export function createRenderBind<T>(compute: () => T, apply: (value: T) => void): void
export function signalGet<T>(signal: unknown): T
export function signalSet<T>(signal: unknown, value: T): T
export function signalUpdate<T>(signal: unknown, updater: (value: T) => T): T
export function signalPeek<T>(signal: unknown): T
export function storeGet<T>(store: unknown): T
export function storeSet<T>(store: unknown, updater: (value: T) => void): void
export function storeReplace<T>(store: unknown, next: T): void
export function storeVersion(store: unknown): number
export class Store<T> {
  constructor(value: T)
  read(): T
  mutate(updater: (value: T) => void): void
  replace(next: T): void
}

export const $DEVCOMP: symbol
export const $PROXY: symbol
export const $REFRESH: symbol
export const $TRACK: symbol
export const DEV: undefined
export const NoHydrateContext: unknown
export const sharedConfig: {
  hydrating: boolean
  done: boolean
  getNextContextId?: () => string
}

export class NotReadyError extends Error {}

export function createOwner(): number
export function createTrackedEffect(compute: () => void | (() => void)): void
export function createReaction(effect: () => void): (tracking: () => void) => void
export function createProjection<T extends object>(fn: (draft: T) => void | T | Promise<void | T>, seed: T, options?: { key?: string | ((item: any) => any) | null }): T
export function createDeepProxy<T>(value: T): T
export function createComponent<P>(Comp: (props: P) => unknown, props: P): unknown
export function createErrorBoundary<T, U>(fn: () => T, fallback: (error: () => unknown, reset: () => void) => U): () => T | U
export function createLoadingBoundary<T, U>(fn: () => T, fallback: () => U, options?: { on?: () => unknown }): () => T | U
export function createRevealOrder<T>(fn: () => T, options?: { order?: () => string; collapsed?: () => boolean }): T
export function reconcile<T>(value: T, key?: string | ((item: any) => any) | null): (state: T) => void
export function snapshot<T>(item: T): T
export function deep<T extends object>(store: T): T
export function merge<T extends unknown[]>(...sources: T): any
export function omit<T extends object>(props: T, ...keys: (keyof T)[]): Partial<T>
export function storePath(...path: any[]): (state: any) => void
export function mapArray<Item, Mapped>(list: () => readonly Item[] | false | null | undefined, map: (item: Item, index: () => number) => Mapped, options?: { keyed?: unknown; fallback?: () => unknown }): () => Mapped[]
export function repeat(count: () => number, map: (index: number) => unknown, options?: { from?: () => number; fallback?: () => unknown }): () => unknown[]
export function flatten(value: unknown, options?: { skipNonRendered?: boolean; doNotUnwrap?: boolean }): unknown
export function refresh(target: { refresh?: () => void }): void
export function resolve<T>(fn: () => T): Promise<T>
export function affects(target: unknown, key?: PropertyKey): void
export function enableExternalSource(factory: unknown): void
export function enforceLoadingBoundary(enabled?: boolean): void
export function enableHydration(): void
export function isDisposed(owner?: number): boolean
export function isEqual(left: unknown, right: unknown): boolean
export function isWrappable(value: unknown): boolean
export function getNextChildId(): string
export function getObserver(): number
export function getProjectionTrace(value?: unknown): undefined
export function materializeContainerTrace(marker?: unknown): unknown
export function ssrHandleError(): void
export function ssrScope<T>(fn: () => T): () => T
export function runInServerComponentScope<T>(fn: () => T): T
export function inServerComponentScope(): boolean
export function creationStamp(): number

export function For(props: any): unknown
export function Repeat(props: any): unknown
export function Show(props: any): unknown
export function Switch(props: any): unknown
export function Match(props: any): unknown
export function Errored(props: any): unknown
export function Loading(props: any): unknown
export function Reveal(props: any): unknown
export function Hydration(props: any): unknown
export function NoHydration(props: any): unknown
