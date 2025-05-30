import * as fs from 'fs';
import { expect } from 'chai';
import { BinaryWriter } from "../src/BinaryWriter";
import { Encoding } from "../src";
import { buildTestsFilesIndex, FixturesDirectory, getTestStrings, WriterTestCallbackDictionaryDictionary } from "./fixtureCommon";

function buildTestExecutors(): WriterTestCallbackDictionaryDictionary {
	const testStrings = getTestStrings();
	return {
		char: {
			'oneByte': function* (writer: BinaryWriter) {
				yield writer.writeChar(0x0034, Encoding.Utf8);
				yield writer.writeChar(String.fromCodePoint(0x0034), Encoding.Utf8);
			},
			'twoByte': function* (writer: BinaryWriter) {
				yield writer.writeChar(0x00A9, Encoding.Utf8);
				yield writer.writeChar(String.fromCodePoint(0x00A9), Encoding.Utf8);
			},
			'threeByte': function* (writer: BinaryWriter) {
				yield writer.writeChar(0x2C01, Encoding.Utf8);
				yield writer.writeChar(String.fromCodePoint(0x2C01), Encoding.Utf8);
			},
			'fourByte': function* (writer: BinaryWriter) {
				yield writer.writeChar(0x1F130, Encoding.Utf8);
				yield writer.writeChar(String.fromCodePoint(0x1F130), Encoding.Utf8);
			},
		},
		charArray: {
			'oneBytes': function* (writer) {
				yield writer.writeChars([0x0034, 0x0034, 0x0034, 0x0034], Encoding.Utf8);
				yield writer.writeChars(String.fromCodePoint(0x0034).repeat(4), Encoding.Utf8);
			},
			'twoBytes': function* (writer) {
				yield writer.writeChars([0x00A9, 0x00A9, 0x00A9, 0x00A9], Encoding.Utf8);
				yield writer.writeChars(String.fromCodePoint(0x00A9).repeat(4), Encoding.Utf8);
			},
			'threeBytes': function* (writer) {
				yield writer.writeChars([0x2C01, 0x2C01, 0x2C01, 0x2C01], Encoding.Utf8);
				yield writer.writeChars(String.fromCodePoint(0x2C01).repeat(4), Encoding.Utf8);
			},
			'fourBytes': function* (writer) {
				yield writer.writeChars([0x1F130, 0x1F130, 0x1F130, 0x1F130], Encoding.Utf8);
				yield writer.writeChars(String.fromCodePoint(0x1F130).repeat(4), Encoding.Utf8);
			},
			'mixedLowHigh': function* (writer) {
				yield writer.writeChars([0x0034, 0x00A9, 0x2C01, 0x1F130], Encoding.Utf8);
				yield writer.writeChars(String.fromCodePoint(0x0034, 0x00A9, 0x2C01, 0x1F130), Encoding.Utf8);
			},
			'mixedHighLow': function* (writer) {
				yield writer.writeChars([0x1F130, 0x2C01, 0x00A9, 0x0034], Encoding.Utf8);
				yield writer.writeChars(String.fromCodePoint(0x1F130, 0x2C01, 0x00A9, 0x0034), Encoding.Utf8);
			},
		},
		string: {
			'oneBytePrefix': function* (writer) {
				yield writer.writeString(testStrings[0], Encoding.Utf8);
				yield writer.writeString(Array.from(testStrings[0]).map(x => x.codePointAt(0) ?? -1), Encoding.Utf8);
			},
			'twoBytePrefix': function* (writer) {
				yield writer.writeString(testStrings[1], Encoding.Utf8);
				yield writer.writeString(Array.from(testStrings[1]).map(x => x.codePointAt(0) ?? -1), Encoding.Utf8);
			},
			'threeBytePrefix': function* (writer) {
				yield writer.writeString(testStrings[2], Encoding.Utf8);
				yield writer.writeString(Array.from(testStrings[2]).map(x => x.codePointAt(0) ?? -1), Encoding.Utf8);
			},
		},
	};
}

function bufferToHex(buffer: Buffer | number[]): string {
	if (buffer instanceof Buffer) {
		buffer = Array.from(new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)));
	}

	return buffer.map(x => x.toString(16).padStart(2, "0")).join(" ");
}

describe("BinaryWriter, string UTF-8 encoding fixture tests", () => {
	const testFileIndex = buildTestsFilesIndex("test.utf8");
	const testExecutors = buildTestExecutors();

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
					const writer = new BinaryWriter();

					const generator = testExecutors[type][testName].call(null, writer);

					if (generator) {
						while (!generator.next().done) {
							expect(bufferToHex(writer.toArray())).to.equal(bufferToHex(buffer));
							writer.clear();
						}
					} else {
						expect(bufferToHex(writer.toArray())).to.equal(bufferToHex(buffer));
					}
				});
			});
		});
	});
});