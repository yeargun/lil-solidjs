import { For, createStore } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [cart, setCart] = createStore({
    items: [
      { id: 1, name: "Lil mug", price: 12, qty: 1 },
      { id: 2, name: "Solid pin", price: 8, qty: 2 },
      { id: 3, name: "Codec tee", price: 24, qty: 1 },
    ],
  })

  const total = () => cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div class="stack">
      <h2>Cart</h2>
      <For each={cart.items} keyed={(item) => item.id}>
        {(item, index) => (
          <div class="todo-item">
            <span>{item().name}</span>
            <button
              onClick={() =>
                setCart((draft) => {
                  const at = index()
                  draft.items[at].qty = Math.max(0, draft.items[at].qty - 1)
                })
              }
            >
              -
            </button>
            <strong>{item().qty}</strong>
            <button
              onClick={() =>
                setCart((draft) => {
                  draft.items[index()].qty += 1
                })
              }
            >
              +
            </button>
          </div>
        )}
      </For>
      <p>Total ${total()}</p>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
