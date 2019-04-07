import {Encoding} from "../Encoding";

const allEncodings = Object.values(Encoding).join(', ');

/** @ignore*/
export const EncodingMessageFactory = {
	unknownEncoding: function (encoding: string): string
	{
		return `'${encoding}' is not a supported encoding, use one of ${allEncodings} instead.`;
	},
};

/** @ignore*/
export const InvalidUtf8CharacterMessageFactory = {
	invalidLeadingByte: function (readByte: number, position: number): string
	{
		return `Invalid leading byte found at position ${position}, expected prefix of 0x, 11x, 111x or 111x, got '${readByte.toString(2).padStart(8, '0')}' instead.`;
	},

	notContinuationByte: function (sequenceStartPosition: number, byteIndex: number, readByte: number): string
	{
		return `Byte #${byteIndex + 1} in UTF8 sequence starting at ${sequenceStartPosition} was expected to be a continuation byte, got '${readByte.toString(2).padStart(8, '0')}' instead.`;
	},
};

/** @ignore*/
export const EndOfStreamMessageFactory = {
	readStringZeroBytesLeft: function (): string
	{
		return `readString requires at least one byte to be left in the stream, but 0 bytes are remaining.`;
	},

	readStringLengthNotEnoughBytesLeft: function (): string
	{
		return `readString ran out of stream when reading length prefix.`;
	},

	readStringTooLongPrefix: function(): string {
		return `readString encountered a string prefix that takes more than 5 bytes`;
	},

	readStringTooLongLeft: function (expectedLength: number, remainingLength: number): string
	{
		return `readString failed when trying to read tring of length ${expectedLength} byte(s), only ${remainingLength} byte(s) are remaining.`;
	},

	readCharZeroBytesLeft: function (): string
	{
		return `readChar requires at least one byte to be left in the stream, but 0 bytes are remaining.`;
	},

	utf8NotEnoughBytesInBuffer: function (position: number, bytesExpected: number, bytesRemaining: number): string
	{
		return `Utf8 sequence at position ${position} is ${bytesExpected} bytes long, but only ${bytesRemaining} byte(s) are left in the buffer.`;
	},

	utf8NotEnoughBytesAllowed: function (position: number, bytesExpected: number, bytesRemaining: number): string
	{
		return `Utf8 sequence at position ${position} is ${bytesExpected} bytes long, but only ${bytesRemaining} more byte(s) are allowed to be read.`;
	},

	notEnoughBytesInBuffer: function (bytesExpected: number, bytesRemaining: number, operationName: string): string
	{
		return `${operationName} expects ${bytesExpected} bytes to be left in the stream, but only ${bytesRemaining} byte(s) are remaining.`;
	},
};

/** @ignore */
export const OutOfBoundsMessageFactory = {
	numberOutsideRange: function(numberName: string, minimumValue: string|number, maximumValue: string|number, givenValue: string|number): string
	{
		return `Number of type '${numberName}' must be between ${minimumValue} and ${maximumValue}, got ${givenValue} instead.`;
	}
};