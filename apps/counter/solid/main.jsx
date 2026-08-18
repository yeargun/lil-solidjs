import { createSignal } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [count, setCount] = createSignal(0)
  return (
    <button type="button" class="count-btn" onClick={() => setCount(count() + 1)}>
      Count {count()}
    </button>
  )
}

render(() => <App />, document.getElementById("app"))
