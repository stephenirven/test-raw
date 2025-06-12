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
    const relationshipMarkup = [];
    const attrs = [];
    const type = currentObject.constructor.name;
    const labels = [];
    const subgraphs = [];

    labels.push`<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`;

    // content
    if (currentObject instanceof String) {
      const { labelMarkup, _ } = this.stringContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject instanceof Date) {
      const { labelMarkup, _ } = this.dateContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject instanceof Function) {
      const { labelMarkup, _ } = this.funcContent(currentObject);
      labels.push(...labelMarkup);
    } else if (currentObject instanceof Set) {
      const { labelMarkup, relationshipMarkup } =
        this.setContent(currentObject);
      labels.push(...labelMarkup);
      relationshipMarkup.push(...relationshipMarkup);
    } else if (currentObject instanceof Array || currentObject instanceof Map) {
      const { labelMarkup, relationshipMarkup } = keyValContent(currentObject);
      labels.push(...labelMarkup);
      relationships.push(...relationshipMarkup);
    } else if (currentObject instanceof AdjacencyList) {
      const { labelMarkup, relationshipMarkup, subgrapMarkup } =
        this.adjacentListContent(currentObject);
      labels.push(...labelMarkup);
      relationships.push(...relationshipshipMarkup);
      subgraphs.push(...subgraphMarkup);
    } else if (
      currentObject instanceof RegExp ||
      currentObject instanceof Error
    ) {
      const { labelMarkup, _ } = this.stringifyContent(currentObject);
      labels.push(...labelMarkup);
    } else if (
      currentObject instanceof WeakMap ||
      currentObject instanceof WeakSet
    ) {
      const { labelMarkup, _ } = this.nonRenderableContent(currentObject);
      labels.push(...labelMarkup);
    } else {
      const { labelMarkup, relationshipMarkup } = objContent(currentObject);

      labels.push(...labelMarkup);
      relationships.push(...relationshipMarkup);
    }

    // end content

    labels.push(`</TABLE>`);
    attrs.push(`label=<${labels.join("")}>`);
    attrs.push(`tooltip="${this.escape(type)}"`);
    attrs.push(`color="${color}"`);
    attrs.push(`fillcolor="${color}"`);
    const objectMarkup = `"${id}" [${attrs.join(" ")}]`;
    return { objectMarkup, relationshipMarkup, subgraphMarkup };
  }
  function stringContent(currentObject) {
    const header = [`<TD>${type}</TD>`];
    const cols = [`<TD></TD>`];
    for (let i = 0; i < currentObject.length; i++) {
      header.push(`<TD>${i}</TD>`);
      cols.push(`<TD PORT="${i}">${currentObject[i]}</TD>`);
    }
    return {
      labelMarkup: [
        (`<TR>${header.join("")}</TR>`, `<TR>${cols.join("")}</TR>`),
      ],
      relationshipMarkup: [],
    };
  }
  function stringifyContent(currentObject) {
    return {
      labelMarkup: [
        `<TR><TD>${type}</TD><TD>${this.escape(
          currentObject.toString()
        )}</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
    labels.push();
  }
  function dateContent(currentObject) {
    return {
      labelMarkupo: [
        `<TR><TD>${type}</TD><TD>${this.escape(
          currentObject.toISOString()
        )}</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
  }
  function funcContent(currentObject) {
    let bodyText = this.escape(getBodyText(currentObject));
    if (bodyText.length > 15) {
      bodyText = bodyText.substring(0, 12) + "...";
    }

    return {
      labelMarkup: [
        `<TR><TD>${this.escape(currentObject.functionName)}(${this.escape(
          currentObject.params.join(",")
        )})</TD><TD>${bodyText}</TD></TR>`,
      ],
      relationshipMarkup: [],
    };
  }
  function nonRenderableContent(currentObject) {
    return {
      labelMarkup: [`<TR><TD>${type}</TD><TD>Not renderable</TD></TR>`],
      relationshipMarkup: [],
    };
  }
  function setContent(currentObject) {
    const labelMarkup = [];
    const relationshipMarkup = [];
    labelMarkup.push(`<TR><TD>${type}(${currentObject.size})</TD></TR>`);
    currentObject.forEach((value) => {
      if (
        (typeof value == "object" || typeof value == "function") &&
        value != null
      ) {
        relationshipMarkup.push(
          `${id} -> ${value.__uniqueid}:w [color="${color}", fontcolor="${color}" label="has" decorate="true"]`
        );
      } else {
        labelMarkup.push(`<TR><TD>${this.escape(value)}</TD></TR>`);
      }
    });
    return { labelMarkup, relationshipMarkup };
  }
  function keyValContent(currentObject) {
    const labels = [];
    const relationships = [];
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
          `<TR><TD PORT="${this.escape(key)}">#${this.escape(
            key
          )}</TD>${r}</TR>`
        );
      });
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
            `<TR><TD>#${this.escape(key)}</TD><TD PORT="${this.escape(
              key
            )}">object</TD></TR>`
          );
          relationships.push(
            `"${this.escape(id)}":"${this.escape(key)}":e -> ${
              value.__uniqueid
            }:w [color="${color}" fontcolor="${color}" decorate="true" headlabel="${this.escape(
              key
            )}"]`
          );
        } else {
          labels.push(
            `<TR><TD>#${key}</TD><TD PORT="${this.escape(key)}">${this.escape(
              value
            )}</TD></TR>`
          );
        }
      });
    }
    return { labels, relationshipMarkup: relationships };
  }
  function adjacentListContent(currentObject) {
    const relationshipMarkup = [];
    const subgraphMarkup = [`subgraph cluster_adjacency_list_${id} {`];
    subgraphMarkup.push(`edge [arrowhead="normal"]`);
    subgraphMarkup.push(`node [shape="oval"]`);

    const labeslMarkup = [];
    labelMarkup.push(
      `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
    );
    labelMarkup.push(`<TR><TD COLSPAN="100%">Adjacency list</TD></TR>`);

    const properties = Object.getOwnPropertyNames(currentObject).filter(
      (x) => x != "__uniqueid" && x != "__constructorName"
    );

    for (let property of properties) {
      const cols = [];
      for (let adj of currentObject[property]) {
        subgraphMarkup.push(`${property} -> ${adj}`);
        cols.push(`<TD>${this.escape(adj)}</TD>`);
      }

      labelMarkup.push(
        `<TR><TD PORT="${this.escape(property)}">${this.escape(
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
        `"${this.escape(id)}" -> "${properties[0]}" [ltail="${this.escape(
          `cluster_adjacency_list_${id}" label="image" style=dashed arrowhead=curve, arrowtail=dot]`
        )}`
      );
    }
    return { labelMarkup, relationshipMarkup, subgraphMarkup };
  }
  function objContent(currentObject) {
    const labelMarkup = [];
    const relationshipMarkup = [];

    labelMarkup.push(
      `<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">`
    );
    labelMarkup.push(`<TR><TD COLSPAN="2">${type}(${length})</TD></TR>`);
    Object.getOwnPropertyNames(currentObject).forEach((key) => {
      const currentProperty = currentObject[key];
      if (
        (typeof currentProperty == "object" ||
          typeof currentProperty == "function") &&
        currentProperty != null
      ) {
        relationshipMarkup.push(
          `"${this.escape(id)}":"${this.escape(key)}":e -> ${
            currentProperty.__uniqueid
          }:w [color="${color}" fontcolor="${color}" decorate="true" headlabel="${this.escape(
            key
          )}"]`
        );

        labelMarkup.push(
          `<TR><TD>#${this.escape(key)}</TD><TD PORT="${this.escape(
            key
          )}">object</TD></TR>`
        );
      } else if (key != "__uniqueid" && key != "__constructorName") {
        labelMarkup.push(
          `<TR><TD>#${this.escape(key)}</TD><TD PORT="${this.escape(
            key
          )}">${this.escape(currentObject[key])}</TD></TR>`
        );
      }
    });

    return { labelMarkup, relationshipMarkup };
  }

  function vizStack(stack) {
    const subgraph = [`subgraph cluster_stack_vis {`];
    subgraph.push("peripheries=1;");
    subgraph.push("rankdir=BT;");
    subgraph.push("nodesep=.1;");
    subgraph.push("ranksep=.1;");

    const frames = [];
    for (let frame of stack) {
      const { objectMarkup, relationshipMarkup } = objToDot(frame);
      frames.push(objectMarkup);
      frames.push(relationshipMarkup);
    }
    if (stack.length > 1) {
      subgraph.push(
        `{rank=same ${stack
          .map((x) => `"${x.__uniqueid}"`)
          .join(" -> ")} [style=invis]}`
      );
    }
    subgraph.push(frames.join(""));

    subgraph.push("}");
    return subgraph.join("\n");
  }

  function toDOTMarkup({ objects, enclosed, variables }, stack = []) {
    const subgraphs = [];
    const nodes = [];
    const edges = [];
    const styles = [];

    if (stack.length > 0) {
      const stack = vizStack(stack);
      subgraphs.push(stack);
    }

    const objVars = new Map();
    variables.keys().forEach((name) => {
      const val = variables.get(name);

      const color = getColorForString(name);

      const displayName = this.escape(name);
      const displayTooltip = `Variable ${displayName}`;
      if (typeof val == "object" && val != null) {
        const id = val.id;

        nodes.push(
          `"${displayName}"[shape="signature" color="${color}" label="${displayName}" tooltip="${displayTooltip}"]`
        );
        if (enclosed.has(id)) {
          edges.push(
            `"${displayName}":e -> "${enclosed.get(
              id
            )}" [color="${color}" constraint=false]`
          );
        } else {
          edges.push(
            `"${displayName}":e -> "${id}" [color="${color}" constraint=false]`
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
              `"${displayName}":e -> ${
                objects.get(variables.get(stringName).id).__uniqueid
              }:${val} [color="${color}" constraint=false]`
            );
          }
        }
      }
    });

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

      const { objectMarkup, relationshipMarkup, subgraphs } =
        itemToDot(currentObject);

      nodes.push(objectMarkup);
      if (relationshipMarkup.length > 0) {
        edges.push(...relationshipMarkup);
      }
      if (subgraphs.length > 0) {
        subgraphMarkup.push(subgraphs);
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
          labels.push(`<TR><TD COLSPAN="2">${this.escape(val)}</TD></TR>`);
          labels.push(
            `<TR><TD PORT="left">left</TD><TD PORT="right">right</TD></TR>`
          );
          labels.push(`</TABLE>`);
          if (node.left != null) {
            const style = !Number.isInteger(node.left.__uniqueid)
              ? "style=invis" // style=invis
              : "";
            relationshipMarkup.push(
              `"${this.escape(id)}":"left" -> ${
                node.left.__uniqueid
              } [color="${color}" fontcolor="${color}" decorate="true" headlabel="left" ${style}]`
            );

            relationshipMarkup.push(
              `"${this.escape(id)}" -> "p-${
                node.left.__uniqueid
              }" [style=invis]` // style=invis
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
              `"${this.escape(id)}":"right" -> ${
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

    return `
digraph structs {
    nodesep=0.3; 
    ranksep=0.2;
    margin="1.5,0.5";
    rankdir=${rankdir};
    packMode="graph";
    tooltip="state visualisation";
    labeljust=l;
    ${splines}

    node [shape=plaintext ordering="out"];
    edge [arrowhead="none"];

    ${stackvis.join("\n")}
    ${subgraphs.join("\n")}
    ${nodes.join("\n")}
    ${edges.join("\n")}
    ${styles.join("\n")}
    }

}
    `;
  }
})();
