import { appendFile } from "node:fs/promises";
import { join } from "node:path";

export const checkHashStore = async (jsonString: string): Promise<boolean> => {
	// hash using [wyhash](https://bun.com/docs/runtime/hashing#bun-hash)
	const hash = Bun.hash(jsonString).toString();
	const path = join(process.cwd(), "hash-store");
	const file = Bun.file(path);

	const exists = await file.exists();
	console.log("file existance", {
		exists,
	});
	if (!exists) return false;

	const fileText = await file.text();
	const includes = fileText.includes(hash);
	console.log({
		fileText,
		includes,
		hash,
	});
	return includes;
};

export const updateHashStore = async (jsonString: string): Promise<string> => {
	// hash using [wyhash](https://bun.com/docs/runtime/hashing#bun-hash)
	const hash = Bun.hash(jsonString).toString();

	const path = join(process.cwd(), "hash-store");
	const file = Bun.file(path);

	const exists = await file.exists();
	if (exists) {
		const isHashPresent = (await file.text()).includes(hash);
		if (isHashPresent) return hash;
	}

	await appendFile(path, `${hash}\n`);

	return hash;
};
