import * as fs from 'fs';
import { expect } from 'chai';
import { BinaryReader } from "../src";
import { combineBuffers } from "./common";
import { buildTestsFilesIndex, FixturesDirectory, ReaderStreamTypesDictionary, ReaderTestCallbackDictionaryDictionary } from "./fixtureCommon";

function assertSimilarFloats(smaller: number, bigger: number): void {
	if (smaller > bigger) {
		const tmp = smaller;
		smaller = bigger;
		bigger = tmp;
	}

	if (smaller === bigger) {
		expect(smaller).to.equal(bigger);
		return;
	}

	const factor = bigger / smaller;

	expect(factor).to.be.closeTo(1, 0.001);
}

function buildTestExecutors(): ReaderTestCallbackDictionaryDictionary {
	return {
		bool: {
			'false': reader => expect(reader.readBoolean()).to.equal(false),
			'true': reader => expect(reader.readBoolean()).to.equal(true),
		},
		sbyte: {
			'min': reader => expect(reader.readSignedByte()).to.equal(-128),
			'midNegative': reader => expect(reader.readSignedByte()).to.equal(-64),
			'zero': reader => expect(reader.readSignedByte()).to.equal(0),
			'midPositive': reader => expect(reader.readSignedByte()).to.equal(64),
			'max': reader => expect(reader.readSignedByte()).to.equal(127),
		},
		byte: {
			'min': reader => expect(reader.readByte()).to.equal(0),
			'mid': reader => expect(reader.readByte()).to.equal(128),
			'max': reader => expect(reader.readByte()).to.equal(255),
		},
		short: {
			'min': reader => expect(reader.readShort()).to.equal(-32768),
			'midNegative': reader => expect(reader.readShort()).to.equal(-16384),
			'zero': reader => expect(reader.readShort()).to.equal(0),
			'midPositive': reader => expect(reader.readShort()).to.equal(16384),
			'max': reader => expect(reader.readShort()).to.equal(32767),
		},
		ushort: {
			'min': reader => expect(reader.readUnsignedShort()).to.equal(0),
			'oneByteMax': reader => expect(reader.readUnsignedShort()).to.equal(255),
			'twoByteMin': reader => expect(reader.readUnsignedShort()).to.equal(256),
			'mid': reader => expect(reader.readUnsignedShort()).to.equal(32768),
			'max': reader => expect(reader.readUnsignedShort()).to.equal(65535),
		},
		int: {
			min: reader => expect(reader.readInt()).to.equal(-2147483648),
			midNegative: reader => expect(reader.readInt()).to.equal(-1073741824),
			zero: reader => expect(reader.readInt()).to.equal(0),
			oneByteMax: reader => expect(reader.readInt()).to.equal(255),
			twoByteMin: reader => expect(reader.readInt()).to.equal(256),
			twoByteMax: reader => expect(reader.readInt()).to.equal(65535),
			threeByteMin: reader => expect(reader.readInt()).to.equal(65536),
			threeByteMax: reader => expect(reader.readInt()).to.equal(16777215),
			fourByteMin: reader => expect(reader.readInt()).to.equal(16777216),
			midPositive: reader => expect(reader.readInt()).to.equal(1073741824),
			max: reader => expect(reader.readInt()).to.equal(2147483647),
		},
		uint: {
			min: reader => expect(reader.readUnsignedInt()).to.equal(0),
			oneByteMax: reader => expect(reader.readUnsignedInt()).to.equal(255),
			twoByteMin: reader => expect(reader.readUnsignedInt()).to.equal(256),
			twoByteMax: reader => expect(reader.readUnsignedInt()).to.equal(65535),
			threeByteMin: reader => expect(reader.readUnsignedInt()).to.equal(65536),
			threeByteMax: reader => expect(reader.readUnsignedInt()).to.equal(16777215),
			fourByteMin: reader => expect(reader.readUnsignedInt()).to.equal(16777216),
			mid: reader => expect(reader.readUnsignedInt()).to.equal(2147483648),
			max: reader => expect(reader.readUnsignedInt()).to.equal(4294967295),
		},
		long: {
			min: reader => {
				expect(reader.readLongString()).to.equal("-9223372036854775808");
				reader.position = 0;
				expect(reader.readLong()).to.equal(-9223372036854775808);
			},
			midNegative: reader => {
				expect(reader.readLongString()).to.equal("-4611686018427387904");
				reader.position = 0;
				expect(reader.readLong()).to.equal(-4611686018427387904);
			},
			zero: reader => {
				expect(reader.readLongString()).to.equal("0");
				reader.position = 0;
				expect(reader.readLong()).to.equal(0);
			},
			oneByteMax: reader => {
				expect(reader.readLongString()).to.equal("255");
				reader.position = 0;
				expect(reader.readLong()).to.equal(255);
			},
			twoByteMin: reader => {
				expect(reader.readLongString()).to.equal("256");
				reader.position = 0;
				expect(reader.readLong()).to.equal(256);
			},
			twoByteMax: reader => {
				expect(reader.readLongString()).to.equal("65535");
				reader.position = 0;
				expect(reader.readLong()).to.equal(65535);
			},
			threeByteMin: reader => {
				expect(reader.readLongString()).to.equal("65536");
				reader.position = 0;
				expect(reader.readLong()).to.equal(65536);
			},
			threeByteMax: reader => {
				expect(reader.readLongString()).to.equal("16777215");
				reader.position = 0;
				expect(reader.readLong()).to.equal(16777215);
			},
			fourByteMin: reader => {
				expect(reader.readLongString()).to.equal("16777216");
				reader.position = 0;
				expect(reader.readLong()).to.equal(16777216);
			},
			fourByteMax: reader => {
				expect(reader.readLongString()).to.equal("4294967295");
				reader.position = 0;
				expect(reader.readLong()).to.equal(4294967295);
			},
			fiveByteMin: reader => {
				expect(reader.readLongString()).to.equal("4294967296");
				reader.position = 0;
				expect(reader.readLong()).to.equal(4294967296);
			},
			fiveByteMax: reader => {
				expect(reader.readLongString()).to.equal("1099511627775");
				reader.position = 0;
				expect(reader.readLong()).to.equal(1099511627775);
			},
			sixByteMin: reader => {
				expect(reader.readLongString()).to.equal("1099511627776");
				reader.position = 0;
				expect(reader.readLong()).to.equal(1099511627776);
			},
			sixByteMax: reader => {
				expect(reader.readLongString()).to.equal("281474976710655");
				reader.position = 0;
				expect(reader.readLong()).to.equal(281474976710655);
			},
			sevenByteMin: reader => {
				expect(reader.readLongString()).to.equal("281474976710656");
				reader.position = 0;
				expect(reader.readLong()).to.equal(281474976710656);
			},
			sevenByteMax: reader => {
				expect(reader.readLongString()).to.equal("72057594037927935");
				reader.position = 0;
				expect(reader.readLong()).to.equal(72057594037927935);
			},
			midPositive: reader => {
				expect(reader.readLongString()).to.equal("4611686018427387904");
				reader.position = 0;
				expect(reader.readLong()).to.equal(4611686018427387904);
			},
			max: reader => {
				expect(reader.readLongString()).to.equal("9223372036854775807");
				reader.position = 0;
				expect(reader.readLong()).to.equal(9223372036854775807);
			},
		},
		ulong: {
			min: reader => {
				expect(reader.readUnsignedLongString()).to.equal("0");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(0);
			},
			zero: reader => {
				expect(reader.readUnsignedLongString()).to.equal("0");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(0);
			},
			oneByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("255");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(255);
			},
			twoByteMin: reader => {
				expect(reader.readUnsignedLongString()).to.equal("256");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(256);
			},
			twoByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("65535");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(65535);
			},
			threeByteMin: reader => {
				expect(reader.readUnsignedLongString()).to.equal("65536");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(65536);
			},
			threeByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("16777215");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(16777215);
			},
			fourByteMin: reader => {
				expect(reader.readUnsignedLongString()).to.equal("16777216");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(16777216);
			},
			fourByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("4294967295");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(4294967295);
			},
			fiveByteMin: reader => {
				expect(reader.readUnsignedLongString()).to.equal("4294967296");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(4294967296);
			},
			fiveByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("1099511627775");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(1099511627775);
			},
			sixByteMin: reader => {
				expect(reader.readUnsignedLongString()).to.equal("1099511627776");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(1099511627776);
			},
			sixByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("281474976710655");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(281474976710655);
			},
			sevenByteMin: reader => {
				expect(reader.readUnsignedLongString()).to.equal("281474976710656");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(281474976710656);
			},
			sevenByteMax: reader => {
				expect(reader.readUnsignedLongString()).to.equal("72057594037927935");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(72057594037927935);
			},
			mid: reader => {
				expect(reader.readUnsignedLongString()).to.equal("9223372036854775808");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(9223372036854775808);
			},
			max: reader => {
				expect(reader.readUnsignedLongString()).to.equal("18446744073709551615");
				reader.position = 0;
				expect(reader.readUnsignedLong()).to.equal(18446744073709551615);
			},
		},
		double: {
			'min': reader => assertSimilarFloats(reader.readDouble(), -1.79769313486231E+308),
			'max': reader => assertSimilarFloats(reader.readDouble(), 1.79769313486231E+308),
			'epsilon': reader => assertSimilarFloats(reader.readDouble(), 4.94065645841247E-324),
			'zero': reader => assertSimilarFloats(reader.readDouble(), 0),
			'smallNegative': reader => assertSimilarFloats(reader.readDouble(), -0.00005),
			'smallPositive': reader => assertSimilarFloats(reader.readDouble(), 0.00005),
			'lowNegative': reader => assertSimilarFloats(reader.readDouble(), -123456789),
			'highPositive': reader => assertSimilarFloats(reader.readDouble(), 123456789),
			'nan': reader => expect(reader.readDouble()).to.NaN,
			'positiveInfinity': reader => expect(reader.readDouble()).to.equal(Number.POSITIVE_INFINITY),
			'negativeInfinity': reader => expect(reader.readDouble()).to.equal(Number.NEGATIVE_INFINITY),
		},
		float: {
			'min': reader => assertSimilarFloats(reader.readFloat(), -3.402823E+38),
			'max': reader => assertSimilarFloats(reader.readFloat(), 3.402823E+38),
			'epsilon': reader => assertSimilarFloats(reader.readFloat(), 1.401298E-45),
			'zero': reader => assertSimilarFloats(reader.readFloat(), 0),
			'smallNegative': reader => assertSimilarFloats(reader.readFloat(), -0.00005),
			'smallPositive': reader => assertSimilarFloats(reader.readFloat(), 0.00005),
			'lowNegative': reader => assertSimilarFloats(reader.readFloat(), -123456792),
			'highPositive': reader => assertSimilarFloats(reader.readFloat(), 123456792),
			'nan': reader => expect(reader.readFloat()).to.NaN,
			'positiveInfinity': reader => expect(reader.readFloat()).to.equal(Number.POSITIVE_INFINITY),
			'negativeInfinity': reader => expect(reader.readFloat()).to.equal(Number.NEGATIVE_INFINITY),
		},
	};
}

describe("BinaryReader, number fixture tests", () => {
	const testFileIndex = buildTestsFilesIndex("test.common");
	const testExecutors = buildTestExecutors();

	const streamTypes: ReaderStreamTypesDictionary = {
		'Exactly matching ArrayBuffer': (buffer: Buffer) => new BinaryReader(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)),
		'Uint8Array with exactly matching buffer inside': (buffer: Buffer) => {
			const array = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
			return new BinaryReader(array);
		},
		'Uint8Array padded with 3 `00` bytes around it': (buffer: Buffer) => {
			const uintArray = new Uint8Array(combineBuffers([0x00, 0x00, 0x00], buffer, [0x00, 0x00, 0x00]));
			const arrayBufferSlice = uintArray.buffer.slice(uintArray.byteOffset, uintArray.byteLength);

			return new BinaryReader(new Uint8Array(arrayBufferSlice, 3, buffer.byteLength));
		},
		'Uint8Array padded with 3 different bytes around it': (buffer: Buffer) => {
			const uintArray = new Uint8Array(combineBuffers([0x3a, 0xe4, 0x4b], buffer, [0xa9, 0x43, 0x18]));
			const arrayBufferSlice = uintArray.buffer.slice(uintArray.byteOffset, uintArray.byteLength);

			return new BinaryReader(new Uint8Array(arrayBufferSlice, 3, buffer.byteLength));
		},
		'Uint8Array padded with 3 `FF` bytes around it': (buffer: Buffer) => {
			const uintArray = new Uint8Array(combineBuffers([0xFF, 0xFF, 0xFF], buffer, [0xFF, 0xFF, 0xFF]));
			const arrayBufferSlice = uintArray.buffer.slice(uintArray.byteOffset, uintArray.byteLength);

			return new BinaryReader(new Uint8Array(arrayBufferSlice, 3, buffer.byteLength));
		},
	};

	Object.entries(streamTypes).forEach(streamTypeData => {
		const streamName = streamTypeData[0];
		const binaryReaderBuilder = streamTypeData[1];

		describe(`Stream type ${streamName}`, () => {
			Object.entries(testFileIndex).forEach(entry => {
				const type = entry[0];
				const tests = entry[1];

				describe(type, () => {

					Object.entries(tests).forEach(test => {
						const testName = test[0];
						const testPath = test[1];

						it(`${testName} - ${testPath}`, () => {
							expect(testExecutors).to.have.any.keys(type);
							expect(testExecutors[type]).to.have.any.keys(testName);

							const buffer = fs.readFileSync(`${FixturesDirectory}/${testPath}`);
							const reader = binaryReaderBuilder(buffer);
							testExecutors[type][testName].call(null, reader);
						});
					});
				});
			});
		});
	});
});
