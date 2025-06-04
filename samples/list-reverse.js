class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

const n = new Node(1);
n.next = new Node(2);
n.next.next = new Node(3)
n.next.next.next = new Node(4);

let current = n;

while (current != null) {
  const next = current.next;

  current.next = prev;

  prev = current;
  current = next;
}

const newList = prev;
