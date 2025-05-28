console.log("nothing to see here");
class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

function foo(){
  const hello = "hello";
  for(let i=0;i< 5;i++){
    hello += "-"+i
  }
  console.log(hello);  
}
const max = 5;

const n = new Node(5);

console.log(n);
console.log(n.uniqueId);
let current = n;

for(let i = 0;i < 5; i++){
  current.next = new Node(i);
  current = current.next;
}
