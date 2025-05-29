import { expect } from 'chai';
import { BinaryReader, Encoding, EndOfStreamError, InvalidUtf8CharacterError } from "../src";
import { getBufferArray, getBufferBinary, getBufferHex, getBufferOfLength, getUtf8CharArray } from "./common";
import * as Utf8 from "../src/Utf8";
import { EndOfStreamMessageFactory, InvalidUtf8CharacterMessageFactory } from "../src/errors/ErrorMessageFactory";
import { InvalidArgumentError } from "../src/errors/InvalidArgumentError";

const lead2 = Utf8.leadingByteLength2Prefix;
const lead3 = Utf8.leadingByteLength3Prefix;
const lead4 = Utf8.leadingByteLength4Prefix;
const cont = Utf8.continuationBytePrefix;

describe("BinaryReader, number negative tests", () => {
	describe('EndOfStream - numerics', () => {
		it('readBoolean', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readBoolean()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(1, 0, 'readBoolean'));
		});

		it('readByte', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readByte()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(1, 0, 'readByte'));
		});

		it('readBytes (starting read at the end)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readBytes(5)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(5, 0, 'readBytes'));
		});

		it('readBytes (starting before the end)', () => {
			const reader = new BinaryReader(getBufferOfLength(5));
			expect(() => reader.readBytes(10)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(10, 5, 'readBytes'));
		});

		it('readSignedByte', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readSignedByte()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(1, 0, 'readSignedByte'));
		});

		it('readShort (0-bytes remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readShort()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(2, 0, 'readShort'));
		});
		it('readShort (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readShort()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(2, 1, 'readShort'));
		});

		it('readUnsignedShort (0-bytes remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readUnsignedShort()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(2, 0, 'readUnsignedShort'));
		});
		it('readUnsignedShort (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readUnsignedShort()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(2, 1, 'readUnsignedShort'));
		});

		it('readInt (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 0, 'readInt'));
		});
		it('readInt (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 1, 'readInt'));
		});
		it('readInt (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 2, 'readInt'));
		});
		it('readInt (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 3, 'readInt'));
		});

		it('readUnsignedInt (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readUnsignedInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 0, 'readUnsignedInt'));
		});
		it('readUnsignedInt (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readUnsignedInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 1, 'readUnsignedInt'));
		});
		it('readUnsignedInt (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readUnsignedInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 2, 'readUnsignedInt'));
		});
		it('readUnsignedInt (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readUnsignedInt()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 3, 'readUnsignedInt'));
		});

		it('readLong (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 0, 'readLong'));
		});
		it('readLong (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 1, 'readLong'));
		});
		it('readLong (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 2, 'readLong'));
		});
		it('readLong (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 3, 'readLong'));
		});
		it('readLong (4-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(4));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 4, 'readLong'));
		});
		it('readLong (5-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(5));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 5, 'readLong'));
		});
		it('readLong (6-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(6));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 6, 'readLong'));
		});
		it('readLong (7-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(7));
			expect(() => reader.readLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 7, 'readLong'));
		});

		it('readLongString (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 0, 'readLongString'));
		});
		it('readLongString (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 1, 'readLongString'));
		});
		it('readLongString (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 2, 'readLongString'));
		});
		it('readLongString (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 3, 'readLongString'));
		});
		it('readLongString (4-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(4));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 4, 'readLongString'));
		});
		it('readLongString (5-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(5));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 5, 'readLongString'));
		});
		it('readLongString (6-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(6));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 6, 'readLongString'));
		});
		it('readLongString (7-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(7));
			expect(() => reader.readLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 7, 'readLongString'));
		});

		it('readUnsignedLong (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 0, 'readUnsignedLong'));
		});
		it('readUnsignedLong (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 1, 'readUnsignedLong'));
		});
		it('readUnsignedLong (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 2, 'readUnsignedLong'));
		});
		it('readUnsignedLong (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 3, 'readUnsignedLong'));
		});
		it('readUnsignedLong (4-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(4));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 4, 'readUnsignedLong'));
		});
		it('readUnsignedLong (5-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(5));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 5, 'readUnsignedLong'));
		});
		it('readUnsignedLong (6-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(6));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 6, 'readUnsignedLong'));
		});
		it('readUnsignedLong (7-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(7));
			expect(() => reader.readUnsignedLong()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 7, 'readUnsignedLong'));
		});

		it('readUnsignedLongString (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 0, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 1, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 2, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 3, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (4-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(4));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 4, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (5-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(5));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 5, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (6-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(6));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 6, 'readUnsignedLongString'));
		});
		it('readUnsignedLongString (7-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(7));
			expect(() => reader.readUnsignedLongString()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 7, 'readUnsignedLongString'));
		});

		it('readFloat (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readFloat()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 0, 'readFloat'));
		});
		it('readFloat (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readFloat()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 1, 'readFloat'));
		});
		it('readFloat (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readFloat()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 2, 'readFloat'));
		});
		it('readFloat (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readFloat()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(4, 3, 'readFloat'));
		});

		it('readDouble (0-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 0, 'readDouble'));
		});
		it('readDouble (1-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(1));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 1, 'readDouble'));
		});
		it('readDouble (2-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(2));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 2, 'readDouble'));
		});
		it('readDouble (3-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(3));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 3, 'readDouble'));
		});
		it('readDouble (4-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(4));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 4, 'readDouble'));
		});
		it('readDouble (5-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(5));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 5, 'readDouble'));
		});
		it('readDouble (6-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(6));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 6, 'readDouble'));
		});
		it('readDouble (7-byte remaining)', () => {
			const reader = new BinaryReader(getBufferOfLength(7));
			expect(() => reader.readDouble()).to.throw(EndOfStreamError, EndOfStreamMessageFactory.notEnoughBytesInBuffer(8, 7, 'readDouble'));
		});
	});

	describe('EndOfStream - readChar(utf8)', () => {
		it("Should error when no bytes remaining", () => {
			const reader = new BinaryReader(getBufferArray([]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readCharZeroBytesLeft());
		});
		it("Should error when 2-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead2]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 2, 1));
		});
		it("Should error when 3-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead3]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 1));
		});
		it("Should error when 3-byte character but stream has 2 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead3, cont]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 3, 2));
		});
		it("Should error when 4-byte character but stream has 1 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 1));
		});
		it("Should error when 4-byte character but stream has 2 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 2));
		});
		it("Should error when 5-byte character but stream has 2 byte", () => {
			const reader = new BinaryReader(getBufferArray([lead4, cont, cont]));

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.utf8NotEnoughBytesInBuffer(0, 4, 3));
		});
	});

	describe('EndOfStream - readString(utf8)', () => {
		it("Should error when no stream left", () => {
			const reader = new BinaryReader(getBufferOfLength(0));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringZeroBytesLeft());
		});

		it("Should error when length prefix is longer than 1 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Should error when length prefix is longer than 2 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000 1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Should error when length prefix is longer than 3 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000 1000:0000 1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Should error when length prefix is longer than 4 byte and not enough bytes left", () => {
			const reader = new BinaryReader(getBufferBinary('1000:0000 1000:0000 1000:0000 1000:0000'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		});

		it("Should error when no stream to read any of the string", () => {
			const reader = new BinaryReader(getBufferBinary('0000:0100'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringTooLongLeft(4, 0));
		});

		it("Should error when no stream to read all of the string", () => {
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

			expect(() => reader.readChar(Encoding.Utf8)).to.throw(InvalidUtf8CharacterError, InvalidUtf8CharacterMessageFactory.notContinuationByte(0, 1, 0xFF));
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

	describe('InvalidArgumentError - readBytes', () => {
		it("Should fail if trying to read negative bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(0));

			expect(() => reader.readBytes(-1)).to.throw(InvalidArgumentError);
		});
	})
});
