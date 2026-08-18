import {
  createContext,
  createEffect as createSplitEffect,
  createIntMemo,
  createIntSignal,
  createJsSignal,
  createMemo as createSeededMemo,
  createRenderEffect,
  createRoot,
  createSignal as createEqualsSignal,
  createStore as createLilStore,
  createUserEffect,
  flush,
  isPending,
  latest,
  onCleanup,
  onSettled,
  provideContext,
  signalGet,
  signalSet,
  signalUpdate,
  storeGet,
  storeReplace,
  storeSet,
  untrack,
  useContext,
} from "./.__compiled-core.mjs"

export {
  createContext,
  createRenderEffect,
  createRoot,
  createUserEffect,
  flush,
  isPending,
  latest,
  onCleanup,
  onSettled,
  provideContext,
  storeGet,
  storeSet,
  untrack,
  useContext,
}

function equalsOf(options) {
  if (!options) return Object.is
  if (options.equals === false) return () => false
  if (typeof options.equals === "function") return options.equals
  return Object.is
}

export function createSignal(initial, options) {
  const signal = typeof initial === "number" && Number.isInteger(initial) && !options
    ? createIntSignal(initial)
    : createEqualsSignal(initial, equalsOf(options))
  const read = () => signalGet(signal)
  const write = (value) => {
    if (typeof value === "function") return signalUpdate(signal, value)
    return signalSet(signal, value)
  }
  return [read, write]
}

export function createMemo(compute, options) {
  const signal = createSeededMemo(undefined, compute, equalsOf(options))
  return () => signalGet(signal)
}

export function createEffect(compute, apply, options) {
  if (typeof apply === "function") {
    createSplitEffect(compute, apply)
    return
  }
  createUserEffect(() => {
    compute()
  })
}

export function createMemoInt(compute) {
  const signal = createIntMemo(compute)
  return () => signalGet(signal)
}

export function jsSignal(initial) {
  const signal = createJsSignal(initial)
  return [() => signalGet(signal), (value) => signalSet(signal, value)]
}

export function createStore(initial) {
  const store = createLilStore(initial)
  const read = () => storeGet(store)
  const write = (updater) => {
    if (typeof updater === "function") {
      storeSet(store, updater)
      return
    }
    storeReplace(store, updater)
  }
  return [read, write]
}
