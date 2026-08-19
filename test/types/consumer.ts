import { createEffect, createMemo, createSignal, createStore, flush } from "@lil/solidjs"
import { render } from "@lil/solidjs/web"
import { keyedEach } from "@lil/solidjs/full"

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
