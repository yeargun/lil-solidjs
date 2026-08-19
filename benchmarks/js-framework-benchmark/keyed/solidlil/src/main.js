import {
  append,
  bindClass,
  bindText,
  createIntSignal,
  createSelector,
  createSignal,
  createStringSignal,
  element,
  keyedEach,
  onClick,
  render,
  selectorMatch,
  signalGet,
  signalSet,
} from "solidlil/web"

const adjectives = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
]
const colors = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
]
const nouns = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
]

const random = (max) => Math.round(Math.random() * 1000) % max

let nextId = 1
const rows = createSignal([], () => false)
const selected = createIntSignal(0)

const buildData = (count) => {
  const data = new Array(count)
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: createStringSignal(
        `${adjectives[random(adjectives.length)]} ${colors[random(colors.length)]} ${nouns[random(nouns.length)]}`,
      ),
    }
  }
  return data
}

const cell = (className) => {
  const node = element("td")
  node.className = className
  return node
}

const button = (id, label, handler) => {
  const wrap = element("div")
  wrap.className = "col-sm-6 smallpad"
  const node = element("button")
  node.id = id
  node.className = "btn btn-primary btn-block"
  node.type = "button"
  node.textContent = label
  onClick(node, handler)
  append(wrap, node)
  return wrap
}

render("#main", (root) => {
  const isSelected = createSelector(selected)
  const replaceRows = (count) => {
    signalSet(selected, 0)
    signalSet(rows, buildData(count))
  }
  const container = element("div")
  container.className = "container"

  const jumbotron = element("div")
  jumbotron.className = "jumbotron"
  const jumboRow = element("div")
  jumboRow.className = "row"
  const titleCol = element("div")
  titleCol.className = "col-md-6"
  const title = element("h1")
  title.textContent = "solidlil"
  append(titleCol, title)
  const actionCol = element("div")
  actionCol.className = "col-md-6"
  const actionRow = element("div")
  actionRow.className = "row"
  append(actionRow, button("run", "Create 1,000 rows", () => replaceRows(1000)))
  append(actionRow, button("runlots", "Create 10,000 rows", () => replaceRows(10000)))
  append(
    actionRow,
    button("add", "Append 1,000 rows", () => {
      signalSet(rows, signalGet(rows).concat(buildData(1000)))
    }),
  )
  append(
    actionRow,
    button("update", "Update every 10th row", () => {
      const current = signalGet(rows)
      for (let i = 0; i < current.length; i += 10) {
        signalSet(current[i].label, `${signalGet(current[i].label)} !!!`)
      }
    }),
  )
  append(
    actionRow,
    button("clear", "Clear", () => {
      signalSet(selected, 0)
      signalSet(rows, [])
    }),
  )
  append(
    actionRow,
    button("swaprows", "Swap Rows", () => {
      const current = signalGet(rows)
      if (current.length <= 998) return
      const next = current.slice()
      const item = next[1]
      next[1] = next[998]
      next[998] = item
      signalSet(rows, next)
    }),
  )
  append(actionCol, actionRow)
  append(jumboRow, titleCol)
  append(jumboRow, actionCol)
  append(jumbotron, jumboRow)
  append(container, jumbotron)

  const table = element("table")
  table.className = "table table-hover table-striped test-data"
  const tbody = element("tbody")
  keyedEach(
    tbody,
    () => signalGet(rows),
    (row) => row.id,
    (row) => {
      const tr = element("tr")
      bindClass(tr, "danger", () => selectorMatch(isSelected, row.id))
      const idCell = cell("col-md-1")
      idCell.textContent = String(row.id)
      const labelCell = cell("col-md-4")
      const labelLink = element("a")
      bindText(labelLink, () => signalGet(row.label))
      onClick(labelLink, () => {
        signalSet(selected, row.id)
      })
      append(labelCell, labelLink)
      const removeCell = cell("col-md-1")
      const removeLink = element("a")
      onClick(removeLink, () => {
        if (signalGet(selected) === row.id) signalSet(selected, 0)
        signalSet(
          rows,
          signalGet(rows).filter((item) => item.id !== row.id),
        )
      })
      const icon = element("span")
      icon.className = "glyphicon glyphicon-remove"
      icon.setAttribute("aria-hidden", "true")
      append(removeLink, icon)
      append(removeCell, removeLink)
      append(tr, idCell)
      append(tr, labelCell)
      append(tr, removeCell)
      append(tr, cell("col-md-6"))
      return tr
    },
  )
  append(table, tbody)
  append(container, table)

  const preload = element("span")
  preload.className = "preloadicon glyphicon glyphicon-remove"
  preload.setAttribute("aria-hidden", "true")
  append(container, preload)
  append(root, container)
})
