import {expect} from 'chai';
import {BinaryWriter} from "../src";

describe("BinaryWriter, number misc tests", () =>
{
	describe("get length", () =>
	{
		[0, 7, 32, 1024, 256 * 256].forEach(length =>
		{
			it(`Should return expected buffer length (length=${length}`, () =>
			{
				const writer = new BinaryWriter();
				writer.writeSameByte(1, length);

				expect(writer.length).to.equal(length);
			});
		});
	});

	describe("set position", () =>
	{
		it("Setting position to negative value rounds to zero", () =>
		{
			const writer = new BinaryWriter();
			writer.writeSameByte(0, 16);

			writer.position = 10;
			writer.position = -10;

			expect(writer.position).to.equal(0);
		});

		it("Changing position should work", () =>
		{
			const writer = new BinaryWriter();
			writer.writeSameByte(0, 16);

			writer.position = 5;

			expect(writer.position).to.equal(5);
		});

		it("Setting position past the end value rounds to the end position", () =>
		{
			const writer = new BinaryWriter();
			writer.writeSameByte(0, 16);

			writer.position = 200;

			expect(writer.position).to.equal(16);
		});
	});

	const advanceTests: { [key: string]: [any, number] | [any, number, string] } = {
		writeBoolean: [false, 1],
		writeByte: [0, 1],
		'writeBytes:length0': [[], 0, 'writeBytes'],
		'writeBytes:length3': [new Array(3), 3, 'writeBytes'],
		'writeBytes:length17': [new Array(17), 17, 'writeBytes'],
		'writeBytes:length170': [new Array(170), 170, 'writeBytes'],
		writeSignedByte: [0, 1],
		writeShort: [0, 2],
		writeUnsignedShort: [0, 2],
		writeInt: [0, 4],
		writeUnsignedInt: [0, 4],
		writeLong: [0, 8],
		writeUnsignedLong: [0, 8],
		writeFloat: [0, 4],
		writeDouble: [0, 8],
	};

	describe("Writing advances position", () =>
	{
		Object.entries(advanceTests).forEach(entry =>
		{
			const testName: string = entry[0];
			const [argument, bytesToWrite] = entry[1];
			const methodName = entry[1].length > 2 ? entry[1][2] : testName;

			it(`${testName} - advance by ${bytesToWrite} bytes`, () =>
			{
				const writer = new BinaryWriter();
				(writer as any)[methodName](argument);
				expect(writer.position).to.equal(bytesToWrite);
			});
		});
	});

	describe("Writing updates length, when writing at the end of the stream starting from zero", () =>
	{
		Object.entries(advanceTests).forEach(entry =>
		{
			const testName: string = entry[0];
			const [argument, bytesToWrite] = entry[1];
			const methodName = entry[1].length > 2 ? entry[1][2] : testName;

			it(`${testName} - increase length by ${bytesToWrite} bytes`, () =>
			{
				const writer = new BinaryWriter();
				(writer as any)[methodName](argument);
				expect(writer.length).to.equal(bytesToWrite);
			});
		});
	});

	describe("Writing updates length, when writing at the end of the stream starting from more than zero", () =>
	{
		Object.entries(advanceTests).forEach(entry =>
		{
			const testName: string = entry[0];
			const [argument, bytesToWrite] = entry[1];
			const methodName = entry[1].length > 2 ? entry[1][2] : testName;

			it(`${testName} - increase length by ${bytesToWrite} bytes`, () =>
			{
				const writer = new BinaryWriter();
				writer.writeBytes([0, 0, 0, 0, 0, 0, 0]);

				(writer as any)[methodName](argument);
				expect(writer.length).to.equal(bytesToWrite + 7);
			});
		});
	});

	describe("Writing updates length if necessary when writing from one byte before the end of the stream", () =>
	{
		Object.entries(advanceTests).forEach(entry =>
		{
			const testName: string = entry[0];
			const [argument, bytesToWrite] = entry[1];
			const methodName = entry[1].length > 2 ? entry[1][2] : testName;

			const expectedIncrease = Math.max(0, bytesToWrite - 1);

			it(`${testName} - increase length by ${expectedIncrease} bytes`, () =>
			{
				const writer = new BinaryWriter();
				writer.writeBytes([0, 0, 0, 0, 0, 0, 0]);
				writer.position--;

				(writer as any)[methodName](argument);
				expect(writer.length).to.equal(7 + expectedIncrease);
			});
		});
	});
});
