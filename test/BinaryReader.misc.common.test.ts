import { expect } from 'chai';
import { BinaryReader } from "../src";
import { getBufferOfLength } from "./common";
import { Endianness } from '../src/Endianness';

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

	describe('properties', () => {
		const BufferLength = 32;
		const SliceLength = 16;
		const SliceOffset = 4;

		const buffer = getBufferOfLength(BufferLength);
		const arrayFull = new Uint8Array(buffer);
		const arraySlice = new Uint8Array(buffer, SliceOffset, SliceLength);

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
			it("Changing position should work", () => {
				const reader = new BinaryReader(buffer);
				reader.position = 5;
				expect(reader.position).to.equal(5);
			});

			it("Setting position to negative value rounds to zero", () => {
				const reader = new BinaryReader(buffer);
				reader.position = 10;
				reader.position = -10;
				expect(reader.position).to.equal(0);
			});

			it("Setting position past the end value rounds to the end position", () => {
				const reader = new BinaryReader(buffer);
				reader.position = 200;
				expect(reader.position).to.equal(BufferLength);
			});

			it("Cannot set position past the length if using sliced array", () => {
				const reader = new BinaryReader(arraySlice);
				reader.position = BufferLength;
				expect(reader.position).to.equal(SliceLength);
			});
		});

		describe('get length', () => {
			it('Proper result for different stream types', () => {
				const readerBuffer = new BinaryReader(buffer);
				const readerArrayFull = new BinaryReader(arrayFull);
				const readerArraySliced = new BinaryReader(arraySlice);

				expect(readerBuffer.length).to.equal(BufferLength);
				expect(readerArrayFull.length).to.equal(BufferLength);
				expect(readerArraySliced.length).to.equal(SliceLength);
			});

			describe("get length", () => {
				[0, 7, 32, 1024, 256 * 256].forEach(length => {
					it(`Should return expected buffer length (length=${length}`, () => {
						const reader = new BinaryReader(getBufferOfLength(length));

						expect(reader.length).to.equal(length);
					});
				});
			});
		})

		describe('get isEndOfStream', () => {
			it('Proper result for stream created from Buffer', () => {
				const reader = new BinaryReader(buffer);

				expect(reader.isEndOfStream).to.equal(false);

				reader.position = BufferLength - 1;
				expect(reader.isEndOfStream).to.equal(false);

				reader.position = BufferLength;
				expect(reader.isEndOfStream).to.equal(true);

				reader.position = BufferLength + 1;
				expect(reader.isEndOfStream).to.equal(true);
			});

			it('Proper result for stream created from unsliced Uint8Array', () => {
				const reader = new BinaryReader(arrayFull);

				expect(reader.isEndOfStream).to.equal(false);

				reader.position = BufferLength - 1;
				expect(reader.isEndOfStream).to.equal(false);

				reader.position = BufferLength;
				expect(reader.isEndOfStream).to.equal(true);

				reader.position = BufferLength + 1;
				expect(reader.isEndOfStream).to.equal(true);
			});

			it('Proper result for stream created from sliced Uint8Array', () => {
				const reader = new BinaryReader(arraySlice);

				expect(reader.isEndOfStream).to.equal(false);

				reader.position = SliceLength - 1;
				expect(reader.isEndOfStream).to.equal(false);

				reader.position = SliceLength;
				expect(reader.isEndOfStream).to.equal(true);

				reader.position = SliceLength + 1;
				expect(reader.isEndOfStream).to.equal(true);
			});

			it("Return true when at the start of zero-byte long stream", () => {
				const reader = new BinaryReader(getBufferOfLength(0));
				expect(reader.isEndOfStream).to.equal(true);
			});
		})
	})
});
