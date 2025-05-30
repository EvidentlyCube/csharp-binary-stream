import { expect } from 'chai';
import { BinaryReader } from "../src";
import { getBufferOfLength } from "./common";

describe("BinaryReader, negative common tests", () => {
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
				expect(() => reader.position = function(){}).to.throw();
			});
		});
	});
});
