
export enum Endianness {
	/**
	 * Least significant byte first - for multi-byte values the bytes representing the
	 * big portion of the data are last, eg: value of `2001` is two bytes:
	 * `07 + D1` (`1792 + 209`). In Little Endian it's written as `D1 07`.
	 */
	Little = 0,

	/**
	 * Most significant byte first - for multi-byte values the bytes representing the
	 * big portion of the data are first, eg: value of `2001` is two bytes:
	 * `07` (1792) and `D1` (209). In Big Endian it's written as `07 D1`.
	 */
	Big = 1,
}

/** @ignore*/
const allEndianness: Endianness[] = Object.values(Endianness).filter(value => typeof value === 'number');

/** @ignore*/
export function isValidEndianness(value: Endianness | number): boolean {
	return allEndianness.includes(value as Endianness);
}
