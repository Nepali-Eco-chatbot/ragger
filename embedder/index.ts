const input = await Bun.stdin.text();

console.log("This is the json data that I will be parsing next");
console.log(JSON.parse(input));
