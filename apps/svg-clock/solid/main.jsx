import { createSignal, onSettled } from "solid-js"
import { render } from "@solidjs/web"

function App() {
  const [seconds, setSeconds] = createSignal(0)
  onSettled(() => {
    const id = setInterval(() => setSeconds((value) => (value + 1) % 60), 1000)
    return () => clearInterval(id)
  })
  return (
    <div class="stack">
      <h2>SVG clock</h2>
      <svg class="clock" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#fff" stroke="#10233a" />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="12"
          stroke="#2c4f7c"
          stroke-width="3"
          transform={`rotate(${seconds() * 6} 50 50)`}
        />
      </svg>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
