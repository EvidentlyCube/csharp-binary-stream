import { expect } from 'chai';
import { BinaryWriter } from "../src";
import { OutOfBoundsMessageFactory } from "../src/errors/ErrorMessageFactory";
import { OutOfBoundsError } from "../src/errors/OutOfBoundsError";
import { InvalidArgumentError } from "../src/errors/InvalidArgumentError";
import { Numbers } from "../src/Numbers";

interface TestCase<T> {
	options: [string, number | string, number | string];
	cases: T[];
	runner: (writer: BinaryWriter, value: T) => void;
}

describe("BinaryWriter, number negative tests", () => {
	describe('OutOfBounds - numerics', () => {
		runTests('writeByte', {
			options: ['byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX],
			cases: [-1, 256, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeByte(value),
		});
		runTests('writeSameByte', {
			options: ['byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX],
			cases: [-1, 256, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeSameByte(value, 10),
		});
		runTests('writeSignedByte', {
			options: ['signed byte', Numbers.SBYTE.MIN, Numbers.SBYTE.MAX],
			cases: [-129, 128, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeSignedByte(value),
		});
		runTests('writeShort', {
			options: ['short', Numbers.SHORT.MIN, Numbers.SHORT.MAX],
			cases: [-32769, 32768, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeShort(value),
		});
		runTests('writeUnsignedShort', {
			options: ['unsigned short', Numbers.USHORT.MIN, Numbers.USHORT.MAX],
			cases: [-1, 65536, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeUnsignedShort(value),
		});
		runTests('writeInt', {
			options: ['int', Numbers.INT.MIN, Numbers.INT.MAX],
			cases: [-2147483649, 2147483648, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeInt(value),
		});
		runTests('writeUnsignedInt', {
			options: ['unsigned int', Numbers.UINT.MIN, Numbers.UINT.MAX],
			cases: [-1, 4294967296, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
			runner: (writer, value) => writer.writeUnsignedInt(value),
		});
		runTests('writeLong', {
			options: ['long', Numbers.LONG.MIN, Numbers.LONG.MAX],
			cases: ["-9223372036854775809", "9223372036854775808", -10223372036854775809, 10223372036854775807, -Number.MAX_VALUE, Number.MAX_VALUE],
			runner: (writer, value) => writer.writeLong(value),
		});
		runTests('writeUnsignedLong', {
			options: ['unsigned long', Numbers.ULONG.MIN, Numbers.ULONG.MAX],
			cases: ["-1", "18446744073709551616", -1, 18446744073709551616, -Number.MAX_VALUE, Number.MAX_VALUE],
			runner: (writer, value) => writer.writeUnsignedLong(value),
		});
		runTests('writeFloat', {
			options: ['float', Numbers.FLOAT.MIN, Numbers.FLOAT.MAX],
			cases: [-3.4028236e+38, 3.4028236e+38, -Number.MAX_VALUE, Number.MAX_VALUE],
			runner: (writer, value) => writer.writeFloat(value),
		});

		it("writeBytes - detect invalid byte on first position", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeBytes([-1])).to.throw(OutOfBoundsError, OutOfBoundsMessageFactory.numberOutsideRange('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, -1));
		});

		it("writeBytes - detect invalid byte on further position", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeBytes([0, 1, 2, -1])).to.throw(OutOfBoundsError, OutOfBoundsMessageFactory.numberOutsideRange('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, -1));
		});
	});
	describe("Invalid arguments", () => {
		it("writeLong - invalid argument on negative infinity", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeLong(Number.NEGATIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeLong - invalid argument on positive infinity", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeLong(Number.POSITIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeLong - invalid argument on NaN", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeLong(Number.NaN)).to.throw(InvalidArgumentError);
		});
		it("writeUnsignedLong - invalid argument on negative infinity", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeUnsignedLong(Number.NEGATIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeUnsignedLong - invalid argument on positive infinity", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeUnsignedLong(Number.POSITIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeUnsignedLong - invalid argument on NaN", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeUnsignedLong(Number.NaN)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on NaN", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, Number.NaN)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on +Infinity", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, Number.POSITIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on -Infinity", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, Number.NEGATIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on negative", () => {
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, -1)).to.throw(InvalidArgumentError);
		});
	});
});

interface TestCase<T> {
	options: [string, number | string, number | string];
	cases: T[];
	runner: (writer: BinaryWriter, value: T) => void;
}

function runTests<T extends string | number>(testName: string, testCase: TestCase<T>) {
	testCase.cases.forEach(value => {
		it(`${testName}(${value})`, () => {
			const writer = new BinaryWriter();
			try {
				testCase.runner(writer, value)
			} catch (e) {
				if (!(e instanceof OutOfBoundsError)) {
					console.log(e);
					process.exit();
				}
			}
			expect(() => testCase.runner(writer, value))
				.to.throw(
					OutOfBoundsError,
					OutOfBoundsMessageFactory.numberOutsideRange(testCase.options[0], testCase.options[1], testCase.options[2], value)
				);
		});
	});
}