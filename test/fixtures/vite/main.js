import { createSignal, flush } from "solidlil"

const [count, setCount] = createSignal(0)
setCount(1)
flush()
document.documentElement.dataset.result = count() === 1 ? "solidlil-ok" : "fail"
