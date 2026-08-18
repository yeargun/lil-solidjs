import { Repeat, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [count, setCount] = createSignal(16)
  return (
    <div class="stack">
      <h2>Repeat</h2>
      <div class="row">
        <button onClick={() => setCount((value) => Math.max(0, value - 4))}>-4</button>
        <span>{count()} cells</span>
        <button onClick={() => setCount((value) => value + 4)}>+4</button>
      </div>
      <div class="grid">
        <Repeat count={count()}>{(index) => <div class="cell">{index + 1}</div>}</Repeat>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
