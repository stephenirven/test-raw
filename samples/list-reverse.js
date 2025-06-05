/*
 *  Reverse a linked list - toy example
 */

// Class for linked list nodes
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// quick and dirty setup for a four node linked list
// 1 -> 2 -> 3 -> 4
const n = new Node(1);
n.next = new Node(2);
n.next.next = new Node(3)
n.next.next.next = new Node(4);

// Reverse the linked list

let current = n; // the current node to process
let prev = null; // the previous node

while (current != null) {
  const next = current.next; // get a reference to the next node
  current.next = prev; // set the next to the previous

  prev = current; // update the previous node
  current = next; // and the next node for the next iteration
}

// prev now references the reverse list
const newList = prev;
// 4 -> 3 -> 2 -> 1
