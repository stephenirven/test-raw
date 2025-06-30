// Class for linked list nodes
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// Set up  linked list
let a = new Node(1);
a.next = new Node(2);
a.next.next = new Node(3);
a.next.next.next = new Node(4);

function sumRecurse(head, val = 0) {
  if (head == null) {
    return val;
  }
  val = val + head.val;
  head = head.next;
  return sumRecurse(head, val);
}

const total = sumRecurse(a);
console.log("Sum is: ", total);
