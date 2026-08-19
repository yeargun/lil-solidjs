import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const resultsPath = process.argv[2]
  ?? resolve(root, "../lilscript/benchmarks/js-framework-benchmark/artifacts/results.json")
const sitePath = resolve(root, "site", "results.json")

const CPU = {
  "01_run1k": "Create 1,000 rows",
  "02_replace1k": "Replace 1,000 rows",
  "03_update10th1k_x16": "Update every 10th row ×16",
  "04_select1k": "Select a row",
  "05_swap1k": "Swap two rows",
  "06_remove-one-1k": "Remove one row",
  "07_create10k": "Create 10,000 rows",
  "08_create1k-after1k_x2": "Append 1,000 rows ×2",
  "09_clear1k_x8": "Clear 1,000 rows ×8",
}
const MEMORY = {
  "21_ready-memory": "Ready memory",
  "22_run-memory": "Memory with 1,000 rows",
  "25_run-clear-memory": "Memory after five create/clear cycles",
}

const official = JSON.parse(await readFile(resultsPath, "utf8"))
const site = JSON.parse(await readFile(sitePath, "utf8"))
const solid = official.frameworks.find((row) => row.id === "solid-v2")
const lil = official.frameworks.find((row) => row.id === "solidlil-v2")
if (!solid || !lil) throw new Error("results.json is missing solid-v2 or solidlil-v2")

function median(framework, section, id, metric) {
  const row = framework[section][id]
  const value = metric ? row?.[metric] : row
  if (value?.median == null) throw new Error(`missing ${framework.id} ${section} ${id}`)
  return value.median
}

function geomean(values) {
  return Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length)
}

const cpu = Object.entries(CPU).map(([id, name]) => {
  const solidMs = median(solid, "cpu", id, "total")
  const lilMs = median(lil, "cpu", id, "total")
  return { id, name, solid: solidMs, solidlil: lilMs, ratio: lilMs / solidMs }
})
const memory = Object.entries(MEMORY).map(([id, name]) => {
  const solidMb = median(solid, "memory", id)
  const lilMb = median(lil, "memory", id)
  return { id, name, solid: solidMb, solidlil: lilMb, ratio: lilMb / solidMb }
})
const allRatios = cpu.map((row) => row.ratio)
const selectRatio = cpu.find((row) => row.id === "04_select1k")?.ratio
const selectSameApp = selectRatio != null && selectRatio >= 0.7 && selectRatio <= 1.4
const sameApp = selectSameApp
  ? allRatios
  : cpu.filter((row) => row.id !== "04_select1k").map((row) => row.ratio)

site.jsFrameworkBenchmark = {
  source: official.upstream?.repository ?? "https://github.com/krausest/js-framework-benchmark",
  commit: official.upstream?.commit ?? official.provenance?.upstreamCommit,
  browser: official.provenance?.chrome,
  blocks: official.configuration?.blocks ?? 15,
  cpuThrottling: official.configuration?.cpuThrottling ?? true,
  geomean: {
    cpu: geomean(allRatios),
    cpuSameApp: geomean(sameApp),
  },
  notes: {
    cpuSameApp: selectSameApp
      ? "Geometric mean of all nine keyed workloads. Both sides read selected() on every row — same algorithm as official Solid 2.0."
      : "Geometric mean of the eight keyed workloads that use the same algorithm as official Solid 2.0. Select is listed separately when the two implementations differ.",
    select: selectSameApp
      ? "04_select1k reads selected() on every row on both sides."
      : "04_select1k is same-app when both sides read selected() on every row. A large gap usually means one side used createSelector.",
  },
  selectSameApp,
  sizes: {
    solid: {
      raw: solid.size.jsRaw,
      gzip: solid.size.jsGzip,
      brotli: solid.size.jsBrotli,
    },
    solidlil: {
      raw: lil.size.jsRaw,
      gzip: lil.size.jsGzip,
      brotli: lil.size.jsBrotli,
    },
  },
  cpu,
  memory,
}

await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`)
const size = site.jsFrameworkBenchmark.sizes
console.log(JSON.stringify({
  sizes: size,
  brotliReduction: (1 - size.solidlil.brotli / size.solid.brotli) * 100,
  cpu: site.jsFrameworkBenchmark.geomean,
}, null, 2))
