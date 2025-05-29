import { expect } from 'chai';
import { BinaryReader } from "../src";
import { Endianness } from '../src/Endianness';
import { getBufferHex } from "./common";


type ReadNumberTestCase = [string, (reader: BinaryReader) => number|string, number|string, number|string];

describe("BinaryReader, endianness", () => {
	const testCases: Record<string, ReadNumberTestCase> = {
		readByte: ['D1', r => r.readByte(), 209, 209],
		readSignedByte: ['D1', r => r.readSignedByte(), -47, -47],
		readUnsignedShort: ['07 D1', r => r.readUnsignedShort(), 53511, 2001],
		readShort: ['07 D1', r => r.readShort(), -12025, 2001],
		readUnsignedInt: ['07 00 00 D1', r => r.readUnsignedInt(), 3506438151, 117440721],
		readInt: ['07 00 00 D1', r => r.readInt(), -788529145, 117440721],
		readLongString: ['07 00 00 00 00 00 00 D1', r => r.readLongString(), '-3386706919782612985', '504403158265495761'],
		readLong: ['07 00 00 00 00 00 00 D1', r => r.readLong(), parseInt('-3386706919782612985'), parseInt('504403158265495761')],
		readUnsignedLongString: ['07 00 00 00 00 00 00 D1', r => r.readUnsignedLongString(), '15060037153926938631', '504403158265495761'],
		readUnsignedLong: ['07 00 00 00 00 00 00 D1', r => r.readUnsignedLong(), parseInt('15060037153926938631'), parseInt('504403158265495761')],
		readFloat: ['44 c1 56 40', r => r.readFloat(), 3.355545997619629, 1546.6953125],
		readDouble: ['40 98 2a c8 00 10 04 02', r => r.readDouble(), 5.991555993870602e-299, 1546.6953127386519],
	};

	describe("Endianness test for reading numbers", () => {
		for (const [testName, testCase] of Object.entries(testCases)) {
			const [data, executor, expectedLittleEndian, expectedBigEndian] = testCase;

			it(`${testName}(LITTLE ENDIAN) - '${data}' reads as ${expectedLittleEndian}`, () => {
				const reader = new BinaryReader(getBufferHex(data), Endianness.Little);
				const result = executor(reader);

				expect(result).to.equal(expectedLittleEndian);
			});

			it(`${testName}(BIG ENDIAN) - '${data}' reads as ${expectedBigEndian}`, () => {
				const reader = new BinaryReader(getBufferHex(data), Endianness.Big);
				const result = executor(reader);

				expect(result).to.equal(expectedBigEndian);
			});
		}
	});
});
