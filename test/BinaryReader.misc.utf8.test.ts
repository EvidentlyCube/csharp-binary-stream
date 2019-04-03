import {expect} from 'chai';
import {BinaryReader, Encoding} from "../src";
import {getBufferArray, getBufferHex, getBufferOfLength, getUtf8CharArray} from "./common";

describe("BinaryReader, string UTF-8 encoding misc tests", () =>
{
	describe("Reading advances position", () =>
	{
		it("readChar - advance by 1 byte when 1 byte char", () =>
		{
			const reader = new BinaryReader(getBufferArray(getUtf8CharArray(1, 16)));
			reader.readChar(Encoding.Utf8);
			expect(reader.position).to.equal(1);
		});
		it("readChar - advance by 2 bytes when 2 byte char", () =>
		{
			const reader = new BinaryReader(getBufferArray(getUtf8CharArray(2, 16)));
			reader.readChar(Encoding.Utf8);
			expect(reader.position).to.equal(2);
		});
		it("readChar - advance by 3 bytes when 3 byte char", () =>
		{
			const reader = new BinaryReader(getBufferArray(getUtf8CharArray(3, 16)));
			reader.readChar(Encoding.Utf8);
			expect(reader.position).to.equal(3);
		});
		it("readChar - advance by 4 bytes when 4 byte char", () =>
		{
			const reader = new BinaryReader(getBufferArray(getUtf8CharArray(4, 16)));
			reader.readChar(Encoding.Utf8);
			expect(reader.position).to.equal(4);
		});

		it("readChars - advance by 4 bytes when four 1-byte chars", () =>
		{
			const array = [].concat(
				getUtf8CharArray(1),
				getUtf8CharArray(1),
				getUtf8CharArray(1),
				getUtf8CharArray(1),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readChars(4, Encoding.Utf8);
			expect(reader.position).to.equal(4);
		});

		it("readChars - advance by 8 bytes when four 2-byte chars", () =>
		{
			const array = [].concat(
				getUtf8CharArray(2),
				getUtf8CharArray(2),
				getUtf8CharArray(2),
				getUtf8CharArray(2),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readChars(4, Encoding.Utf8);
			expect(reader.position).to.equal(8);
		});

		it("readChars - advance by 12 bytes when four 3-byte chars", () =>
		{
			const array = [].concat(
				getUtf8CharArray(3),
				getUtf8CharArray(3),
				getUtf8CharArray(3),
				getUtf8CharArray(3),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readChars(4, Encoding.Utf8);
			expect(reader.position).to.equal(12);
		});

		it("readChars - advance by 16 bytes when four 4-byte chars", () =>
		{
			const array = [].concat(
				getUtf8CharArray(4),
				getUtf8CharArray(4),
				getUtf8CharArray(4),
				getUtf8CharArray(4),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readChars(4, Encoding.Utf8);
			expect(reader.position).to.equal(16);
		});

		it("readCharBytes - advance by 4 bytes", () =>
		{
			const array = [].concat(
				getUtf8CharArray(1),
				getUtf8CharArray(1),
				getUtf8CharArray(1),
				getUtf8CharArray(1),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readCharBytes(4, Encoding.Utf8);
			expect(reader.position).to.equal(4);
		});

		it("readCharBytes - advance by 8 bytes", () =>
		{
			const array = [].concat(
				getUtf8CharArray(2),
				getUtf8CharArray(2),
				getUtf8CharArray(2),
				getUtf8CharArray(2),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readCharBytes(8, Encoding.Utf8);
			expect(reader.position).to.equal(8);
		});

		it("readCharBytes - advance by 12 bytes", () =>
		{
			const array = [].concat(
				getUtf8CharArray(3),
				getUtf8CharArray(3),
				getUtf8CharArray(3),
				getUtf8CharArray(3),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readCharBytes(12, Encoding.Utf8);
			expect(reader.position).to.equal(12);
		});

		it("readCharBytes - advance by 16 bytes", () =>
		{
			const array = [].concat(
				getUtf8CharArray(4),
				getUtf8CharArray(4),
				getUtf8CharArray(4),
				getUtf8CharArray(4),
				new Array(16),
			);

			const reader = new BinaryReader(getBufferArray(array));
			reader.readCharBytes(16, Encoding.Utf8);
			expect(reader.position).to.equal(16);
		});

		it("readString - advance by 2 when one byte length data and one byte string", () =>
		{
			const reader = new BinaryReader(getBufferHex('01 00 00 00 00 00'));
			reader.readString(Encoding.Utf8);
			expect(reader.position).to.equal(2);
		});

		it("readString - advance by 130 when two byte length data and 128 byte string", () =>
		{
			const data = new Array(200);
			data[0] = parseInt('10000000', 2);
			data[1] = parseInt('00000001', 2);
			const reader = new BinaryReader(getBufferArray(data));
			reader.readString(Encoding.Utf8);
			expect(reader.position).to.equal(130);
		});
	});

	describe('Rounding arguments', () => {
		it("readChars - round the argument down", () => {
			const reader = new BinaryReader(getBufferOfLength(128));

			expect(reader.readChars(1.1, Encoding.Utf8)).to.have.length(1);
			expect(reader.readChars(16.9, Encoding.Utf8)).to.have.length(16);
		});
		it("readCharBytes - round the argument down", () => {
			const reader = new BinaryReader(getBufferOfLength(128));

			expect(reader.readCharBytes(1.1, Encoding.Utf8)).to.have.length(1);
			expect(reader.readCharBytes(16.9, Encoding.Utf8)).to.have.length(16);
		});
	});
});
