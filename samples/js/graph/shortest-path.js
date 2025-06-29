const graph = {
  v: ["w", "z"],
  w: ["x", "v"],
  x: ["w", "y"],
  y: ["x", "z"],
  z: ["y", "v"],
};

function shortestPath(graph, graph_start, graph_end) {
  let distance = 0;
  const queue = [{ node: graph_start, distance: distance }];

  const seen = new Set();

  while (queue.length > 0) {
    const { node: graph_node, distance } = queue.shift();
    if (seen.has(String(graph_node))) continue;

    seen.add(String(graph_node));
    if (graph_node == graph_end) {
      return distance;
    }

    for (let graph_neighbour of graph[graph_node]) {
      queue.push({ node: graph_neighbour, distance: distance + 1 });
    }
  }

  return -1;
}

const shortest = shortestPath(graph, "w", "z");
console.log(shortest);
