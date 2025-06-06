import { expect } from 'chai';
import { BinaryReader, Encoding, EndOfStreamError } from "../src";
import { getBufferBinary, getBufferOfLength } from "./common";
import { EncodingMessageFactory, EndOfStreamMessageFactory } from "../src/errors/ErrorMessageFactory";
import { EncodingError } from "../src/errors/EncodingError";

describe("BinaryReader, string negative tests", () => {
	const invalidEncodings = ['utf7', 'not an encoding'];
	invalidEncodings.forEach(encoding => {
		describe(`Unknown encoding: ${encoding}`, () => {
			it("readChar error when unknown encoding", () => {
				const reader = new BinaryReader(getBufferOfLength(0));

				expect(() => reader.readChar(encoding as Encoding)).to.throw(EncodingError, EncodingMessageFactory.unknownEncoding(encoding));
			});
			it("readChars error when unknown encoding", () => {
				const reader = new BinaryReader(getBufferOfLength(0));

				expect(() => reader.readChars(1, encoding as Encoding)).to.throw(EncodingError, EncodingMessageFactory.unknownEncoding(encoding));
			});
			it("readCharBytes error when unknown encoding", () => {
				const reader = new BinaryReader(getBufferOfLength(0));

				expect(() => reader.readCharBytes(1, encoding as Encoding)).to.throw(EncodingError, EncodingMessageFactory.unknownEncoding(encoding));
			});
			it("readString error when unknown encoding", () => {
				const reader = new BinaryReader(getBufferOfLength(0));

				expect(() => reader.readString(encoding as Encoding)).to.throw(EncodingError, EncodingMessageFactory.unknownEncoding(encoding));
			});
		});
	});

	describe("Other tests", () => {
		it("readString - error when length prefix takes more than 5 bytes", () => {
			const reader = new BinaryReader(getBufferBinary('10000001 10000001 10000001 10000001 10000001 10000001'));

			expect(() => reader.readString(Encoding.Utf8)).to.throw(EndOfStreamError, EndOfStreamMessageFactory.readStringTooLongPrefix());
		});
	});
});
