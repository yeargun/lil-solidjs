import assert from "node:assert/strict"
import test from "node:test"
import * as solid from "solid-js"
import * as web from "@solidjs/web"
import * as ours from "@itslil/solidjs"
import * as ourWeb from "@itslil/solidjs/web"

function exportNames(mod) {
  return Object.getOwnPropertyNames(mod).filter((name) => name !== "default").sort()
}

test("every solid-js export exists on @itslil/solidjs", () => {
  const missing = exportNames(solid).filter((name) => !(name in ours))
  assert.deepEqual(missing, [])
})

test("every @solidjs/web export exists on @itslil/solidjs/web", () => {
  const missing = exportNames(web).filter((name) => !(name in ourWeb) && !(name in ours))
  assert.deepEqual(missing, [])
})

test("createProjection and reconcile keep keyed identity", () => {
  ours.createRoot(() => {
    const [rows, setRows] = ours.createStore([
      { id: 1, name: "Ada" },
      { id: 2, name: "Grace" },
    ])
    setRows(ours.reconcile([{ id: 2, name: "Hopper" }, { id: 3, name: "Alan" }]))
    ours.flush()
    assert.equal(rows()[0].name, "Hopper")
    assert.equal(rows().length, 2)
    const view = ours.createProjection(
      () => rows().filter((row) => row.id > 1),
      [],
    )
    ours.flush()
    assert.equal(view[0]?.name ?? view()[0]?.name, "Hopper")
  })
})

test("mapArray and For map a list", () => {
  ours.createRoot(() => {
    const [items, setItems] = ours.createSignal(["a", "b"])
    const mapped = ours.mapArray(items, (item) => item.toUpperCase())
    assert.deepEqual(mapped(), ["A", "B"])
    setItems(["c"])
    ours.flush()
    assert.deepEqual(mapped(), ["C"])
  })
})

test("Reveal holds later Loading slots until earlier ones settle", async () => {
  await ours.createRoot(async (dispose) => {
    let finish
    const pending = new Promise((ok) => { finish = ok })
    const first = ours.createMemo(() => pending.then(() => "one"))
    const second = ours.createMemo(() => "two")
    let a
    let b
    ours.createRevealOrder(() => {
      a = ours.createLoadingBoundary(() => first(), () => "wait-a")
      b = ours.createLoadingBoundary(() => second(), () => "wait-b")
    }, { order: () => "sequential" })
    assert.equal(a(), "wait-a")
    assert.equal(b(), "wait-b")
    finish()
    await pending
    await Promise.resolve()
    await Promise.resolve()
    ours.flush()
    assert.equal(a(), "one")
    assert.equal(b(), "two")
    dispose()
  })
})

test("ssr helpers and renderToString produce HTML", () => {
  assert.equal(ourWeb.ssrElement("div", { id: "x" }, "hi"), '<div id="x">hi</div>')
  assert.match(ourWeb.ssrHydrationKey(), /data-hk=/)
  assert.match(ourWeb.generateHydrationScript(), /_\$HY/)
  assert.equal(ourWeb.isServer, false)
  assert.equal(ourWeb.renderToString(() => "hello"), "hello")
})

test("hydrate claims existing nodes and does not wipe the root", () => {
  const child = { nodeType: 1, nodeName: "DIV", nextSibling: null, parentNode: null }
  const root = {
    nodeType: 1,
    firstChild: child,
    textContent: "keep",
    insertBefore(node) { return node },
  }
  child.parentNode = root
  let claimed
  ourWeb.hydrate(() => {
    claimed = ourWeb.getNextElement()
    return claimed
  }, root)
  assert.equal(claimed, child)
  assert.equal(root.textContent, "keep")
})

test("mapArray reuses mapped nodes by identity", () => {
  ours.createRoot(() => {
    const first = { id: 1 }
    const second = { id: 2 }
    const [items, setItems] = ours.createSignal([first, second])
    const mapped = ours.mapArray(items, (item) => ({ item }))
    const initial = mapped()
    setItems([first])
    ours.flush()
    assert.equal(mapped()[0], initial[0])
  })
})

test("createStore setter can replace by returning a new value", () => {
  ours.createRoot(() => {
    const [rows, setRows] = ours.createStore([{ id: 1 }, { id: 2 }])
    setRows((list) => list.filter((row) => row.id === 2))
    ours.flush()
    assert.equal(rows().length, 1)
    assert.equal(rows()[0].id, 2)
  })
})

test("createMemo lazy waits for the first read", () => {
  ours.createRoot(() => {
    const [count] = ours.createSignal(1)
    let runs = 0
    const doubled = ours.createMemo(() => {
      runs += 1
      return count() * 2
    }, { lazy: true })
    assert.equal(runs, 0)
    assert.equal(doubled(), 2)
    assert.equal(runs, 1)
  })
})

test("createEffect defer skips the first apply", () => {
  ours.createRoot(() => {
    const [count, setCount] = ours.createSignal(0)
    const seen = []
    ours.createEffect(() => count(), (value) => { seen.push(value) }, { defer: true })
    ours.flush()
    assert.deepEqual(seen, [])
    setCount(1)
    ours.flush()
    assert.deepEqual(seen, [1])
  })
})

test("default-less createContext throws outside a provider", () => {
  ours.createRoot(() => {
    const context = ours.createContext()
    assert.throws(() => ours.useContext(context), /ContextNotFoundError/)
  })
})
