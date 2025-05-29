import * as Utf8 from '../src/Utf8';

export function getBufferOfLength(length: number): ArrayBuffer {
	const uint8Array = new Uint8Array(length);

	return uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
}

export function getBufferArray(bytes: number[]): ArrayBuffer {
	const uint8Array = new Uint8Array(bytes);

	return uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
}

export function getBufferBinary(binary: string): ArrayBuffer {
	binary = binary.replace(/[^01]/g, '');

	if (binary.length % 8 !== 0) {
		throw new Error("Provided binary data should have length being multiply of 8.");
	}

	const matches = binary.match(/.{8}/g);
	if (!matches) {
		throw new Error("Binary did not match");
	}

	const byteArray = matches.map(x => parseInt(x, 2));

	return getBufferArray(byteArray);
}

export function getArrayHex(hex: string): number[] {
	hex = hex.replace(/[^0123456789abcdef]/gi, '');

	if (hex.length % 2 !== 0) {
		throw new Error("Provided binary data should have length being multiply of 8.");
	}

	const matches = hex.match(/.{2}/g);
	if (!matches) {
		throw new Error("Hex did not match");
	}

	return matches.map(x => parseInt(x, 16));
}

export function getBufferHex(hex: string): ArrayBuffer {
	return getBufferArray(getArrayHex(hex));
}

export function arrayToHex(data: number[]): string {
	return data.map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
}

export function writeUtf8Character(array: number[], position: number, charLength: number): void {
	if (charLength === 1) {
		array[position] = Utf8.leadingByteLength1Prefix;

	} else if (charLength === 2) {
		array[position] = Utf8.leadingByteLength2Prefix;
		array[position + 1] = Utf8.continuationBytePrefix;

	} else if (charLength === 3) {
		array[position] = Utf8.leadingByteLength3Prefix;
		array[position + 1] = Utf8.continuationBytePrefix;
		array[position + 2] = Utf8.continuationBytePrefix;

	} else if (charLength === 4) {
		array[position] = Utf8.leadingByteLength4Prefix;
		array[position + 1] = Utf8.continuationBytePrefix;
		array[position + 2] = Utf8.continuationBytePrefix;
		array[position + 3] = Utf8.continuationBytePrefix;

	} else {
		throw new Error(`Invalid char lengt=${charLength} given.`);
	}
}

export function getUtf8CharArray(charLength: number, totalBufferLength?: number): number[] {
	if (totalBufferLength === undefined) {
		totalBufferLength = charLength;
	}

	if (totalBufferLength < charLength) {
		throw new Error(`Total buffer length=${totalBufferLength} is less than char length=${charLength}`);
	}

	const buffer = new Array(totalBufferLength);

	writeUtf8Character(buffer, 0, charLength);

	return buffer;
}

type BufferLike = ArrayBuffer | Buffer | Uint8Array | number[];

export function combineBuffers(...buffers: BufferLike[]): number[] {
	return buffers.map(bufferLike => {
		if (bufferLike instanceof ArrayBuffer) {
			return Array.from(new Uint8Array(bufferLike));
		} else if (bufferLike instanceof Uint8Array) {
			return Array.from(bufferLike);
		} else if (bufferLike instanceof Buffer) {
			return [...bufferLike];
		}

		return bufferLike;

	}).reduce((sum, next) => sum.concat(next));
}