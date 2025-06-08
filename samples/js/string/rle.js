// Run length encoding using two pointers

const input = new String("ABBA BAABA MAAL AARON PAUL");
const encoded = rle(input)

console.log(encoded);

function rle(input) {
  let input_p1 = 0; // pointer to start of run
  let input_p2 = 0; // pinter to end of run
  const output = []; // output buffer

  // loop through the string
  while (input_p2 < input.length) {
    // while the characters at the start and end pointer match
    while (input[input_p1] == input[input_p2]) {
      input_p2++; // move the end pointer forward
    }

    const length = input_p2 - input_p1; // current run length
    if (length > 1) { // if it's more than 1
      output.push(input_p2 - input_p1); // push the number to the output buffer
    }
    output.push(input[input_p1]); // push the character to the output buffer

    input_p1 = input_p2; // move start pointer to end pointer
  }
  return output.join("");
}
