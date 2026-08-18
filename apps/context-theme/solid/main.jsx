import { createContext, createSignal, useContext } from "solid-js"
import { render } from "@solidjs/web"

const ThemeContext = createContext("light")

function Child() {
  const theme = useContext(ThemeContext)
  return <p>Child sees {theme()}</p>
}

function App() {
  const [theme, setTheme] = createSignal("light")
  return (
    <div class="stack">
      <h2>Context</h2>
      <button onClick={() => setTheme((value) => (value === "light" ? "dark" : "light"))}>
        Theme {theme()}
      </button>
      <div class="card">
        <ThemeContext value={theme}>
          <Child />
        </ThemeContext>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
