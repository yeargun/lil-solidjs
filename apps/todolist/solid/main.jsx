import { For, createSignal } from "solid-js"
import { render } from "@solidjs/web"

function makeTodo(id, title) {
  const [done, setDone] = createSignal(false)
  return { id, title, done, setDone }
}

function App() {
  let nextId = 1
  const [todos, setTodos] = createSignal([])
  const [draft, setDraft] = createSignal("")
  const [filter, setFilter] = createSignal(0)

  const visible = () => {
    const mode = filter()
    if (mode === 0) return todos()
    return todos().filter((todo) => (mode === 1 ? !todo.done() : todo.done()))
  }

  const remaining = () => todos().filter((todo) => !todo.done()).length

  function addTodo() {
    const title = draft().trim()
    if (!title) return
    setTodos((current) => [...current, makeTodo(nextId++, title)])
    setDraft("")
  }

  return (
    <div class="stack">
      <h2>Todos</h2>
      <div class="row">
        <input
          placeholder="What needs doing?"
          value={draft()}
          onInput={(event) => setDraft(event.currentTarget.value)}
        />
        <button class="primary" onClick={addTodo}>Add</button>
      </div>
      <div class="row">
        <button onClick={() => setFilter(0)}>All</button>
        <button onClick={() => setFilter(1)}>Active</button>
        <button onClick={() => setFilter(2)}>Done</button>
      </div>
      <For each={visible()}>
        {(todo) => (
          <div class="todo-item">
            <input
              type="checkbox"
              checked={todo.done()}
              onChange={(event) => todo.setDone(event.currentTarget.checked)}
            />
            <span>{todo.title}</span>
            <button onClick={() => setTodos((current) => current.filter((item) => item.id !== todo.id))}>
              Remove
            </button>
          </div>
        )}
      </For>
      <p class="muted">{remaining()} left</p>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
