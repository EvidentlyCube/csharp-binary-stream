import * as fs from "fs";
import {BinaryReader} from "../src";
import {BinaryWriter} from "../src/BinaryWriter";

export const FixturesDirectory = __dirname + "/fixtures";


type ReaderTestCallback = (data: BinaryReader) => void;

interface ReaderTestCallbackDictionary
{
	[index: string]: ReaderTestCallback;
}

export interface ReaderTestCallbackDictionaryDictionary
{
	[index: string]: ReaderTestCallbackDictionary;
}

export interface ReaderStreamTypesDictionary
{
	[index: string]: ((buffer: Buffer) => BinaryReader);
}


export type WriterTestCallback = (data: BinaryWriter) => void|IterableIterator<void>;

export interface WriterTestCallbackDictionary
{
	[index: string]: WriterTestCallback;
}

export interface WriterTestCallbackDictionaryDictionary
{
	[index: string]: WriterTestCallbackDictionary;
}


interface TestFileDictionary
{
	[index: string]: string;
}

interface TestFileDictionaryDictionary
{
	[index: string]: TestFileDictionary;
}


export function bufferToHex(buffer: Buffer | number[]): string
{
	if (buffer instanceof Buffer) {
		buffer = Array.from(new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)));
	}

	return buffer.map(x => x.toString(16).padStart(2, "0")).join(" ");
}

export function buildTestsFilesIndex(expectedPrefix: string): TestFileDictionaryDictionary
{
	const tests: TestFileDictionaryDictionary = {};

	fs.readdirSync(FixturesDirectory).forEach(file =>
	{
		if (file.indexOf(expectedPrefix) !== 0) {
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


export function getTestStrings(): [string, string, string]
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
