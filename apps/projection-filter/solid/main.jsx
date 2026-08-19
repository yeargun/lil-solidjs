import { For, createProjection, createSignal, createStore } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [query, setQuery] = createSignal("")
  const [people] = createStore([
    { id: 1, name: "Ada Lovelace", tag: "lang" },
    { id: 2, name: "Grace Hopper", tag: "lang" },
    { id: 3, name: "Alan Turing", tag: "systems" },
    { id: 4, name: "Margaret Hamilton", tag: "systems" },
  ])
  const view = createProjection(
    () =>
      people.filter((person) => {
        const needle = query().toLowerCase()
        if (!needle) return true
        return person.name.toLowerCase().includes(needle) || person.tag.includes(needle)
      }),
    [],
  )

  return (
    <div class="stack">
      <h2>Projection</h2>
      <input
        value={query()}
        placeholder="filter"
        onInput={(event) => setQuery(event.currentTarget.value)}
      />
      <For each={view} keyed={(person) => person.id}>
        {(person) => (
          <div class="todo-item">
            <strong>{person().name}</strong>
            <span class="muted">{person().tag}</span>
          </div>
        )}
      </For>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
