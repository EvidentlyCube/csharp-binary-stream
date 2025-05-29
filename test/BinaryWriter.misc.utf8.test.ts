import {expect} from 'chai';
import {BinaryWriter, Encoding} from "../src";
import {getTestStrings} from "./fixtureCommon";

describe("BinaryWriter, string UTF-8 encoding misc tests", () =>
{
	const testStrings = getTestStrings();

	const advanceTests: Record<string, [(writer: BinaryWriter) => void, number]> = {
		'writeChar:0x0034': [w => w.writeChar(0x0034, Encoding.Utf8), 1],
		'writeChar:0x00A9': [w => w.writeChar(0x00A9, Encoding.Utf8), 2],
		'writeChar:0x2C01': [w => w.writeChar(0x2C01, Encoding.Utf8), 3],
		'writeChar:0x1F130': [w => w.writeChar(0x1F130, Encoding.Utf8), 4],
		'writeChar:4': [w => w.writeChar(String.fromCodePoint(0x0034), Encoding.Utf8), 1],
		'writeChar:©': [w => w.writeChar(String.fromCodePoint(0x00A9), Encoding.Utf8), 2],
		'writeChar:Ⰱ': [w => w.writeChar(String.fromCodePoint(0x2C01), Encoding.Utf8), 3],
		'writeChar:🄰': [w => w.writeChar(String.fromCodePoint(0x1F130), Encoding.Utf8), 4],
		'writeChars:4x 0x0034': [w => w.writeChars([0x0034, 0x0034, 0x0034, 0x0034], Encoding.Utf8), 4],
		'writeChars:4x 0x00A9': [w => w.writeChars([0x00A9, 0x00A9, 0x00A9, 0x00A9], Encoding.Utf8), 8],
		'writeChars:4x 0x2C01': [w => w.writeChars([0x2C01, 0x2C01, 0x2C01, 0x2C01], Encoding.Utf8), 12],
		'writeChars:4x 0x1F130': [w => w.writeChars([0x1F130, 0x1F130, 0x1F130, 0x1F130], Encoding.Utf8), 16],
		'writeChars:fourDifferentUtf8 as numbers': [w => w.writeChars([0x0034, 0x00A9, 0x2C01, 0x1F130], Encoding.Utf8), 10],
		'writeChars:4x 4': [w => w.writeChars(String.fromCodePoint(0x0034, 0x0034, 0x0034, 0x0034), Encoding.Utf8), 4],
		'writeChars:4x ©': [w => w.writeChars(String.fromCodePoint(0x00A9, 0x00A9, 0x00A9, 0x00A9), Encoding.Utf8), 8],
		'writeChars:4x Ⰱ': [w => w.writeChars(String.fromCodePoint(0x2C01, 0x2C01, 0x2C01, 0x2C01), Encoding.Utf8), 12],
		'writeChars:4x 🄰': [w => w.writeChars(String.fromCodePoint(0x1F130, 0x1F130, 0x1F130, 0x1F130), Encoding.Utf8), 16],
		'writeChars:fourDifferentUtf8 as string': [w => w.writeChars(String.fromCodePoint(0x0034, 0x00A9, 0x2C01, 0x1F130), Encoding.Utf8), 10],
		'writeString:1-byte prefix as string': [w => w.writeString(testStrings[0], Encoding.Utf8), 110],
		'writeString:2-byte prefix as string': [w => w.writeString(testStrings[1], Encoding.Utf8), 1092],
		'writeString:3-byte prefix as string': [w => w.writeString(testStrings[2], Encoding.Utf8), 21803],
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

	describe("Misc", () => {
		it("writeChar writes only the first character of the provided string", () => {
			const writer = new BinaryWriter();
			writer.writeChar("O HAI", Encoding.Utf8);

			expect(writer.length).to.equal(1);
			expect(writer.toArray()).to.deep.equal(['O'.codePointAt(0)]);
		});
	})
});
