import { Errored, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function Boom(props) {
  if (props.boom() > 0) throw new Error("Boom")
  return <p>All clear</p>
}

function App() {
  const [boom, setBoom] = createSignal(0)
  return (
    <div class="stack">
      <h2>Error reset</h2>
      <button onClick={() => setBoom((value) => value + 1)}>Trip error</button>
      <Errored
        fallback={(err, reset) => (
          <div class="card">
            <p>{String(err())}</p>
            <button
              onClick={() => {
                setBoom(0)
                reset()
              }}
            >
              Reset
            </button>
          </div>
        )}
      >
        <Boom boom={boom} />
      </Errored>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
