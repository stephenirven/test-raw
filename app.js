window.Prism = window.Prism || {};
window.Prism.manual = true;
sourceMap: window.sourceMap;
sourceMap.SourceMapConsumer.initialize({
  "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
});

const Dot = (function () {
  function escape(data) {
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
  function itemToDot(currentObject) {
    const id = currentObject.__uniqueid;
    const color = getColorForId(id);
    const relationshipMarkups = [];
    const attrs = [];
    const type = currentObject.constructor.name;
    const labels = [];
    const subgraphMarkups = [];

    labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;

    // content types
    if (currentObject instanceof String) {
      const { labelMarkup, _ } = stringContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject instanceof Date) {
      const { labelMarkup, _ } = dateContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject instanceof Function) {
      const { labelMarkup, _ } = funcContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject instanceof Set) {
      const { labelMarkup, relationshipMarkup } = setContent(currentObject);
      labels.push(...labelMarkup);
      relationshipMarkups.push(...relationshipMarkup);
    } else if (currentObject instanceof Array || currentObject instanceof Map) {
      const { labelMarkup, relationshipMarkup } = keyValContent(currentObject);
      labels.push(...labelMarkup);
      relationshipMarkups.push(...relationshipMarkup);
    } else if (
      currentObject instanceof RegExp ||
      currentObject instanceof Error
    ) {
      const { labelMarkup, _ } = stringifyContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject.__constructorName == "AdjacencyList") {
      // this isn't a local class
      const { labelMarkup, relationshipMarkup, subgraphMarkup } =
        adjacencyListContent(currentObject);
      labels.push(...labelMarkup);
      relationshipMarkups.push(...relationshipMarkup);
      subgraphMarkups.push(...subgraphMarkup);
    } else {
      const { labelMarkup, relationshipMarkup } = objContent(currentObject);
      labels.push(...labelMarkup);
      relationshipMarkups.push(...relationshipMarkup);
    }

    // end content

    labels.push(`</TABLE>`);
    attrs.push(`label=<${labels.join("")}>`);
    attrs.push(`tooltip="${escape(type)}"`);
    attrs.push(`color="${color}"`);
    attrs.push(`fillcolor="${color}"`);
    const objectMarkup = `"${id}" [${attrs.join(" ")}]`;
    return {
      objectMarkup,
      relationshipMarkup: relationshipMarkups,
      subgraphMarkup: subgraphMarkups,
    };
  }
  function stringContent(currentObject) {
    const header = [`<TD PORT="_main">String</TD>`];
    const cols = [`<TD></TD>`];
    for (let i = 0; i < currentObject.length; i++) {
      header.push(`<TD>${i}</TD>`);
      cols.push(`<TD PORT="${i}">${currentObject[i]}</TD>`);
    }
    return {
      labelMarkup: [`<TR>${header.join("")}</TR>`, `<TR>${cols.join("")}</TR>`],
      relationshipMarkup: [],
    };
  }
  function stringifyContent(currentObject) {
    const type = currentObject.constructor.name;
    return {
      labelMarkup: [
        `<TR><TD PORT="_main">${type}</TD><TD>${escape(
          currentObject.toString()
        )}</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
    labels.push();
  }
  function dateContent(currentObject) {
    return {
      labelMarkup: [
        `<TR><TD PORT="_main">Date</TD><TD>${escape(
          currentObject.toISOString()
        )}</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
  }
  function funcContent(currentObject) {
    const start = state.sourceMapConsumer.originalPositionFor({
      line: currentObject.bodyLoc.start.line,
      column: currentObject.bodyLoc.start.column,
    });
    const end = state.sourceMapConsumer.originalPositionFor({
      line: currentObject.bodyLoc.end.line,
      column: currentObject.bodyLoc.end.column,
    });

    let bodyText = escape(
      start && end ? getSourceRange(state.source, start, end) : ""
    );

    if (bodyText.length > 15) {
      bodyText = bodyText.substring(0, 12) + "...";
    }

    return {
      labelMarkup: [
        `<TR><TD PORT="_main">${escape(currentObject.functionName)}(${escape(
          currentObject.params.join(",")
        )})</TD><TD>${bodyText}</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
  }
  function nonRenderableContent(currentObject) {
    return {
      labelMarkup: [
        `<TR><TD PORT="_main">${type}</TD><TD>Not renderable</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
  }
  function setContent(currentObject) {
    const id = currentObject.__uniqueid;
    const type = currentObject.constructor.name;
    const color = getColorForId(id);
    const labelMarkup = [];
    const relationshipMarkup = [];
    labelMarkup.push(
      `<TR><TD PORT="_main">${type}(${currentObject.size})</TD></TR>`
    );
    currentObject.forEach((value) => {
      if (
        (typeof value == "object" || typeof value == "function") &&
        value != null
      ) {
        relationshipMarkup.push(
          `${id} -> ${value.__uniqueid} [color="${color}", fontcolor="${color}" label="has" decorate="true"]`
        );
      } else {
        labelMarkup.push(`<TR><TD>${escape(value)}</TD></TR>`);
      }
    });
    return { labelMarkup, relationshipMarkup };
  }
  function keyValContent(currentObject) {
    const id = currentObject.__uniqueid;
    const type = currentObject.constructor.name;
    const color = getColorForId(id);
    const labelMarkup = [];
    const relationshipMarkup = [];
    if (is2DRectArray(currentObject)) {
      cols = [];
      for (let i = 0; i < currentObject[0].length; i++) {
        cols.push(`<TD>#${i}</TD>`);
      }
      labelMarkup.push(`<TR><TD PORT="_main">2D</TD>${cols.join("")}</TR>`);
      currentObject.forEach((row, key) => {
        const r = row.map((x) => `<TD>${x}</TD>`).join("");
        labelMarkup.push(
          `<TR><TD PORT="${escape(key)}">#${escape(key)}</TD>${r}</TR>`
        );
      });
    } else {
      const length =
        type == "Array" ? currentObject.length : currentObject.size;

      labelMarkup.push(`<TR><TD COLSPAN="2">${type}(${length})</TD></TR>`);

      currentObject.forEach((value, key) => {
        if (
          (typeof value == "object" || typeof value == "function") &&
          value != null
        ) {
          labelMarkup.push(
            `<TR><TD>#${escape(key)}</TD><TD PORT="${escape(
              key
            )}">object</TD></TR>`
          );
          relationshipMarkup.push(
            `"${escape(id)}":"${escape(key)}" -> ${
              value.__uniqueid
            } [color="${color}" fontcolor="${color}" decorate="true" headlabel="${escape(
              key
            )}"]`
          );
        } else {
          labelMarkup.push(
            `<TR><TD>#${key}</TD><TD PORT="${escape(key)}">${escape(
              value
            )}</TD></TR>`
          );
        }
      });
    }
    return { labelMarkup, relationshipMarkup };
  }
  function adjacencyListContent(currentObject) {
    const id = currentObject.__uniqueid;
    const relationshipMarkup = [];
    const subgraphMarkup = [`subgraph cluster_adjacency_list_${id} {`];
    subgraphMarkup.push(`edge [arrowhead="normal"]`);
    subgraphMarkup.push(`node [shape="oval"]`);

    const labelMarkup = [];
    labelMarkup.push(
      `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
    );
    labelMarkup.push(
      `<TR><TD PORT="_main" COLSPAN="100%">Adjacency list</TD></TR>`
    );

    const properties = Object.getOwnPropertyNames(currentObject).filter(
      (x) => x != "__uniqueid" && x != "__constructorName"
    );

    for (let property of properties) {
      const cols = [];
      for (let adj of currentObject[property]) {
        subgraphMarkup.push(`${property} -> ${adj}`);
        cols.push(`<TD>${escape(adj)}</TD>`);
      }

      labelMarkup.push(
        `<TR><TD PORT="${escape(property)}">${escape(
          property + " ==> "
        )}</TD>${cols.join("")}</TR>`
      );
    }

    labelMarkup.push(`</TABLE>`);
    attrs.push(`label=<${labelMarkup.join("")}>`);

    subgraphMarkup.push("}");
    if (properties.length > 0) {
      relationshipMarkup.push(subgraphMarkup.join("\n"));
      relationshipMarkup.push(
        `"${escape(id)}" -> "${properties[0]}" [ltail="${escape(
          `cluster_adjacency_list_${id}" label="image" style=dashed arrowhead=curve, arrowtail=dot]`
        )}`
      );
    }
    return { labelMarkup, relationshipMarkup, subgraphMarkup };
  }
  function objContent(currentObject) {
    const id = currentObject.__uniqueid;
    const color = getColorForId(id);
    const labelMarkup = [];
    const relationshipMarkup = [];
    const type = currentObject.constructor.name;

    labelMarkup.push(
      `<TR><TD PORT="_main" COLSPAN="2">${type}(${length})</TD></TR>`
    );
    Object.getOwnPropertyNames(currentObject).forEach((key) => {
      const currentProperty = currentObject[key];
      if (
        (typeof currentProperty == "object" ||
          typeof currentProperty == "function") &&
        currentProperty != null
      ) {
        relationshipMarkup.push(
          `"${escape(id)}":"${escape(key)}" -> ${
            currentProperty.__uniqueid
          } [color="${color}" fontcolor="${color}" decorate="true" headlabel="${escape(
            key
          )}"]`
        );

        labelMarkup.push(
          `<TR><TD>#${escape(key)}</TD><TD PORT="${escape(
            key
          )}">object</TD></TR>`
        );
      } else if (key != "__uniqueid" && key != "__constructorName") {
        labelMarkup.push(
          `<TR><TD>#${escape(key)}</TD><TD PORT="${escape(key)}">${escape(
            currentObject[key]
          )}</TD></TR>`
        );
      }
    });

    return { labelMarkup, relationshipMarkup };
  }
  function stackFrameRender(frame) {
    const id = frame.__uniqueid;
    const color = getColorForId(id);
    const labels = [];
    const references = [];
    const type = frame.constructor.name;

    labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;
    labels.push(`<TR><TD PORT="_main" COLSPAN="2">${frame.name}</TD></TR>`);
    Object.getOwnPropertyNames(frame.values).forEach((key) => {
      const currentProperty = frame.values[key];
      if (
        (typeof currentProperty == "object" ||
          typeof currentProperty == "function") &&
        currentProperty != null
      ) {
        references.push(
          `"${escape(id)}":"${escape(key)}" -> ${escape(
            currentProperty.__uniqueid
          )}:"_main" [color="${color}" fontcolor="${color}" decorate="true" headlabel="${escape(
            key
          )}" constraint=false]`
        );

        labels.push(
          `<TR><TD>#${escape(key)}</TD><TD PORT="${escape(
            key
          )}">object</TD></TR>`
        );
      } else if (key != "__uniqueid" && key != "__constructorName") {
        labels.push(
          `<TR><TD>#${escape(key)}</TD><TD PORT="${escape(key)}">${escape(
            frame.values[key]
          )}</TD></TR>`
        );
      }
    });

    labels.push(`</TABLE>`);
    const attrs = [];
    attrs.push(`label=<${labels.join("")}>`);
    attrs.push(`tooltip="${escape(type)}"`);
    attrs.push(`color="${color}"`);
    attrs.push(`fillcolor="${color}"`);
    const frameMarkup = `"${id}" [${attrs.join(" ")}]`;
    return { id, frameMarkup, references };
  }
  function vizStack(stack) {
    const subgraph = [`subgraph cluster_stack_vis {`];
    subgraph.push(`label="Stack";`);
    subgraph.push("peripheries=1;");
    subgraph.push(`rankdir="BT";`);
    subgraph.push("nodesep=0;");
    subgraph.push("ranksep=0;");

    const edges = [];
    const frames = [];
    const ids = [];
    for (let frame of stack) {
      const { id, frameMarkup, references } = stackFrameRender(frame);
      frames.push(frameMarkup);
      edges.push(...references);
      ids.push(id);
    }
    subgraph.push(frames.join("\n"));
    subgraph.push(`{ ${ids.reverse().join(" -> ")}  [arrowhead="inv"]}`);

    subgraph.push("}");
    subgraph.push(...edges);
    return subgraph.join("\n");
  }
  function vizVariables(objects, enclosed, variables) {
    const subgraph = [`subgraph cluster_variables {`];
    subgraph.push(`label="Variables";`);
    subgraph.push("peripheries=1;");
    subgraph.push(`rankdir="BT";`);
    subgraph.push("nodesep=0;");
    subgraph.push("ranksep=0;");

    const nodes = [];
    const edges = [];

    variables.keys().forEach((name) => {
      const val = variables.get(name);

      const color = getColorForId(name);

      const displayName = escape(name);
      const displayTooltip = `Variable ${displayName}`;
      if (typeof val == "object" && val != null) {
        const id = val.id;

        nodes.push(
          `"${displayName}"[shape="signature" color="${color}" label="${displayName}" tooltip="${displayTooltip}"]`
        );
        if (enclosed.has(id)) {
          edges.push(
            `"${displayName}" -> ${enclosed.get(
              id
            )} [color="${color}" constraint=false]`
          );
        } else {
          edges.push(
            `"${displayName}" -> "${id}":"_main" [color="${color}" constraint=false]`
          );
        }
      } else {
        nodes.push(
          `"${displayName}"[shape="signature" color="${color}" label="${displayName}: ${
            val ? val.toString() : val
          }" tooltip="${displayTooltip}"]`
        );
        // Cater for string pointers
        if (Number.isInteger(val) && val >= 0) {
          const [stringName, ...rest] = displayName.split(/_(.*)/s);
          if (
            variables.has(stringName) &&
            variables.get(stringName) instanceof ObjectPointer &&
            objects.has(variables.get(stringName).id) &&
            objects.get(variables.get(stringName).id) instanceof String &&
            val < objects.get(variables.get(stringName).id).length
          ) {
            edges.push(
              `"${displayName}" -> ${
                objects.get(variables.get(stringName).id).__uniqueid
              }:${val} [color="${color}" constraint=false]`
            );
          }
        }
      }
    });
    subgraph.push(...nodes);

    subgraph.push("}");
    subgraph.push(...edges);
    return subgraph.join("\n");
  }
  function toDOTMarkup({ objects, enclosed, variables }, stack = []) {
    const subgraphs = [];
    const nodes = [];
    const edges = [];
    const styles = [];

    if (stack.length > 0) {
      const stackSubgraph = vizStack(stack);
      subgraphs.push(stackSubgraph);
    }

    const variableSubgraph = vizVariables(objects, enclosed, variables);
    subgraphs.push(variableSubgraph);

    // Binary tree nodes in the data set
    const binaryTreeNodes = new Map();

    objects.keys().forEach((id) => {
      if (enclosed.has(id)) {
        return; // don't include objects that are already rendered in a 2d graph
      }
      const currentObject = objects.get(id);

      if (currentObject.__constructorName == "BinaryNode") {
        binaryTreeNodes.set(currentObject.__uniqueid, currentObject);
        return; // don't include binary tree nodes that will be in subgraphs
      }

      const { objectMarkup, relationshipMarkup, subgraphMarkup } =
        itemToDot(currentObject);

      nodes.push(objectMarkup);
      if (relationshipMarkup.length > 0) {
        edges.push(...relationshipMarkup);
      }
      if (subgraphs.length > 0) {
        subgraphs.push(subgraphMarkup);
      }
    });

    const nonRootNodes = new Set();
    for (let id of binaryTreeNodes.keys()) {
      let node = binaryTreeNodes.get(id);
      nonRootNodes.add(node.left?.__uniqueid);
      nonRootNodes.add(node.right?.__uniqueid);
    }
    for (let id of nonRootNodes) {
      binaryTreeNodes.delete(id);
    }
    const trees = new Map();
    for (let [key, tree] of binaryTreeNodes) {
      const gap = 0.1;
      const width = 1;
      const maxTreeHeight = treeHeight(tree);
      const n = new DummyBinaryNode(tree, maxTreeHeight, key);
      let levels = [];
      treeLevels(n, 0, levels);

      const subgraph = [`subgraph cluster_binarytree_${n.__uniqueid} {`];
      subgraph.push("peripheries=0;");

      for (let levelNum = 0; levelNum < levels.length; levelNum++) {
        const level = levels[levelNum];
        const paddingWidth =
          Math.pow(2, maxTreeHeight - levelNum) * gap +
          (Math.pow(2, maxTreeHeight - levelNum) - 1) * width;
        const paddingNodes = [];
        for (let node of level) {
          const id = node.__uniqueid;

          const val = node.val;
          const color = getColorForId(id);
          const relationshipMarkup = [];
          const attrs = [];
          const labels = [];

          labels.push(
            `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
          );
          labels.push(
            `<TR><TD COLSPAN="2" PORT="_main">${escape(val)}</TD></TR>`
          );
          labels.push(
            `<TR><TD PORT="left">left</TD><TD PORT="right">right</TD></TR>`
          );
          labels.push(`</TABLE>`);
          if (node.left != null) {
            const style = !Number.isInteger(node.left.__uniqueid)
              ? "style=invis" // style=invis
              : "";
            relationshipMarkup.push(
              `"${escape(id)}":"left" -> ${
                node.left.__uniqueid
              } [color="${color}" fontcolor="${color}" decorate="true" headlabel="left" ${style}]`
            );

            relationshipMarkup.push(
              `"${escape(id)}" -> "p-${node.left.__uniqueid}" [style=invis]` // style=invis
            );

            paddingNodes.push(
              `"p-${node.left.__uniqueid}" [width=${paddingWidth} style=invis]` // style=invis
            );
          }

          if (node.right != null) {
            const style = !Number.isInteger(node.right.__uniqueid)
              ? "style=invis" //style=invis
              : "";
            relationshipMarkup.push(
              `"${escape(id)}":"right" -> ${
                node.right.__uniqueid
              } [color="${color}" fontcolor="${color}" decorate="true" headlabel="right" ${style}]`
            );
            paddingNodes.push(
              `"p-${node.right.__uniqueid}" [width=${0} style=invis]` // style=invis
            );
          }
          attrs.push(`width=1`);
          attrs.push(`label=<${labels.join("")}>`);
          attrs.push(`tooltip="Node"`);
          attrs.push(`color="${color}"`);
          attrs.push(`fillcolor="${color}"`);
          if (!Number.isInteger(id)) {
            attrs.push(`style=invis`); // style=invis
          }

          const objectMarkup = `"${id}" [${attrs.join(" ")}]`;

          subgraph.push(objectMarkup);
          subgraph.push(relationshipMarkup.join("\n"));
        }
        paddingNodes.pop(); // remove last padding right...
        subgraph.push(paddingNodes.join("\n"));

        if (level.length > 1) {
          let levelOrder = level
            .map((x) => `"${x.__uniqueid}" -> "p-${x.__uniqueid}"`)
            .join(" -> ");
          levelOrder = levelOrder.substring(0, levelOrder.lastIndexOf("->")); // remove last padding right

          levelOrder = `{rank=same ${levelOrder} [style=invis]}`; // style=invis

          subgraph.push(levelOrder);
        }
      }

      subgraph.push("}");

      subgraphs.push(subgraph.join("\n"));
    }

    // trees render better without splines.
    // ideally we would set this only for the tree subgraphs
    // but it's a graph level attribute
    const splines = binaryTreeNodes.size > 0 ? "splines=false;" : "";
    const rankdir = binaryTreeNodes.size > 0 ? "TB" : "LR";

    edges.push(
      `"stack_frame_0" -> "input" [ltail="cluster_stack" lhead="cluster_variables" style=invis];`
    );

    return `
digraph structs {
  bgcolor="lightblue"
  nodesep=0.3; 
  ranksep=0.2;
  margin="1.5,0.5";
  rankdir=${rankdir};
  packMode="node";
  tooltip="state visualisation";
  labeljust=l;
  compound=true;
  ${splines}

  node [shape=plaintext ordering="out"];
  edge [arrowhead="none"];

  ${subgraphs.join("\n")}
  ${nodes.join("\n")}
  ${edges.join("\n")}
  ${styles.join("\n")}

}
    `;
  }
  function getColorForPositiveInteger(id) {
    return config.colorWheel[id % config.colorWheel.length];
  }
  function getColorForString(name) {
    // hash function can return negative integers
    const id =
      ((sdbm(name) % config.colorWheel.length) + config.colorWheel.length) %
      config.colorWheel.length;

    return getColorForPositiveInteger(id);
  }
  function getColorForId(id) {
    if (Number.isInteger(id)) {
      return getColorForPositiveInteger(id);
    }
    return getColorForString(id);
  }
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
  function getSourceRange(text, start, end) {
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
  function treeHeight(head) {
    if (head == null) return -1;
    return Math.max(treeHeight(head.left), treeHeight(head.right)) + 1;
  }
  function treeLevels(head, level = 0, levels = []) {
    if (head == null) return;

    if (!levels[level]) levels[level] = [];

    levels[level].push(head);

    if (head.left != null) treeLevels(head.left, level + 1, levels);
    if (head.right != null) treeLevels(head.right, level + 1, levels);
  }
  class DummyBinaryNode {
    constructor(node, depth, prefix, dummyNodeNumbers = []) {
      if (node != null) {
        this.__uniqueid = node.__uniqueid;
        this.val = node.val;
      } else {
        this.__uniqueid = `d_${prefix}_${dummyNodeNumbers.length}`;
        dummyNodeNumbers.push(this.__uniqueid);
      }

      if (depth > 0) {
        this.left = new DummyBinaryNode(
          node?.left || null,
          depth - 1,
          prefix,
          dummyNodeNumbers
        );
        this.right = new DummyBinaryNode(
          node?.right || null,
          depth - 1,
          prefix,
          dummyNodeNumbers
        );
      }
    }
  }

  return { toDOTMarkup };
})();

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
  //  postfixes: [], // @TODO amend step function to make sure we don't trigger on any postfix code.
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

function deepEqual(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
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
      enclosed: new Map(),
    };
    this.current = {
      objects: new Map(),
      variables: new Map(),
      enclosed: new Map(),
    };

    this.reset = this.reset.bind(this);
    this.update = this.update.bind(this);
  }
  reset() {
    this.prev = {
      objects: new Map(),
      variables: new Map(),
      enclosed: new Map(),
    };
    this.current = {
      objects: new Map(),
      variables: new Map(),
      enclosed: new Map(),
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
  update(newVariables) {
    this.prev = this.current;
    this.current = newVariables;
  }
}

class StateManager {
  constructor() {
    this.variables = new VariableStore();
    this.stack = [];
    this.oldStack_ = [];
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

    this.update = this.update.bind(this);
    this.updateVariables = this.updateVariables.bind(this);
    this.updateStack = this.updateStack.bind(this);
  }
  update() {
    this.updateStack();
    this.updateVariables();
  }
  updateVariables() {
    this.variables.update(this.getVariables(this.interpreter, this.stack));
  }
  updateStack() {
    const vmStack = state.interpreter.getStateStack();

    this.stack = [];
    for (let i = 0; i < vmStack.length; i++) {
      const callFrame = vmStack[i];
      if (
        callFrame.node?.type == "CallExpression" &&
        callFrame.node.callee.name != undefined
      ) {
        const scope = {
          __uniqueid: "stack_frame_" + this.stack.length,
          name: callFrame.node.callee.name,
          // args: callFrame.node.arguments,
          // callFrame: callFrame,
        };
        this.stack.push(scope);
        if (i < vmStack.length - 1) {
          const blockscope = vmStack[i + 1].scope.object.properties;
          scope.values = {};
          for (let property of Object.getOwnPropertyNames(blockscope)) {
            if (property != "arguments" && property != "this") {
              if (
                typeof scope.values[property] == "object" ||
                typeof scope.values[property] == "function"
              ) {
                scope.values[property] = blockscope[property]; // TODO ObjectPointer
              } else {
                scope.values[property] = blockscope[property];
              }
            }
          }
        }
      }
    }
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
    return !deepEqual(this.locations.current.start, this.locations.current.end);
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
      const dot = Dot.toDOTMarkup(this.variables.current, this.stack);
      var graphviz = d3
        .select("#visualisation")
        .graphviz()
        .transition(function () {
          return d3.transition("main").ease(d3.easeLinear).duration(200);
        })
        .on("initEnd", render);

      function render() {
        graphviz.renderDot(dot);
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
  getVariables(interpreter, stack) {
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
    const scopeObj = interpreter.getScope().object;

    if (
      typeof scopeObj != "object" ||
      !(scopeObj instanceof Interpreter.Object)
    ) {
      return;
    }
    const enclosed = new Set();
    const objects = new Map();

    const propertyNames = new Set();

    // Add objects referenced in stack frames
    for (let i = 0; i < stack.length; i++) {
      const frame = stack[i];
      for (let property of Object.getOwnPropertyNames(frame.values)) {
        if (!property != "__uniqueid" && property != "__constructorName") {
          if (
            typeof frame.values[property] == "object" ||
            typeof frame.values[property] == "function"
          ) {
            propertyNames.add(frame.values[property]);
          }
        }
      }
    }

    for (let key of Object.keys(scopeObj.properties)) {
      propertyNames.add(key);
    }

    for (let key of propertyNames) {
      const currentObject =
        typeof key == "object" || typeof key == "function"
          ? key
          : scopeObj.properties[key];
      if (
        currentObject &&
        typeof currentObject == "object" &&
        //!key.startsWith("_") &&
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
          if (!objects.has(id)) {
            if (is2DRectArray(obj)) {
              for (let i = 0; i < obj.length; i++) {
                // We have special rendering for two dimensional arrays
                enclosed.set(obj[i].__uniqueid, `"${id}":"${i}"`);
              }
            } else if (
              typeof obj == "object" &&
              obj.__constructorName == "AdjacencyList"
            ) {
              // we have special rendering for AdjacencyLists
              for (let property of Object.getOwnPropertyNames(obj)) {
                if (
                  property != "__uniqueid" &&
                  property != "__constructorName"
                ) {
                  enclosed.set(obj[property].__uniqueid, `${id}:${property}`);
                }
              }
            }
            objects.set(id, obj);
          }
        }
      }
    }

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

    return { objects, enclosed, variables };
  }
  isLine(stack) {
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

    if (this.oldStack_[this.oldStack_.length - 1] === currentState) {
      // Never repeat the same statement multiple times.
      // Typically a statement is stepped into and out of.
      return false;
    }

    if (
      this.oldStack_.indexOf(currentState) !== -1 &&
      type !== "ForStatement" &&
      type !== "WhileStatement" &&
      type !== "DoWhileStatement"
    ) {
      // Don't revisit a statement on the stack (e.g. 'if') when exiting.
      // The exception is loops.
      return false;
    }

    this.oldStack_ = stack.slice();
    return true;
  }
  tryStep() {
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
}

const state = new StateManager();

state.getSample(
  "https://raw.githubusercontent.com/stephenirven/test-raw/refs/heads/main/samples/js/string/rle.js"
);

async function parseButton() {
  state.displayError();
  await state.parse();
  disable("");
}

function runButton() {
  disable("disabled");
  if (state.interpreter.run()) {
    // Async function hit.  There's more code to run.
    setTimeout(runButton, 100);
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
    (!state.sourceLinesValid() ||
      !state.sourceLinesChanged() ||
      !state.isLine(stack))
  ) {
    [ok, error] = state.tryStep();
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

  state.update();
  state.display();

  if (error) {
    state.highlightErrorLines(error);
    state.displayError(error);
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
