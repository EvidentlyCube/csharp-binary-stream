import * as bigInt from 'big-integer';
import {Encoding, isValidEncoding} from "./Encoding";
import {writeUtf8StringFromCodePoints} from "./Utf8";
import {OutOfBoundsError} from "./errors/OutOfBoundsError";
import {EncodingMessageFactory, OutOfBoundsMessageFactory} from "./errors/ErrorMessageFactory";
import {InvalidArgumentError} from "./errors/InvalidArgumentError";
import {Numbers} from "./Numbers";
import {EncodingError} from "./errors/EncodingError";

function assertNumberSize(type: string, minValue: number, maxValue: number, givenValue: number): void
{
	if (givenValue < minValue || givenValue > maxValue || Number.isNaN(givenValue)) {
		throw new OutOfBoundsError(OutOfBoundsMessageFactory.numberOutsideRange(type, minValue, maxValue, givenValue));
	}
}

function assertBigIntSize(type: string, minValue: string, maxValue: string, givenValue: string): void
{
	const givenBigInt = bigInt(givenValue);
	if (givenBigInt.lesser(minValue) || givenBigInt.greater(maxValue)) {
		throw new OutOfBoundsError(OutOfBoundsMessageFactory.numberOutsideRange(type, minValue, maxValue, givenValue));
	}
}

export class BinaryWriter
{
	private _buffer: number[];
	private _length: number;
	private _position: number;

	public get position(): number
	{
		return this._position;
	}

	public set position(value: number)
	{
		this._position = Math.max(0, Math.min(this._length, value));
	}

	public get length(): number
	{
		return this._length;
	}

	public get capacity(): number
	{
		return this._buffer.length;
	}

	public constructor();
	public constructor(initialCapacity: number);
	public constructor(array: number[]);
	public constructor(array: Uint8Array);

	public constructor(arg1: number|number[]|Uint8Array = 128)
	{
		this._position = 0;

		if (typeof arg1 === 'number') {
			this._buffer = new Array(arg1);
			this._length = 0;

		} else if (Array.isArray(arg1)) {
			this._buffer = new Array(arg1.length);
			this._length = 0;
			this.writeBytes(arg1);

		} else if (arg1 instanceof Uint8Array) {
			this._buffer = Array.from(arg1);
			this._length = this._buffer.length;
		}
	}

	public writeBoolean(value: boolean): void
	{
		this._buffer[this._position++] = value ? 1 : 0;

		this._length = Math.max(this._length, this._position);
	}

	public writeByte(value: number): void
	{
		assertNumberSize('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, value);

		this._buffer[this._position++] = value;

		this._length = Math.max(this._length, this._position);
	}

	public writeSameByte(value: number, repeats: number): void
	{
		if (Number.isNaN(repeats) || !Number.isFinite(repeats) || repeats < 0) {
			throw new InvalidArgumentError('`repeats` must be a non-negative integer', 'repeats', repeats);
		}
		assertNumberSize('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, value);

		while (repeats-- > 0) {
			this._buffer[this._position++] = value;
		}

		this._length = Math.max(this._length, this._position);
	}

	public writeBytes(bytes: number[]): void
	{
		for(let i = 0; i < bytes.length; i++) {
			const byte = bytes[i];
			assertNumberSize('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, byte);
			this._buffer[this._position++] = byte;
		}

		this._length = Math.max(this._length, this._position);
	}

	public writeSignedByte(value: number): void
	{
		assertNumberSize('signed byte', Numbers.SBYTE.MIN, Numbers.SBYTE.MAX, value);

		this._buffer[this._position++] = value < 0 ? value + 256 : value;

		this._length = Math.max(this._length, this._position);
	}

	public writeShort(value: number): void
	{
		assertNumberSize('short', Numbers.SHORT.MIN, Numbers.SHORT.MAX, value);

		this._buffer[this._position++] = value & 0xFF;
		this._buffer[this._position++] = (value >> 8 & 0xFF);

		this._length = Math.max(this._length, this._position);
	}

	public writeUnsignedShort(value: number): void
	{
		assertNumberSize('unsigned short', Numbers.USHORT.MIN, Numbers.USHORT.MAX, value);

		this._buffer[this._position++] = value & 0xFF;
		this._buffer[this._position++] = (value >> 8 & 0xFF);

		this._length = Math.max(this._length, this._position);
	}

	public writeInt(value: number): void
	{
		assertNumberSize('int', Numbers.INT.MIN, Numbers.INT.MAX, value);

		this._buffer[this._position++] = value & 0xFF;
		this._buffer[this._position++] = (value >> 8 & 0xFF);
		this._buffer[this._position++] = (value >> 16 & 0xFF);
		this._buffer[this._position++] = (value >> 24 & 0xFF);

		this._length = Math.max(this._length, this._position);
	}

	public writeUnsignedInt(value: number): void
	{
		assertNumberSize('unsigned int', Numbers.UINT.MIN, Numbers.UINT.MAX, value);

		this._buffer[this._position++] = value & 0xFF;
		this._buffer[this._position++] = (value >> 8 & 0xFF);
		this._buffer[this._position++] = (value >> 16 & 0xFF);
		this._buffer[this._position++] = (value >> 24 & 0xFF);

		this._length = Math.max(this._length, this._position);
	}

	public writeLong(value: number | string): void
	{
		if (typeof value === 'number' && (Number.isNaN(value) || !Number.isFinite(value))) {
			throw new InvalidArgumentError('Value cannot be infinite or NaN', 'value', value);
		}

		assertBigIntSize('long', Numbers.LONG.MIN, Numbers.LONG.MAX, value.toString());

		const bigint = typeof value === "number"
			? bigInt(value)
			: bigInt(value);

		const leftHalf = bigint.and(0xFFFFFFFF).toJSNumber();
		const rightHalf = bigint.shiftRight(32).and(0xFFFFFFFF).toJSNumber();

		this._buffer[this._position++] = leftHalf & 0xFF;
		this._buffer[this._position++] = (leftHalf >> 8 & 0xFF);
		this._buffer[this._position++] = (leftHalf >> 16 & 0xFF);
		this._buffer[this._position++] = (leftHalf >> 24 & 0xFF);

		this._buffer[this._position++] = rightHalf & 0xFF;
		this._buffer[this._position++] = (rightHalf >> 8 & 0xFF);
		this._buffer[this._position++] = (rightHalf >> 16 & 0xFF);
		this._buffer[this._position++] = (rightHalf >> 24 & 0xFF);

		this._length = Math.max(this._length, this._position);
	}

	public writeUnsignedLong(value: number | string): void
	{
		if (typeof value === 'number' && (Number.isNaN(value) || !Number.isFinite(value))) {
			throw new InvalidArgumentError('Value cannot be infinite or NaN', 'value', value);
		}

		assertBigIntSize('unsigned long', Numbers.ULONG.MIN, Numbers.ULONG.MAX, value.toString());

		const bigint = typeof value === "number"
			? bigInt(value)
			: bigInt(value);

		const leftHalf = bigint.and(0xFFFFFFFF).toJSNumber();
		const rightHalf = bigint.shiftRight(32).and(0xFFFFFFFF).toJSNumber();

		this._buffer[this._position++] = leftHalf & 0xFF;
		this._buffer[this._position++] = (leftHalf >> 8 & 0xFF);
		this._buffer[this._position++] = (leftHalf >> 16 & 0xFF);
		this._buffer[this._position++] = (leftHalf >> 24 & 0xFF);

		this._buffer[this._position++] = rightHalf & 0xFF;
		this._buffer[this._position++] = (rightHalf >> 8 & 0xFF);
		this._buffer[this._position++] = (rightHalf >> 16 & 0xFF);
		this._buffer[this._position++] = (rightHalf >> 24 & 0xFF);

		this._length = Math.max(this._length, this._position);
	}

	public writeFloat(value: number): void
	{
		if (Number.isFinite(value) && !Number.isNaN(value)) {
			assertNumberSize('float', Numbers.FLOAT.MIN, Numbers.FLOAT.MAX, value);
		}

		if (Number.isNaN(value)) {
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0xc0;
			this._buffer[this._position++] = 0xff;

		} else {
			const floatBuffer = new Float32Array([value]);
			const uintBuffer = new Uint8Array(floatBuffer.buffer, floatBuffer.byteOffset, 4);

			this._buffer[this._position++] = uintBuffer[0];
			this._buffer[this._position++] = uintBuffer[1];
			this._buffer[this._position++] = uintBuffer[2];
			this._buffer[this._position++] = uintBuffer[3];
		}

		this._length = Math.max(this._length, this._position);
	}

	public writeDouble(value: number): void
	{
		if (Number.isNaN(value)) {
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0x00;
			this._buffer[this._position++] = 0xf8;
			this._buffer[this._position++] = 0xff;
		} else {
			const floatBuffer = new Float64Array([value]);
			const uintBuffer = new Uint8Array(floatBuffer.buffer, floatBuffer.byteOffset, 8);

			this._buffer[this._position++] = uintBuffer[0];
			this._buffer[this._position++] = uintBuffer[1];
			this._buffer[this._position++] = uintBuffer[2];
			this._buffer[this._position++] = uintBuffer[3];
			this._buffer[this._position++] = uintBuffer[4];
			this._buffer[this._position++] = uintBuffer[5];
			this._buffer[this._position++] = uintBuffer[6];
			this._buffer[this._position++] = uintBuffer[7];
		}

		this._length = Math.max(this._length, this._position);
	}

	public writeChar(value: number | string, encoding: Encoding): void
	{
		if (value === null) {
			throw new InvalidArgumentError('Cannot write null string.', 'value', value);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		this._position = writeUtf8StringFromCodePoints(this._buffer, this._position, typeof value === "number" ? [value] : value);

		this._length = Math.max(this._length, this._position);
	}

	public writeChars(value: number[] | string, encoding: Encoding): void
	{
		if (value === null) {
			throw new InvalidArgumentError('Cannot write null string.', 'value', value);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		this._position = writeUtf8StringFromCodePoints(this._buffer, this._position, value);

		this._length = Math.max(this._length, this._position);
	}

	public writeString(value: number[] | string, encoding: Encoding): void
	{
		if (value === null) {
			throw new InvalidArgumentError('Cannot write null string.', 'value', value);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		const tempBuffer: number[] = [];
		writeUtf8StringFromCodePoints(tempBuffer, 0, value);

		let length = tempBuffer.length;
		while (length >= 0x80) {
			this._buffer[this._position++] = (length & 0xFF) | 0x80;
			length >>= 7;
		}
		this._buffer[this._position++] = length;

		for(let i = 0; i < tempBuffer.length; i++) {
			this._buffer[this._position++] = tempBuffer[i];
		}

		this._length = Math.max(this._length, this._position);
	}

	public clear(): void
	{
		this._position = 0;
		this._length = 0;
	}

	public toArray(): number[]
	{
		return this._buffer.slice(0, this._length);
	}

	public toUint8Array(): Uint8Array
	{
		return new Uint8Array(this.toArray());
	}
}