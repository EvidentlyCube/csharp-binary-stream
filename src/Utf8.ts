import {InvalidUtf8CharacterError} from "./errors/InvalidUtf8CharacterError";
import {InvalidUtf8CharacterMessageFactory, EndOfStreamMessageFactory} from "./errors/ErrorMessageFactory";
import {EndOfStreamError} from "./errors/EndOfStreamError";
import {InvalidArgumentError} from "./errors/InvalidArgumentError";

/** @ignore */
export const leadingByteLength1Prefix = parseInt("00000000", 2); // b0xxxxxxx
/** @ignore */
export const leadingByteLength2Prefix = parseInt("11000000", 2); // b110xxxxx
/** @ignore */
export const leadingByteLength3Prefix = parseInt("11100000", 2); // b1110xxxx
/** @ignore */
export const leadingByteLength4Prefix = parseInt("11110000", 2); // b11110xxx
/** @ignore */
export const continuationBytePrefix = parseInt("10000000", 2); // b10xxxxxx

/** @ignore */
export const continuationByteMask = parseInt("11000000", 2); // b11000000

/** @ignore */
export function isUtf8ContinuationCharacter(byte: number): boolean
{
	return (byte & continuationByteMask) === continuationBytePrefix;
}

/** @ignore*/
interface Utf8ReadResult
{
	readString: string;
	finalPosition: number;
}

export function writeUtf8StringFromCodePoints(buffer: number[], position: number, dataToWrite: number[] | string): number
{
	if (typeof dataToWrite === "string") {
		dataToWrite = Array.from(dataToWrite).map(x => x.codePointAt(0));
	}

	for(let i = 0; i < dataToWrite.length; i++) {
		const codepoint = dataToWrite[i];
		if (Number.isNaN(codepoint) || !Number.isFinite(codepoint) || codepoint < 0) {
			throw new InvalidArgumentError(`Codepoint at position #${i} in the UTF-8 data-to-write is not valid, should be non-negative integer.`, 'dataToWrite', codepoint);
		}

		if (codepoint < 0x80) {
			buffer[position++] = codepoint;

		} else if (codepoint < 0x800) {
			buffer[position++] = 0xc0 | (codepoint >> 6);
			buffer[position++] = 0x80 | (codepoint & 0x3f);
		}
		else if (codepoint < 0x10000) {
			buffer[position++] = 0xe0 | (codepoint >> 12);
			buffer[position++] = 0x80 | ((codepoint >> 6) & 0x3f);
			buffer[position++] = 0x80 | (codepoint & 0x3f);
		}
		else {
			buffer[position++] = 0xf0 | (codepoint >> 18);
			buffer[position++] = 0x80 | ((codepoint >> 12) & 0x3f);
			buffer[position++] = 0x80 | ((codepoint >> 6) & 0x3f);
			buffer[position++] = 0x80 | (codepoint & 0x3f);
		}
	}

	return position;
}

/** @ignore */
export function readUtf8StringFromBytes(bytes: Uint8Array, position: number, maxCharactersToRead: number = Number.MAX_SAFE_INTEGER, maxBytesToRead: number = Number.MAX_SAFE_INTEGER): Utf8ReadResult
{
	const maxFinalPosition = Math.min(bytes.length, position + maxBytesToRead);
	let readString = '';
	let readCharacters = 0;
	while (position < maxFinalPosition && readCharacters < maxCharactersToRead) {
		const remainingBytes = bytes.length - position;
		const remainingAllowedBytes = maxFinalPosition - position;

		let leadingByte = bytes[position++];
		if (leadingByte > 127) {
			if (leadingByte > 191 && leadingByte < 224) {
				if (remainingBytes < 2) {
					throw new EndOfStreamError(EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(position - 1, 2, remainingBytes));

				} else if (remainingAllowedBytes < 2) {
					throw new EndOfStreamError(EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(position - 1, 2, remainingAllowedBytes));
				}

				const secondByte = bytes[position++];
				if (!isUtf8ContinuationCharacter(secondByte)) {
					throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.notContinuationByte(position - 2, 1, secondByte));
				}
				leadingByte = (leadingByte & 31) << 6 | secondByte & 63;
			} else if (leadingByte > 223 && leadingByte < 240) {
				if (remainingBytes < 3) {
					throw new EndOfStreamError(EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(position - 1, 3, remainingBytes));

				} else if (remainingAllowedBytes < 3) {
					throw new EndOfStreamError(EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(position - 1, 3, remainingAllowedBytes));
				}

				const secondByte = bytes[position++];
				const thirdByte = bytes[position++];
				if (!isUtf8ContinuationCharacter(secondByte)) {
					throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.notContinuationByte(position - 3, 1, secondByte));
				}
				if (!isUtf8ContinuationCharacter(thirdByte)) {
					throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.notContinuationByte(position - 3, 2, thirdByte));
				}
				leadingByte = (leadingByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
			} else if (leadingByte > 239 && leadingByte < 248) {
				if (remainingBytes < 4) {
					throw new EndOfStreamError(EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(position - 1, 4, remainingBytes));

				} else if (remainingAllowedBytes < 4) {
					throw new EndOfStreamError(EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(position - 1, 4, remainingAllowedBytes));
				}

				const secondByte = bytes[position++];
				const thirdByte = bytes[position++];
				const fourthByte = bytes[position++];
				if (!isUtf8ContinuationCharacter(secondByte)) {
					throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.notContinuationByte(position - 4, 1, secondByte));
				}
				if (!isUtf8ContinuationCharacter(thirdByte)) {
					throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.notContinuationByte(position - 4, 2, thirdByte));
				}
				if (!isUtf8ContinuationCharacter(fourthByte)) {
					throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.notContinuationByte(position - 4, 3, fourthByte));
				}
				leadingByte = (leadingByte & 7) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
			} else {
				throw new InvalidUtf8CharacterError(InvalidUtf8CharacterMessageFactory.invalidLeadingByte(leadingByte, position - 1));
			}
		}

		readCharacters++;

		if (leadingByte <= 0xffff) {
			readString += String.fromCharCode(leadingByte);

		} else if (leadingByte <= 0x10ffff) {
			leadingByte -= 0x10000;
			readString += String.fromCharCode(leadingByte >> 10 | 0xd800);
			readString += String.fromCharCode(leadingByte & 0x3FF | 0xdc00);
		} else {
			throw new Error('UTF-8 decode: code point 0x' + leadingByte.toString(16) + ' exceeds UTF-16 reach');
		}
	}

	return {
		readString: readString,
		finalPosition: position,
	};
}

