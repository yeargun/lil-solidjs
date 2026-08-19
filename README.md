# @lil/solidjs

Solid 2.0’s client runtime, compiled with LilScript and published as `@lil/solidjs`. Source: [github.com/yeargun/lil-solidjs](https://github.com/yeargun/lil-solidjs).

**Official js-framework-benchmark keyed table: 68.4% smaller Brotli (11,420 B → 3,609 B) and 0.92× CPU versus Solid 2.0.** 18/18 paired browser demos also ship smaller after Brotli (76.3% smaller in total). Solid 2.0 on one side, **LSX** (LilScript JSX) on the other. Live apps, raw / gzip-9 / Brotli-11 sizes, and measured performance are on the **[solidlil demo lab](https://yeargun.github.io/solidlil/)**.

| Reproducible result | Solid 2.0 | `@lil/solidjs` | Ratio | Reduction |
| --- | ---: | ---: | ---: | ---: |
| [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) keyed table, JS Brotli-11 | 11,420 B | 3,609 B | 0.316× | **68.4%** |
| Same keyed table, raw JS | 33,701 B | 10,020 B | 0.297× | **70.3%** |
| 18 matching browser demos, Brotli total | 193,259 B | 45,801 B | 0.237× | **76.30%** |
| Median paired demo, Brotli | — | — | — | **79.22%** |
| Best paired demo (`store-cart`), Brotli | 16,105 B | 2,643 B | 0.164× | **83.59%** |

The keyed-table row is the fair app-sized comparison: both implementations are the official jumbotron + 1,000-row table. Solid’s JSX is compiled by the Solid Vite plugin; solidlil’s LSX is compiled by LilScript to the same `cloneNode` template style, then terser. The 18 demos are the same programs compiled as closed-world apps; they look even smaller because LilScript can delete unused runtime, while Solid 2.0’s npm browser entry is a pre-bundled `dist/solid.js` + `dist/web.js`.

Official [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) CPU, same machine, Chrome 151, 15 blocks, CPU throttling on. Same jumbotron table: Solid’s JSX and solidlil’s LSX both compile to `cloneNode` templates. Geometric mean of the nine keyed totals is **0.921×** Solid 2.0.

| Keyed workload | Solid 2.0 | @lil/solidjs | Ratio |
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
npm install @lil/solidjs
```

```js
import { createSignal, createMemo, createEffect, flush, createRoot } from "@lil/solidjs"

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

`@lil/solidjs` targets **Solid 2.0** (`solid-js@2.0.0-rc.0`, `@solidjs/web@2.0.0-rc.0`): queued writes until `flush()`, split `createEffect(compute, apply)`, `For` / `Repeat`, `Loading` / `Errored`, draft-first stores, `onSettled`, `isPending` / `latest`. There is no `batch`, `createResource`, or `startTransition`.

LilScript apps are written in **LSX** (`.lilx`) — JSX for LilScript — and compile closed-world (`import … from "solidlil"`). JavaScript consumers use the tuple helpers on the default entry. A DOM app should import only from `@lil/solidjs/web` so it shares one reactive graph; mixing `@lil/solidjs` with `@lil/solidjs/web` duplicates the runtime.

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
import { render, bindText, keyedEach, createIntSignal } from "@lil/solidjs/web"
```

## What “smaller” means

This is not a different tree-shaking trick on Solid’s side. A normal Solid 2.0 web build *is* a single bundled file — js-framework-benchmark’s keyed entries are Vite library mode + terser, `sideEffects: false`, the same as a typical app. The size gap is still large because **Solid 2.0 ships the browser runtime as already-concatenated files** (`solid-js/dist/solid.js` and `@solidjs/web/dist/web.js`). Rollup can drop unused *exports* from those files, but it cannot recover the fine-grained module graph Solid 1.9 had. Official keyed Solid **1.9** in the same harness is 11,563 B raw; Solid **2.0** is 33,701 B raw; solidlil LSX is 10,020 B raw.

The 18 lab demos are matching closed-world application builds of the same UI — official Solid 2.0 (JSX or TypeScript + Vite + terser) versus LSX — reported as **raw, gzip-9, and Brotli-11**. They overstate the gap relative to a full table app because a Solid 2.0 counter still carries most of that pre-bundled client. Use the js-framework-benchmark keyed row as the app-level number.

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
