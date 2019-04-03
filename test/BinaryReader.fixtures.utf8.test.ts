import * as fs from 'fs';
import {expect} from 'chai';
import {BinaryReader, Encoding} from "../src";

type TestCallback = (data: BinaryReader) => void;

interface TestCallbackDictionary
{
	[index: string]: TestCallback;
}

interface TestCallbackDictionaryDictionary
{
	[index: string]: TestCallbackDictionary;
}

interface TestFileDictionary
{
	[index: string]: string;
}

interface TestFileDictionaryDictionary
{
	[index: string]: TestFileDictionary;
}

const testsDirectory = __dirname + "/fixtures";

function buildTestsFilesIndex(): TestFileDictionaryDictionary
{
	const tests: TestFileDictionaryDictionary = {};

	fs.readdirSync(testsDirectory).forEach(file =>
	{
		if (file.indexOf("test.utf8") !== 0) {
			return;
		}

		const bits = file.split('.');
		if (bits.length !== 5) {
			throw new Error("There should be no file in test/fixtures/ directory that does not have four dots in its name.");
		}

		const type = bits[2];
		const testName = bits[3];

		if (!tests[type]) {
			tests[type] = {};
		}

		tests[type][testName] = file;
	});

	return tests;
}

function getTestStrings(): [string, string, string]
{
	const encodedString = ""
		+ "%E2%8A%86%E2%84%95%E2%82%80%E2%84%9A%E2%84%9D" // "scienceCharacters" = "⊆ℕ₀ℚℝ"
		+ "%C9%94%C9%9B%C9%99" // "IPA" = "ɔɛə"
		+ "%CE%B3%CE%BD%CF%89%CF%81%E1%BD%B7%CE%B6" // "greek" = "γνωρίζ"
		+ "%D0%94%D0%B5%D1%81" // "russian" = "Дес"
		+ "%E0%B9%81%E0%B8%9C%E0%B9%88" // "thai" = "แผ่"
		+ "%E1%8A%A5%E1%8A%95%E1%8B%B0%E1%8A%A0%E1%89%A3%E1%89%B4" // "ahmaric" = "እንደአባቴ"
		+ "%E1%9B%92%E1%9A%A2%E1%9B%9E%E1%9B%96" // "runes" = "ᛒᚢᛞᛖ"
		+ "%E2%A0%B9%E2%A0%BB%E2%A0%91" // "braille" = "⠹⠻⠑"
		+ "%E3%82%B3%E3%83%B3" // "japanese" = "コン"
		+ "%E2%94%8F%E2%94%AF%E2%94%93%E2%96%89%E2%94%9C" // "boxes" = "┏┯┓▉├"
		+ "";

	const decodedString = decodeURI(encodedString);

	return [
		decodedString,
		decodedString.repeat(10),
		decodedString.repeat(200),
	];
}

function buildTestExecutors(): TestCallbackDictionaryDictionary
{
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

describe("BinaryReader, string UTF-8 encoding fixture tests", () =>
{
	const testFileIndex = buildTestsFilesIndex();
	const testExecutors = buildTestExecutors();

	Object.entries(testFileIndex).forEach(entry =>
	{
		const type = entry[0];
		const tests = entry[1];

		describe(type, () =>
		{

			Object.entries(tests).forEach(test =>
			{
				const testName = test[0];
				const testPath = test[1];

				it(`${testName} - ${testPath}`, () =>
				{
					expect(testExecutors).to.have.any.keys(type, `Failed to find test group definition for fixture 'test.utf8.${type}.${testName}.bin'`);
					expect(testExecutors[type]).to.have.any.keys(testName, `Failed to find test definition for fixture 'test.utf8.${type}.${testName}.bin'`);

					const buffer = fs.readFileSync(`${testsDirectory}/${testPath}`);
					const reader = new BinaryReader(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
					testExecutors[type][testName].call(null, reader);
				});
			});
		});
	});
});
