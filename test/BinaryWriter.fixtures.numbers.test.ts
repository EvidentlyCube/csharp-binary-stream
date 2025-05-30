import * as fs from 'fs';
import { expect } from 'chai';
import { BinaryWriter } from "../src";
import { bufferToHex, buildTestsFilesIndex, FixturesDirectory, WriterTestCallbackDictionaryDictionary } from "./fixtureCommon";

function buildTestExecutors(): WriterTestCallbackDictionaryDictionary {
	return {
		bool: {
			'false': writer => writer.writeBoolean(false),
			'true': writer => writer.writeBoolean(true),
		},
		sbyte: {
			'min': writer => writer.writeSignedByte(-128),
			'midNegative': writer => writer.writeSignedByte(-64),
			'zero': writer => writer.writeSignedByte(0),
			'midPositive': writer => writer.writeSignedByte(64),
			'max': writer => writer.writeSignedByte(127),
		},
		byte: {
			'min': writer => writer.writeByte(0),
			'mid': writer => writer.writeByte(128),
			'max': writer => writer.writeByte(255),
		},
		short: {
			'min': writer => writer.writeShort(-32768),
			'midNegative': writer => writer.writeShort(-16384),
			'zero': writer => writer.writeShort(0),
			'midPositive': writer => writer.writeShort(16384),
			'max': writer => writer.writeShort(32767),
		},
		ushort: {
			'min': writer => writer.writeUnsignedShort(0),
			'oneByteMax': writer => writer.writeUnsignedShort(255),
			'twoByteMin': writer => writer.writeUnsignedShort(256),
			'mid': writer => writer.writeUnsignedShort(32768),
			'max': writer => writer.writeUnsignedShort(65535),
		},
		int: {
			min: writer => writer.writeInt(-2147483648),
			midNegative: writer => writer.writeInt(-1073741824),
			zero: writer => writer.writeInt(0),
			oneByteMax: writer => writer.writeInt(255),
			twoByteMin: writer => writer.writeInt(256),
			twoByteMax: writer => writer.writeInt(65535),
			threeByteMin: writer => writer.writeInt(65536),
			threeByteMax: writer => writer.writeInt(16777215),
			fourByteMin: writer => writer.writeInt(16777216),
			midPositive: writer => writer.writeInt(1073741824),
			max: writer => writer.writeInt(2147483647),
		},
		uint: {
			min: writer => writer.writeUnsignedInt(0),
			oneByteMax: writer => writer.writeUnsignedInt(255),
			twoByteMin: writer => writer.writeUnsignedInt(256),
			twoByteMax: writer => writer.writeUnsignedInt(65535),
			threeByteMin: writer => writer.writeUnsignedInt(65536),
			threeByteMax: writer => writer.writeUnsignedInt(16777215),
			fourByteMin: writer => writer.writeUnsignedInt(16777216),
			mid: writer => writer.writeUnsignedInt(2147483648),
			max: writer => writer.writeUnsignedInt(4294967295),
		},
		long: {
			min: writer => writer.writeLong("-9223372036854775808"),
			midNegative: writer => writer.writeLong("-4611686018427387904"),
			zero: writer => writer.writeLong("0"),
			oneByteMax: writer => writer.writeLong("255"),
			twoByteMin: writer => writer.writeLong("256"),
			twoByteMax: writer => writer.writeLong("65535"),
			threeByteMin: writer => writer.writeLong("65536"),
			threeByteMax: writer => writer.writeLong("16777215"),
			fourByteMin: writer => writer.writeLong("16777216"),
			fourByteMax: writer => writer.writeLong("4294967295"),
			fiveByteMin: writer => writer.writeLong("4294967296"),
			fiveByteMax: writer => writer.writeLong("1099511627775"),
			sixByteMin: writer => writer.writeLong("1099511627776"),
			sixByteMax: writer => writer.writeLong("281474976710655"),
			sevenByteMin: writer => writer.writeLong("281474976710656"),
			sevenByteMax: writer => writer.writeLong("72057594037927935"),
			midPositive: writer => writer.writeLong("4611686018427387904"),
			max: writer => writer.writeLong("9223372036854775807"),
		},
		ulong: {
			min: writer => writer.writeUnsignedLong("0"),
			zero: writer => writer.writeUnsignedLong("0"),
			oneByteMax: writer => writer.writeUnsignedLong("255"),
			twoByteMin: writer => writer.writeUnsignedLong("256"),
			twoByteMax: writer => writer.writeUnsignedLong("65535"),
			threeByteMin: writer => writer.writeUnsignedLong("65536"),
			threeByteMax: writer => writer.writeUnsignedLong("16777215"),
			fourByteMin: writer => writer.writeUnsignedLong("16777216"),
			fourByteMax: writer => writer.writeUnsignedLong("4294967295"),
			fiveByteMin: writer => writer.writeUnsignedLong("4294967296"),
			fiveByteMax: writer => writer.writeUnsignedLong("1099511627775"),
			sixByteMin: writer => writer.writeUnsignedLong("1099511627776"),
			sixByteMax: writer => writer.writeUnsignedLong("281474976710655"),
			sevenByteMin: writer => writer.writeUnsignedLong("281474976710656"),
			sevenByteMax: writer => writer.writeUnsignedLong("72057594037927935"),
			mid: writer => writer.writeUnsignedLong("9223372036854775808"),
			max: writer => writer.writeUnsignedLong("18446744073709551615"),
		},
		double: {
			'min': writer => writer.writeDouble(-1.79769313486231E+308),
			'max': writer => writer.writeDouble(1.79769313486231E+308),
			'epsilon': writer => writer.writeDouble(4.94065645841247E-324),
			'zero': writer => writer.writeDouble(0),
			'smallNegative': writer => writer.writeDouble(-0.00005),
			'smallPositive': writer => writer.writeDouble(0.00005),
			'lowNegative': writer => writer.writeDouble(-123456789),
			'highPositive': writer => writer.writeDouble(123456789),
			'nan': writer => writer.writeDouble(Number.NaN),
			'positiveInfinity': writer => writer.writeDouble(Number.POSITIVE_INFINITY),
			'negativeInfinity': writer => writer.writeDouble(Number.NEGATIVE_INFINITY),
		},
		float: {
			'min': writer => writer.writeFloat(-3.4028235e+38),
			'max': writer => writer.writeFloat(3.4028235e+38),
			'epsilon': writer => writer.writeFloat(1.401298E-45),
			'zero': writer => writer.writeFloat(0),
			'smallNegative': writer => writer.writeFloat(-0.00005),
			'smallPositive': writer => writer.writeFloat(0.00005),
			'lowNegative': writer => writer.writeFloat(-123456792),
			'highPositive': writer => writer.writeFloat(123456792),
			'nan': writer => writer.writeFloat(Number.NaN),
			'positiveInfinity': writer => writer.writeFloat(Number.POSITIVE_INFINITY),
			'negativeInfinity': writer => writer.writeFloat(Number.NEGATIVE_INFINITY),
		},
	};
}

describe("BinaryWriter, number fixture tests", () => {
	const testFileIndex = buildTestsFilesIndex("test.common");
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
					testExecutors[type][testName].call(null, writer);

					expect(bufferToHex(writer.toArray())).to.equal(bufferToHex(buffer));
				});
			});
		});
	});
});