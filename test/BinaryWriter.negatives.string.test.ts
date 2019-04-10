import {expect} from 'chai';
import {BinaryWriter, Encoding} from "../src";
import {InvalidArgumentError} from "../src/errors/InvalidArgumentError";

describe("BinaryWriter, string negative tests", () =>
{
	describe("Invalid arguments", () =>
	{
		it("writeChar - invalid argument on null", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChar(null, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChar - invalid argument on NaN", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChar(Number.NaN, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChar - invalid argument on -Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChar(Number.NEGATIVE_INFINITY, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChar - invalid argument on +Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChar(Number.POSITIVE_INFINITY, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChar - invalid argument on negative number", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChar(-1, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChars - invalid argument on null", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChars(null, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChars - invalid argument on NaN", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChars([Number.NaN], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChars - invalid argument on -Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChars([Number.NEGATIVE_INFINITY], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChars - invalid argument on +Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChars([Number.POSITIVE_INFINITY], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeChars - invalid argument on negative number", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeChars([-1], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeString - invalid argument on null string", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeString(null, Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeString - invalid argument on NaN", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeString([Number.NaN], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeString - invalid argument on -Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeString([Number.NEGATIVE_INFINITY], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeString - invalid argument on +Infinity", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeString([Number.POSITIVE_INFINITY], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
		it("writeString - invalid argument on negative number", () =>
		{
			const writer = new BinaryWriter();
			expect(() => writer.writeString([-1], Encoding.Utf8)).to.throw(InvalidArgumentError);
		});
	});
});
