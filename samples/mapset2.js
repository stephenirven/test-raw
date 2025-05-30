const s = new Set();
const m = new Map();

console.log(s.constructor.name);
console.log(m.constructor.name);

console.log(s instanceof Set);
console.log(s instanceof Map);

m.set(1, "hello");
m.set(2, "goodbye");
m.set(4, "this");
m.set(5, "is");
m.set(9, "some");
m.set(20, "data");

