import {expect} from 'chai';
import {BinaryWriter} from "../src";
import {OutOfBoundsMessageFactory} from "../src/errors/ErrorMessageFactory";
import {OutOfBoundsError} from "../src/errors/OutOfBoundsError";
import {InvalidArgumentError} from "../src/errors/InvalidArgumentError";
import {Numbers} from "../src/Numbers";

interface TestCase
{
	options: [string, number | string, number | string];
	cases: any[];
	runner: (writer: BinaryWriter, value: any) => void;
}

describe("BinaryWriter, number negative tests", () =>
{
	describe('OutOfBounds - numerics', () =>
	{
		const methodTestsMap: { [key: string]: TestCase } = {
			'writeByte': {
				options: ['byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX],
				cases: [-1, 256, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeByte(value),
			},
			'writeSameByte': {
				options: ['byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX],
				cases: [-1, 256, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeSameByte(value, 10),
			},
			'writeSignedByte': {
				options: ['signed byte', Numbers.SBYTE.MIN, Numbers.SBYTE.MAX],
				cases: [-129, 128, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeSignedByte(value),
			},
			'writeShort': {
				options: ['short', Numbers.SHORT.MIN, Numbers.SHORT.MAX],
				cases: [-32769, 32768, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeShort(value),
			},
			'writeUnsignedShort': {
				options: ['unsigned short', Numbers.USHORT.MIN, Numbers.USHORT.MAX],
				cases: [-1, 65536, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeUnsignedShort(value),
			},
			'writeInt': {
				options: ['int', Numbers.INT.MIN, Numbers.INT.MAX],
				cases: [-2147483649, 2147483648, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeInt(value),
			},
			'writeUnsignedInt': {
				options: ['unsigned int', Numbers.UINT.MIN, Numbers.UINT.MAX],
				cases: [-1, 4294967296, -Number.MAX_VALUE, Number.MAX_VALUE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NaN],
				runner: (writer, value) => writer.writeUnsignedInt(value),
			},
			'writeLong': {
				options: ['long', Numbers.LONG.MIN, Numbers.LONG.MAX],
				cases: ["-9223372036854775809", "9223372036854775808", -9223372036854775809, 9223372036854775807, -Number.MAX_VALUE, Number.MAX_VALUE],
				runner: (writer, value) => writer.writeLong(value),
			},
			'writeUnsignedLong': {
				options: ['unsigned long', Numbers.ULONG.MIN, Numbers.ULONG.MAX],
				cases: ["-1", "18446744073709551616", -1, 18446744073709551616, -Number.MAX_VALUE, Number.MAX_VALUE],
				runner: (writer, value) => writer.writeUnsignedLong(value),
			},
			'writeFloat': {
				options: ['float', Numbers.FLOAT.MIN, Numbers.FLOAT.MAX],
				cases: [-3.4028236e+38, 3.4028236e+38, -Number.MAX_VALUE, Number.MAX_VALUE],
				runner: (writer, value) => writer.writeFloat(value),
			},
		};

		Object.entries(methodTestsMap).forEach(entry =>
		{
			const testName: string = entry[0];
			const testCase: TestCase = entry[1];

			testCase.cases.forEach(value =>
			{
				it(`${testName}(${value})`, () =>
				{
					const writer = new BinaryWriter();
					expect(() => testCase.runner(writer, value))
						.to.throw(OutOfBoundsError, OutOfBoundsMessageFactory.numberOutsideRange(testCase.options[0], testCase.options[1], testCase.options[2], value));
				});
			});
		});

		it("writeBytes - detect invalid byte on first position", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeBytes([-1])).to.throw(OutOfBoundsError, OutOfBoundsMessageFactory.numberOutsideRange('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, -1));
		});

		it("writeBytes - detect invalid byte on further position", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeBytes([0, 1, 2, -1])).to.throw(OutOfBoundsError, OutOfBoundsMessageFactory.numberOutsideRange('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, -1));
		});
	});
	describe("Invalid arguments", () =>
	{
		it("writeLong - invalid argument on negative infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeLong(Number.NEGATIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeLong - invalid argument on positive infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeLong(Number.POSITIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeLong - invalid argument on NaN", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeLong(Number.NaN)).to.throw(InvalidArgumentError);
		});
		it("writeUnsignedLong - invalid argument on negative infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeUnsignedLong(Number.NEGATIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeUnsignedLong - invalid argument on positive infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeUnsignedLong(Number.POSITIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeUnsignedLong - invalid argument on NaN", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeUnsignedLong(Number.NaN)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on NaN", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, Number.NaN)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on +Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, Number.POSITIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on -Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, Number.NEGATIVE_INFINITY)).to.throw(InvalidArgumentError);
		});
		it("writeSameByte - invalid argument on negative", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeSameByte(10, -1)).to.throw(InvalidArgumentError);
		});
	});
});
