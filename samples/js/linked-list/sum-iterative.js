/*
 *  Sum a linked list - Iterative method
 */

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

function sumIter(list) {
  let sum = 0;
  let current = list;
  while (current != null) {
    sum += current.val;
    current = current.next;
  }
  return sum;
}


const total = sumIter(a)
