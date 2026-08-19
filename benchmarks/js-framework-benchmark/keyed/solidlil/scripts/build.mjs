import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const frameworkRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function findSolidlilRoot(start) {
  if (process.env.SOLIDLIL_ROOT) return resolve(process.env.SOLIDLIL_ROOT)
  let current = resolve(start)
  while (true) {
    if (
      existsSync(join(current, "src", "reactive.lil")) &&
      existsSync(join(current, "src", "lsx.lil")) &&
      existsSync(join(current, "tooling", "lilx", "compile.mjs"))
    ) {
      return current
    }
    const parent = dirname(current)
    if (parent === current) {
      throw new Error("solidlil root not found; set SOLIDLIL_ROOT")
    }
    current = parent
  }
}

const solidlilRoot = findSolidlilRoot(frameworkRoot)
const compilerCandidates = [
  process.env.SOLIDLIL_LILSCRIPT_BIN,
  join(solidlilRoot, "../lilscript/target/release/lilscript"),
  "lilscript",
].filter(Boolean)
const compiler = compilerCandidates.find((candidate) => {
  if (candidate.includes("/") && !existsSync(candidate)) return false
  return spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0
})
if (!compiler) throw new Error("LilScript compiler not found")
const { minify } = createRequire(join(solidlilRoot, "package.json"))("terser")

function lilImport(fromFile, target) {
  let value = relative(dirname(fromFile), target).replaceAll("\\", "/")
  if (!value.startsWith(".")) value = `./${value}`
  return value
}

const { compileLilxFile } = await import(
  `file://${join(solidlilRoot, "tooling", "lilx", "compile.mjs")}`
)

const entry = join(frameworkRoot, "src", "main.lilx")
const generated = join(frameworkRoot, "src", ".generated.lil")
compileLilxFile(entry, generated, {
  filename: entry,
  reactiveImport: lilImport(generated, join(solidlilRoot, "src", "reactive")),
  storeImport: lilImport(generated, join(solidlilRoot, "src", "store")),
  domImport: lilImport(generated, join(solidlilRoot, "src", "lsx")),
  asyncImport: lilImport(generated, join(solidlilRoot, "src", "async")),
})

const dist = join(frameworkRoot, "dist")
await mkdir(dist, { recursive: true })
const out = join(dist, "main.js")
const result = spawnSync(
  compiler,
  [
    generated,
    "--target",
    "js-module",
    "--config",
    join(solidlilRoot, "src", "lilscript.closed.toml"),
    "--mode",
    "production",
    "--output",
    out,
  ],
  { cwd: solidlilRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
)
await rm(generated, { force: true })
if (result.status !== 0) {
  throw new Error(`solidlil jsfb compile failed\n${result.stderr || result.stdout}`)
}

const minified = await minify(await readFile(out, "utf8"), {
  module: true,
  compress: { passes: 3 },
  mangle: { toplevel: true },
  format: { comments: false },
})
if (!minified.code) throw new Error("Terser produced no code")
await writeFile(out, `${minified.code}\n`)
console.log(`built ${out} (${Buffer.byteLength(minified.code)} bytes)`)
