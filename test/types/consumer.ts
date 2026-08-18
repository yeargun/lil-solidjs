import { createEffect, createMemo, createSignal, createStore, flush } from "solidlil"
import { render } from "solidlil/web"
import { keyedEach } from "solidlil/full"

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
