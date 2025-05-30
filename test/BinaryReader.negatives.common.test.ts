import { expect } from 'chai';
import { BinaryReader } from "../src";
import { getBufferOfLength, getInvalidNumberValues } from "./common";
import { expectInvalidArgument } from './asserts';

describe("BinaryReader, negative common tests", () => {
	describe('Constructor', () => {
		it("Throw exception when receiving invalid constructor", () => {
			const invalidValues = [
				null,
				undefined,
				{},
				[],
				false,
				true,
				0,
				"",
				"0",
				function () { }
			];

			for (const value of invalidValues) {
				expectInvalidArgument(
					// @ts-expect-error: Negative scenario checking
					() => new BinaryReader(value),
					"`stream` must be either an instance of ArrayBuffer or Uint8Array",
					'stream',
					value
				);
			}
			// @ts-expect-error: Negative scenario checking
			expect(() => new BinaryReader(undefined)).to.throw();
			// @ts-expect-error: Negative scenario checking
			expect(() => new BinaryReader({})).to.throw();
			// @ts-expect-error: Negative scenario checking
			expect(() => new BinaryReader([])).to.throw();
			// @ts-expect-error: Negative scenario checking
			expect(() => new BinaryReader(false)).to.throw();
			// @ts-expect-error: Negative scenario checking
			expect(() => new BinaryReader(0)).to.throw();
			// @ts-expect-error: Negative scenario checking
			expect(() => new BinaryReader(function () { })).to.throw();
		})
	});

	describe('Properties', () => {
		describe('set position', () => {
			for (const [name, value] of Object.entries(getInvalidNumberValues())) {
				it(`position = ${name}`, () => {
					const reader = new BinaryReader(getBufferOfLength(16));

					expectInvalidArgument(
						// @ts-expect-error: Negative scenario checking
						() => reader.position = value,
						"Cannot set position to a non-numeric value",
						'position',
						value
					);
				});
			}
		});
	});
});
