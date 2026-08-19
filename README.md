# @itslil/solidjs

Solid 2.0’s client runtime, compiled with LilScript and published as `@itslil/solidjs`. Source: [github.com/yeargun/lil-solidjs](https://github.com/yeargun/lil-solidjs).

**Official [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) keyed table: 68.4% smaller Brotli (11,420 B → 3,609 B)** and **0.99×** CPU on the eight same-app workloads. That is one Vite + terser app — Solid’s client plus the jumbotron — not a reconstructed `export *` vendor. Live apps, raw / gzip-9 / Brotli-11 sizes, and measured performance are on the **[solidlil demo lab](https://yeargun.github.io/solidlil/)**. 18 paired browser demos are closed-world LSX extras, not the typical ship.

| Reproducible result | Solid 2.0 | `@itslil/solidjs` | Ratio | Reduction |
| --- | ---: | ---: | ---: | ---: |
| [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) keyed table, JS Brotli-11 | 11,420 B | 3,609 B | 0.316× | **68.4%** |
| Same keyed table, gzip-9 | 12,546 B | 4,077 B | 0.325× | **67.5%** |
| Same keyed table, raw JS | 33,701 B | 10,020 B | 0.297× | **70.3%** |

The size that matters is the official keyed app: one vendor chunk plus that table, Solid JSX versus LSX, both `cloneNode` templates, then terser. A named-import `solid-js` bundle without the app is already ~10 kB Brotli; `export *` is ~35 kB because it keeps unused `@solidjs/signals` modules. Neither is a substitute for the JFB payload. Closed-world demo totals count Solid’s client once per file and let LilScript delete unused runtime; they overstate the gap.

Official [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) CPU, same machine, Chrome 151, 15 blocks, CPU throttling on. Same jumbotron table: Solid’s JSX and solidlil’s LSX both compile to `cloneNode` templates. Same-app geometric mean of the eight matching workloads is **0.99×** Solid 2.0. The nine-workload geomean is 0.92× only because that run used `createSelector` for select; Solid 2.0’s official entry reads `selected()` on every row.

| Keyed workload | Solid 2.0 | @itslil/solidjs | Ratio |
| --- | ---: | ---: | ---: |
| Create 1,000 rows | 25.8 ms | 26.6 ms | 1.03× |
| Replace 1,000 rows | 29.6 ms | 29.2 ms | **0.99×** |
| Update every 10th ×16 | 18.7 ms | 17.6 ms | **0.94×** |
| Select a row | 8.9 ms | 4.6 ms | **0.52×** |
| Swap two rows | 21.5 ms | 20.8 ms | **0.97×** |
| Remove one row | 14.7 ms | 14.6 ms | **0.99×** |
| Create 10,000 rows | 287.0 ms | 294.2 ms | 1.03× |
| Append 1,000 ×2 | 30.6 ms | 32.2 ms | 1.05× |
| Clear 1,000 ×8 | 13.7 ms | 12.7 ms | **0.93×** |
| JS Brotli-11 | 11,420 B | 3,609 B | **0.32×** |
| JS raw | 33,701 B | 10,020 B | **0.30×** |
| Ready memory | 1.16 MB | 1.06 MB | **0.92×** |
| Memory with 1,000 rows | 3.18 MB | 4.12 MB | 1.29× |
| Memory after five create/clear cycles | 1.46 MB | 2.16 MB | 1.48× |

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

`@itslil/solidjs` targets **Solid 2.0** (`solid-js@2.0.0-rc.0`, `@solidjs/web@2.0.0-rc.0`): queued writes until `flush()`, split `createEffect(compute, apply)`, `For` / `Repeat` / `Show` / `Switch`, `Loading` / `Errored`, draft-first stores, `onSettled`, `isPending` / `latest`, promise memos, `action`, `createOptimistic` / `createOptimisticStore`, `lazy`, `children`, `createUniqueId`, `runWithOwner`. Solid 2.0 dropped `batch`, `createResource`, and `startTransition`; we match that. Official JFB measures `render()` on both sides.

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

**Same flush, same pending.** Solid’s [scheduler.ts](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-signals/src/core/scheduler.ts) is microtask flush plus effect queues; ours is `pendingWrites` / render / user / settled and `flush()` in [reactive.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/reactive.lil). Solid’s [async.ts](https://github.com/solidjs/solid/blob/v2.0.0-rc.0/packages/solid-signals/src/core/async.ts) is NotReady plus pending; ours is `asyncPending`, `isPending`, `latest`, `action`, `createOptimistic`, and `<Loading>` in [web.lil](https://github.com/yeargun/lil-solidjs/blob/main/src/web.lil). Official JFB calls `render()` on both sides. That number is the same client app.

**Tooling.** [LilScript](https://github.com/yeargun/lilscript) types the program and searches JS against Brotli ([show-hn](https://github.com/yeargun/lilscript/blob/main/docs/show-hn.md), [mangle / ABI](https://github.com/yeargun/lilscript/blob/main/docs/configuration.md)). **LSX** (`.lilx`) is JSX for that language: [parse-jsx.mjs](https://github.com/yeargun/lil-solidjs/blob/main/tooling/lilx/parse-jsx.mjs) then `lower.mjs`. The [lab](https://yeargun.github.io/solidlil/) hero is official JFB. The 18 paired iframes are closed-world extras — they delete unused runtime per file and overstate the gap. `npm install @itslil/solidjs` is the reusable ESM vendor chunk, not those demos summed.

## What “smaller” means

A normal client app vendors the framework once, then adds modules. The number on this page is that model: official js-framework-benchmark. Official keyed Solid **1.9** is 11,563 B raw; Solid **2.0** is 33,701 B raw / 11,420 B Brotli-11; `@itslil/solidjs` LSX is 10,020 B raw / 3,609 B Brotli-11.

The 18 lab demos are closed-world LSX builds of the same UI. They are not how a typical Solid or React app is shipped. Use the js-framework-benchmark keyed row.

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
