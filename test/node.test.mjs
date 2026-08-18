import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"
import * as solidlil from "solidlil"
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

test("CommonJS entry exposes the same public names", () => {
  const require = createRequire(import.meta.url)
  const cjs = require("solidlil")
  for (const name of ["createSignal", "createMemo", "createEffect", "flush", "createRoot", "createStore"]) {
    assert.equal(typeof cjs[name], typeof solidlil[name], name)
  }
})
