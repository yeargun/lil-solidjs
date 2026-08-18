import { For, Show, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function NodeView(props) {
  const [open, setOpen] = createSignal(true)
  return (
    <div>
      <div class="row">
        <button onClick={() => setOpen((value) => !value)}>
          {props.node.children.length === 0 ? "·" : open() ? "−" : "+"}
        </button>
        <span>{props.node.name}</span>
      </div>
      <Show when={open() && props.node.children.length > 0}>
        <div style={{ "padding-left": "18px" }}>
          <For each={props.node.children} keyed={(child) => child.id}>
            {(child) => <NodeView node={child()} />}
          </For>
        </div>
      </Show>
    </div>
  )
}

function App() {
  const tree = {
    id: 1,
    name: "src",
    children: [
      { id: 2, name: "reactive.lil", children: [] },
      { id: 3, name: "web.lil", children: [] },
      {
        id: 4,
        name: "apps",
        children: [
          { id: 5, name: "counter", children: [] },
          { id: 6, name: "keyed", children: [] },
        ],
      },
    ],
  }
  return (
    <div class="stack">
      <h2>Nested tree</h2>
      <NodeView node={tree} />
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
