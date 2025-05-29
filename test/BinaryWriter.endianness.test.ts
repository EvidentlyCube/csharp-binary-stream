import { expect } from 'chai';
import { BinaryWriter } from "../src";
import { Endianness } from '../src/Endianness';
import { arrayToHex } from "./common";


type ReadNumberTestCase = [(reader: BinaryWriter, value: number) => void, number, number, string|[string, string]];
type ReadStringTestCase = [(reader: BinaryWriter, value: string) => void, string, string, string];

describe("BinaryWriter, endianness", () => {
	const numberTestCases: Record<string, ReadNumberTestCase> = {
		writeByte: [(r, v) => r.writeByte(v), 7, 7, '07'],
		writeSignedByte: [(r, v) => r.writeSignedByte(v), 7, 7, '07'],
		writeUnsignedShort: [(r, v) => r.writeUnsignedShort(v), 53511, 2001, '07 D1'],
		writeShort: [(r, v) => r.writeShort(v), -12025, 2001, '07 D1'],
		writeUnsignedInt: [(r, v) => r.writeUnsignedInt(v), 3506438151, 117440721, '07 00 00 D1'],
		writeInt: [(r, v) => r.writeInt(v), -788529145, 117440721, '07 00 00 D1'],
		writeFloat: [(r, v) => r.writeFloat(v), 3.355545997619629, 1546.6953125, '44 C1 56 40'],


		// Long stores values larger than float/double precision allows so unlike other tests we need
		// different values for each endianness. `parseInt()` is used to avoid
		// IDE warnings
		writeLong: [
			(r, v) => r.writeLong(v),
			parseInt('-4611686018427388000'),
			parseInt('504403158265495740'),
			['00 00 00 00 00 00 00 C0', '07 00 00 00 00 00 00 C0']
		],
		writeUnsignedLong: [
			(r, v) => r.writeUnsignedLong(v),
			parseInt('4611686018427388000'),
			parseInt('504403158265495740'),
			['00 00 00 00 00 00 00 40', '07 00 00 00 00 00 00 C0']
		],
	};

	const stringTestCases: Record<string, ReadStringTestCase> = {
		writeLongString: [(r, v) => r.writeLong(v), '-3386706919782612985', '504403158265495761', '07 00 00 00 00 00 00 D1'],
		writeUnsignedLongString: [(r, v) => r.writeUnsignedLong(v), '15060037153926938631', '504403158265495761', '07 00 00 00 00 00 00 D1'],
	};

	describe("Endianness test for writing numbers", () => {
		for (const [testName, testCase] of Object.entries(numberTestCases)) {
			const [executor, valueLittleEndian, valueBigEndian, expectedHex] = testCase;
			const [expectedHexLittle, expectedHexBig] = Array.isArray(expectedHex)
				? expectedHex
				: [expectedHex, expectedHex];

			it(`${testName}(${valueLittleEndian}, LITTLE ENDIAN) - should write '${expectedHexLittle}'`, () => {
				const writer = new BinaryWriter(Endianness.Little);
				executor(writer, valueLittleEndian);

				const writtenHex = arrayToHex(writer.toArray());
				expect(writtenHex).to.equal(expectedHexLittle);
			});

			it(`${testName}(${valueBigEndian}, BIG ENDIAN) - should write '${expectedHexBig}'`, () => {
				const writer = new BinaryWriter(Endianness.Big);
				executor(writer, valueBigEndian);

				const writtenHex = arrayToHex(writer.toArray());
				expect(writtenHex).to.equal(expectedHexBig);
			});
		}

		for (const [testName, testCase] of Object.entries(stringTestCases)) {
			const [executor, valueLittleEndian, valueBigEndian, expectedHex] = testCase;

			it(`${testName}(${valueLittleEndian}, LITTLE ENDIAN) - should write '${expectedHex}'`, () => {
				const writer = new BinaryWriter(Endianness.Little);
				executor(writer, valueLittleEndian);

				const writtenHex = arrayToHex(writer.toArray());
				expect(writtenHex).to.equal(expectedHex);
			});

			it(`${testName}(${valueBigEndian}, BIG ENDIAN) - should write '${expectedHex}'`, () => {
				const writer = new BinaryWriter(Endianness.Big);
				executor(writer, valueBigEndian);

				const writtenHex = arrayToHex(writer.toArray());
				expect(writtenHex).to.equal(expectedHex);
			});
		}
	});
});
