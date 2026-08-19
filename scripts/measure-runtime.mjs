import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { brotliCompressSync, constants, gzipSync } from "node:zlib"
import { build } from "esbuild"
import { minify } from "terser"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

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

async function bundle(contents) {
  const built = await build({
    stdin: {
      contents,
      resolveDir: root,
      loader: "js",
    },
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
  return minifyCode(built.outputFiles[0].text)
}

function reduction(solid, lil) {
  return {
    raw: (1 - lil.raw / solid.raw) * 100,
    gzip: (1 - lil.gzip / solid.gzip) * 100,
    brotli: (1 - lil.brotli / solid.brotli) * 100,
  }
}

export async function measureRuntime() {
  const solidClient = bytesOf(await bundle(`
export * from "solid-js"
export * from "@solidjs/web"
`))
  const lilWeb = bytesOf(await bundle(`
export * from "@itslil/solidjs/web"
`))
  const lilFull = bytesOf(await bundle(`
export * from "@itslil/solidjs/full"
`))
  return {
    method: "Vendor the whole client once. esbuild browser bundle of every export from solid-js + @solidjs/web versus @itslil/solidjs/web, then terser (3 passes). That is the runtime tax a Vite/React/Solid app pays before app modules.",
    solid: solidClient,
    solidlil: lilWeb,
    full: lilFull,
    reduction: reduction(solidClient, lilWeb),
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log(JSON.stringify(await measureRuntime(), null, 2))
}
