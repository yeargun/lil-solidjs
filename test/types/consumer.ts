import { createEffect, createMemo, createSignal, createStore, flush } from "@itslil/solidjs"
import { render } from "@itslil/solidjs/web"
import { keyedEach } from "@itslil/solidjs/full"

const [count, setCount] = createSignal(0)
setCount(1)
flush()
count()

const doubled = createMemo(() => count() * 2)
doubled()

createEffect(
  () => count(),
  (value) => {
    console.log(value)
  },
)

const [store, setStore] = createStore({ qty: 1 })
setStore((draft) => {
  draft.qty += 1
})
store()

render("#app", (root) => {
  root.textContent = "ok"
})
keyedEach
