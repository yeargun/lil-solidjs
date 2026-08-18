import { Loading, createMemo, createSignal, isPending } from "solid-js"
import { render } from "@solidjs/web"

function fetchProfile(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`Ada Lovelace #${id}`), 180)
  })
}

function App() {
  const [userId, setUserId] = createSignal(1)
  const profile = createMemo(() => fetchProfile(userId()))

  return (
    <div class="stack">
      <h2>Async memo</h2>
      <button class="primary" onClick={() => setUserId((id) => id + 1)}>
        Next profile
      </button>
      <div class="card">
        <Loading fallback={<p class="muted">Loading profile…</p>}>
          <h3 class={{ stale: isPending(profile) }}>{profile()}</h3>
        </Loading>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
