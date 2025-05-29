import { expect } from 'chai';
import { BinaryReader } from "../src";
import { getBufferOfLength } from "./common";
import { Endianness } from '../src/Endianess';

describe("BinaryReader, common tests", () => {
	it('constructor(Uint8Array) - endianness', () => {
		const readerDefault = new BinaryReader(new Uint8Array([]));
		const readerBig = new BinaryReader(new Uint8Array([]), Endianness.Big);
		const readerLittle = new BinaryReader(new Uint8Array([]), Endianness.Little);

		expect(readerDefault.endianness).to.equal(Endianness.Little);
		expect(readerBig.endianness).to.equal(Endianness.Big);
		expect(readerLittle.endianness).to.equal(Endianness.Little);
	});

	it('constructor(ArrayBuffer) - endianness', () => {
		const readerDefault = new BinaryReader(new ArrayBuffer());
		const readerBig = new BinaryReader(new ArrayBuffer(), Endianness.Big);
		const readerLittle = new BinaryReader(new ArrayBuffer(), Endianness.Little);

		expect(readerDefault.endianness).to.equal(Endianness.Little);
		expect(readerBig.endianness).to.equal(Endianness.Big);
		expect(readerLittle.endianness).to.equal(Endianness.Little);
	});

	describe("get length", () => {
		[0, 7, 32, 1024, 256 * 256].forEach(length => {
			it(`Should return expected buffer length (length=${length}`, () => {
				const reader = new BinaryReader(getBufferOfLength(length));

				expect(reader.length).to.equal(length);
			});
		});
	});

	describe("get position", () => {
		it("Return zero on a newly created reader", () => {
			const reader = new BinaryReader(getBufferOfLength(10));

			expect(reader.position).to.equal(0);
		});

		it("Return actual position of the reader", () => {
			const reader = new BinaryReader(getBufferOfLength(10));

			reader.readByte();
			reader.readByte();

			expect(reader.position).to.equal(2);
		});
	});

	describe("set position", () => {
		it("Setting position to negative value rounds to zero", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 10;
			reader.position = -10;
			expect(reader.position).to.equal(0);
		});

		it("Changing position should work", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 5;
			expect(reader.position).to.equal(5);
		});

		it("Setting position past the end value rounds to the end position", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 200;
			expect(reader.position).to.equal(16);
		});
	});

	describe("get isEndOfStream", () => {
		it("Should return false when at the beginning of non-zero-byte stream", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			expect(reader.isEndOfStream).to.equal(false);
		});
		it("Should return false when on last byte of non-zero-byte stream", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 15;
			expect(reader.isEndOfStream).to.equal(false);
		});
		it("Should return true when after last byte of non-zero-byte stream", () => {
			const reader = new BinaryReader(getBufferOfLength(16));
			reader.position = 16;
			expect(reader.isEndOfStream).to.equal(true);
		});
		it("Should return true when at the start of zero-byte stream", () => {
			const reader = new BinaryReader(getBufferOfLength(0));
			expect(reader.isEndOfStream).to.equal(true);
		});
	});
});
