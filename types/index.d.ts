export type Setter<T> = (value: T | ((previous: T) => T)) => T
export type Accessor<T> = () => T
export type Equals<T> = (previous: T, next: T) => boolean

export interface SignalOptions<T> {
  equals?: Equals<T> | false
}

export function createSignal<T>(initial: T, options?: SignalOptions<T>): [Accessor<T>, Setter<T>]
export function createMemo<T>(compute: () => T, options?: SignalOptions<T>): Accessor<T>
export function createEffect<T>(compute: () => T, apply: (value: T) => void): void
export function createEffect(compute: () => void): void
export function createStore<T extends object>(initial: T): [() => T, (updater: ((draft: T) => void) | T) => void]
export function createRoot<T>(callback: (dispose: () => void) => T): T
export function flush(): void
export function untrack<T>(callback: () => T): T
export function onCleanup(callback: () => void): void
export function onSettled(callback: () => void): void
export function isPending<T>(signal: { asyncPending?: boolean }): boolean
export function latest<T>(signal: { read(): T }): T
export function createContext<T>(defaultValue: T): unknown
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
