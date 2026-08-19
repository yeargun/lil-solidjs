import { createSignal, flush } from "@itslil/solidjs"

const [count, setCount] = createSignal(0)
setCount(1)
flush()
document.documentElement.dataset.result = count() === 1 ? "solidlil-ok" : "fail"
