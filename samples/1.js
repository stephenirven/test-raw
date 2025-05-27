console.log("nothing to see here");
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

const max = 5;

const n = new Node(5);
let current = n;

for(let i = 0;i < 5; i++){
  current.next = new Node(i);
  current = current.next;
}

console.log(n);
