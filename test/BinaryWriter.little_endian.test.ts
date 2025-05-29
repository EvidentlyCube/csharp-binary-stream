import {expect} from 'chai';
import {BinaryWriter} from "../src";

describe("BinaryWriter, number misc tests", () =>
{
	const advanceTests: Record<string, [(writer: BinaryWriter) => void, number]> = {
		'writeBoolean': [w => w.writeBoolean(false), 1],
		'writeByte': [w => w.writeByte(0), 1],
		'writeBytes': [w => w.writeBytes([]), 0],
		'writeBytes:length=3': [w => w.writeBytes(new Array(3)), 3],
		'writeBytes:length=17': [w => w.writeBytes(new Array(17)), 17],
		'writeBytes:length=170': [w => w.writeBytes(new Array(170)), 170],
		'writeSignedByte': [w => w.writeSignedByte(0), 1],
		'writeShort': [w => w.writeShort(0), 2],
		'writeUnsignedShort': [w => w.writeUnsignedShort(0), 2],
		'writeInt': [w => w.writeInt(0), 4],
		'writeUnsignedInt': [w => w.writeUnsignedInt(0), 4],
		'writeLong': [w => w.writeLong(0), 8],
		'writeUnsignedLong': [w => w.writeUnsignedLong(0), 8],
		'writeFloat': [w => w.writeFloat(0), 4],
		'writeDouble': [w => w.writeDouble(0), 8],
	};

	describe("Writing advances position", () =>
	{
		Object.entries(advanceTests).forEach(([testName, args]) =>
		{
			const [executor, bytesToWrite] = args;

			it(`${testName} - advance by ${bytesToWrite} bytes`, () =>
			{
				const writer = new BinaryWriter();
				executor(writer);
				expect(writer.position).to.equal(bytesToWrite);
			});
		});
	});

	describe("Writing updates length, when writing at the end of the stream starting from zero", () =>
	{
		Object.entries(advanceTests).forEach(([testName, args]) =>
		{
			const [executor, bytesToWrite] = args;

			it(`${testName} - increase length by ${bytesToWrite} bytes`, () =>
			{
				const writer = new BinaryWriter();
				executor(writer);
				expect(writer.length).to.equal(bytesToWrite);
			});
		});
	});

	describe("Writing updates length, when writing at the end of the stream starting from more than zero", () =>
	{
		Object.entries(advanceTests).forEach(([testName, args]) =>
		{
			const [executor, bytesToWrite] = args;

			it(`${testName} - increase length by ${bytesToWrite} bytes`, () =>
			{
				const writer = new BinaryWriter();
				writer.writeBytes([0, 0, 0, 0, 0, 0, 0]);

				executor(writer);
				expect(writer.length).to.equal(bytesToWrite + 7);
			});
		});
	});

	describe("Writing updates length if necessary when writing from one byte before the end of the stream", () =>
	{
		Object.entries(advanceTests).forEach(([testName, args]) =>
		{
			const [executor, bytesToWrite] = args;
			const expectedIncrease = Math.max(0, bytesToWrite - 1);

			it(`${testName} - increase length by ${expectedIncrease} bytes`, () =>
			{
				const writer = new BinaryWriter();
				writer.writeBytes([0, 0, 0, 0, 0, 0, 0]);
				writer.position--;

				executor(writer);
				expect(writer.length).to.equal(7 + expectedIncrease);
			});
		});
	});
});
