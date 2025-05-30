import { expect } from 'chai';
import { BinaryReader, BinaryWriter } from "../src";
import { getBufferOfLength } from "./common";
import { expectInvalidArgument } from './asserts';

describe("BinaryWriter, negative common tests", () => {
	describe('Constructor', () => {
		it("new BinaryWriter('invalid') - Exception when invalid endianness value", () => {
			expectInvalidArgument(
				// @ts-expect-error: Negative scenario checking
				() => new BinaryWriter("invalid"),
				'`endianness` must be a value from the Endianness enum',
				'endianness',
				"invalid"
			);
		});

		it("new BinaryWriter([], 'invalid') - Exception when invalid endianness value", () => {
			expectInvalidArgument(
				// @ts-expect-error: Negative scenario checking
				() => new BinaryWriter("invalid"),
				'`endianness` must be a value from the Endianness enum',
				'endianness',
				"invalid"
			);
		});

		it("new BinaryWriter([], 'invalid') - Exception when invalid endianness value", () => {
			expectInvalidArgument(
				// @ts-expect-error: Negative scenario checking
				() => new BinaryWriter([], "invalid"),
				'`endianness` must be a value from the Endianness enum',
				'endianness',
				"invalid"
			);
		});
	});

	describe('Properties', () => {
		describe('set position', () => {
			it('Throw an error when setting to non numeric values', () => {
				const reader = new BinaryReader(getBufferOfLength(16));

				expect(() => reader.position = Number.NaN).to.throw();
				expect(() => reader.position = Number.NEGATIVE_INFINITY).to.throw();
				expect(() => reader.position = Number.POSITIVE_INFINITY).to.throw();

				// @ts-expect-error: Negative scenario checking
				expect(() => reader.position = null).to.throw();
				// @ts-expect-error: Negative scenario checking
				expect(() => reader.position = undefined).to.throw();
				// @ts-expect-error: Negative scenario checking
				expect(() => reader.position = "").to.throw();
				// @ts-expect-error: Negative scenario checking
				expect(() => reader.position = []).to.throw();
				// @ts-expect-error: Negative scenario checking
				expect(() => reader.position = {}).to.throw();
				// @ts-expect-error: Negative scenario checking
				expect(() => reader.position = function () { }).to.throw();
			});
		});
	});
});
