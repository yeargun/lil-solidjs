const data = await fetch("./results.json").then((response) => {
  if (!response.ok) throw new Error(`Unable to load results: ${response.status}`)
  return response.json()
})

const demoGrid = document.querySelector("#demo-grid")
const resultsBody = document.querySelector("#results-body")
const perfBody = document.querySelector("#perf-body")
const formatter = new Intl.NumberFormat("en-US")

function pct(value) {
  if (value == null || Number.isNaN(value)) return "—"
  const sign = value >= 0 ? "−" : "+"
  return `${sign}${Math.abs(value).toFixed(1)}%`
}

function ms(value) {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value.toFixed(2)} ms`
}

function times(value) {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value.toFixed(2)}×`
}

const brotli = data.metrics.brotli
const gzip = data.metrics.gzip
const raw = data.metrics.raw

document.querySelector("#score-wins").innerHTML = `${brotli.wins}<span>/${data.cases}</span>`
document.querySelector("#score-brotli").textContent = pct(brotli.weightedReduction)
document.querySelector("#score-gzip").textContent = pct(gzip.weightedReduction)
document.querySelector("#score-raw").textContent = pct(raw.weightedReduction)

const createRatio = data.performance?.browserMs?.ratio?.create1k
document.querySelector("#score-perf").textContent = createRatio == null
  ? (data.performance?.browserMs?.skipped ? "node only" : "—")
  : `${createRatio.toFixed(2)}×`

function renderDemos(filter = "all") {
  const examples = filter === "all"
    ? data.examples
    : data.examples.filter((example) => example.group === filter)

  demoGrid.innerHTML = examples.map((example, index) => `
    <article class="demo-card" style="--order:${index}">
      <header>
        <div>
          <span class="case-number">${String(data.examples.indexOf(example) + 1).padStart(2, "0")}</span>
          <h3>${example.title}</h3>
        </div>
        <strong class="saving">${pct(example.reduction.brotli)}</strong>
      </header>
      <div class="demo-frame-wrap">
        <iframe
          src="./apps/${encodeURIComponent(example.id)}/compare.html"
          title="${example.title} Solid 2.0 vs solidlil"
          loading="lazy"
        ></iframe>
      </div>
      <footer>
        <span>raw ${formatter.format(example.solidlil.raw)} · gzip ${formatter.format(example.solidlil.gzip)} · brotli ${formatter.format(example.solidlil.brotli)}</span>
        <div>
          <a href="./apps/${encodeURIComponent(example.id)}/solid.html">Solid</a>
          <a href="./apps/${encodeURIComponent(example.id)}/solidlil.html">solidlil</a>
          <button class="replay" type="button" aria-label="Replay ${example.title}">replay ↻</button>
        </div>
      </footer>
    </article>
  `).join("")
}

function renderResults() {
  const rows = data.examples.map((example) => `
    <tr>
      <th scope="row">${example.title}</th>
      <td>${formatter.format(example.solid.raw)}</td>
      <td>${formatter.format(example.solidlil.raw)}</td>
      <td>${formatter.format(example.solid.gzip)}</td>
      <td>${formatter.format(example.solidlil.gzip)}</td>
      <td>${formatter.format(example.solid.brotli)}</td>
      <td>${formatter.format(example.solidlil.brotli)}</td>
      <td><strong>${pct(example.reduction.brotli)}</strong></td>
    </tr>
  `)
  rows.push(`
    <tr>
      <th scope="row">Total</th>
      <td>${formatter.format(raw.solid)}</td>
      <td>${formatter.format(raw.solidlil)}</td>
      <td>${formatter.format(gzip.solid)}</td>
      <td>${formatter.format(gzip.solidlil)}</td>
      <td>${formatter.format(brotli.solid)}</td>
      <td>${formatter.format(brotli.solidlil)}</td>
      <td><strong>${pct(brotli.weightedReduction)}</strong></td>
    </tr>
  `)
  resultsBody.innerHTML = rows.join("")
  const width = Math.max(18, Math.min(100, (brotli.solidlil / brotli.solid) * 100))
  document.querySelector("#total-bar").innerHTML = `
    <div class="bar-solid"><span>Solid 2.0 Brotli</span><strong>${formatter.format(brotli.solid)} B</strong></div>
    <div class="bar-lil" style="width:${width}%"><span>solidlil Brotli</span><strong>${formatter.format(brotli.solidlil)} B</strong></div>
    <div class="bar-solid"><span>Solid 2.0 gzip-9</span><strong>${formatter.format(gzip.solid)} B</strong></div>
    <div class="bar-lil" style="width:${Math.max(18, Math.min(100, (gzip.solidlil / gzip.solid) * 100))}%"><span>solidlil gzip-9</span><strong>${formatter.format(gzip.solidlil)} B</strong></div>
    <div class="bar-solid"><span>Solid 2.0 raw</span><strong>${formatter.format(raw.solid)} B</strong></div>
    <div class="bar-lil" style="width:${Math.max(18, Math.min(100, (raw.solidlil / raw.solid) * 100))}%"><span>solidlil raw</span><strong>${formatter.format(raw.solidlil)} B</strong></div>
  `
}

function row(name, solid, lil, ratioValue) {
  return `
    <tr>
      <th scope="row">${name}</th>
      <td>${solid}</td>
      <td>${lil}</td>
      <td><strong>${ratioValue}</strong></td>
    </tr>
  `
}

function renderPerf() {
  const perf = data.performance
  if (!perf) {
    perfBody.innerHTML = row("Benchmarks not generated", "—", "—", "—")
    document.querySelector("#perf-note").textContent = "Run npm run bench:perf after build:apps."
    return
  }
  const nodeSolid = perf.nodeMs.solid
  const nodeLil = perf.nodeMs.solidlil
  const nodeRatio = perf.nodeMs.ratio ?? {}
  const rows = [
    row("Node 50k signal write+flush+read", ms(nodeSolid?.signal50k), ms(nodeLil.signal50k), times(nodeRatio.signal50k)),
    row("Node 50k memo invalidate+read", ms(nodeSolid?.memo50k), ms(nodeLil.memo50k), times(nodeRatio.memo50k)),
    row("Node 10k split effects", ms(nodeSolid?.effect10k), ms(nodeLil.effect10k), times(nodeRatio.effect10k)),
  ]
  const browser = perf.browserMs
  if (browser && !browser.skipped) {
    rows.push(
      row("Browser keyed create 1,000", ms(browser.solid.create1k), ms(browser.solidlil.create1k), times(browser.ratio.create1k)),
      row("Browser keyed update every 10th", ms(browser.solid.updateEvery10th), ms(browser.solidlil.updateEvery10th), times(browser.ratio.updateEvery10th)),
      row("Browser keyed swap rows", ms(browser.solid.swap), ms(browser.solidlil.swap), times(browser.ratio.swap)),
      row("Browser keyed clear", ms(browser.solid.clear), ms(browser.solidlil.clear), times(browser.ratio.clear)),
    )
    document.querySelector("#perf-note").textContent =
      `Node ${perf.node}, vs @solidjs/signals@2.0.0-rc.0. Browser medians of 9 Playwright samples on the keyed table versus solid-js + @solidjs/web. Ratio is solidlil / Solid 2.0 (lower is faster).`
  } else {
    document.querySelector("#perf-note").textContent =
      `Node ${perf.node}. Browser benches were skipped${browser?.error ? `: ${browser.error}` : "."}`
  }
  perfBody.innerHTML = rows.join("")
}

renderDemos()
renderResults()
renderPerf()

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]")
  if (!button) return
  document.querySelectorAll(".filters button").forEach((item) => {
    item.classList.toggle("active", item === button)
  })
  renderDemos(button.dataset.filter)
})

demoGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".replay")
  if (!button) return
  const iframe = button.closest(".demo-card").querySelector("iframe")
  iframe.src = iframe.src
})

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy]")
  if (!button) return
  await navigator.clipboard.writeText(button.dataset.copy)
  const previous = button.textContent
  button.textContent = "copied!"
  window.setTimeout(() => { button.textContent = previous }, 1400)
})

const progress = document.querySelector(".progress")
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`
}
window.addEventListener("scroll", updateProgress, { passive: true })
updateProgress()
