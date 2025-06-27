// Island count using BFS

const graph = [
  [1, 0, 0],
  [1, 1, 0],
  [0, 0, 0],
  [1, 0, 1],
];

function islandCount(graph) {
  const rowCount = graph.length;
  const colCount = graph[0].length;

  let count = 0; // count of the islands found so far

  let seen = new Set(); // Set of seen island locations

  // loop through the locations in the grid
  for (let graph_row = 0; graph_row < rowCount; graph_row++) {
    for (let graph_col = 0; graph_col < colCount; graph_col++) {
      const current = [graph_row, graph_col];
      // get the size of the island on the current location
      // or zero
      const size = explore(graph, current, seen);
      // if there's an island here, add to the total
      if (size > 0) count++; 
    }
  }
  return count;
}

// BFS search for count of attached island grid squares
function explore(graph, location, seen) {
  const queue = [location];
  let islandSize = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    const [graph_row, graph_col] = current;

    // skip this location if we have already seen it
    if (seen.has(graph_row + "-" + graph_col)) continue;
    // or if it's out of range
    if (graph_row < 0) continue;
    if (graph_col < 0) continue;
    if (graph_row >= graph.length) continue;
    if (graph_col >= graph[0].length) continue;
    // or if it isn't part of an islance
    if (graph[graph_row][graph_col] == 0) continue;

    // increase the size of the current island
    islandSize++;
    // add adjacent squares to the queue
    // it's simpler to apply the checks on dequeue
    seen.add(graph_row + "-" + graph_col);
    queue.push([graph_row + 1, graph_col]);
    queue.push([graph_row - 1, graph_col]);
    queue.push([graph_row, graph_col + 1]);
    queue.push([graph_row, graph_col - 1]);
  }
  return islandSize;
}

const numIslands = islandCount(graph);
console.log("Number of islands: ", numIslands);
