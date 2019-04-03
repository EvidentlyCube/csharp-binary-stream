/**
 This file will generate the fixtures necessary for running the JS tests
*/
using System;
using System.IO;
using System.Linq;
using System.Text;
using TestsInGroup = System.Collections.Generic.Dictionary<string, System.Action<System.IO.BinaryWriter>>;
using TestsGroup = System.Collections.Generic.Dictionary<string, System.Collections.Generic.Dictionary<string, System.Action<System.IO.BinaryWriter>>>;

namespace CSharpBinaryStream
{
	public static class Program
	{
		[STAThread]
		private static void Main()
		{
			WriteAllTestFixtures(Path.GetDirectoryName(System.Reflection.Assembly.GetEntryAssembly().Location) + "/tests/");
		}

		public static void WriteAllTestFixtures(string path)
		{
			Directory.CreateDirectory(path);

			var testStrings = getTestUtf8String();

			var commonTests = new TestsGroup
			{
				["bool"] = new TestsInGroup
				{
					["true"] = writer => writer.Write((bool) true),
					["false"] = writer => writer.Write((bool) false)
				},
				["sbyte"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((sbyte) -128),
					["midNegative"] = writer => writer.Write((sbyte) -64),
					["zero"] = writer => writer.Write((sbyte) 0),
					["midPositive"] = writer => writer.Write((sbyte) 64),
					["max"] = writer => writer.Write((sbyte) 127)
				},
				["byte"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((byte) 0),
					["mid"] = writer => writer.Write((byte) 128),
					["max"] = writer => writer.Write((byte) 255)
				},
				["short"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((short) -32768),
					["midNegative"] = writer => writer.Write((short) -16384),
					["zero"] = writer => writer.Write((short) 0),
					["midPositive"] = writer => writer.Write((short) 16384),
					["max"] = writer => writer.Write((short) 32767)
				},
				["ushort"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((ushort) 0),
					["oneByteMax"] = writer => writer.Write((ushort) 255),
					["twoByteMin"] = writer => writer.Write((ushort) 256),
					["mid"] = writer => writer.Write((ushort) 32768),
					["max"] = writer => writer.Write((ushort) 65535)
				},
				["int"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((int) -2147483648),
					["midNegative"] = writer => writer.Write((int) -1073741824),
					["zero"] = writer => writer.Write((int) 0),
					["oneByteMax"] = writer => writer.Write((int) 255),
					["twoByteMin"] = writer => writer.Write((int) 256),
					["twoByteMax"] = writer => writer.Write((int) 65535),
					["threeByteMin"] = writer => writer.Write((int) 65536),
					["threeByteMax"] = writer => writer.Write((int) 16777215),
					["fourByteMin"] = writer => writer.Write((int) 16777216),
					["midPositive"] = writer => writer.Write((int) 1073741824),
					["max"] = writer => writer.Write((int) 2147483647)
				},
				["uint"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((uint) 0),
					["oneByteMax"] = writer => writer.Write((uint) 255),
					["twoByteMin"] = writer => writer.Write((uint) 256),
					["twoByteMax"] = writer => writer.Write((uint) 65535U),
					["threeByteMin"] = writer => writer.Write((uint) 65536U),
					["threeByteMax"] = writer => writer.Write((uint) 16777215U),
					["fourByteMin"] = writer => writer.Write((uint) 16777216U),
					["mid"] = writer => writer.Write((uint) 2147483648),
					["max"] = writer => writer.Write((uint) 4294967295)
				},
				["long"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((long) -9223372036854775808),
					["midNegative"] = writer => writer.Write((long) -4611686018427387904),
					["zero"] = writer => writer.Write((long) 0),
					["oneByteMax"] = writer => writer.Write((long) 255),
					["twoByteMin"] = writer => writer.Write((long) 256),
					["twoByteMax"] = writer => writer.Write(65535L),
					["threeByteMin"] = writer => writer.Write(65536L),
					["threeByteMax"] = writer => writer.Write(16777215L),
					["fourByteMin"] = writer => writer.Write(16777216L),
					["fourByteMax"] = writer => writer.Write(4294967295L),
					["fiveByteMin"] = writer => writer.Write(4294967296L),
					["fiveByteMax"] = writer => writer.Write(1099511627775L),
					["sixByteMin"] = writer => writer.Write(1099511627776L),
					["sixByteMax"] = writer => writer.Write(281474976710655L),
					["sevenByteMin"] = writer => writer.Write(281474976710656L),
					["sevenByteMax"] = writer => writer.Write(72057594037927935L),
					["midPositive"] = writer => writer.Write((long) 4611686018427387904),
					["max"] = writer => writer.Write((long) 9223372036854775807)
				},
				["ulong"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((ulong) 0),
					["zero"] = writer => writer.Write((ulong) 0),
					["oneByteMax"] = writer => writer.Write((ulong) 255),
					["twoByteMin"] = writer => writer.Write((ulong) 256),
					["twoByteMax"] = writer => writer.Write(65535UL),
					["threeByteMin"] = writer => writer.Write(65536UL),
					["threeByteMax"] = writer => writer.Write(16777215UL),
					["fourByteMin"] = writer => writer.Write(16777216UL),
					["fourByteMax"] = writer => writer.Write(4294967295UL),
					["fiveByteMin"] = writer => writer.Write(4294967296UL),
					["fiveByteMax"] = writer => writer.Write(1099511627775UL),
					["sixByteMin"] = writer => writer.Write(1099511627776UL),
					["sixByteMax"] = writer => writer.Write(281474976710655UL),
					["sevenByteMin"] = writer => writer.Write(281474976710656UL),
					["sevenByteMax"] = writer => writer.Write(72057594037927935UL),
					["mid"] = writer => writer.Write((ulong) 9223372036854775808),
					["max"] = writer => writer.Write((ulong) 18446744073709551615)
				},
				["double"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((double) -1.79769313486231E+308),
					["max"] = writer => writer.Write((double) 1.79769313486231E+308),
					["epsilon"] = writer => writer.Write((double) 4.94065645841247E-324),
					["zero"] = writer => writer.Write((double) 0),
					["smallNegative"] = writer => writer.Write((double) -0.00005),
					["smallPositive"] = writer => writer.Write((double) 0.00005),
					["lowNegative"] = writer => writer.Write((double) -123456789),
					["highPositive"] = writer => writer.Write((double) 123456789),
					["nan"] = writer => writer.Write((double) double.NaN),
					["positiveInfinity"] = writer => writer.Write((double) double.PositiveInfinity),
					["negativeInfinity"] = writer => writer.Write((double) double.NegativeInfinity),
				},
				["float"] = new TestsInGroup
				{
					["min"] = writer => writer.Write((float) float.MinValue),
					["max"] = writer => writer.Write((float) float.MaxValue),
					["epsilon"] = writer => writer.Write((float) float.Epsilon),
					["zero"] = writer => writer.Write((float) 0),
					["smallNegative"] = writer => writer.Write((float) -0.00005),
					["smallPositive"] = writer => writer.Write((float) 0.00005),
					["lowNegative"] = writer => writer.Write((float) -123456789),
					["highPositive"] = writer => writer.Write((float) 123456789),
					["nan"] = writer => writer.Write((float) float.NaN),
					["positiveInfinity"] = writer => writer.Write((float) float.PositiveInfinity),
					["negativeInfinity"] = writer => writer.Write((float) float.NegativeInfinity),
				}
			};


			var utf8Tests = new TestsGroup
			{
				["char"] = new TestsInGroup
				{
					// 1-byte UTF8 character, (U+0034) 0x34
					["oneByte"] = writer => writer.Write("4".ToCharArray()),
					// 2-byte UTF8 character, (U+00A9) 0xC2A9
					["twoByte"] = writer => writer.Write("©".ToCharArray()),
					// 3-byte UTF8 character, (U+2C01) 0xE2B081
					["threeByte"] = writer => writer.Write("Ⰱ".ToCharArray()),
					// 4-byte UTF8 character, (U+1F130) 0xF09F84B0
					["fourByte"] = writer => writer.Write("🄰".ToCharArray()),
				},
				["charArray"] = new TestsInGroup
				{
					// 1-byte UTF8 character, (U+0034) 0x34
					["oneBytes"] = writer => writer.Write("4444".ToCharArray()),
					// 2-byte UTF8 character, (U+00A9) 0xC2A9
					["twoBytes"] = writer => writer.Write("©©©©".ToCharArray()),
					// 3-byte UTF8 character, (U+2C01) 0xE2B081
					["threeBytes"] = writer => writer.Write("ⰁⰁⰁⰁ".ToCharArray()),
					// 4-byte UTF8 character, (U+1F130) 0xF09F84B0
					["fourBytes"] = writer => writer.Write("🄰🄰🄰🄰".ToCharArray()),
					["mixedLowHigh"] = writer => writer.Write("4©Ⰱ🄰".ToCharArray()),
					["mixedHighLow"] = writer => writer.Write("🄰Ⰱ©4".ToCharArray()),
				},
				["string"] = new TestsInGroup
				{
					["oneBytePrefix"] = writer => writer.Write(testStrings.Item1),
					["twoBytePrefix"] = writer => writer.Write(testStrings.Item2),
					["threeBytePrefix"] = writer => writer.Write(testStrings.Item3),
				},
			};

			WriteTests(path, commonTests, "common", Encoding.UTF8);
			WriteTests(path, utf8Tests, "utf8", Encoding.UTF8);
		}

		private static void WriteTests(string path, TestsGroup tests, string encodingName, Encoding encoding)
		{
			foreach (var tuple in tests)
			{
				var typeName = tuple.Key;
				foreach (var test in tuple.Value)
				{
					var testName = test.Key;
					var fileName = $"{path}/test.{encodingName}.{typeName}.{testName}.bin";

					using (var stream = new FileStream(fileName, FileMode.Create, FileAccess.Write))
					using (var writer = new BinaryWriter(stream, encoding))
					{
						test.Value.Invoke(writer);
					}
				}
			}
		}

		private static Tuple<string, string, string> getTestUtf8String()
		{
			/*
			 Characters were collected from this source:
			  - https://www.w3.org/2001/06/utf-8-test/UTF-8-demo.html

			 The way the encoded version were created was by:
			 1. Copy the contents of the comment
			 2. Paste to Chrome 73.0.3686.86 64-bit developer console to `console.log(encodeURI("<PASTE HERE>"))`
			 3. Copy the result into the code here
			 */

			var encodedString = ""
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

			var decodedString = Uri.UnescapeDataString(encodedString);

			/*
			  String length in bytes = 108 bytes

			  BinaryWriter's Write(<string>) prefixes the string with the string's length using a format, where 7 bits ares used to store the length,
			  and if the length is >= 128 bytes, the eighth bit is set to 1 and then it uses the next 7-bits to make the max length (128*128)-1
			  Thus for 1, 2 and 3 byte-long prefixes we need respectively:
			   1-byte prefix =      0 -       127 bytes of text
			   2-byte prefix =    128 -     1,383 bytes of text
			   3-byte prefix = 16,384 - 2,097,152 bytes of text

			  Test strings:
			     1 string  =    108 bytes (1-byte prefix)
			    10 strings =  1,080 bytes (2-byte prefix)
			   200 strings = 21,600 bytes (3-byte prefix)
			 */

			return new Tuple<string, string, string>(
				decodedString,
				string.Concat(Enumerable.Repeat(decodedString, 10)),
				string.Concat(Enumerable.Repeat(decodedString, 200))
			);
		}
	}
}