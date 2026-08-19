import { action, createOptimistic, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function persistName(next, fail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error("save failed"))
      else resolve(next)
    }, 280)
  })
}

function App() {
  const [name, setName] = createOptimistic("Ada")
  const [draft, setDraft] = createSignal("Ada")
  const [failNext, setFailNext] = createSignal(true)
  const [status, setStatus] = createSignal("idle")

  const save = action(function* () {
    const next = draft()
    setName(next)
    setStatus("saving")
    yield persistName(next, failNext())
    setStatus("saved")
  })

  return (
    <div class="stack">
      <h2>Optimistic action</h2>
      <div class="row">
        <input value={draft()} onInput={(event) => setDraft(event.currentTarget.value)} />
        <button
          class="primary"
          disabled={status() === "saving"}
          onClick={() => {
            save().catch(() => {
              setFailNext(false)
              setStatus("reverted")
            })
          }}
        >
          Save
        </button>
      </div>
      <div class="card">
        <p>
          Shown as <strong>{name()}</strong>
        </p>
        <p class="muted">{status()}</p>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
