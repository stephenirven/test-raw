console.log("nothing to see here");
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

const n = new Node(5);

console.log(n);
console.log(Object.id(n.id));
