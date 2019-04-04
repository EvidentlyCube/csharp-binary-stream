import * as bigInt from 'big-integer';
import {Encoding} from "./Encoding";
import {writeUtf8StringFromCodePoints} from "./Utf8";

export class BinaryWriter
{
	private _stream: number[];
	private _position: number;

	public constructor()
	{
		this._stream = [];
		this._position = 0;
	}

	public writeBoolean(value: boolean): void
	{
		this.writeBytes(value ? 1 : 0);
	}

	public writeByte(value: number): void
	{
		this._stream[this._position++] = value;
	}

	public writeSignedByte(value: number): void
	{
		this._stream[this._position++] = value < 0 ? value + 256 : value;
	}

	public writeShort(value: number): void
	{
		this._stream[this._position++] = value & 0xFF;
		this._stream[this._position++] = (value >> 8 & 0xFF);
	}

	public writeUnsignedShort(value: number): void
	{
		this._stream[this._position++] = value & 0xFF;
		this._stream[this._position++] = (value >> 8 & 0xFF);
	}

	public writeInt(value: number): void
	{
		this._stream[this._position++] = value & 0xFF;
		this._stream[this._position++] = (value >> 8 & 0xFF);
		this._stream[this._position++] = (value >> 16 & 0xFF);
		this._stream[this._position++] = (value >> 24 & 0xFF);
	}

	public writeUnsignedInt(value: number): void
	{
		this._stream[this._position++] = value & 0xFF;
		this._stream[this._position++] = (value >> 8 & 0xFF);
		this._stream[this._position++] = (value >> 16 & 0xFF);
		this._stream[this._position++] = (value >> 24 & 0xFF);
	}

	public writeLong(value: number | string): void
	{
		const bigint = typeof value === "number"
			? bigInt(value)
			: bigInt(value);

		const leftHalf = bigint.and(0xFFFFFFFF).toJSNumber();
		const rightHalf = bigint.shiftRight(32).and(0xFFFFFFFF).toJSNumber();

		this._stream[this._position++] = leftHalf & 0xFF;
		this._stream[this._position++] = (leftHalf >> 8 & 0xFF);
		this._stream[this._position++] = (leftHalf >> 16 & 0xFF);
		this._stream[this._position++] = (leftHalf >> 24 & 0xFF);

		this._stream[this._position++] = rightHalf & 0xFF;
		this._stream[this._position++] = (rightHalf >> 8 & 0xFF);
		this._stream[this._position++] = (rightHalf >> 16 & 0xFF);
		this._stream[this._position++] = (rightHalf >> 24 & 0xFF);
	}

	public writeUnsignedLong(value: number | string): void
	{
		const bigint = typeof value === "number"
			? bigInt(value)
			: bigInt(value);

		const leftHalf = bigint.and(0xFFFFFFFF).toJSNumber();
		const rightHalf = bigint.shiftRight(32).and(0xFFFFFFFF).toJSNumber();

		this._stream[this._position++] = leftHalf & 0xFF;
		this._stream[this._position++] = (leftHalf >> 8 & 0xFF);
		this._stream[this._position++] = (leftHalf >> 16 & 0xFF);
		this._stream[this._position++] = (leftHalf >> 24 & 0xFF);

		this._stream[this._position++] = rightHalf & 0xFF;
		this._stream[this._position++] = (rightHalf >> 8 & 0xFF);
		this._stream[this._position++] = (rightHalf >> 16 & 0xFF);
		this._stream[this._position++] = (rightHalf >> 24 & 0xFF);
	}

	public writeFloat(value: number): void
	{
		if (Number.isNaN(value)) {
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0xc0;
			this._stream[this._position++] = 0xff;
			return;
		}

		const floatBuffer = new Float32Array([value]);
		const uintBuffer = new Uint8Array(floatBuffer.buffer, floatBuffer.byteOffset, 4);

		this._stream[this._position++] = uintBuffer[0];
		this._stream[this._position++] = uintBuffer[1];
		this._stream[this._position++] = uintBuffer[2];
		this._stream[this._position++] = uintBuffer[3];
	}

	public writeDouble(value: number): void
	{
		if (Number.isNaN(value)) {
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0x00;
			this._stream[this._position++] = 0xf8;
			this._stream[this._position++] = 0xff;
			return;
		}

		const floatBuffer = new Float64Array([value]);
		const uintBuffer = new Uint8Array(floatBuffer.buffer, floatBuffer.byteOffset, 8);

		this._stream[this._position++] = uintBuffer[0];
		this._stream[this._position++] = uintBuffer[1];
		this._stream[this._position++] = uintBuffer[2];
		this._stream[this._position++] = uintBuffer[3];
		this._stream[this._position++] = uintBuffer[4];
		this._stream[this._position++] = uintBuffer[5];
		this._stream[this._position++] = uintBuffer[6];
		this._stream[this._position++] = uintBuffer[7];
	}

	public writeChar(value: number | string, encoding: Encoding): void
	{
		this._position = writeUtf8StringFromCodePoints(this._stream, this._position, typeof value === "number" ? [value] : value);
	}

	public writeChars(value: number[] | string, encoding: Encoding): void
	{
		this._position = writeUtf8StringFromCodePoints(this._stream, this._position, value);
	}

	public writeString(value: number[] | string, encoding: Encoding): void
	{
		const tempBuffer: number[] = [];
		writeUtf8StringFromCodePoints(tempBuffer, 0, value);

		let length = tempBuffer.length;
		while (length >= 0x80) {
			this._stream[this._position++] = (length & 0xFF) | 0x80;
			length >>= 7;
		}
		this._stream[this._position++] = length;

		for(let i = 0; i < tempBuffer.length; i++) {
			this._stream[this._position++] = tempBuffer[i];
		}
	}

	public clear(): void
	{
		this._position = 0;
		this._stream.length = 0;
	}

	public toArray(): number[]
	{
		return this._stream.concat();
	}

	private writeBytes(...bytes: number[]): void
	{
		for(let i = 0; i < bytes.length; i++) {
			this._stream[this._position++] = bytes[i];
		}
	}
}