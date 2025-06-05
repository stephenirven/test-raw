window.Prism = window.Prism || {};
window.Prism.manual = true;

// https://en.wikipedia.org/wiki/Help:Distinguishable_colors
const colorWheel = [
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
];

// https://godsnotwheregodsnot.blogspot.com/2012/09/color-distribution-methodology.html
// const colorWheel = [
//   "#000000",
//   "#FFFF00",
//   "#1CE6FF",
//   "#FF34FF",
//   "#FF4A46",
//   "#008941",
//   "#006FA6",
//   "#A30059",
//   "#FFDBE5",
//   "#7A4900",
//   "#0000A6",
//   "#63FFAC",
//   "#B79762",
//   "#004D43",
//   "#8FB0FF",
//   "#997D87",
//   "#5A0007",
//   "#809693",
//   "#FEFFE6",
//   "#1B4400",
//   "#4FC601",
//   "#3B5DFF",
//   "#4A3B53",
//   "#FF2F80",
//   "#61615A",
//   "#BA0900",
//   "#6B7900",
//   "#00C2A0",
//   "#FFAA92",
//   "#FF90C9",
//   "#B903AA",
//   "#D16100",
//   "#DDEFFF",
//   "#000035",
//   "#7B4F4B",
//   "#A1C299",
//   "#300018",
//   "#0AA6D8",
//   "#013349",
//   "#00846F",
//   "#372101",
//   "#FFB500",
//   "#C2FFED",
//   "#A079BF",
//   "#CC0744",
//   "#C0B9B2",
//   "#C2FF99",
//   "#001E09",
//   "#00489C",
//   "#6F0062",
//   "#0CBD66",
//   "#EEC3FF",
//   "#456D75",
//   "#B77B68",
//   "#7A87A1",
//   "#788D66",
//   "#885578",
//   "#FAD09F",
//   "#FF8A9A",
//   "#D157A0",
//   "#BEC459",
//   "#456648",
//   "#0086ED",
//   "#886F4C",
//   "#34362D",
//   "#B4A8BD",
//   "#00A6AA",
//   "#452C2C",
//   "#636375",
//   "#A3C8C9",
//   "#FF913F",
//   "#938A81",
//   "#575329",
//   "#00FECF",
//   "#B05B6F",
//   "#8CD0FF",
//   "#3B9700",
//   "#04F757",
//   "#C8A1A1",
//   "#1E6E00",
//   "#7900D7",
//   "#A77500",
//   "#6367A9",
//   "#A05837",
//   "#6B002C",
//   "#772600",
//   "#D790FF",
//   "#9B9700",
//   "#549E79",
//   "#FFF69F",
//   "#201625",
//   "#72418F",
//   "#BC23FF",
//   "#99ADC0",
//   "#3A2465",
//   "#922329",
//   "#5B4534",
//   "#FDE8DC",
//   "#404E55",
//   "#0089A3",
//   "#CB7E98",
//   "#A4E804",
//   "#324E72",
//   "#6A3A4C",
// ];

class ObjectPointer {
  constructor(id) {
    this.id = id;
  }
}

class VariableStore {
  constructor() {
    this.prev = {
      objects: new Map(),
      containers: [],
      variables: new Map(),
    };
    this.current = {
      objects: new Map(),
      containers: [],
      variables: new Map(),
    };

    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
    this.display = this.display.bind(this);
  }
  reset() {
    this.prev = {
      objects: new Map(),
      containers: [],
      variables: new Map(),
    };
    this.current = {
      objects: new Map(),
      containers: [],
      variables: new Map(),
    };

    this.display();
  }

  shouldRender() {
    const objKeys = new Set(this.current.objects.keys());
    const prevObjKeys = new Set(this.prev.objects.keys());

    if (objKeys.difference(prevObjKeys).size > 0) return true;

    const varKeys = new Set(this.current.variables.keys());
    const prevVarKeys = new Set(this.prev.variables.keys());

    if (varKeys.difference(prevVarKeys).size > 0) return true;

    for (let key of objKeys) {
      const prev = this.prev.objects.get(key);
      const current = this.current.objects.get(key);

      if (!deepEqual(prev, current)) {
        return true;
      }
    }

    for (let key of varKeys) {
      const prev = this.prev.variables.get(key);
      const current = this.current.variables.get(key);

      if (!deepEqual(prev, current)) {
        return true;
      }
    }

    return false;
  }

  update() {
    this.prev = this.current;
    this.current = getVariables(myInterpreter.getScope().object);

    if (this.shouldRender) this.display();
  }

  display() {
    const visjs = visualizeDot(this.current);

    var graphviz = d3
      .select("#visualisation")
      .graphviz()
      .transition(function () {
        return d3.transition("main").ease(d3.easeLinear).duration(200);
      })
      .on("initEnd", render);

    function render() {
      console.time("graph");
      graphviz.renderDot(visjs);
      console.timeEnd("graph");
      disable("");
    }
  }
}

const variablesVals = new VariableStore();
let classesToIgnore = [];

function SupportedContainer(obj) {
  switch (obj.constructor.name) {
    case "Array":
      return true;
    case "Map":
      return true;
    case "Set":
      return true;
  }
  return false;
}

function Renderable(obj) {
  switch (obj.constructor.name) {
    case "WeakMap":
      return false;
    case "WeakSet":
      return false;
  }
  return true;
}

function isKeyValContainer(obj) {
  switch (obj.constructor.name) {
    case "Array":
      return true;
    case "Map":
      return true;
  }
  return false;
}

function isValContainer(obj) {
  switch (obj.constructor.name) {
    case "Set":
      return true;
  }
  return false;
}

const shapes = new Map([
  ["Array", "subproc"],
  ["Map", "lin-rect"],
  ["WeakMap", "lin-rect"],
  ["Set", "win-pane"],
  ["WeakSet", "win-pane"],
]);
function shape(obj) {
  const t = obj.constructor.name;
  if (shapes.has(t)) return shapes.get(t);

  return "rect";
}

async function getSample() {
  return fetch(
    "https://raw.githubusercontent.com/stephenirven/test-raw/main/samples/list-reverse.js"
  )
    .then((response) => {
      if (response.status == 200) {
        return response;
      } else {
        console.log("error", response);
        return {
          text: () => "error loading sample: " + JSON.stringify(response),
        };
      }
    })
    .then((response) => response.text())
    .then(
      (text) =>
        new DOMParser().parseFromString(text, "text/html").body.textContent
    );
}

const sourceMap = window.sourceMap;
sourceMap.SourceMapConsumer.initialize({
  "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
});

let source = "";

getSample()
  .then((body) => {
    const element = document.getElementById("code-source");
    element.textContent = body;
    return element;
  })
  .then((el) => window.Prism.highlightElement(el));

let transpile;

let myInterpreter;
let sourceMapConsumer;

function initNativeFunctions(interpreter, globalObject) {
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

  this.CONSOLE = this.createNativeFunction((_value, var_args) => this, false);
  this["CONSOLE"] = this.CONSOLE;
  this.setProperty(
    globalObject,
    "console",
    this.CONSOLE,
    Interpreter.NONENUMERABLE_DESCRIPTOR
  );

  // Static methods on console. Support log and table for debugging.
  // DO NOT ADD DOM METHODS HERE
  this.setProperty(
    this.CONSOLE,
    "log",
    this.createNativeFunction(function (...args) {
      console.log(...args.map((a) => myInterpreter.pseudoToNative(a)));
    }, false),
    Interpreter.NONENUMERABLE_DESCRIPTOR
  );
  this.setProperty(
    this.CONSOLE,
    "table",
    this.createNativeFunction(function (...args) {
      console.table(...args.map((a) => myInterpreter.pseudoToNative(a)));
    }, false),
    Interpreter.NONENUMERABLE_DESCRIPTOR
  );
}

async function parseButton() {
  variablesVals.reset();

  source = document.getElementById("code-source").innerText;

  const babelOptions = {
    sourceType: "script",

    presets: [
      "es2015",
      // ["env", { debug: true, useBuiltIns: "entry", corejs: "3.41" }],
    ],
    sourceMaps: true,
    compact: false,
    minified: false,
  };

  transpile = Babel.transform(source, babelOptions);

  sourceMapConsumer = await new sourceMap.SourceMapConsumer(transpile.map);

  //mappy.destroy();

  // prefix the code for any polyfills etc. Must not contain linefeeds to prevent misaligned line numbers
  const prefixes = [
    // Polyfill for maps, sets & weakmaps https://github.com/anonyco/Javascript-Fast-Light-Map-WeakMap-Set-And-WeakSet-JS-Polyfill/tree/master
    `"undefined"!=typeof Map&&Map.prototype.keys&&"undefined"!=typeof Set&&Set.prototype.keys||function(){"use-strict";function t(t,e){if(e===e)return t.indexOf(e);for(i=0,n=t.length;t[i]===t[i]&&++i!==n;);return i}var e,i,n,r,s,o,h={"delete":function(i){return e=t(this.k,i),~e?(this.k.splice(e,1),this.v.splice(e,1),--this.size,!0):!1},get:function(e){return this.v[t(this.k,e)]},set:function(i,n){return e=t(this.k,i),~e||(this.k[e=this.size++]=i),this.v[e]=n,this},has:function(e){return t(this.k,e)>-1},clear:function(){this.k.length=this.v.length=this.size=0},forEach:function(t,e){e&&(t=t.bind(e));for(var i=-1,n=this.size;++i!==n;)t(this.v[i],this.k[i],this)},entries:function(){var t=0,e=this;return{next:function(){return t!==e.size?{value:[e.k[t++],e.v[t]],done:!1}:{done:!0}}}},keys:function(){var t=0,e=this;return{next:function(){return t!==e.size?{value:e.k[t++],done:!1}:{done:!0}}}},values:function(){var t=0,e=this;return{next:function(){return t!==e.size?{value:e.v[t++],done:!1}:{done:!0}}}},toString:function(){return"[object Map]"}};WeakMap=Map=function(e){if(r=this.k=[],s=this.v=[],n=0,void 0!==e&&null!==e){if(o=Object(e),i=+o.length,i!=i)throw new TypeError("("+(e.toString||o.toString)()+") is not iterable");for(;i--;){if(!(o[i]instanceof Object))throw new TypeError("Iterator value "+o[i]+" is not an entry object");~t(r,o[i][0])||(r[n]=o[i][0],s[n++]=o[i][1])}r.reverse(),s.reverse()}this.size=n},Map.prototype=h,WeakSet=Set=function(e){if(r=this.k=this.v=[],n=0,void 0!==e&&null!==e){if(o=Object(e),i=+o.length,i!=i)throw new TypeError("("+(e.toString||o.toString)()+") is not iterable");for(;i--;)~t(r,o[i])||(r[n++]=o[i]);r.reverse()}this.size=n},Set.prototype={"delete":function(i){return e=t(this.k,i),~e?(this.k.splice(e,1),--this.size,!0):!1},add:function(i){return e=t(this.k,i),~e||(e=this.size++),this.k[e]=i,this},has:h.has,clear:h.clear,forEach:h.forEach,entries:h.entries,keys:h.keys,values:h.keys,toString:function(){return"[object Set]"}}}();`,
    // object uniqueId - used to help map to specific objects when serialising variables https://stackoverflow.com/questions/1997661/unique-object-identifier-in-javascript
    `(function(){if(typeof Object.id!="undefined")return;var id=0;Object.id=function(o){if(typeof o.__uniqueid!="undefined"){return o.__uniqueid;}Object.defineProperty(o,"__uniqueid",{value:++id,enumerable:false,writable:false});return o.__uniqueid;};})();`,
  ];

  const classReg =
    /(?:var[\s]+)(?<name>[\p{L}_$]+[\p{L}_$0-9]*).*__PURE__.*_createClass/gu;
  classesToIgnore = [...transpile.code.matchAll(classReg)].map(
    (match) => match[1]
  );

  myInterpreter = new Interpreter(
    prefixes.join("") + transpile.code,
    initNativeFunctions
  );

  const postfixes = [];
  // append any code after the snippet
  myInterpreter.appendCode(postfixes.join(""));

  myInterpreter.skipConstructors = new Set(classesToIgnore);

  disable("");
}

function tryStep() {
  try {
    var ok = myInterpreter.step();
    var error;
  } finally {
    if (!ok) {
      if (myInterpreter.value?.stack) {
        const [message, location] =
          myInterpreter.value?.stack?.split("at code:");

        const [trans_line, trans_column] = location.split(":").map(Number);

        const errorLocation = sourceMapConsumer.originalPositionFor({
          line: trans_line,
          column: trans_column,
        });
        error = {
          message: message,
          location: errorLocation,
        };
      }

      disable("disabled");
    }
    return [ok, error];
  }
}

function stepButton() {
  disable("disabled");

  const code_wrapper = document.getElementById("code-wrapper");
  const code_source = document.getElementById("code-source");

  let source_lines = [null, null];
  let prev_source_lines = [null, null];

  let stack = myInterpreter.getStateStack();
  let node = stack[stack.length - 1].node;
  let ok = true;
  while (
    myInterpreter.getStatus() == Interpreter.Status.STEP &&
    ok &&
    (!isLine(stack) ||
      source_lines.includes(null) ||
      (source_lines[0] == prev_source_lines[0] &&
        source_lines[1] == prev_source_lines[1]))
  ) {
    [ok, error] = tryStep();
    stack = myInterpreter.getStateStack();

    node = stack[stack.length - 1].node;
    prev_source_lines[0] = source_lines[0];
    prev_source_lines[1] = source_lines[1];
    if (ok) {
      const start = sourceMapConsumer.originalPositionFor({
        line: node.loc.start.line,
        column: node.loc.start.column,
      });
      const end = sourceMapConsumer.originalPositionFor({
        line: node.loc.end.line,
        column: node.loc.end.column,
      });
      source_lines = [start.line, end.line];

      code_wrapper.removeAttribute("data-error");
      code_wrapper.setAttribute("data-line", source_lines.join("-"));
    } else {
      code_wrapper.removeAttribute("data-line");
      console.log(error);
      code_wrapper.setAttribute(
        "data-error",
        error.location.line + "-" + error.location.column
      );
    }
  }

  window.Prism.highlightElement(code_source);

  //const head = myInterpreter.getValueFromScope("head"); // TODO - Add traces for specific variables

  variablesVals.update();

  if (error) {
    document.getElementById("error").innerText = JSON.stringify(error);

    if (error.location.line != null) {
      const line =
        document.querySelector(".line-numbers-rows").children[
          error.location.line - 1
        ];

      line.classList.add("error-highlight");
    }
  }
}

// Is the current stack at the beginning of a new line?
function isLine(stack) {
  var state = stack[stack.length - 1];
  var node = state.node;
  var type = node.type;

  if (
    stack.filter((frame) => {
      return (
        frame.isConstructor &&
        myInterpreter.skipConstructors.has(frame.node?.callee?.name)
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

  if (isLine.oldStack_[isLine.oldStack_.length - 1] === state) {
    // Never repeat the same statement multiple times.
    // Typically a statement is stepped into and out of.
    return false;
  }

  if (
    isLine.oldStack_.indexOf(state) !== -1 &&
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
  if (myInterpreter.run()) {
    // Async function hit.  There's more code to run.
    setTimeout(runButton, 100);
  }
}

function disable(disabled) {
  document.getElementById("stepButton").disabled = disabled;
}

function buildObjects(input, skipTypes, skipNames) {
  if (typeof input != "object" || !(input instanceof Interpreter.Object)) {
    return;
  }

  const nativeObjects = new Map();
  const nativeContainers = []; // keep track of these separately to help with layout

  for (let key of Object.keys(input.properties)) {
    const currentObject = input.properties[key];
    if (
      currentObject &&
      typeof currentObject == "object" &&
      !skipNames.has(key) &&
      !skipTypes.has(currentObject.class)
    ) {
      let cycle = {
        pseudo: [],
        native: [],
      };
      const real_o = myInterpreter.pseudoToNative(currentObject, cycle);

      for (let obj of cycle.native) {
        const id = obj.__uniqueid;
        //delete obj.__uniqueid;
        nativeObjects.set(id, obj);
        if (SupportedContainer(obj)) {
          nativeContainers.push(id);
        }
      }
    }
  }
  return { objects: nativeObjects, containers: nativeContainers };
}

function getVariables(scopeObj) {
  let variables = new Map();
  const skipNames = new Set([
    ...classesToIgnore,
    "this",
    "arguments",
    "self",
    "window",
  ]);
  const skipTypes = new Set(["Function"]);

  // const n = myInterpreter.getValueFromScope("n"); // TODO - Add traces for specific variables
  // console.log("N:", n);
  // console.log(scopeObj["n"]);

  const { objects, containers } = buildObjects(scopeObj, skipTypes, skipNames);

  for (let key of Object.keys(scopeObj.properties)) {
    if (skipNames.has(key)) continue;

    const val = scopeObj.properties[key];

    if (typeof val == "object" && val != null && val != undefined) {
      if (skipTypes.has(val.class)) {
        continue;
      }

      variables.set(
        key,
        new ObjectPointer(myInterpreter.pseudoToNative(val).__uniqueid)
      );
    } else {
      variables.set(key, val);
    }
  }

  return { objects: objects, containers: containers, variables: variables };
}

function deepEqual(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
}

function getObjectDiff(original, current) {
  const changes = {};

  // Check current object's properties
  for (const [key, value] of Object.entries(current)) {
    if (!(key in original)) {
      changes[key] = {
        oldValue: undefined,
        newValue: value,
      };
      continue;
    }

    const originalValue = original[key];
    const currentValue = value;

    // Handle different types of comparisons
    if (
      originalValue !== currentValue &&
      String(originalValue) !== String(currentValue) &&
      JSON.stringify(originalValue) !== JSON.stringify(currentValue)
    ) {
      changes[key] = {
        oldValue: originalValue,
        newValue: currentValue,
      };
    }
  }

  // Check for removed properties
  for (const key of Object.keys(original)) {
    if (!(key in current)) {
      changes[key] = {
        oldValue: original[key],
        newValue: undefined,
      };
    }
  }

  return Object.keys(changes).length === 0 ? null : changes;
}

function toMermaid(id, currentObject, variables) {
  const type = currentObject.constructor.name;
  const objectMarkup = [];
  const relationshipMarkup = [];

  switch (type) {
    case "String":
    case "RegExp":
    case "Error":
      objectMarkup.push(`${type}: ${currentObject.toString()}`);
      break;
    case "Date":
      objectMarkup.push(`${type}: ${currentObject.toISOString()}`);
      break;
    case "Set":
      objectMarkup.push(
        `${currentObject.constructor.name}: size: ${currentObject.size}`
      );
      currentObject.forEach((value) => {
        if (typeof value == "object" && value != null) {
          relationshipMarkup.push(id + ` --> |has| ${value.__uniqueid}`);
        } else {
          objectMarkupProps.push(`${value}`);
        }
      });
      break;
    case "Array":
    case "Map":
      objectMarkup.push(
        `${currentObject.constructor.name}: length ${currentObject.length}`
      );
      currentObject.forEach((value, key) => {
        if (typeof value == "object" && value != null) {
          objectMarkup.push(`${key}: object`);
          relationshipMarkup.push(id + ` --> |${key}| ${value.__uniqueid}`);
        } else {
          objectMarkup.push(`${key}: ${value}`);
        }
      });
      break;
    case "WeakSet":
    case "WeakMap":
      objectMarkup.push(`${currentObject.constructor.name}: Not renderable`);
      break;
    default:
      Object.getOwnPropertyNames(currentObject).forEach((property) => {
        if (
          typeof currentObject[property] == "object" &&
          currentObject[property] != null
        ) {
          relationshipMarkup.push(
            id + ` --> |${property}| ${currentObject[property].__uniqueid}`
          );
          linksFromObject.push(relationshipMarkup.length - 1);
          objectMarkup.push(`${property}: object`);
        } else if (property != "__uniqueid") {
          objectMarkup.push(`${property}: ${currentObject[property]}`);
        }
      });
  }

  let objRecord = id + "(" + objectMarkup.join("\n") + ")";
  objRecord += `\n${id}@{ shape: ${shape(currentObject)} }`;

  if (variables && variables.length) {
    objRecord = `subgraph ${variables.join(" - ")}\n${objRecord}\nend`;
  }

  return {
    objectMarkup: objRecord,
    relationshipMarkup: relationshipMarkup,
  };
}

function visualizeMermaid({ objects, containers, variables }) {
  // TODO: strip / escape characters for valid markup

  const objs = [];
  const rels = [];
  const styles = [];

  const objVars = new Map();
  const vars = [];
  variables.keys().forEach((name) => {
    const val = variables.get(name);
    vars.push(`${name}: ${val}`);
    if (typeof val == "object" && val != null) {
      const id = val.id;
      if (!objVars.has(id)) {
        objVars.set(id, new Set([name]));
      } else {
        objVars.get(id).add(name);
      }
    }
  });

  objects.keys().forEach((id) => {
    const currentObject = objects.get(id);
    const color = colorWheel[id % colorWheel.length];

    const linksFromObject = [];
    const objectMarkupProps = [];

    const objVariables = objVars.has(id) ? Array.from(objVars.get(id)) : [];
    const { objectMarkup, relationshipMarkup } = toMermaid(
      id,
      currentObject,
      objVariables
    );

    objs.push(objectMarkup);

    if (relationshipMarkup.length > 0) {
      rels.push(...relationshipMarkup);
      const links = [];
      for (let i = 0; i < relationshipMarkup.length; i++) {
        links.push(rels.length - 1 - i);
      }
      styles.push(
        `linkStyle ${links.join(
          ","
        )} color:black,line-height: 2rem,font-weight:800,text-decoration:underline overline,text-decoration-color:${color},text-decoration-thickness:5px,stroke:${color},stroke-width:3px`
      );
    }
  });

  objs.push(`variables@{ shape: braces, label: "${vars.join("\n")}" }`);
  //  rels.push("start ~~~ variables");
  for (let i = 0; i < containers.length - 1; i++) {
    rels.push(`${containers[i]} ~~~ ${containers[i + 1]}`);
  }
  return (
    "flowchart LR\n" +
    objs.join("\n") +
    "\n" +
    rels.join("\n") +
    "\n" +
    styles.join("\n")
  );
}

function toDot(id, currentObject, variables) {
  const type = currentObject.constructor.name;
  const color = colorWheel[id % colorWheel.length];

  const relationshipMarkup = [];

  const attrs = [];

  const labels = [];
  switch (type) {
    case "String":
    case "RegExp":
    case "Error":
      attrs.push(`label="${type}: ${currentObject.toString()}"`);
      break;
    case "Date":
      attrs.push(`label="${type}: ${currentObject.toISOString()}"`);
      break;
    case "Set":
      labels.push(`{${type}(${currentObject.size})}`);
      currentObject.forEach((value) => {
        if (typeof value == "object" && value != null) {
          relationshipMarkup.push(
            `${id} -> ${value.__uniqueid}:w [color="${color}", fontcolor="${color}" decorate="true"]`
          );
        } else {
          labels.push(`{${value}}`);
        }
      });
      attrs.push(`label="${labels.join("|")}"`);
      break;
    case "Array":
    case "Map":
      const length =
        type == "Array" ? currentObject.length : currentObject.size;
      labels.push(`{${type}(${length})}`);

      currentObject.forEach((value, key) => {
        if (typeof value == "object" && value != null) {
          labels.push(`{${key}|<${key}>object}`);
          relationshipMarkup.push(
            `${id}:${key}:e -> ${value.__uniqueid}:w [color="${color}" fontcolor="${color}" decorate="true" headlabel="${key}"]`
          );
        } else {
          labels.push(`{${key}|<${key}>${value}}`);
        }
      });
      attrs.push(`label="${labels.join("|")}"`);
      break;
    case "WeakSet":
    case "WeakMap":
      attrs.push(`label="${currentObject.constructor.name}: Not renderable"`);
      break;
    default:
      Object.getOwnPropertyNames(currentObject).forEach((property) => {
        if (
          typeof currentObject[property] == "object" &&
          currentObject[property] != null
        ) {
          relationshipMarkup.push(
            `${id}:${property}:e -> ${currentObject[property].__uniqueid}:w [color="${color}" fontcolor="${color}" decorate="true" headlabel="${property}"]`
          );

          labels.push(`{${property}|<${property}>object}`);
        } else if (property != "__uniqueid") {
          labels.push(`{${property}|<${property}>${currentObject[property]}}`);
        }
      });
      attrs.push(`label="${labels.join("|")}"`);
  }
  attrs.push(`color="${color}"`);
  attrs.push(`fillcolor="${color}"`);

  let objectMarkup = `${id} [${attrs.join(" ")}]`;

  return {
    objectMarkup: objectMarkup,
    relationshipMarkup: relationshipMarkup,
  };
}

function visualizeDot({ objects, containers, variables }) {
  // TODO: strip / escape characters for valid markup

  const objs = [];
  const rels = [];
  const styles = [];

  const objVars = new Map();
  variables.keys().forEach((name) => {
    const val = variables.get(name);

    // hash function can return negative integers
    const color =
      colorWheel[
        ((sdbm(name) % colorWheel.length) + colorWheel.length) %
          colorWheel.length
      ];

    if (typeof val == "object" && val != null) {
      const id = val.id;
      objs.push(`${name}[shape="signature" color="${color}" label="${name}"]`);
      rels.push(`${name}:e -> ${id}`);
    } else {
      objs.push(
        `${name}[shape="signature" color="${color}" label="${name}: ${
          val ? val.toString() : val
        } "]`
      );
    }
  });

  objects.keys().forEach((id) => {
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
        margin="1.5,0.5"
        rankdir=LR
        packMode="graph"
  
        node [shape=record ordering="out"];
        edge [arrowhead="none"];

        ${objs.join("\n") + "\n" + rels.join("\n") + "\n" + styles.join("\n")}

  }
    `;
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
