import { pipeline } from "@huggingface/transformers";

const args = Bun.argv.slice(2);

if (args.length === 0) {
	console.error("No args provided `jsonData` required.");
	process.exit(1);
}

const mayBeJsonData = args[0];
if (!mayBeJsonData) {
	console.error("undefined arg provided");
	process.exit(1);
}

try {
	const jsonData = JSON.parse(mayBeJsonData);
	console.log(jsonData);
} catch (e) {
	console.error("Invalid json data provided");
	process.exit(1);
}

//Embedding generation.
const extractor = await pipeline("feature-extraction", "intfloat/multilingual-e5-small");

const output = await extractor("This is the test", {
	normalize: true,
	pooling: "mean",
});

console.log(output);
