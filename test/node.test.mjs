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

test("fan-out subscribe notifies every observer and forgets recycled slots", () => {
  const source = core.createIntSignal(0)
  let hits = 0
  const dispose = core.createRoot((d) => {
    for (let i = 0; i < 400; i++) {
      core.createRenderEffect(() => {
        core.signalGet(source)
        hits += 1
      })
    }
    return d
  })
  assert.equal(hits, 400)
  core.signalSet(source, 1)
  core.flush()
  assert.equal(hits, 800)
  dispose()
  hits = 0
  const disposeNext = core.createRoot((d) => {
    for (let i = 0; i < 400; i++) {
      core.createRenderEffect(() => {
        hits += 1
      })
    }
    return d
  })
  core.signalSet(source, 2)
  core.flush()
  assert.equal(hits, 400)
  disposeNext()
})

test("dropping a dependency stops updates from that signal", () => {
  core.createRoot(() => {
    const left = core.createIntSignal(1)
    const right = core.createIntSignal(10)
    const useLeft = core.createIntSignal(1)
    let seen = 0
    core.createRenderEffect(() => {
      seen = core.signalGet(useLeft) == 1 ? core.signalGet(left) : core.signalGet(right)
    })
    assert.equal(seen, 1)
    core.signalSet(useLeft, 0)
    core.flush()
    assert.equal(seen, 10)
    core.signalSet(left, 99)
    core.flush()
    assert.equal(seen, 10)
    core.signalSet(right, 12)
    core.flush()
    assert.equal(seen, 12)
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

test("NotReady from a nested effect wakes the parent Loading effect", async () => {
  const dispose = solidlil.createRoot((d) => d)
  let finish
  const pending = new Promise((done) => {
    finish = done
  })
  const profile = solidlil.createMemo(() => pending.then(() => "Ada"))
  const boundary = solidlil.createLoadingBoundary(
    () => {
      let text
      solidlil.createRenderEffect(() => {
        text = profile()
      })
      return text
    },
    () => "wait",
  )
  let view
  solidlil.createRenderEffect(() => {
    view = boundary()
  })
  assert.equal(view, "wait")
  finish()
  await pending
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(view, "Ada")
  dispose()
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
