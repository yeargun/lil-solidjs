import { Repeat, createMemo, createSignal } from "solid-js"
import { render } from "@solidjs/web"

const ROWS = 8
const COLS = 6

function App() {
  const cells = Array.from({ length: ROWS * COLS }, () => {
    const [value, setValue] = createSignal(0)
    return { value, setValue }
  })
  const [selected, setSelected] = createSignal(0)
  const sums = Array.from({ length: COLS }, (_, column) =>
    createMemo(() => {
      let total = 0
      for (let row = 0; row < ROWS; row++) total += cells[row * COLS + column].value()
      return total
    }),
  )
  const selectedCell = () => cells[selected()]

  return (
    <div class="stack">
      <h2>Spreadsheet</h2>
      <p class="muted">
        {ROWS}×{COLS} independent cells. Column totals are memos. Click a cell, then +1 / +10.
      </p>
      <div class="row">
        <span>{`R${Math.floor(selected() / COLS) + 1}C${(selected() % COLS) + 1} = ${selectedCell().value()}`}</span>
        <button class="primary" onClick={() => selectedCell().setValue((value) => value + 1)}>+1</button>
        <button onClick={() => selectedCell().setValue((value) => value + 10)}>+10</button>
        <button onClick={() => selectedCell().setValue(0)}>Zero</button>
      </div>
      <table class="sheet">
        <thead>
          <tr>
            <th />
            <Repeat count={COLS}>{(column) => <th>{String.fromCharCode(65 + column)}</th>}</Repeat>
          </tr>
        </thead>
        <tbody>
          <Repeat count={ROWS}>
            {(row) => (
              <tr>
                <th>{row + 1}</th>
                <Repeat count={COLS}>
                  {(column) => {
                    const index = row * COLS + column
                    const cell = cells[index]
                    return (
                      <td class={{ sel: selected() === index }} onClick={() => setSelected(index)}>
                        {cell.value()}
                      </td>
                    )
                  }}
                </Repeat>
              </tr>
            )}
          </Repeat>
          <tr>
            <th>Σ</th>
            <Repeat count={COLS}>{(column) => <td>{sums[column]()}</td>}</Repeat>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

render(() => <App />, document.getElementById("app"))
