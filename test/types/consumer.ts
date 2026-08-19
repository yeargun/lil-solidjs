import {
  action,
  children,
  createEffect,
  createMemo,
  createOptimistic,
  createSignal,
  createStore,
  createUniqueId,
  flush,
  isPending,
  lazy,
} from "@itslil/solidjs"
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

const [name, setName] = createOptimistic("Ada")
const rename = action(function* (next: string) {
  setName(next)
  yield
  return next
})
void rename("Grace")
void isPending(doubled)
void children(() => count())
void createUniqueId()
void lazy(async () => ({ default: () => null }))

render("#app", (root) => {
  root.textContent = "ok"
})
keyedEach
