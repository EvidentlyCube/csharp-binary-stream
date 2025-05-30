import { expect } from "chai";
import { InvalidArgumentError } from "../src";

export function expectInvalidArgument(callback: () => void, message: string, argumentName: string, argumentValue: unknown) {
	try {
		callback();
		expect.fail(`Expected function to throw an error`);

	} catch (unknownError: unknown) {
		expect(unknownError).to.instanceOf(InvalidArgumentError);

		const err = unknownError as InvalidArgumentError;
		expect(err.argumentName).to.equal(argumentName);

		if (typeof argumentValue === 'number' && Number.isNaN(argumentValue)) {
			expect(Number.isNaN(err.argumentValue), "Expect Number.isNaN() to be true").to.equal(true);
		} else {
			expect(err.argumentValue).to.equal(argumentValue);
		}
	}
}