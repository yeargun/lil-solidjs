import { createSignal } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [name, setName] = createSignal("Ada")
  return (
    <div class="stack">
      <h2>Form binding</h2>
      <input value={name()} onInput={(event) => setName(event.currentTarget.value)} />
      <p>Hello, {name()}</p>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
