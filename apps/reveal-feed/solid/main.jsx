import { Loading, Reveal, createMemo, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function fetchSlow(label, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(label), ms)
  })
}

function App() {
  const [tick, setTick] = createSignal(0)
  const head = createMemo(() => fetchSlow(`Headline #${tick() + 1}`, 200))
  const comments = createMemo(() => fetchSlow(`Comments for #${tick() + 1}`, 520))

  return (
    <div class="stack">
      <h2>Reveal feed</h2>
      <button class="primary" onClick={() => setTick((value) => value + 1)}>
        Reload
      </button>
      <Reveal order="sequential">
        <Loading fallback={<p class="muted">Head…</p>}>
          <article class="card">{head()}</article>
        </Loading>
        <Loading fallback={<p class="muted">Comments…</p>}>
          <article class="card">{comments()}</article>
        </Loading>
      </Reveal>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
