export function delayString(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

export function delayObject(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}
