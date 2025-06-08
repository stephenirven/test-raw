window.Prism = window.Prism || {};
window.Prism.manual = true;
sourceMap: window.sourceMap;
sourceMap.SourceMapConsumer.initialize({
  "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
});

const config = {
  babelOptions: {
    sourceType: "script",

    presets: [
      "es2015",
      // ["env", { debug: true, useBuiltIns: "entry", corejs: "3.41" }],
    ],
    sourceMaps: true,
    compact: false,
    minified: false,
  },
  prefixes: [
    // Polyfill for maps, sets & weakmaps https://github.com/anonyco/Javascript-Fast-Light-Map-WeakMap-Set-And-WeakSet-JS-Polyfill/tree/master
    `"undefined"!=typeof Map&&Map.prototype.keys&&"undefined"!=typeof Set&&Set.prototype.keys||function(){"use-strict";function t(t,e){if(e===e)return t.indexOf(e);for(i=0,n=t.length;t[i]===t[i]&&++i!==n;);return i}var e,i,n,r,s,o,h={"delete":function(i){return e=t(this.k,i),~e?(this.k.splice(e,1),this.v.splice(e,1),--this.size,!0):!1},get:function(e){return this.v[t(this.k,e)]},set:function(i,n){return e=t(this.k,i),~e||(this.k[e=this.size++]=i),this.v[e]=n,this},has:function(e){return t(this.k,e)>-1},clear:function(){this.k.length=this.v.length=this.size=0},forEach:function(t,e){e&&(t=t.bind(e));for(var i=-1,n=this.size;++i!==n;)t(this.v[i],this.k[i],this)},entries:function(){var t=0,e=this;return{next:function(){return t!==e.size?{value:[e.k[t++],e.v[t]],done:!1}:{done:!0}}}},keys:function(){var t=0,e=this;return{next:function(){return t!==e.size?{value:e.k[t++],done:!1}:{done:!0}}}},values:function(){var t=0,e=this;return{next:function(){return t!==e.size?{value:e.v[t++],done:!1}:{done:!0}}}},toString:function(){return"[object Map]"}};WeakMap=Map=function(e){if(r=this.k=[],s=this.v=[],n=0,void 0!==e&&null!==e){if(o=Object(e),i=+o.length,i!=i)throw new TypeError("("+(e.toString||o.toString)()+") is not iterable");for(;i--;){if(!(o[i]instanceof Object))throw new TypeError("Iterator value "+o[i]+" is not an entry object");~t(r,o[i][0])||(r[n]=o[i][0],s[n++]=o[i][1])}r.reverse(),s.reverse()}this.size=n},Map.prototype=h,WeakSet=Set=function(e){if(r=this.k=this.v=[],n=0,void 0!==e&&null!==e){if(o=Object(e),i=+o.length,i!=i)throw new TypeError("("+(e.toString||o.toString)()+") is not iterable");for(;i--;)~t(r,o[i])||(r[n++]=o[i]);r.reverse()}this.size=n},Set.prototype={"delete":function(i){return e=t(this.k,i),~e?(this.k.splice(e,1),--this.size,!0):!1},add:function(i){return e=t(this.k,i),~e||(e=this.size++),this.k[e]=i,this},has:h.has,clear:h.clear,forEach:h.forEach,entries:h.entries,keys:h.keys,values:h.keys,toString:function(){return"[object Set]"}}}();`,
  ],
  //  postfixes: [], // @TODO amend step function to make sure we don't trigger on ay postfix code.
  classReg:
    /(?:var[\s]+)(?<name>[\p{L}_$]+[\p{L}_$0-9]*).*__PURE__.*_createClass/gu,
  colorWheel: [
    "#F0A3FF",
    "#0075DC",
    "#993F00",
    "#4C005C",
    "#191919",
    "#005C31",
    "#2BCE48",
    "#FFCC99",
    "#808080",
    "#94FFB5",
    "#8F7C00",
    "#9DCC00",
    "#C20088",
    "#003380",
    "#FFA405",
    "#FFA8BB",
    "#426600",
    "#FF0010",
    "#5EF1F2",
    "#00998F",
    "#E0FF66",
    "#740AFF",
    "#990000",
    "#FFFF80",
    "#FFE100",
    "#FF5005",
  ],
};

function getColorForNumericId(id) {
  return config.colorWheel[id % config.colorWheel.length];
}

function getColorForName(name) {
  // hash function can return negative integers
  const id =
    ((sdbm(name) % config.colorWheel.length) + config.colorWheel.length) %
    config.colorWheel.length;

  return getColorForNumericId(id);
}
// Hashing function to get an integer represnetation of a string
function sdbm(str) {
  let arr = str.split("");
  return arr.reduce(
    (hashCode, currentVal) =>
      (hashCode =
        currentVal.charCodeAt(0) +
        (hashCode << 6) +
        (hashCode << 16) -
        hashCode),
    0
  );
}

// https://en.wikipedia.org/wiki/Help:Distinguishable_colors
// https://godsnotwheregodsnot.blogspot.com/2012/09/color-distribution-methodology.html

class ObjectPointer {
  constructor(id) {
    this.id = id;
  }
}

class VariableStore {
  constructor() {
    this.prev = {
      objects: new Map(),
      variables: new Map(),
      twoDrows: new Map(),
    };
    this.current = {
      objects: new Map(),
      variables: new Map(),
      twoDrows: new Map(),
    };

    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
  }
  reset() {
    this.prev = {
      objects: new Map(),
      variables: new Map(),
      twoDrows: new Map(),
    };
    this.current = {
      objects: new Map(),
      variables: new Map(),
      twoDrows: new Map(),
    };
  }

  hasChanges() {
    const objKeys = new Set(this.current.objects.keys());
    const prevObjKeys = new Set(this.prev.objects.keys());

    if (objKeys.difference(prevObjKeys).size > 0) return true;

    const varKeys = new Set(this.current.variables.keys());
    const prevVarKeys = new Set(this.prev.variables.keys());

    if (varKeys.difference(prevVarKeys).size > 0) return true;

    for (let key of objKeys) {
      const prev = this.prev.objects.get(key);
      const current = this.current.objects.get(key);

      if (!DeepEqual(prev, current)) {
        return true;
      }
    }

    for (let key of varKeys) {
      const prev = this.prev.variables.get(key);
      const current = this.current.variables.get(key);

      if (!DeepEqual(prev, current)) {
        return true;
      }
    }

    return false;
  }

  update() {
    this.prev = this.current;
    this.current = getVariables(state.interpreter.getScope().object);
  }
}

class StateManager {
  constructor() {
    this.variables = new VariableStore();
    this.classesToIgnore = [];
    this.skipConstructors = new Set();
    this.source = "";
    this.sourceMapConsumer = undefined;
    this.transpile = undefined;
    this.interpreter = undefined;
    this.locations = {
      prev: {
        start: { line: null, column: null },
        end: { line: null, column: null },
      },
      current: {
        start: { line: null, column: null },
        end: { line: null, column: null },
      },
    };
    this.prefixLength = 0;

    this.elements = {
      code_wrapper: document.getElementById("code-wrapper"),
      code_source: document.getElementById("code-source"),
      status: document.getElementById("status"),
    };
  }

  async getSample(sample) {
    if (sample.startsWith("http://") || sample.startsWith("https://")) {
      return fetch(sample)
        .then((response) => {
          if (response.status == 200) {
            return response;
          } else {
            return {
              text: () => "error loading sample: " + JSON.stringify(response),
            };
          }
        })
        .then((response) => response.text())
        .then((text) => {
          this.source = new DOMParser().parseFromString(
            text,
            "text/html"
          ).body.textContent;
          return this.source;
        })
        .then((source) => {
          this.elements.code_source.textContent = source;
          window.Prism.highlightElement(this.elements.code_source);
        });
    } else {
      this.source = new DOMParser().parseFromString(
        sample,
        "text/html"
      ).body.textContent;
      this.elements.code_source.textContent = this.source;
      window.Prism.highlightElement(this.elements.code_source);
    }
  }

  async parse() {
    this.transpile = Babel.transform(this.source, config.babelOptions);
    this.variables.reset();
    this.display(true);
    this.classesToIgnore = [
      ...this.transpile.code.matchAll(config.classReg),
    ].map((match) => match[1]);
    this.skipConstructors.clear();
    this.skipConstructors.add(...this.classesToIgnore);

    if (this.sourceMapConsumer != undefined) {
      this.sourceMapConsumer.destroy();
    }
    this.sourceMapConsumer = await new sourceMap.SourceMapConsumer(
      this.transpile.map
    );

    // prefix the code for any polyfills etc. Must not contain linefeeds to prevent misaligned line numbers

    const prefixCode = config.prefixes.join("");
    this.prefixLength = prefixCode.length;

    this.interpreter = new Interpreter(
      prefixCode + this.transpile.code,
      (interpreter, globalObject) => {
        const nativeFunctions = {
          alert: function (text) {
            return window.alert(arguments.length ? text : "");
          },
        };

        for (const [name, func] of Object.entries(nativeFunctions)) {
          interpreter.setProperty(
            globalObject,
            name,
            interpreter.createNativeFunction(func)
          );
        }

        interpreter.CONSOLE = interpreter.createNativeFunction(
          (_value, var_args) => this,
          false
        );
        interpreter["CONSOLE"] = interpreter.CONSOLE;
        interpreter.setProperty(
          globalObject,
          "console",
          interpreter.CONSOLE,
          Interpreter.NONENUMERABLE_DESCRIPTOR
        );

        // Static methods on console. Support log and table for debugging.
        // DO NOT ADD DOM METHODS HERE
        interpreter.setProperty(
          interpreter.CONSOLE,
          "log",
          interpreter.createNativeFunction(function (...args) {
            console.log(...args.map((a) => interpreter.pseudoToNative(a)));
          }, false),
          Interpreter.NONENUMERABLE_DESCRIPTOR
        );
        interpreter.setProperty(
          interpreter.CONSOLE,
          "table",
          interpreter.createNativeFunction(function (...args) {
            console.table(...args.map((a) => interpreter.pseudoToNative(a)));
          }, false),
          Interpreter.NONENUMERABLE_DESCRIPTOR
        );
      }
    );

    // append any code after the snippet
    //this.interpreter.appendCode(config.postfixes.join(""));
  }

  updateSourceLines({ start, end }) {
    const newStart = this.originalPositionFor(start);
    const newEnd = this.originalPositionFor(end);

    this.locations.prev = { ...this.locations.current };
    this.locations.current = {
      start: { line: newStart.line, column: newStart.column },
      end: { line: newEnd.line, column: newEnd.column },
    };
  }

  sourceLinesChanged() {
    const same =
      this.locations.current.start.line == this.locations.prev.start.line &&
      this.locations.current.end.line == this.locations.prev.end.line;
    return !same;
  }

  sourceLinesValid() {
    if (
      this.locations.current.start.line == null ||
      this.locations.current.end.line == null
    ) {
      return false;
    }
    return !DeepEqual(this.locations.current.start, this.locations.current.end);
  }
  getSourceLines() {
    return [this.locations.current.start.line, this.locations.current.end.line];
  }

  highlightSourceLines() {
    this.elements.code_wrapper.setAttribute(
      "data-line",
      this.getSourceLines().join("-")
    );
    window.Prism.highlightElement(this.elements.code_source);
  }

  highlightErrorLines(error) {
    this.elements.code_wrapper.removeAttribute("data-line");

    if (error?.location?.line != null) {
      const line =
        document.querySelector(".line-numbers-rows").children[
          error.location.line - 1
        ];

      line.classList.add("error-highlight");
    }
  }
  displayError(error) {
    if (error && typeof error == "string") {
      this.elements.status.innerText = error;
    } else if (error && typeof error == "object") {
      this.elements.status.innerText = JSON.stringify(error);
    } else {
      this.elements.status.innerText = "";
    }
  }

  display(regardless = false) {
    if (regardless || this.variables.hasChanges) {
      const dot = visualizeDot(this.variables.current);
      console.log(dot);
      var graphviz = d3
        .select("#visualisation")
        .graphviz()
        .transition(function () {
          return d3.transition("main").ease(d3.easeLinear).duration(200);
        })
        .on("initEnd", render);

      function render() {
        console.time("graph");
        graphviz.renderDot(dot);
        console.timeEnd("graph");
        disable("");
      }
    }
  }

  originalPositionFor({ line, column }) {
    return this.sourceMapConsumer.originalPositionFor({
      line: line,
      column: column,
    });
  }
}

const state = new StateManager();

state.getSample(
  "https://raw.githubusercontent.com/stephenirven/test-raw/refs/heads/main/samples/js/linked-list/reverse.js"
);

async function parseButton() {
  state.displayError();
  await state.parse();
  disable("");
}

function tryStep() {
  try {
    var ok = state.interpreter.step();
    var error;
  } finally {
    if (!ok) {
      if (state.interpreter.value?.stack) {
        const [message, location] =
          state.interpreter.value?.stack?.split("at code:");

        const [trans_line, trans_column] = location.split(":").map(Number);

        const errorLocation = state.sourceMapConsumer.originalPositionFor({
          line: trans_line,
          column: trans_column,
        });
        error = {
          message: message,
          location: errorLocation,
        };
        console.log("ERROR", error);
      }

      disable("disabled");
    }
    return [ok, error];
  }
}

function stepButton() {
  //disable("disabled");

  let stack = state.interpreter.getStateStack();
  let node = stack[stack.length - 1].node;
  let ok = true;
  while (
    state.interpreter.getStatus() == Interpreter.Status.STEP &&
    ok &&
    (!state.sourceLinesValid() || !state.sourceLinesChanged() || !isLine(stack))
  ) {
    [ok, error] = tryStep();
    stack = state.interpreter.getStateStack();

    node = stack[stack.length - 1].node;
    state.updateSourceLines({ start: node.loc.start, end: node.loc.end });
  }

  if (ok) {
    const status = Object.keys(Interpreter.Status).find(
      (key) => Interpreter.Status[key] === state.interpreter.getStatus()
    );
    state.displayError(`Status: ${status}`);
  } else {
    state.highlightErrorLines(error);
    state.displayError();
  }

  state.highlightSourceLines();

  //const head = state.interpreter.getValueFromScope("head"); // TODO - Add traces for specific variables

  state.variables.update();
  state.display();

  if (error) {
    state.highlightErrorLines(error);
    state.displayError(error);
  }
}

// Is the current stack at the beginning of a new line?
function isLine(stack) {
  var currentState = stack[stack.length - 1];
  var node = currentState.node;
  var type = node.type;

  // If the code is in the prefix, ignore it
  if (node.loc.end.line == 1 && node.loc.end.column < state.prefixLength) {
    return false;
  }

  if (
    stack.filter((frame) => {
      return (
        frame.isConstructor &&
        state.skipConstructors.has(frame.node?.callee?.name)
      );
    }).length > 0
  ) {
    return false;
  }

  if (type !== "VariableDeclaration" && type.substr(-9) !== "Statement") {
    // Current node is not a statement.
    return false;
  }

  if (type === "BlockStatement") {
    // Not a 'line' by most definitions.
    return false;
  }

  if (
    type === "VariableDeclaration" &&
    stack[stack.length - 2].node.type === "ForStatement"
  ) {
    // This 'var' is not a line: for (var i = 0; ...)
    return false;
  }

  if (isLine.oldStack_[isLine.oldStack_.length - 1] === currentState) {
    // Never repeat the same statement multiple times.
    // Typically a statement is stepped into and out of.
    return false;
  }

  if (
    isLine.oldStack_.indexOf(currentState) !== -1 &&
    type !== "ForStatement" &&
    type !== "WhileStatement" &&
    type !== "DoWhileStatement"
  ) {
    // Don't revisit a statement on the stack (e.g. 'if') when exiting.
    // The exception is loops.
    return false;
  }

  isLine.oldStack_ = stack.slice();
  return true;
}
isLine.oldStack_ = [];

function runButton() {
  disable("disabled");
  if (state.interpreter.run()) {
    // Async function hit.  There's more code to run.
    setTimeout(runButton, 100);
  }
}

function disable(disabled) {
  document.getElementById("stepButton").disabled = disabled;
}

function is2DRectArray(object) {
  if (!(object instanceof Array)) return false;

  if (!(object[0] instanceof Array)) return false;
  const length = object[0].length;

  if (
    !object.every((row) => {
      if (!(row instanceof Array)) return false;
      if (row.length != length) return false;

      return row.every((col) => {
        if (col instanceof Object) return false;
        return true;
      });
    })
  )
    return false;

  return true;
}

function buildObjects(input, skipTypes, skipNames) {
  if (typeof input != "object" || !(input instanceof Interpreter.Object)) {
    return;
  }

  const twoDrows = new Map();
  const nativeObjects = new Map();

  for (let key of Object.keys(input.properties)) {
    const currentObject = input.properties[key];
    if (
      currentObject &&
      typeof currentObject == "object" &&
      !key.startsWith("_") &&
      !skipNames.has(key) &&
      !skipTypes.has(currentObject.class)
    ) {
      let cycle = {
        pseudo: [],
        native: [],
      };
      const nativeObj = state.interpreter.pseudoToNative(
        currentObject,
        cycle,
        true
      );

      for (let obj of cycle.native) {
        const id = obj.__uniqueid;
        if (!nativeObjects.has(id)) {
          if (is2DRectArray(obj)) {
            for (let row in obj) {
              // We have special rendering for two dimensional arrays
              twoDrows.set(obj[row].__uniqueid, `${id}:${row}`);
            }
          }
          nativeObjects.set(id, obj);
        }
      }
    }
  }

  return { objects: nativeObjects, twoDrows: twoDrows };
}

function GetRange(text, start, end) {
  if (
    start.line == null ||
    start.column == null ||
    end.line == null ||
    end.column == null
  ) {
    return "";
  }

  let lines = text.split("\n");
  lines = lines.slice(start.line - 1, end.line); // positions are 1 indexed. slice end is exclusive
  lines[0] = lines[0].slice(start.column);
  lines[lines.length - 1] = lines[lines.length - 1].slice(0, end.column + 1);
  return lines.join("\n");
}

function getBodyText(nativeObj) {
  const start = state.sourceMapConsumer.originalPositionFor({
    line: nativeObj.bodyLoc.start.line,
    column: nativeObj.bodyLoc.start.column,
  });
  const end = state.sourceMapConsumer.originalPositionFor({
    line: nativeObj.bodyLoc.end.line,
    column: nativeObj.bodyLoc.end.column,
  });

  return start && end ? GetRange(state.source, start, end) : "";
}

function getVariables(scopeObj) {
  let variables = new Map();
  const skipNames = new Set([
    ...state.classesToIgnore,
    "this",
    "arguments",
    "self",
    "window",
    "WeakMap",
    "WeakSet",
    "Map",
    "Set",
    "alert",
  ]);
  const skipTypes = new Set([]);

  // const n = state.interpreter.getValueFromScope("n"); // TODO - Add traces for specific variables

  const { objects, twoDrows } = buildObjects(scopeObj, skipTypes, skipNames);

  for (let key of Object.keys(scopeObj.properties)) {
    if (skipNames.has(key)) continue;
    if (key.startsWith("_")) continue;

    const val = scopeObj.properties[key];

    if (typeof val == "object" && val != null && val != undefined) {
      if (skipTypes.has(val.class)) {
        continue;
      }
      variables.set(key, new ObjectPointer(val.__uniqueid));
    } else {
      variables.set(key, val);
    }
  }

  return { objects: objects, twoDrows: twoDrows, variables: variables };
}

function DeepEqual(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => DeepEqual(x[key], y[key]))
    : x === y;
}

function DotEscapeString(data) {
  if (
    data instanceof Symbol ||
    data instanceof String ||
    typeof data == "string"
  ) {
    return data.replace(
      /[\u00A0-\u9999<>\&]/g,
      (i) => "&#" + i.charCodeAt(0) + ";"
    );
  }
  return data;
}

function toDot(id, currentObject, variables) {
  const type = currentObject.constructor.name;
  const color = getColorForNumericId(id);

  const relationshipMarkup = [];

  const attrs = [];

  const labels = [];
  switch (type) {
    case "Function":
      const bodyText = DotEscapeString(getBodyText(currentObject));
      labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;
      labels.push(
        `<TR><TD>${DotEscapeString(
          currentObject.functionName
        )}(${DotEscapeString(
          currentObject.params.join(",")
        )})</TD><TD>${bodyText}</TD></TR>`
      );
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);
      break;
    case "String":
    case "RegExp":
    case "Error":
      labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;
      labels.push(
        `<TR><TD>${type}</TD><TD>${DotEscapeString(
          currentObject.toString()
        )}</TD></TR>`
      );
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);
      break;
    case "Date":
      labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;
      labels.push(
        `<TR><TD>${type}</TD><TD>${DotEscapeString(
          currentObject.toISOString()
        )}</TD></TR>`
      );
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);
      break;
    case "Set":
      labels.push(
        `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
      );
      labels.push(`<TR><TD>${type}(${currentObject.size})</TD></TR>`);
      currentObject.forEach((value) => {
        if (
          (typeof value == "object" || typeof value == "function") &&
          value != null
        ) {
          relationshipMarkup.push(
            `${id} -> ${value.__uniqueid}:w [color="${color}", fontcolor="${color}" label="has" decorate="true"]`
          );
        } else {
          labels.push(`<TR><TD>${DotEscapeString(value)}</TD></TR>`);
        }
      });
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);
      break;
    case "Array":
    case "Map":
      if (is2DRectArray(currentObject)) {
        labels.push(
          `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
        );
        cols = [];
        for (let i = 0; i < currentObject[0].length; i++) {
          cols.push(`<TD>#${i}</TD>`);
        }
        labels.push(`<TR><TD>2D</TD>${cols.join("")}</TR>`);
        currentObject.forEach((row, key) => {
          const r = row.map((x) => `<TD>${x}</TD>`).join("");
          labels.push(
            `<TR><TD PORT="${DotEscapeString(key)}">#${DotEscapeString(
              key
            )}</TD>${r}</TR>`
          );
        });
        labels.push(`</TABLE>`);
        attrs.push(`label=<${labels.join("")}>`);
        break;
      } else {
        const length =
          type == "Array" ? currentObject.length : currentObject.size;

        labels.push(
          `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
        );
        labels.push(`<TR><TD COLSPAN="2">${type}(${length})</TD></TR>`);

        currentObject.forEach((value, key) => {
          if (
            (typeof value == "object" || typeof value == "function") &&
            value != null
          ) {
            labels.push(
              `<TR><TD>#${DotEscapeString(key)}</TD><TD PORT="${DotEscapeString(
                key
              )}">object</TD></TR>`
            );
            relationshipMarkup.push(
              `"${DotEscapeString(id)}":"${DotEscapeString(key)}":e -> ${
                value.__uniqueid
              }:w [color="${color}" fontcolor="${color}" decorate="true" headlabel="${DotEscapeString(
                key
              )}"]`
            );
          } else {
            labels.push(
              `<TR><TD>#${key}</TD><TD PORT="${DotEscapeString(
                key
              )}">${DotEscapeString(value)}</TD></TR>`
            );
          }
        });
      }
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);

      break;
    case "WeakSet":
    case "WeakMap":
      labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;
      labels.push(`<TR><TD>${type}</TD><TD>Not renderable</TD></TR>`);
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);
      break;
    default:
      labels.push(
        `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
      );
      labels.push(`<TR><TD COLSPAN="2">${type}(${length})</TD></TR>`);
      Object.getOwnPropertyNames(currentObject).forEach((key) => {
        const currentProperty = currentObject[key];
        if (
          (typeof currentProperty == "object" ||
            typeof currentProperty == "function") &&
          currentProperty != null
        ) {
          relationshipMarkup.push(
            `"${DotEscapeString(id)}":"${DotEscapeString(key)}":e -> ${
              currentProperty.__uniqueid
            }:w [color="${color}" fontcolor="${color}" decorate="true" headlabel="${DotEscapeString(
              key
            )}"]`
          );

          labels.push(
            `<TR><TD>#${DotEscapeString(key)}</TD><TD PORT="${DotEscapeString(
              key
            )}">object</TD></TR>`
          );
        } else if (key != "__uniqueid") {
          labels.push(
            `<TR><TD>#${DotEscapeString(key)}</TD><TD PORT="${DotEscapeString(
              key
            )}">${DotEscapeString(currentObject[key])}</TD></TR>`
          );
        }
      });
      labels.push(`</TABLE>`);
      attrs.push(`label=<${labels.join("")}>`);
  }
  attrs.push(`tooltip="${DotEscapeString(type)}"`);

  attrs.push(`color="${color}"`);
  attrs.push(`fillcolor="${color}"`);

  let objectMarkup = `"${id}" [${attrs.join(" ")}]`;

  return {
    objectMarkup: objectMarkup,
    relationshipMarkup: relationshipMarkup,
  };
}

function visualizeDot({ objects, twoDrows, variables }) {
  const objs = [];
  const rels = [];
  const styles = [];

  const objVars = new Map();
  variables.keys().forEach((name) => {
    const val = variables.get(name);

    const color = getColorForName(name);

    const displayName = DotEscapeString(name);
    const displayTooltip = `Variable ${displayName}`;
    if (typeof val == "object" && val != null) {
      const id = val.id;

      objs.push(
        `"${displayName}"[shape="signature" color="${color}" label="${displayName}" tooltip="${displayTooltip}"]`
      );
      if (twoDrows.has(id)) {
        rels.push(`"${displayName}":e -> ${twoDrows.get(id)}`);
      } else {
        rels.push(`"${displayName}":e -> ${id}`);
      }
    } else {
      objs.push(
        `"${displayName}"[shape="signature" color="${color}" label="${displayName}: ${
          val ? val.toString() : val
        }" tooltip="${displayTooltip}"]`
      );
    }
  });

  objects.keys().forEach((id) => {
    if (twoDrows.has(id)) {
      return; // don't include objects that are already rendered in a 2d graph
    }
    const currentObject = objects.get(id);

    const objVariables = objVars.has(id) ? Array.from(objVars.get(id)) : [];
    const { objectMarkup, relationshipMarkup } = toDot(
      id,
      currentObject,
      objVariables
    );

    objs.push(objectMarkup);
    if (relationshipMarkup.length > 0) {
      rels.push(...relationshipMarkup);
    }
  });

  return `
  digraph structs {
      nodesep=0.5;
      ranksep=1;
      margin="1.5,0.5";
      rankdir=LR;
      packMode="graph";
      tooltip="state visualisation";
      labeljust=l;

      node [shape=plaintext ordering="out"];
      edge [arrowhead="none"];

      ${objs.join("\n") + "\n" + rels.join("\n") + "\n" + styles.join("\n")}

  }
    `;
}
