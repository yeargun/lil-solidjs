import { readFileSync, writeFileSync } from "node:fs";
import { createCtx, lowerJsxToLil } from "./lower.mjs";
import { parseJsx } from "./parse-jsx.mjs";

const DOM_IMPORTS = [
  "Element",
  "append",
  "appendComponentChildren",
  "attribute",
  "boolAttribute",
  "boolProperty",
  "childNodes",
  "classToggle",
  "cloneTemplate",
  "componentNode",
  "componentNodes",
  "componentProp",
  "componentProperty",
  "componentProps",
  "componentSpread",
  "createRenderEffect",
  "delay",
  "dynamicErrored",
  "dynamicForNodes",
  "dynamicForValue",
  "dynamicForValueNodes",
  "dynamicKeyedNodes",
  "dynamicKeyedValue",
  "dynamicIndexNodes",
  "dynamicLoading",
  "dynamicRepeat",
  "dynamicRepeatNodes",
  "dynamicShow",
  "dynamicSwitch",
  "dynamicText",
  "dynamicTextNode",
  "element",
  "every",
  "firstChild",
  "flattenNodeGroups",
  "fragment",
  "hostDocument",
  "materializeNodeGroup",
  "Math",
  "mathElement",
  "namespacedAttribute",
  "nextSibling",
  "nodeGroup",
  "onDelegatedClickVoid",
  "onDelegatedEvent",
  "onDelegatedEventVoid",
  "onEvent",
  "portalNodes",
  "prepareMathTemplate",
  "prepareSvgTemplate",
  "prepareTemplate",
  "query",
  "reactiveText",
  "region",
  "render",
  "reveal",
  "revealOrdered",
  "hydrate",
  "openRevealSlot",
  "revealAllowed",
  "revealSetReady",
  "revealShowFallback",
  "setText",
  "spreadProps",
  "stringProperty",
  "stopEvery",
  "svgElement",
  "text",
  "use",
  "DomEvent",
];

const REACTIVE_IMPORTS = [
  "Context",
  "Selector",
  "Signal",
  "createBoolSignal",
  "createContext",
  "createEffect",
  "createIntMemo",
  "createIntSignal",
  "beginAction",
  "createAsyncMemo",
  "createMemo",
  "createOptimisticSignal",
  "createSignal",
  "createUniqueId",
  "endAction",
  "inAction",
  "optimisticSet",
  "rememberOptimistic",
  "createSelector",
  "createStringSignal",
  "createUserEffect",
  "flush",
  "isPending",
  "latest",
  "onCleanup",
  "onSettled",
  "provideContext",
  "signalMarkPending",
  "untrack",
  "useContext",
];

const STORE_IMPORTS = ["Store", "createStore", "createProjection", "storeReconcile"];
const ASYNC_IMPORTS = ["delayString"];

export function compileLilx(
  source,
  {
    filename = "input.lilx",
    reactiveImport = "../../../src/reactive",
    storeImport = "../../../src/store",
    domImport = "../../../src/lsx",
    asyncImport = "../../../src/async",
  } = {},
) {
  const context = createCtx();
  const replacements = [];
  let index = 0;
  while (index < source.length) {
    const start = findJsxStart(source, index);
    if (start < 0) break;
    try {
      const { node, end } = parseJsx(source, start);
      const lowered = lowerJsxToLil(node, context);
      replacements.push({
        start,
        end,
        text: loweredExpression(lowered),
      });
      index = end;
    } catch (error) {
      error.message = `${filename}: ${error.message}`;
      throw error;
    }
  }

  let output = "";
  let cursor = 0;
  for (const replacement of replacements) {
    output += source.slice(cursor, replacement.start);
    output += replacement.text;
    cursor = replacement.end;
  }
  output += source.slice(cursor);
  output = output.replace(
    /import\s*\{[^}]*\}\s*from\s*["']solidlil["']\s*;?\s*/g,
    "",
  );

  const templates = context.templates.map((template) => {
    const helper =
      template.wrap === "svg"
        ? "prepareSvgTemplate"
        : template.wrap === "math"
          ? "prepareMathTemplate"
          : "prepareTemplate";
    return {
      line: `Element ${template.id} = ${helper}(${JSON.stringify(template.html)});`,
      names: ["Element", helper],
    };
  });
  const usedSource = `${output}\n${templates.flatMap((template) => template.names).join("\n")}`;
  const header = [
    namedImport(usedNames(REACTIVE_IMPORTS, usedSource), reactiveImport),
    namedImport(usedNames(STORE_IMPORTS, usedSource), storeImport),
    namedImport(usedNames(DOM_IMPORTS, usedSource), domImport),
    namedImport(usedNames(ASYNC_IMPORTS, usedSource), asyncImport),
    ...templates.map((template) => template.line),
  ]
    .filter(Boolean)
    .join("\n") + "\n";

  return `${header}${output}\n`;
}

function usedNames(names, source) {
  return names.filter((name) => new RegExp(`\\b${name}\\b`).test(source));
}

function namedImport(names, specifier) {
  if (names.length === 0) return "";
  return `import { ${names.join(", ")} } from ${JSON.stringify(specifier)};`;
}

function loweredExpression(lowered) {
  if (lowered.code.length === 1) {
    const match = lowered.code[0].match(
      /^Element \w+ = (cloneTemplate\(_tmpl\d+\));$/,
    );
    if (match && lowered.code[0].includes(` ${lowered.varName} = `)) {
      return match[1];
    }
  }
  return `( () => {\n${lowered.code.map((line) => `  ${line}`).join("\n")}\n  return ${lowered.varName};\n})()`;
}

function findJsxStart(source, from) {
  for (let index = from; index < source.length; index += 1) {
    if (source[index] !== "<") continue;
    const next = source[index + 1];
    if (!next || !/[A-Za-z]/.test(next)) continue;
    const before = source.slice(Math.max(0, index - 48), index);
    if (
      /(Signal|Map|Set|Array|func|Promise|createMemo|createSignal)\s*$/.test(
        before,
      )
    ) {
      continue;
    }
    if (
      /[A-Za-z0-9_]\s*$/.test(before) &&
      !/(return|=|\(|:|,)\s*$/.test(before)
    ) {
      continue;
    }
    return index;
  }
  return -1;
}

export function compileLilxFile(inputPath, outputPath, options) {
  const source = readFileSync(inputPath, "utf8");
  const output = compileLilx(source, { filename: inputPath, ...options });
  if (outputPath) writeFileSync(outputPath, output);
  return output;
}
