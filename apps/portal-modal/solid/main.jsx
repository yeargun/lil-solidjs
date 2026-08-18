import { Show, createSignal } from "solid-js"
import { Portal, render } from "@solidjs/web"

function App() {
  const [open, setOpen] = createSignal(false)
  return (
    <div class="stack">
      <h2>Portal modal</h2>
      <button class="primary" onClick={() => setOpen(true)}>Open modal</button>
      <Show when={open()}>
        <Portal>
          <div class="modal-back">
            <div class="modal">
              <h3>Portaled overlay</h3>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
