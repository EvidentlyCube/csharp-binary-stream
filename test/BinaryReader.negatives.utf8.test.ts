import { expect } from 'chai';
import { BinaryReader, Encoding, EndOfStreamError, InvalidUtf8CharacterError } from "../src";
import { getBufferArray, getBufferBinary, getBufferHex, getBufferOfLength, getInvalidNumberValues, getUtf8CharArray } from "./common";
import * as Utf8 from "../src/Utf8";
import { EndOfStreamMessageFactory, InvalidUtf8CharacterMessageFactory } from "../src/errors/ErrorMessageFactory";
import { expectInvalidArgument } from './asserts';

const lead2 = Utf8.leadingByteLength2Prefix;
const lead3 = Utf8.leadingByteLength3Prefix;
const lead4 = Utf8.leadingByteLength4Prefix;
const cont = Utf8.continuationBytePrefix;

describe("BinaryReader, string UTF-8 encoding negative tests", () => {
	describe('EndOfStream - readChar', () => {
		it("Error when no bytes remaining", () => {
			const reader = new BinaryReader(getBufferArray([]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readCharZeroBytesLeft());
		});
		it("Error when 2-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead2]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 2, 1));
		});
		it("Error when 3-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead3]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 1));
		});
		it("Error when 3-byte character but stream has 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead3, cont]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 2));
		});
		it("Error when 4-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 1));
		});
		it("Error when 4-byte character but stream has 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 2));
		});
		it("Error when 4-byte character but stream has 3 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 3));
		});
	});

	describe('EndOfStream - readChars', () => {
		it("Error when no bytes remaining", () => {
			const reader = new BinaryReader(getBufferArray([]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readCharZeroBytesLeft());
		});
		it("Error when 2-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead2]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 2, 1));
		});
		it("Error when 3-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead3]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 1));
		});
		it("Error when 3-byte character but stream has 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead3, cont]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 2));
		});
		it("Error when 4-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 1));
		});
		it("Error when 4-byte character but stream has 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 2));
		});
		it("Error when 4-byte character but stream has 3 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont]));

			expect(() => reader.readChars(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 3));
		});
	});

	describe('EndOfStream - readCharBytes', () => {
		it("Error when no bytes remaining", () => {
			const reader = new BinaryReader(getBufferArray([]));

			expect(() => reader.readCharBytes(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readCharZeroBytesLeft());
		});
		it("Error when 2-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead2]));

			expect(() => reader.readCharBytes(2, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 2, 1));
		});
		it("Error when 3-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead3]));

			expect(() => reader.readCharBytes(3, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 1));
		});
		it("Error when 3-byte character but stream has 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead3, cont]));

			expect(() => reader.readCharBytes(3, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 2));
		});
		it("Error when 4-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4]));

			expect(() => reader.readCharBytes(4, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 1));
		});
		it("Error when 4-byte character but stream has 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont]));

			expect(() => reader.readCharBytes(4, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 2));
		});
		it("Error when 4-byte character but stream has 3 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont]));

			expect(() => reader.readCharBytes(4, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 3));
		});
		it("Error when 2-byte character but we read 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead2, cont]));

			expect(() => reader.readCharBytes(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(0, 2, 1));
		});
		it("Error when 3-byte character but we read 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead3, cont, cont]));

			expect(() => reader.readCharBytes(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(0, 3, 1));
		});
		it("Error when 3-byte character but we read 2 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead3, cont, cont]));

			expect(() => reader.readCharBytes(2, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(0, 3, 2));
		});
		it("Error when 4-byte character but we read 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont, cont]));

			expect(() => reader.readCharBytes(1, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(0, 4, 1));
		});
		it("Error when 4-byte character but we read 2 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont, cont]));

			expect(() => reader.readCharBytes(2, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(0, 4, 2));
		});
		it("Error when 4-byte character but we read 3 bytes", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont, cont]));

			expect(() => reader.readCharBytes(3, Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesAllowed(0, 4, 3));
		});
	});

	describe('EndOfStream - readString', () => {
		it("Error when no stream left", () => {
			const reader = new BinaryReader(getBufferOfLength(0));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringZeroBytesLeft());
		});
		it("Error when length prefix is longer than 1 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Error when length prefix is longer than 2 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000 1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Error when length prefix is longer than 3 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000 1000:0000 1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Error when length prefix is longer than 4 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000 1000:0000 1000:0000 1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Error when no stream to read any of the string", () => {
			const reader = new BinaryReader(getBufferBinary('0000:0100'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringTooLongLeft(4, 0));
		});

		it("Error when no stream to read all of the string", () => {
			const reader = new BinaryReader(getBufferBinary('0000:0100 0000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringTooLongLeft(4, 1));
		});
	});

	describe('InvalidUtf8CharacterError - readChar', () => {
		it("Should fail when char starts with continuation byte", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000'));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.invalidLeadingByte(Utf8.continuationBytePrefix, 0));
		});

		it("Should fail when char starts with other invalid leading sequence", () => {
			const reader = new BinaryReader(getBufferHex('FF'));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.invalidLeadingByte(0xFF, 0));
		});

		it("Should fail when second byte in two character sequence does not have continuation prefix", () => {
			const sequence = getUtf8CharArray(2, 16);
			sequence[1] = 0xFF;

			const reader = new BinaryReader(getBufferArray(sequence));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 1, 0xFF));
		});

		it("Should fail when second byte in three character sequence does not have continuation prefix", () => {
			const sequence = getUtf8CharArray(3, 16);
			sequence[1] = 0xFF;

			const reader = new BinaryReader(getBufferArray(sequence));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(Error, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 1, 0xFF));
		});

		it("Should fail when third byte in three character sequence does not have continuation prefix", () => {
			const sequence = getUtf8CharArray(3, 16);
			sequence[2] = 0xFF;

			const reader = new BinaryReader(getBufferArray(sequence));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 2, 0xFF));
		});

		it("Should fail when second byte in four character sequence does not have continuation prefix", () => {
			const sequence = getUtf8CharArray(4, 16);
			sequence[1] = 0xFF;

			const reader = new BinaryReader(getBufferArray(sequence));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 1, 0xFF));
		});

		it("Should fail when third byte in four character sequence does not have continuation prefix", () => {
			const sequence = getUtf8CharArray(4, 16);
			sequence[2] = 0xFF;

			const reader = new BinaryReader(getBufferArray(sequence));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 2, 0xFF));
		});

		it("Should fail when fourth byte in four character sequence does not have continuation prefix", () => {
			const sequence = getUtf8CharArray(4, 16);
			sequence[3] = 0xFF;

			const reader = new BinaryReader(getBufferArray(sequence));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 3, 0xFF));
		});
	});

	describe('InvalidArguments - charactersToRead', () => {
		for (const [name, value] of Object.entries(getInvalidNumberValues())) {
			it(`readChars(${name}) - throw InvalidArgument exception`, () => {
				const reader = new BinaryReader(getBufferArray([]));

				expectInvalidArgument(
					// @ts-expect-error: Negative scenario checking
					() => reader.readChars(value),
					"`charactersToRead` is not a number",
					'charactersToRead',
					value
				);
			});

			it(`readCharBytes(${name}) - throw InvalidArgument exception`, () => {
				const reader = new BinaryReader(getBufferArray([]));

				expectInvalidArgument(
					// @ts-expect-error: Negative scenario checking
					() => reader.readCharBytes(value),
					"`bytesToRead` is not a number",
					'bytesToRead',
					value
				);
			});
		}
	});
});