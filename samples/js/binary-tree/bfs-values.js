let a = new BinaryNode("a");
let b = new BinaryNode("b");
let c = new BinaryNode("c");
let d = new BinaryNode("d");
let e = new BinaryNode("e");
let f = new BinaryNode("f");

a.left = b;
a.right = c;
b.left = d;
b.right = e;
c.right = f;

function breadthFirstIter(tree) {
  const queue = [tree];
  const values = [];

  while (queue.length > 0) {
    const current = queue.shift();
    values.push(current.val);
    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }
  return values;
}

const i = breadthFirstIter(a);

console.log(i);

class BinaryNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}
