class Node{
  constructor(val){
    this.val = val;
    this.next = null;
  }
}

const l = new Node(1);
const n = new Node(10);

console.table(n);
console.log(n);
console.log(JSON.stringify(n));
console.log(Object.id(n));
console.log(Object.id(l));
for(let key of Object.keys(n)){
  console.log(key + " - " + n[key]);
}
