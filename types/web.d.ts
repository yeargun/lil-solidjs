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
export function hydrate(code: (() => unknown) | string, node?: Element | string, options?: object): () => void
export function hydrateNode(mount: Element, app: (root: Element) => void): () => void
export function insert(parent: Element, accessor: unknown, marker?: Node | null, current?: unknown): unknown
export function template(html: string, flag?: number): () => Element
export function Portal(props: { mount?: Element; children?: unknown }): unknown
export function Dynamic(props: { component?: unknown; [key: string]: unknown }): unknown
export function dynamic(source: () => unknown): (props: object) => unknown
export function clientOnly(fn: () => Promise<{ default: any }>, options?: { lazy?: boolean }): any
export function renderToString(code: () => unknown): string
export function renderToStream(code: () => unknown): ReadableStream<string>
export const isServer: boolean
export const isDev: boolean
export const HREF: symbol
export const SAFE_ERROR: symbol
export const RequestContext: symbol
export const REVALIDATE_HEADER: string
export const ChildProperties: Set<string>
export const DOMElements: Set<string>
export const DelegatedEvents: Set<string>
export const SVGElements: Set<string>
export const MathMLElements: Set<string>
export const VoidElements: Set<string>
export const RawTextElements: Set<string>
export const Namespaces: Record<string, string>
export const DOMWithState: Record<string, unknown>
export function spread(node: Element, accessor: unknown, skipChildren?: boolean): void
export function assign(node: Element, props: object, skipChildren?: boolean): object
export function setAttribute(node: Element, name: string, value: string): void
export function setAttributeNS(node: Element, namespace: string, name: string, value: string): void
export function className(node: Element, value: unknown): void
export function style(node: Element, value: object, prev?: object): void
export function addEvent(node: Element, name: string, handler: EventListener, delegate?: boolean): void
export function delegateEvents(eventNames: string[]): void
export function mergeProps(...sources: unknown[]): unknown
export function getHydrationKey(): string | undefined
export function getNextElement(factory?: () => Element): Element
export function getNextMatch(start: Node, elementName: string): Element
export function getNextMarker(start: Node): [Node, Node[]]
export function runHydrationEvents(): void
export function ssr(template: string | string[], ...values: unknown[]): string
export function ssrElement(tag: string, props?: object, children?: unknown, selfClose?: boolean): string
export function ssrAttribute(name: string, value: unknown): string
export function ssrClassName(value: unknown): string
export function ssrStyle(value: unknown): string
export function ssrStyleProperty(name: string, value: unknown): string
export function ssrHydrationKey(): string
export function ssrGroup(value: unknown): string
export function escape(text: unknown): string
export function httpStatus(code: number, text?: string): void
export function httpHeader(name: string, value: string, options?: { append?: boolean }): void
export function useHead(tag: unknown): void
export function parseCookieHeader(header?: string | null): Map<string, string>
export function serializeCookie(name: string, value: string, options?: object): string
export function redirect(url: string, status?: number): unknown
export function reveal(parent: Element, children: () => void): void
export function generateHydrationScript(): string
export function finishHydration(): void
