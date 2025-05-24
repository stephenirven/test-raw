console.log("nothing to see here");
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

foo(); // not defined

let n = new Node(10);
console.log(n);
