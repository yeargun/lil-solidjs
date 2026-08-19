# @itslil/solidjs

Solid 2.0’s client runtime, compiled with LilScript and published as `@itslil/solidjs`. Source: [github.com/yeargun/lil-solidjs](https://github.com/yeargun/lil-solidjs).

**Official [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) keyed table: 67.7% smaller Brotli (11,180 B → 3,606 B)** and **1.04×** CPU across all nine same-app workloads. That is one Vite + terser app — Solid’s client plus the jumbotron — not a reconstructed `export *` vendor. Live apps, raw / gzip-9 / Brotli-11 sizes, and measured performance are on the **[solidlil demo lab](https://yeargun.github.io/solidlil/)**. The paired browser demos are closed-world LSX extras, not the typical ship.

| Reproducible result | Solid 2.0 | `@itslil/solidjs` | Ratio | Reduction |
| --- | ---: | ---: | ---: | ---: |
| [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) keyed table, JS Brotli-11 | 11,180 B | 3,606 B | 0.323× | **67.7%** |
| Same keyed table, gzip-9 | 12,318 B | 4,059 B | 0.330× | **67.0%** |
| Same keyed table, raw JS | 32,159 B | 9,814 B | 0.305× | **69.5%** |

The size that matters is the official keyed app: one vendor chunk plus that table, Solid JSX versus LSX, both `cloneNode` templates, then terser. A named-import `solid-js` bundle without the app is already ~10 kB Brotli; `export *` is ~35 kB because it keeps unused `@solidjs/signals` modules. Neither is a substitute for the JFB payload. Closed-world demo totals count Solid’s client once per file and let LilScript delete unused runtime; they overstate the gap.

Official [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) CPU, same machine, Chrome 151, 15 blocks, CPU throttling on. Same jumbotron table: Solid’s JSX and solidlil’s LSX both compile to `cloneNode` templates, and both read `selected()` on every row. Geometric mean of all nine workloads is **1.04×** Solid 2.0.

| Keyed workload | Solid 2.0 | @itslil/solidjs | Ratio |
| --- | ---: | ---: | ---: |
| Create 1,000 rows | 25.5 ms | 26.3 ms | 1.03× |
| Replace 1,000 rows | 29.1 ms | 31.7 ms | 1.09× |
| Update every 10th ×16 | 19.2 ms | 18.4 ms | **0.96×** |
| Select a row | 9.1 ms | 8.9 ms | **0.98×** |
| Swap two rows | 21.0 ms | 21.2 ms | 1.01× |
| Remove one row | 15.3 ms | 15.4 ms | 1.01× |
| Create 10,000 rows | 288.2 ms | 326.9 ms | 1.13× |
| Append 1,000 ×2 | 30.5 ms | 33.1 ms | 1.09× |
| Clear 1,000 ×8 | 13.4 ms | 14.8 ms | 1.10× |
| JS Brotli-11 | 11,180 B | 3,606 B | **0.32×** |
| JS raw | 32,159 B | 9,814 B | **0.31×** |
| Ready memory | 1.16 MB | 1.07 MB | **0.92×** |
| Memory with 1,000 rows | 3.18 MB | 4.07 MB | 1.28× |
| Memory after five create/clear cycles | 1.47 MB | 2.18 MB | 1.49× |

```sh
npm install @itslil/solidjs
```

```js
import { createSignal, createMemo, createEffect, flush, createRoot } from "@itslil/solidjs"

createRoot(() => {
  const [count, setCount] = createSignal(0)
  const doubled = createMemo(() => count() * 2)

  createEffect(
    () => doubled(),
    (value) => console.log(value),
  )

  setCount(1)
  flush()
})
```

## Compatibility

`@itslil/solidjs` is the Solid 2.0 **client** (`solid-js@2.0.0-rc.0`, `@solidjs/web@2.0.0-rc.0`): every public export, including `flush`, split `createEffect`, `For` / `Repeat` / `Show` / `Switch` / `Reveal`, `Loading` / `Errored`, stores, `createProjection` / `reconcile`, `action` / `createOptimistic`, `hydrate` (claims existing DOM), `renderToString` / `renderToStream`, `lazy`, `children`, and the rest of the 2.0 authoring surface. LSX `hydrate()` / `<Reveal>` compile to the same Lil primitives. Solid 2.0 dropped `batch`, `createResource`, and `startTransition`; we match that. Official JFB still measures `render()` of the same keyed table on both sides.

LilScript apps are written in **LSX** (`.lilx`) — JSX for LilScript — and compile closed-world (`import … from "solidlil"`). JavaScript consumers use the tuple helpers on the default entry. A DOM app should import only from `@itslil/solidjs/web` so it shares one reactive graph; mixing `@itslil/solidjs` with `@itslil/solidjs/web` duplicates the runtime.

```lil
import { Signal, append, createIntSignal, render } from "solidlil";

func()->void dispose = render("#app", (Element root) => {
  Signal<int> count = createIntSignal(0);
  Element view = (
    <button type="button" onClick={() => { count.write(count.read() + 1); }}>
      {`Count ${count.read()}`}
    </button>
  );
  append(root, view);
});
```

```js
import { render, bindText, keyedEach, createIntSignal } from "@itslil/solidjs/web"
```

## Why smaller

The JFB cut is not “Vite property-mangled Solid harder,” and it is not a thinner API. Solid 2.0 already shortens internal keys when it publishes `@solidjs/signals`. Extra Terser `mangle.properties` on the keyed app saves a couple hundred Brotli bytes. The remaining gap is how the same client is represented.

**Owned fields become slots.** Solid’s graph is objects — [core.ts](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-signals/src/core/core.ts), [owner.ts](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-signals/src/core/owner.ts) — so a signal still has many named fields (`e.se`, `e.Ne`) after `^_` mangling. LilScript structs in [reactive.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/reactive.lil) lower to `e[0]`, `e[1]` under [lilscript.closed.toml](https://github.com/yeargun/lil-solidjs/blob/main/src/lilscript.closed.toml) (`public_aggregate_abi = "positional"`). `extern class` DOM names stay. Terser cannot prove ownership.

**Same templates, thinner For.** Both jumbotrons compile to `cloneNode` HTML. Solid JSX uses [`template().cloneNode`](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-web/src/index.ts) and [`For`](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid/src/client/flow.ts). LSX does the same in [lilx/lower.mjs](https://github.com/yeargun/lil-solidjs/blob/main/tooling/lilx/lower.mjs) → [web.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/web.lil) `keyedEach` / [lsx.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/lsx.lil). Compare [JFB Solid JSX](https://github.com/yeargun/lil-solidjs/blob/main/benchmarks/js-framework-benchmark/keyed/solid-v2/src/main.jsx) with [JFB LSX](https://github.com/yeargun/lil-solidjs/blob/main/benchmarks/js-framework-benchmark/keyed/solidlil/src/main.lilx).

**Same flush, same pending.** The port is the 2.0 authoring surface: microtask `flush`, split effects, `For` / `Reveal` / `Loading`, stores, `createProjection`, `action` / `createOptimistic`, `isPending` / `latest`, `hydrate`. Solid’s [scheduler.ts](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-signals/src/core/scheduler.ts) is the flush; ours is `pendingWrites` and `flush()` in [reactive.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/reactive.lil). Solid’s [async.ts](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-signals/src/core/async.ts) is NotReady plus pending; ours is the same verbs in [web.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/web.lil). Official JFB calls `render()` on both sides.

**Tree-shaking is the fair size.** Solid sizes a shaken app (`sideEffects: false`). Official JFB is that method — one vendor chunk plus the jumbotron. Unfair: `export *`, adding published flat `web.js`, or summing the lab iframes (that counts Solid once per file). Lil closed-world DCE can drop more than Vite can prove unused; Solid keeps promise/`createMemo` async rails in every Solid build. Those APIs still exist here. The lab’s Async 2.0 pairs exercise them.

**Tooling.** [LilScript](https://github.com/yeargun/lilscript) types the program and searches JS against Brotli ([show-hn](https://github.com/yeargun/lilscript/blob/main/docs/show-hn.md), [mangle / ABI](https://github.com/yeargun/lilscript/blob/main/docs/configuration.md)). **LSX** (`.lilx`) is JSX for that language: [parse-jsx.mjs](https://github.com/yeargun/lil-solidjs/blob/main/tooling/lilx/parse-jsx.mjs) then `lower.mjs`. The [lab](https://yeargun.github.io/solidlil/) hero is official JFB. The paired iframes are closed-world extras. `npm install @itslil/solidjs` is the reusable ESM vendor chunk, not those demos summed.

## What “smaller” means

A normal client app vendors the framework once, then adds modules. The number on this page is that model: official js-framework-benchmark. Official keyed Solid **1.9** is 11,563 B raw; Solid **2.0** is 32,159 B raw / 11,180 B Brotli-11; `@itslil/solidjs` LSX is 9,814 B raw / 3,606 B Brotli-11.

The lab demos are closed-world LSX builds of the same UI. They are not how a typical Solid or React app is shipped. Use the js-framework-benchmark keyed row.

CPU is not inferred from size. The lab’s Playwright medians (`npm run bench:perf`) are a small demo; the krausest harness (throttled Chrome, 15 blocks) is the number that should be compared to other frameworks.

The reusable package ESM is a different artifact from those app builds. `npm run test:size` prints package and named-import sizes.

## Build pipeline

Keep `solidlil` next to a LilScript checkout, or point at a release compiler:

```sh
npm ci
SOLIDLIL_LILSCRIPT_BIN=/path/to/lilscript npm run build
npm run build:apps
npm run bench:perf
npm run check
```

Set `SOLIDLIL_BUILD_MODE=development` for a faster local library build. Production is the default. `SOLIDLIL_SKIP_BROWSER=1` skips Playwright if Chromium is not installed.

## Verification

```sh
npm test           # Node reactivity + Vite consumer bundle
npm run check      # tests, TypeScript declarations, Pages artifact, npm tarball
npm run test:size  # package raw/gzip/brotli report
npm run build:site # GitHub Pages lab
```

The implementation is MIT licensed. See [NOTICE.md](./NOTICE.md) for upstream attribution.
