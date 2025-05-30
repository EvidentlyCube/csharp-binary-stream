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
		readUnsignedInt: ['07 01 02 D1', r => r.readUnsignedInt(), 3506569479, 117506769],
		readInt: ['07 01 02 D1', r => r.readInt(), -788397817, 117506769],
		readLongString: ['07 01 02 03 04 05 06 D1', r => r.readLongString(), '-3385012555133878009', '504686845217801937'],
		readLong: ['07 01 02 03 04 05 06 D1', r => r.readLong(), parseInt('-3385012555133878000'), parseInt('504686845217801900')],
		readUnsignedLongString: ['07 01 02 03 04 05 06 D1', r => r.readUnsignedLongString(), '15061731518575673607', '504686845217801937'],
		readUnsignedLong: ['07 01 02 03 04 05 06 D1', r => r.readUnsignedLong(), parseInt('15061731518575673000'), parseInt('504686845217801900')],
		readFloat: ['44 c1 56 40', r => r.readFloat(), 3.355545997619629, 1546.6953125],
		readDouble: ['40 98 2a c8 01 10 04 02', r => r.readDouble(), 5.991560550821864e-299, 1546.6953165533491],
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
