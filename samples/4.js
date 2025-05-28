class Node(){
  constructor(val){
    this.val = val;
    this.next = null;
  }
}

const n = new Node(10);

console.table(n);
console.log(n);
console.log(JSON.stringigy(n));
console.log(Object.id(n));
for(let key of Object.keys(n)){
  console.log(key + " - " + n[key];
}
