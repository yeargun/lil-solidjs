import { For, createSignal } from "solid-js"
import { render } from "@solidjs/web"

const adjectives = ["pretty","large","big","small","tall","short","long","handsome","plain","quaint","clean","elegant","easy","angry","crazy","helpful","mushy","odd","unsightly","adorable","important","inexpensive","cheap","expensive","fancy"]
const colors = ["red","yellow","blue","green","pink","brown","purple","white","black","orange"]
const nouns = ["table","chair","house","bbq","desk","car","pony","cookie","sandwich","burger","pizza","mouse","keyboard"]

function pick(values) {
  return values[Math.floor(Math.random() * values.length)]
}

function makeRow(id) {
  const [label, setLabel] = createSignal(`${pick(adjectives)} ${pick(colors)} ${pick(nouns)}`)
  return { id, label, setLabel }
}

function App() {
  let nextId = 1
  const [rows, setRows] = createSignal([])
  const [selected, setSelected] = createSignal(0)

  function build(count) {
    const result = []
    for (let index = 0; index < count; index++) {
      result.push(makeRow(nextId++))
    }
    return result
  }

  return (
    <div class="stack">
      <h2>Keyed rows</h2>
      <div class="row">
        <button onClick={() => setRows(build(1000))}>Create 1,000</button>
        <button onClick={() => setRows(build(10000))}>Create 10,000</button>
        <button onClick={() => setRows((current) => current.concat(build(1000)))}>Append 1,000</button>
        <button
          onClick={() => {
            const current = rows()
            for (let index = 0; index < current.length; index += 10) {
              current[index].setLabel((value) => value + " !!!")
            }
          }}
        >
          Update every 10th
        </button>
        <button onClick={() => { setSelected(0); setRows([]) }}>Clear</button>
        <button
          onClick={() =>
            setRows((current) => {
              if (current.length <= 998) return current
              const next = current.slice()
              const second = next[1]
              next[1] = next[998]
              next[998] = second
              return next
            })
          }
        >
          Swap rows
        </button>
      </div>
      <table>
        <tbody>
          <For each={rows()} keyed={(row) => row.id}>
            {(row) => (
              <tr class={{ danger: selected() === row().id }}>
                <td>{row().id}</td>
                <td>
                  <a onClick={() => setSelected(row().id)}>{row().label()}</a>
                </td>
                <td>
                  <a
                    onClick={() => {
                      if (selected() === row().id) setSelected(0)
                      setRows((current) => current.filter((item) => item.id !== row().id))
                    }}
                  >
                    remove
                  </a>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
