import * as fs from 'fs';
import { expect } from 'chai';
import { BinaryReader, Encoding } from "../src";
import { combineBuffers } from "./common";
import { buildTestsFilesIndex, FixturesDirectory, getTestStrings, ReaderStreamTypesDictionary, ReaderTestCallbackDictionaryDictionary } from "./fixtureCommon";

function buildTestExecutors(): ReaderTestCallbackDictionaryDictionary {
	const testStrings = getTestStrings();
	return {
		char: {
			'oneByte': reader => expect(reader.readChar(Encoding.Utf8)).to.equal(String.fromCodePoint(0x0034)),
			'twoByte': reader => expect(reader.readChar(Encoding.Utf8)).to.equal(String.fromCodePoint(0x00A9)),
			'threeByte': reader => expect(reader.readChar(Encoding.Utf8)).to.equal(String.fromCodePoint(0x2C01)),
			'fourByte': reader => expect(reader.readChar(Encoding.Utf8)).to.equal(String.fromCodePoint(0x1F130)),
		},
		charArray: {
			'oneBytes': reader => {
				const expectedString = String.fromCodePoint(0x0034).repeat(4);
				expect(reader.readChars(4, Encoding.Utf8)).to.equal(expectedString);
				reader.position = 0;
				expect(reader.readCharBytes(4, Encoding.Utf8)).to.equal(expectedString);
			},
			'twoBytes': reader => {
				const expectedString = String.fromCodePoint(0x00A9).repeat(4);
				expect(reader.readChars(4, Encoding.Utf8)).to.equal(expectedString);
				reader.position = 0;
				expect(reader.readCharBytes(8, Encoding.Utf8)).to.equal(expectedString);
			},
			'threeBytes': reader => {
				const expectedString = String.fromCodePoint(0x2C01).repeat(4);
				expect(reader.readChars(4, Encoding.Utf8)).to.equal(expectedString);
				reader.position = 0;
				expect(reader.readCharBytes(12, Encoding.Utf8)).to.equal(expectedString);
			},
			'fourBytes': reader => {
				const expectedString = String.fromCodePoint(0x1F130).repeat(4);
				expect(reader.readChars(4, Encoding.Utf8)).to.equal(expectedString);
				reader.position = 0;
				expect(reader.readCharBytes(16, Encoding.Utf8)).to.equal(expectedString);
			},
			'mixedLowHigh': reader => {
				const expectedString = String.fromCodePoint(0x0034, 0x00A9, 0x2C01, 0x1F130);
				expect(reader.readChars(4, Encoding.Utf8)).to.equal(expectedString);
				reader.position = 0;
				expect(reader.readCharBytes(10, Encoding.Utf8)).to.equal(expectedString);
			},
			'mixedHighLow': reader => {
				const expectedString = String.fromCodePoint(0x1F130, 0x2C01, 0x00A9, 0x0034);
				expect(reader.readChars(4, Encoding.Utf8)).to.equal(expectedString);
				reader.position = 0;
				expect(reader.readCharBytes(10, Encoding.Utf8)).to.equal(expectedString);
			},
		},
		string: {
			'oneBytePrefix': reader => expect(reader.readString(Encoding.Utf8)).to.equal(testStrings[0]),
			'twoBytePrefix': reader => expect(reader.readString(Encoding.Utf8)).to.equal(testStrings[1]),
			'threeBytePrefix': reader => expect(reader.readString(Encoding.Utf8)).to.equal(testStrings[2]),
		},
	};
}

describe("BinaryReader, string UTF-8 encoding fixture tests", () => {
	const testFileIndex = buildTestsFilesIndex("test.utf8");
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
							expect(testExecutors).to.have.any.keys(type, `Failed to find test group definition for fixture 'test.utf8.${type}.${testName}.bin'`);
							expect(testExecutors[type]).to.have.any.keys(testName, `Failed to find test definition for fixture 'test.utf8.${type}.${testName}.bin'`);

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
