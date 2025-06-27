const graph = {
  v: ["w", "z"],
  w: ["x", "v"],
  x: ["w", "y"],
  y: ["x", "z"],
  z: ["y", "v"],
};

function shortestPath(graph, start, end) {
  let distance = 0;
  const queue = [{ node: start, distance: distance }];

  const seen = new Set();

  while (queue.length > 0) {
    const { node, distance } = queue.shift();
    if (seen.has(String(node))) continue;

    seen.add(String(node));
    if (node == end) {
      return distance;
    }

    for (let neighbour of graph[node]) {
      queue.push({ node: neighbour, distance: distance + 1 });
    }
  }

  return -1;
}

console.log(shortestPath(graph, "w", "z"));
