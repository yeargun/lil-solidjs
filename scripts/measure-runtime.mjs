import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { brotliCompressSync, constants, gzipSync } from "node:zlib"
import { build } from "esbuild"
import { minify } from "terser"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const entries = join(root, "scripts", "runtime-entries")

function bytesOf(source) {
  const input = Buffer.isBuffer(source) ? source : Buffer.from(source)
  return {
    raw: input.length,
    gzip: gzipSync(input, { level: 9 }).length,
    brotli: brotliCompressSync(input, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
  }
}

function reduction(solid, lil) {
  return {
    raw: (1 - lil.raw / solid.raw) * 100,
    gzip: (1 - lil.gzip / solid.gzip) * 100,
    brotli: (1 - lil.brotli / solid.brotli) * 100,
  }
}

async function minifyCode(code) {
  const result = await minify(code, {
    module: true,
    compress: { passes: 3, pure_getters: true },
    mangle: { toplevel: true },
    format: { comments: false },
  })
  if (!result.code) throw new Error("Terser produced no code")
  return result.code
}

async function vendor(entry) {
  const built = await build({
    entryPoints: [join(entries, entry)],
    absWorkingDir: root,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    conditions: ["browser", "import"],
    legalComments: "none",
    treeShaking: true,
    minify: false,
    write: false,
  })
  return bytesOf(await minifyCode(built.outputFiles[0].text))
}

export async function measureRuntime() {
  const solidClient = await vendor("solid.js")
  const lilWeb = await vendor("solidlil.js")
  if (solidClient.brotli > 20000) {
    throw new Error(
      `Solid runtime Brotli ${solidClient.brotli} B is not a real Vite client. export * from solid-js keeps unused @solidjs/signals modules.`,
    )
  }
  return {
    method: "esbuild browser bundle + terser of the named DOM APIs a Vite Solid app actually vendors (createSignal, createMemo, createEffect, createRoot, flush, For, Show, render). Not export * — that keeps unused @solidjs/signals and is ~35 kB Brotli, which no real Solid 2.0 app ships. Lil is the published @itslil/solidjs/web graph.",
    solid: solidClient,
    solidlil: lilWeb,
    reduction: reduction(solidClient, lilWeb),
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log(JSON.stringify(await measureRuntime(), null, 2))
}
