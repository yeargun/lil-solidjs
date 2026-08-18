# solidlil

Solid 2.0’s client runtime, ported to LilScript and published as the dependency-free `solidlil` package.

**14/14 paired browser demos ship smaller after Brotli: 82.7% smaller in total, 83.3% median, and up to 87.3% smaller.** Demos are Solid 2.0 JSX on one side and **LSX** (LilScript JSX) on the other. Live side-by-side apps, raw / gzip-9 / Brotli-11 sizes, and measured performance are on the **[solidlil demo lab](https://yeargun.github.io/solidlil/)**.

| Reproducible result | Solid 2.0 | LilScript / `solidlil` | Ratio | Reduction |
| --- | ---: | ---: | ---: | ---: |
| 14 matching browser demos, Brotli total | 156,227 B | 26,985 B | 0.173× | **82.73%** |
| Median paired demo, Brotli | — | — | — | **83.28%** |
| Best paired demo (`store-cart`), Brotli | 16,865 B | 2,147 B | 0.127× | **87.27%** |
| Keyed create 1,000 (Playwright median) | 54.0 ms | 56.8 ms | 1.05× | — |

The browser figures are matching closed-world builds from the 14-case lab — official Solid 2.0 JSX versus the same program in LSX — not a comparison between unmatched entry points.

```sh
npm install solidlil
```

```js
import { createSignal, createMemo, createEffect, flush, createRoot } from "solidlil"

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

`solidlil` targets **Solid 2.0** (`solid-js@2.0.0-rc.0`, `@solidjs/web@2.0.0-rc.0`): queued writes until `flush()`, split `createEffect(compute, apply)`, `For` / `Repeat`, `Loading` / `Errored`, draft-first stores, `onSettled`, `isPending` / `latest`. There is no `batch`, `createResource`, or `startTransition`.

LilScript apps are written in **LSX** (`.lilx`) — JSX for LilScript — and compile closed-world. JavaScript consumers use the tuple helpers on the default entry.

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
import { createSignal, flush } from "solidlil"
import { render, bindText, keyedEach } from "solidlil/web"
import { createIntSignal } from "solidlil/full"
```

## What “smaller” means

Demo figures are matching closed-world application builds — not a comparison between unmatched entry points. Every case reports **raw, gzip-9, and Brotli-11** bytes. Performance is measured separately (`npm run bench:perf`): Node signal/memo/effect loops against `@solidjs/signals@2.0.0-rc.0`, and Playwright medians for keyed create 1,000 / update / swap / clear versus `solid-js` + `@solidjs/web`.

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
