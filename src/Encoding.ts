
export enum Encoding {
	Utf8 = 'utf8'
}

/** @ignore*/
const allEncodings = Object.values(Encoding);

/** @ignore*/
export function isValidEncoding(value: Encoding|string): boolean {
	return allEncodings.includes(value);
}
