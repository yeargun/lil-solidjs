export * from "./index"

export function createSignal<T>(initial: T, equals: (previous: T, next: T) => boolean): unknown
export function render(selector: string, app: (root: Element) => void): () => void
export function renderNode(mount: Element, app: (root: Element) => void): () => void
export function element(tag: string): Element
export function svgElement(tag: string): Element
export function text(value: string): Element
export function bindText(node: Element, compute: () => string): void
export function bindValue(node: Element, compute: () => string): void
export function bindChecked(node: Element, compute: () => boolean): void
export function bindClass(node: Element, name: string, compute: () => boolean): void
export function bindAttribute(node: Element, name: string, compute: () => string): void
export function bindStyle(node: Element, name: string, compute: () => string): void
export function onClick(node: Element, handler: () => void): void
export function onInput(node: Element, handler: () => void): void
export function keyedEach<T>(
  parent: Element,
  items: () => T[],
  keyOf: (item: T) => number,
  createRow: (item: T, index: unknown) => Element,
): void
export function identityEach<T>(
  parent: Element,
  items: () => T[],
  createRow: (item: T, index: unknown) => Element,
): void
export function indexEach<T>(
  parent: Element,
  items: () => T[],
  createRow: (item: unknown, index: number) => Element,
): void
export function repeat(parent: Element, count: () => number, createRow: (index: number) => Element): void
export function show(
  parent: Element,
  when: () => boolean,
  children: () => Element,
  fallback: () => Element,
): void
export function portal(target: Element, children: () => Element): void
export function loading(parent: Element, ready: () => void, fallback: () => Element): void
export function errored(
  parent: Element,
  children: () => void,
  fallback: (message: string, reset: () => void) => Element,
): void
