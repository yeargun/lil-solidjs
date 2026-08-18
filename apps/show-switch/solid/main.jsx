import { Show, Switch, Match, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [open, setOpen] = createSignal(true)
  const [tab, setTab] = createSignal("home")

  return (
    <div class="stack">
      <h2>Control flow</h2>
      <div class="row">
        <button onClick={() => setOpen((value) => !value)}>{open() ? "Hide panel" : "Show panel"}</button>
        <button onClick={() => setTab("home")}>Home</button>
        <button onClick={() => setTab("settings")}>Settings</button>
        <button onClick={() => setTab("about")}>About</button>
      </div>
      <Show when={open()} fallback={<p class="muted">Panel hidden</p>}>
        <div class="card">
          <Switch fallback={<p>Unknown tab</p>}>
            <Match when={tab() === "home"}>
              <p>Home: fine-grained updates, no VDOM.</p>
            </Match>
            <Match when={tab() === "settings"}>
              <p>Settings: queued writes flush before paint.</p>
            </Match>
            <Match when={tab() === "about"}>
              <p>About: Solid 2.0 client semantics in LilScript.</p>
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
