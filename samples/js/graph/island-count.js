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
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const current = [row, col];
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
    const [row, col] = current;

    // skip this location if we have already seen it
    if (seen.has(row + "-" + col)) continue;
    // or if it's out of range
    if (row < 0) continue;
    if (col < 0) continue;
    if (row >= graph.length) continue;
    if (col >= graph[0].length) continue;
    // or if it isn't part of an islance
    if (graph[row][col] == 0) continue;

    // increase the size of the current island
    islandSize++;
    // add adjacent squares to the queue
    // it's simpler to apply the checks on dequeue
    seen.add(row + "-" + col);
    queue.push([row + 1, col]);
    queue.push([row - 1, col]);
    queue.push([row, col + 1]);
    queue.push([row, col - 1]);
  }
  return islandSize;
}

const numIslands = islandCount(graph);
console.log("Number of islands: ", numIslands);
