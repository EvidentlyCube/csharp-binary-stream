import { expect } from 'chai';
import { BinaryReader } from "../src";
import { getBufferArray, getBufferOfLength } from "./common";

describe("BinaryReader, number misc tests", () => {
	describe("Reading advances position", () => {
		it("readBoolean - advance by 1 byte", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readBoolean();
			expect(reader.position).to.equal(1);
		});
		it("readByte - advance by 1 byte", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readByte();
			expect(reader.position).to.equal(1);
		});
		it("readBytes(0) - advance by 0 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readBytes(0);
			expect(reader.position).to.equal(0);
		});
		it("readBytes(1) - advance by 1 byte", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readBytes(1);
			expect(reader.position).to.equal(1);
		});
		it("readBytes(7) - advance by 7 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readBytes(7);
			expect(reader.position).to.equal(7);
		});
		it("readSignedByte - advance by 2 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readSignedByte();
			expect(reader.position).to.equal(1);
		});
		it("readShort - advance by 2 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readShort();
			expect(reader.position).to.equal(2);
		});
		it("readUnsignedShort - advance by 2 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedShort();
			expect(reader.position).to.equal(2);
		});
		it("readInt - advance by 4 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readInt();
			expect(reader.position).to.equal(4);
		});
		it("readUnsignedInt - advance by 4 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedInt();
			expect(reader.position).to.equal(4);
		});
		it("readLong - advance by 8 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readLong();
			expect(reader.position).to.equal(8);
		});
		it("readLongString - advance by 8 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readLongString();
			expect(reader.position).to.equal(8);
		});
		it("readUnsignedLong - advance by 8 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedLong();
			expect(reader.position).to.equal(8);
		});
		it("readUnsignedLongString - advance by 8 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readUnsignedLongString();
			expect(reader.position).to.equal(8);
		});
		it("readFloat - advance by 4 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readFloat();
			expect(reader.position).to.equal(4);
		});
		it("readDouble - advance by 8 bytes", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.readDouble();
			expect(reader.position).to.equal(8);
		});
	});

	describe('Correct return', () => {
		const bytes = [0, 17, 42, 128, 255];
		[0, 1, 2, 3, 4, 5].forEach(bytesToRead => {
			it(`readBytes(${bytesToRead}) - should correctly read the bytes`, () => {
				const reader = new BinaryReader(getBufferArray(bytes));
				const readBytes = reader.readBytes(bytesToRead);
				expect(readBytes).to.deep.equal(bytes.slice(0, bytesToRead));
			});
		})
	})
});
