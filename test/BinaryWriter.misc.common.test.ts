import { expect } from 'chai';
import { BinaryWriter } from "../src";
import { OutOfBoundsError } from "../src/errors/OutOfBoundsError";
import { Endianness } from '../src/Endianness';

describe("BinaryWriter, common misc tests", () => {
	describe("get position", () => {
		it("Return zero on a newly created writer", () => {
			const writer = new BinaryWriter();

			expect(writer.position).to.equal(0);
		});

		it("Return actual position of the writer", () => {
			const writer = new BinaryWriter();

			writer.writeByte(1);
			writer.writeByte(1);

			expect(writer.position).to.equal(2);
		});
	});

	describe("set position", () => {
		it("Setting to negative sets it to zero", () => {
			const writer = new BinaryWriter([0, 1, 2, 3, 4]);

			writer.position = -100;

			expect(writer.position).to.equal(0);
		});

		it("Setting past end of buffer sets it to the end of buffer", () => {
			const writer = new BinaryWriter([0, 1, 2, 3, 4]);

			writer.position = 50;

			expect(writer.position).to.equal(5);
		});

		it("Should change position", () => {
			const writer = new BinaryWriter([0, 1, 2, 3, 4]);

			writer.position = 3;

			expect(writer.position).to.equal(3);
		});
	});

	describe("get length", () => {
		it("Zero on empty buffer", () => {
			const writer = new BinaryWriter();

			expect(writer.length).to.equal(0);
		});

		it("Actual length when something is written", () => {
			const writer = new BinaryWriter();

			writer.writeSameByte(1, 47);

			expect(writer.length).to.equal(47);
		});
	});

	describe("constructor", () => {
		it("constructor() - Should create empty writer", () => {
			const writer = new BinaryWriter();

			expect(writer.length).to.equal(0);
			expect(writer.toArray()).to.deep.equal([]);
		});

		it("constructor(Endianness) - Should set endianness", () => {
			const writerDefault = new BinaryWriter();
			const writerBig = new BinaryWriter(Endianness.Big);
			const writerLittle = new BinaryWriter(Endianness.Little);

			expect(writerDefault.endianness).to.equal(Endianness.Little);
			expect(writerBig.endianness).to.equal(Endianness.Big);
			expect(writerLittle.endianness).to.equal(Endianness.Little);
		});

		it("constructor(array) - Should populate with bytes", () => {
			const startArray = [0, 1, 13, 127];
			const writer = new BinaryWriter(startArray);

			expect(writer.length).to.equal(startArray.length);
			expect(writer.toArray()).to.deep.equal(startArray);
		});

		it("constructor(array) - Should copy the given array", () => {
			const startArray = [0];
			const writer = new BinaryWriter(startArray);

			startArray[0] = 90;
			expect(writer.toArray()).to.deep.equal([0]);
		});

		it("constructor(array) - Should error when invalid byte", () => {
			expect(() => new BinaryWriter([-1])).to.throw(OutOfBoundsError);
			expect(() => new BinaryWriter([256])).to.throw(OutOfBoundsError);
			expect(() => new BinaryWriter([Number.NaN])).to.throw(OutOfBoundsError);
			expect(() => new BinaryWriter([Number.NEGATIVE_INFINITY])).to.throw(OutOfBoundsError);
			expect(() => new BinaryWriter([Number.POSITIVE_INFINITY])).to.throw(OutOfBoundsError);
		});

		it("constructor(array, Endianness) - Should set endianness", () => {
			const writerDefault = new BinaryWriter([]);
			const writerBig = new BinaryWriter([], Endianness.Big);
			const writerLittle = new BinaryWriter([], Endianness.Little);

			expect(writerDefault.endianness).to.equal(Endianness.Little);
			expect(writerBig.endianness).to.equal(Endianness.Big);
			expect(writerLittle.endianness).to.equal(Endianness.Little);
		});

		it("constructor(Uint8Array) - Should populate", () => {
			const startArray = [0, 1, 2, 3];
			const typedArray = new Uint8Array(startArray);
			const writer = new BinaryWriter(typedArray);

			expect(writer.length).to.equal(startArray.length);
			expect(writer.toArray()).to.deep.equal(startArray);
		});

		it("constructor(Uint8Array) - Should copy the given array", () => {
			const startArray = [0];
			const typedArray = new Uint8Array(startArray);
			const writer = new BinaryWriter(typedArray);

			startArray[0] = 90;
			typedArray[0] = 90;
			expect(writer.toArray()).to.deep.equal([0]);
		});

		it("constructor(array, Endianness) - Should set endianness", () => {
			const writerDefault = new BinaryWriter(new Uint8Array([]));
			const writerBig = new BinaryWriter(new Uint8Array([]), Endianness.Big);
			const writerLittle = new BinaryWriter(new Uint8Array([]), Endianness.Little);

			expect(writerDefault.endianness).to.equal(Endianness.Little);
			expect(writerBig.endianness).to.equal(Endianness.Big);
			expect(writerLittle.endianness).to.equal(Endianness.Little);
		});
	});

	describe('clear()', () => {
		it("Should clear whatever is stored in the buffer", () => {
			const writer = new BinaryWriter();

			writer.writeSameByte(10, 100);
			writer.clear();

			expect(writer.length).to.equal(0);
			expect(writer.position).to.equal(0);
			expect(writer.toArray()).to.deep.equal([]);
		});
	});

	describe('toArray()', () => {
		it("Should return array representation of the buffer", () => {
			const writer = new BinaryWriter();

			writer.writeByte(5);
			writer.writeByte(13);

			expect(writer.toArray()).to.deep.equal([5, 13]);
		});
		it("Returned array should not be modified when the writer changes", () => {
			const writer = new BinaryWriter();

			writer.writeByte(5);
			writer.writeByte(13);

			const returnedArray = writer.toArray();
			writer.position = 0;
			writer.writeByte(60);
			writer.writeByte(60);

			expect(returnedArray).to.deep.equal([5, 13]);
		});
	});

	describe('toUint8Array()', () => {
		it("Should return array representation of the buffer", () => {
			const writer = new BinaryWriter();

			writer.writeByte(5);
			writer.writeByte(13);

			expect(Array.from(writer.toUint8Array())).to.deep.equal([5, 13]);
		});

		it("Returned array should not be modified when the writer changes", () => {
			const writer = new BinaryWriter();

			writer.writeByte(5);
			writer.writeByte(13);

			const returnedArray = writer.toArray();
			writer.position = 0;
			writer.writeByte(60);
			writer.writeByte(60);

			expect(Array.from(returnedArray)).to.deep.equal([5, 13]);
		});
	});
});
