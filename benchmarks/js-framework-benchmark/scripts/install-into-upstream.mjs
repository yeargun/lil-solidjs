import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const solidlilRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const sourceRoot = join(solidlilRoot, "benchmarks", "js-framework-benchmark", "keyed")
const defaultUpstream = resolve(solidlilRoot, "../lilscript/benchmarks/js-framework-benchmark/upstream")
const upstreamRoot = resolve(process.env.JSFB_UPSTREAM ?? defaultUpstream)

const copies = [
  ["solid-v2", "solid-v2"],
  ["solidlil", "solidlil-v2"],
]

mkdirSync(join(upstreamRoot, "frameworks", "keyed"), { recursive: true })
for (const [from, to] of copies) {
  const destination = join(upstreamRoot, "frameworks", "keyed", to)
  rmSync(destination, { recursive: true, force: true })
  cpSync(join(sourceRoot, from), destination, {
    recursive: true,
    filter: (source) => basename(source) !== "node_modules",
  })
  console.log(`copied ${from} -> ${destination}`)
}

if (!existsSync(join(upstreamRoot, "css", "currentStyle.css"))) {
  console.warn("upstream css/currentStyle.css missing; clone js-framework-benchmark first")
}
