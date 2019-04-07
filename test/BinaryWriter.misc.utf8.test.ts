import {expect} from 'chai';
import {BinaryWriter, Encoding} from "../src";
import {getTestStrings} from "./fixtureCommon";

describe("BinaryWriter, string UTF-8 encoding misc tests", () =>
{
	const testStrings = getTestStrings();

	const advanceTests: { [key: string]: [any, number] | [any, number, string] } = {
		'writeChar:0x0034': [0x0034, 1, 'writeChar'],
		'writeChar:0x00A9': [0x00A9, 2, 'writeChar'],
		'writeChar:0x2C01': [0x2C01, 3, 'writeChar'],
		'writeChar:0x1F130': [0x1F130, 4, 'writeChar'],
		'writeChar:4': [String.fromCodePoint(0x0034), 1, 'writeChar'],
		'writeChar:©': [String.fromCodePoint(0x00A9), 2, 'writeChar'],
		'writeChar:Ⰱ': [String.fromCodePoint(0x2C01), 3, 'writeChar'],
		'writeChar:🄰': [String.fromCodePoint(0x1F130), 4, 'writeChar'],
		'writeChars:4x 0x0034': [[0x0034, 0x0034, 0x0034, 0x0034], 4, 'writeChars'],
		'writeChars:4x 0x00A9': [[0x00A9, 0x00A9, 0x00A9, 0x00A9], 8, 'writeChars'],
		'writeChars:4x 0x2C01': [[0x2C01, 0x2C01, 0x2C01, 0x2C01], 12, 'writeChars'],
		'writeChars:4x 0x1F130': [[0x1F130, 0x1F130, 0x1F130, 0x1F130], 16, 'writeChars'],
		'writeChars:fourDifferentUtf8 as numbers': [[0x0034, 0x00A9, 0x2C01, 0x1F130], 10, 'writeChars'],
		'writeChars:4x 4': [String.fromCodePoint(0x0034, 0x0034, 0x0034, 0x0034), 4, 'writeChars'],
		'writeChars:4x ©': [String.fromCodePoint(0x00A9, 0x00A9, 0x00A9, 0x00A9), 8, 'writeChars'],
		'writeChars:4x Ⰱ': [String.fromCodePoint(0x2C01, 0x2C01, 0x2C01, 0x2C01), 12, 'writeChars'],
		'writeChars:4x 🄰': [String.fromCodePoint(0x1F130, 0x1F130, 0x1F130, 0x1F130), 16, 'writeChars'],
		'writeChars:fourDifferentUtf8 as string': [String.fromCodePoint(0x0034, 0x00A9, 0x2C01, 0x1F130), 10, 'writeChars'],
		'writeString:1-byte prefix as string': [testStrings[0], 110, 'writeString'],
		'writeString:2-byte prefix as string': [testStrings[1], 1092, 'writeString'],
		'writeString:3-byte prefix as string': [testStrings[2], 21803, 'writeString'],
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
				(writer as any)[methodName](argument, Encoding.Utf8);
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
				(writer as any)[methodName](argument, Encoding.Utf8);
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

				(writer as any)[methodName](argument, Encoding.Utf8);
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

				(writer as any)[methodName](argument, Encoding.Utf8);
				expect(writer.length).to.equal(7 + expectedIncrease);
			});
		});
	});
});
