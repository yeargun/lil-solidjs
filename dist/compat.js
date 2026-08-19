import {
  createContext,
  createEffect as createSplitEffect,
  createIntMemo,
  createIntSignal,
  createJsSignal,
  createRenderEffect,
  createRoot,
  createSignal as createEqualsSignal,
  createStore as createLilStore,
  createUniqueId,
  createUserEffect,
  flush,
  getOwner as getOwnerId,
  isPending as signalIsPending,
  latest as signalLatest,
  onCleanup,
  onSettled,
  provideContext,
  runWithOwner as runWithOwnerId,
  signalCommit,
  signalGet,
  signalMarkPending,
  signalPeek,
  signalPending,
  signalSet,
  signalUpdate,
  storeGet,
  storeReplace,
  storeSet,
  untrack,
  useContext,
} from "./core.js"

export {
  createContext,
  createRenderEffect,
  createRoot,
  createUniqueId,
  createUserEffect,
  flush,
  onCleanup,
  onSettled,
  provideContext,
  storeGet,
  storeSet,
  untrack,
  useContext,
}

const actionFrames = []

function equalsOf(options) {
  if (!options) return Object.is
  if (options.equals === false) return () => false
  if (typeof options.equals === "function") return options.equals
  return Object.is
}

function isThenable(value) {
  return value != null && typeof value.then === "function"
}

function accessorOf(signal) {
  const read = () => signalGet(signal)
  read._signal = signal
  return read
}

function currentAction() {
  return actionFrames.length > 0 ? actionFrames[actionFrames.length - 1] : null
}

export function getOwner() {
  return getOwnerId()
}

export function runWithOwner(owner, callback) {
  return runWithOwnerId(owner, callback)
}

export function isPending(source) {
  if (source && source._signal) return signalPending(source._signal)
  return signalIsPending(source)
}

export function latest(source) {
  if (source && source._signal) return signalPeek(source._signal)
  return signalLatest(source)
}

export function createSignal(initial, options) {
  const signal = typeof initial === "number" && Number.isInteger(initial) && !options
    ? createIntSignal(initial)
    : createEqualsSignal(initial, equalsOf(options))
  const write = (value) => {
    if (typeof value === "function") return signalUpdate(signal, value)
    return signalSet(signal, value)
  }
  return [accessorOf(signal), write]
}

export function createMemo(compute, options) {
  const equals = equalsOf(options)
  const signal = createEqualsSignal(undefined, equals)
  let epoch = 0
  createRenderEffect(() => {
    const result = compute()
    if (isThenable(result)) {
      const token = ++epoch
      signalMarkPending(signal, true)
      result.then(
        (value) => {
          if (token !== epoch) return
          signalMarkPending(signal, false)
          signalCommit(signal, value)
        },
        (error) => {
          if (token !== epoch) return
          signalMarkPending(signal, false)
          throw error
        },
      )
      return
    }
    epoch += 1
    if (signalPending(signal)) signalMarkPending(signal, false)
    signalCommit(signal, result)
  })
  return accessorOf(signal)
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
  return accessorOf(signal)
}

export function jsSignal(initial) {
  const signal = createJsSignal(initial)
  return [accessorOf(signal), (value) => signalSet(signal, value)]
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

export function createOptimistic(initial, options) {
  const signal = typeof initial === "number" && Number.isInteger(initial) && !options
    ? createIntSignal(initial)
    : createEqualsSignal(initial, equalsOf(options))
  const write = (value) => {
    const frame = currentAction()
    if (frame && !frame.bases.has(signal)) {
      frame.bases.set(signal, signalPeek(signal))
      frame.reverts.set(signal, () => signalCommit(signal, frame.bases.get(signal)))
    }
    if (typeof value === "function") return signalUpdate(signal, value)
    return signalSet(signal, value)
  }
  return [accessorOf(signal), write]
}

export function createOptimisticStore(initial) {
  const store = createLilStore(initial)
  const read = () => storeGet(store)
  const write = (updater) => {
    const frame = currentAction()
    if (frame && !frame.reverts.has(store)) {
      const snapshot = structuredClone(storeGet(store))
      frame.reverts.set(store, () => storeReplace(store, snapshot))
    }
    if (typeof updater === "function") {
      storeSet(store, updater)
      return
    }
    storeReplace(store, updater)
  }
  return [read, write]
}

export function action(genFn) {
  return (...args) => {
    const frame = { reverts: new Map(), bases: new Map() }
    actionFrames.push(frame)
    const revert = () => {
      for (const undo of frame.reverts.values()) undo()
    }
    const finish = () => {
      if (actionFrames[actionFrames.length - 1] === frame) actionFrames.pop()
    }
    const run = async () => {
      try {
        const iter = genFn(...args)
        if (iter && typeof iter.next === "function") {
          let step = await iter.next()
          while (!step.done) {
            flush()
            const yielded = await step.value
            step = await iter.next(yielded)
          }
          flush()
          return step.value
        }
        const result = await iter
        flush()
        return result
      } catch (error) {
        revert()
        flush()
        throw error
      } finally {
        finish()
      }
    }
    return run()
  }
}

export function children(fn) {
  const resolved = createMemo(fn)
  const read = () => resolved()
  read.toArray = () => {
    const value = read()
    if (value == null) return []
    return Array.isArray(value) ? value.flat(Infinity).filter((node) => node != null) : [value]
  }
  return read
}

export function lazy(loader) {
  let component
  let failure
  let started = false
  const status = createJsSignal(0)
  const start = () => {
    if (started) return
    started = true
    signalMarkPending(status, true)
    loader().then(
      (mod) => {
        component = mod.default
        signalMarkPending(status, false)
        signalCommit(status, 1)
      },
      (error) => {
        failure = error
        signalMarkPending(status, false)
        signalCommit(status, 2)
      },
    )
  }
  const Comp = (props) => {
    start()
    const pending = signalPending(status)
    if (failure) throw failure
    if (pending || !component) throw "NotReady"
    return component(props)
  }
  Comp.preload = () => {
    start()
    return Promise.resolve()
  }
  return Comp
}
