import {expect} from 'chai';
import {BinaryReader} from "../src";
import {getBufferOfLength} from "./common";

describe("BinaryReader, number misc tests", () =>
{
	describe("get length", () =>
	{
		[0, 7, 32, 1024, 256 * 256].forEach(length =>
		{
			it(`Should return expected buffer length (length=${length}`, () =>
			{
				const reader = new BinaryReader(getBufferOfLength(length));

				expect(reader.length).to.equal(length);
			});
		});
	});

	describe("set position", () =>
	{
		it("Setting position to negative value rounds to zero", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 10;
			reader.position = -10;
			expect(reader.position).to.equal(0);
		});

		it("Changing position should work", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 5;
			expect(reader.position).to.equal(5);
		});

		it("Setting position past thend value rounds to the end position", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 200;
			expect(reader.position).to.equal(16);
		});
	});

	describe("get isEndOfStream", () =>
	{
		it("Should return false when at the beginning of non-zero-byte stream", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			expect(reader.isEndOfStream).to.equal(false);
		});
		it("Should return false when on last byte of non-zero-byte stream", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 15;
			expect(reader.isEndOfStream).to.equal(false);
		});
		it("Should return true when after last byte of non-zero-byte stream", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 16;
			expect(reader.isEndOfStream).to.equal(true);
		});
		it("Should return true when at the start of zero-byte stream", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(reader.isEndOfStream).to.equal(true);
		});
	});

	describe("Reading advances position", () =>
	{
		it("readBoolean - advance by 1 byte", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readBoolean();
			expect(reader.position).to.equal(1);
		});
		it("readByte - advance by 1 byte", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readByte();
			expect(reader.position).to.equal(1);
		});
		it("readSignedByte - advance by 2 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readSignedByte();
			expect(reader.position).to.equal(1);
		});
		it("readShort - advance by 2 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readShort();
			expect(reader.position).to.equal(2);
		});
		it("readUnsignedShort - advance by 2 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedShort();
			expect(reader.position).to.equal(2);
		});
		it("readInt - advance by 4 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readInt();
			expect(reader.position).to.equal(4);
		});
		it("readUnsignedInt - advance by 4 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedInt();
			expect(reader.position).to.equal(4);
		});
		it("readLong - advance by 8 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readLong();
			expect(reader.position).to.equal(8);
		});
		it("readLongString - advance by 8 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readLongString();
			expect(reader.position).to.equal(8);
		});
		it("readUnsignedLong - advance by 8 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedLong();
			expect(reader.position).to.equal(8);
		});
		it("readUnsignedLongString - advance by 8 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedLongString();
			expect(reader.position).to.equal(8);
		});
		it("readFloat - advance by 4 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readFloat();
			expect(reader.position).to.equal(4);
		});
		it("readDouble - advance by 8 bytes", () =>
		{
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readDouble();
			expect(reader.position).to.equal(8);
		});
	});
});
