import { createSignal, flush } from "@lil/solidjs"

const [count, setCount] = createSignal(0)
setCount(1)
flush()
document.documentElement.dataset.result = count() === 1 ? "solidlil-ok" : "fail"
