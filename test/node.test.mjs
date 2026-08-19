import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"
import * as solidlil from "@itslil/solidjs"
import * as core from "../dist/core.js"

test("queued writes stay invisible until flush", () => {
  core.createRoot(() => {
    const signal = core.createIntSignal(1)
    assert.equal(core.signalGet(signal), 1)
    core.signalSet(signal, 7)
    assert.equal(core.signalGet(signal), 1)
    core.flush()
    assert.equal(core.signalGet(signal), 7)
  })
})

test("tuple createSignal matches the Solid 2.0 consumer shape", () => {
  solidlil.createRoot(() => {
    const [count, setCount] = solidlil.createSignal(0)
    assert.equal(count(), 0)
    setCount(3)
    assert.equal(count(), 0)
    solidlil.flush()
    assert.equal(count(), 3)
    setCount((value) => value + 1)
    solidlil.flush()
    assert.equal(count(), 4)
  })
})

test("createMemo is allocated once and tracks the source", () => {
  solidlil.createRoot(() => {
    const [count, setCount] = solidlil.createSignal(2)
    const doubled = solidlil.createMemo(() => count() * 2)
    assert.equal(doubled(), 4)
    setCount(5)
    solidlil.flush()
    assert.equal(doubled(), 10)
  })
})

test("split createEffect applies after compute", () => {
  solidlil.createRoot(() => {
    const [count, setCount] = solidlil.createSignal(1)
    let seen = 0
    solidlil.createEffect(
      () => count(),
      (value) => {
        seen = value
      },
    )
    solidlil.flush()
    assert.equal(seen, 1)
    setCount(9)
    solidlil.flush()
    assert.equal(seen, 9)
  })
})

test("createSelector only notifies matching keys", () => {
  core.createRoot(() => {
    const selected = core.createIntSignal(0)
    const selector = core.createSelector(selected)
    let hits = 0
    core.createRenderEffect(() => {
      if (core.selectorMatch(selector, 3)) hits += 1
    })
    core.createRenderEffect(() => {
      if (core.selectorMatch(selector, 7)) hits += 10
    })
    assert.equal(hits, 0)
    core.signalSet(selected, 3)
    core.flush()
    assert.equal(hits, 1)
    core.signalSet(selected, 7)
    core.flush()
    assert.equal(hits, 11)
    core.signalSet(selected, 9)
    core.flush()
    assert.equal(hits, 11)
  })
})

test("createStore mutates a draft", () => {
  solidlil.createRoot(() => {
    const [cart, setCart] = solidlil.createStore({ qty: 1 })
    assert.equal(cart().qty, 1)
    setCart((draft) => {
      draft.qty += 2
    })
    solidlil.flush()
    assert.equal(cart().qty, 3)
  })
})

test("disposing a root recycles effect slots", () => {
  const dispose = core.createRoot((d) => {
    for (let i = 0; i < 40; i++) core.createRenderEffect(() => {})
    return d
  })
  const freeAfterCreate = core.diagnosticFreeEffectSlots()
  dispose()
  assert.equal(core.diagnosticFreeEffectSlots(), freeAfterCreate + 40)
})

test("public entries export createSelector", () => {
  assert.equal(typeof solidlil.createSelector, "function")
  assert.equal(typeof solidlil.selectorMatch, "function")
})

test("createMemo settles a thenable and flips isPending", async () => {
  const dispose = solidlil.createRoot((d) => d)
  let finish
  const pending = new Promise((done) => {
    finish = done
  })
  const [id] = solidlil.createSignal(1)
  const profile = solidlil.createMemo(() => pending.then(() => `user-${id()}`))
  assert.equal(solidlil.isPending(profile), true)
  finish()
  await pending
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(solidlil.isPending(profile), false)
  assert.equal(profile(), "user-1")
  dispose()
})

test("action reverts createOptimistic writes on failure", async () => {
  await solidlil.createRoot(async (dispose) => {
    const [name, setName] = solidlil.createOptimistic("Ada")
    const rename = solidlil.action(function* (next) {
      setName(next)
      solidlil.flush()
      throw new Error("nope")
    })
    await assert.rejects(() => rename("Grace"))
    assert.equal(name(), "Ada")
    dispose()
  })
})

test("createUniqueId is stable per call and children flattens", () => {
  solidlil.createRoot(() => {
    const first = solidlil.createUniqueId()
    const second = solidlil.createUniqueId()
    assert.notEqual(first, second)
    const list = solidlil.children(() => ["a", ["b", null, "c"]])
    assert.deepEqual(list.toArray(), ["a", "b", "c"])
  })
})

test("CommonJS entry exposes the same public names", () => {
  const require = createRequire(import.meta.url)
  const cjs = require("@itslil/solidjs")
  for (const name of ["createSignal", "createMemo", "createEffect", "flush", "createRoot", "createStore"]) {
    assert.equal(typeof cjs[name], typeof solidlil[name], name)
  }
})
