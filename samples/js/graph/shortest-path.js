class AdjacencyList extends Object {}

const graph = new AdjacencyList();

graph.v = ["w", "z"];
graph.w = ["x", "v"];
graph.x = ["w", "y"];
graph.y = ["x", "z"];
graph.z = ["y", "v"];

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
