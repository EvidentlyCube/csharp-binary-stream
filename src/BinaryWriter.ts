import { Encoding, isValidEncoding } from "./Encoding";
import { writeUtf8StringFromCodePoints } from "./Utf8";
import { OutOfBoundsError } from "./errors/OutOfBoundsError";
import { EncodingMessageFactory, OutOfBoundsMessageFactory } from "./errors/ErrorMessageFactory";
import { InvalidArgumentError } from "./errors/InvalidArgumentError";
import { Numbers } from "./Numbers";
import { EncodingError } from "./errors/EncodingError";
import { Endianness, isValidEndianness } from './Endianness';

/**
 * @ignore
 */
function assertNumberSize(type: string, minValue: number, maxValue: number, givenValue: number): void {
	if (givenValue < minValue || givenValue > maxValue || Number.isNaN(givenValue)) {
		throw new OutOfBoundsError(OutOfBoundsMessageFactory.numberOutsideRange(type, minValue, maxValue, givenValue));
	}
}

/**
 * @ignore
 */
function assertBigIntSize(type: string, minValue: string, maxValue: string, givenValue: number | string): void {
	const givenBigInt = BigInt(givenValue);
	if (givenBigInt < BigInt(minValue) || givenBigInt > BigInt(maxValue)) {
		throw new OutOfBoundsError(OutOfBoundsMessageFactory.numberOutsideRange(type, minValue, maxValue, givenValue));
	}
}

/**
 * A binary stream writer compatible with majority of methods in C#'s [BinaryWriter](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter?view=netframework-4.7.2).
 *
 * All write operations advance the position by the number of bytes that were written.
 *
 * Any time the word _stream_ or _buffer_ is used in the documentation it refers to the internal array that represents the written data.
 */
export class BinaryWriter {
	private _buffer: number[];
	private _length: number;
	private _position: number;

	/**
	 * Endianness of all the write operations
	 */
	private _endianness: Endianness;

	/**
	 * Length of the written data in bytes
	 */
	public get length(): number {
		return this._length;
	}

	/**
	 * Current position inside the buffer denoting the place at which the next write operation will happen.
	 */
	public get position(): number {
		return this._position;
	}

	/**
	 * Changes the position inside the buffer at which the next write operation
	 * will happen. Setting it to less than `0` will clamp it to `0`, and setting it
	 * to anything more than `length` will clamp it to `length`.
	 */
	public set position(value: number) {
		this._position = Math.max(0, Math.min(this._length, value));
	}

	public get endianness() {
		return this._endianness;
	}

	public set endianness(value: Endianness) {
		if (!isValidEndianness(value)) {
			throw new InvalidArgumentError('`endianness` must be a value from the Endianness enum', 'endianness', value);
		}

		this._endianness = value;
	}

	/**
	 * Creates a new `BinaryWriter` with empty writing buffer.
	 *
	 * @param {Endianness | undefined} endianness Defaults to Little Endian.
	 */
	public constructor(endianness?: Endianness);

	/**
	 * Creates a new `BinaryWriter` and fills its buffer with the specified
	 * array. Position is set to the end of the buffer, meaning
	 * any subsequent writes will append new data at the end.
	 *
	 * @remarks
	 * There is no syncing between the buffer and the passed array, changes to
	 * either won't be reflected in the other.
	 *
	 * @param {number[]} array
	 * @param {Endianness | undefined} endianness Defaults to Little Endian.
	 * @throws {@link OutOfBoundsError} Thrown when any of the array elements provided is outside byte range
	 */
	public constructor(array: number[], endianness?: Endianness);

	/**
	 * Creates a new `BinaryWriter` and fills its buffer with the contents of
	 * the array. Position is set to the end of the buffer, meaning
	 * any subsequent writes will append new data at the end.
	 *
	 * @remarks
	 * There is no syncing between the buffer and the passed array, changes to
	 * either won't be reflected in the other.
	 *
	 * @param {Uint8Array} array
	 * @param {Endianness | undefined} endianness Defaults to Little Endian.
	 */
	public constructor(array: Uint8Array, endianness?: Endianness);

	public constructor(arg1?: number[] | Uint8Array | Endianness, arg2?: Endianness) {
		this._position = 0;

		this._endianness = Endianness.Little;

		if (Array.isArray(arg1)) {
			this._buffer = new Array(arg1.length);
			this._length = 0;
			this.writeBytes(arg1);

			if (arg2) {
				this.endianness = arg2;
			}

		} else if (arg1 instanceof Uint8Array) {
			this._buffer = Array.from(arg1);
			this._length = this._buffer.length;

			if (arg2) {
				this.endianness = arg2;
			}

		} else {
			this._buffer = [];
			this._length = 0;

			if (arg1) {
				this.endianness = arg1;
			}
		}
	}

	/**
	 * Writes one byte, `0x01` for `true` and `0x00` for `false` and advances
	 * the position by one byte.
	 * @param {boolean} value Boolean to write.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Boolean_)
	 */
	public writeBoolean(value: boolean): void {
		this._buffer[this._position++] = value ? 1 : 0;

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes one byte and advances the position by one byte.
	 * @param {number} value Byte to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than 0, more
	 * than 255, +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Byte_)
	 */
	public writeByte(value: number): void {
		assertNumberSize('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, value);

		this._buffer[this._position++] = value;

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes the same byte multiple times and advances the position by `repeats` bytes.
	 * @param {number} value Byte to write.
	 * @param {number} repeats Number of times to write the byte.
	 * @throws {@link InvalidArgumentError} Thrown when `repeats` is less than 0, +/- infinity or `NaN`.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than 0, more than 255, +/- infinity or `NaN`.
	 */
	public writeSameByte(value: number, repeats: number): void {
		if (Number.isNaN(repeats) || !Number.isFinite(repeats) || repeats < 0) {
			throw new InvalidArgumentError('`repeats` must be a non-negative integer', 'repeats', repeats);
		}
		assertNumberSize('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, value);

		while (repeats-- > 0) {
			this._buffer[this._position++] = value;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes the passed array of bytes and advances the position by `bytes`'s length.
	 * @param {number[]} bytes Bytes to write.
	 * @throws {@link OutOfBoundsError} Thrown when any of the bytes in `bytes` is less
	 * than 0, more than 255, +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Byte___)
	 */
	public writeBytes(bytes: number[]): void {
		for (let i = 0; i < bytes.length; i++) {
			const byte = bytes[i];
			assertNumberSize('byte', Numbers.BYTE.MIN, Numbers.BYTE.MAX, byte);
			this._buffer[this._position++] = byte;
		}

		this._length = Math.max(this._length, this._position);
	}


	/**
	 * Writes a `signed byte` and advances the position by one byte.
	 * @param {number} value Signed byte to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than -128, more
	 * than 127, +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_SByte_)
	 */
	public writeSignedByte(value: number): void {
		assertNumberSize('signed byte', Numbers.SBYTE.MIN, Numbers.SBYTE.MAX, value);

		this._buffer[this._position++] = value < 0 ? value + 256 : value;

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes a `short` and advances the position by two bytes.
	 * @param {number} value Short to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than -32,768
	 * more than 32,767, +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Int16_)
	 */
	public writeShort(value: number): void {
		assertNumberSize('short', Numbers.SHORT.MIN, Numbers.SHORT.MAX, value);

		if (this.endianness === Endianness.Little) {
			this._buffer[this._position++] = value & 0xFF;
			this._buffer[this._position++] = (value >> 8 & 0xFF);
		} else {
			this._buffer[this._position++] = (value >> 8 & 0xFF);
			this._buffer[this._position++] = value & 0xFF;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes an `unsigned short` and advances the position by two bytes.
	 * @param {number} value Unsigned short to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than 0 more than
	 * 65,535, +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_UInt16_)
	 */
	public writeUnsignedShort(value: number): void {
		assertNumberSize('unsigned short', Numbers.USHORT.MIN, Numbers.USHORT.MAX, value);

		if (this.endianness === Endianness.Little) {
			this._buffer[this._position++] = value & 0xFF;
			this._buffer[this._position++] = (value >> 8 & 0xFF);
		} else {
			this._buffer[this._position++] = (value >> 8 & 0xFF);
			this._buffer[this._position++] = value & 0xFF;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes an `int` and advances the position by four bytes.
	 * @param {number} value Int to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than
	 * -2,147,483,648 more than 2,147,483,647, +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Int32_)
	 */
	public writeInt(value: number): void {
		assertNumberSize('int', Numbers.INT.MIN, Numbers.INT.MAX, value);

		if (this.endianness === Endianness.Little) {
			this._buffer[this._position++] = value & 0xFF;
			this._buffer[this._position++] = (value >> 8 & 0xFF);
			this._buffer[this._position++] = (value >> 16 & 0xFF);
			this._buffer[this._position++] = (value >> 24 & 0xFF);
		} else {
			this._buffer[this._position++] = (value >> 24 & 0xFF);
			this._buffer[this._position++] = (value >> 16 & 0xFF);
			this._buffer[this._position++] = (value >> 8 & 0xFF);
			this._buffer[this._position++] = value & 0xFF;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes an `unsigned int` and advances the position by four bytes.
	 * @param {number} value Unsigned int to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than 0 more than
	 * 4,294,967,295 +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_UInt32_)
	 */
	public writeUnsignedInt(value: number): void {
		assertNumberSize('unsigned int', Numbers.UINT.MIN, Numbers.UINT.MAX, value);

		if (this.endianness === Endianness.Little) {
			this._buffer[this._position++] = value & 0xFF;
			this._buffer[this._position++] = (value >> 8 & 0xFF);
			this._buffer[this._position++] = (value >> 16 & 0xFF);
			this._buffer[this._position++] = (value >> 24 & 0xFF);
		} else {
			this._buffer[this._position++] = (value >> 24 & 0xFF);
			this._buffer[this._position++] = (value >> 16 & 0xFF);
			this._buffer[this._position++] = (value >> 8 & 0xFF);
			this._buffer[this._position++] = value & 0xFF;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes a `long` and advances the position by eight bytes.
	 *
	 * @remarks
	 * JavaScript internally uses `double` to represent all numbers.
	 * The smallest and largest number that can be represented without loss of
	 * precision are, respectively, −9,007,199,254,740,991 `−(2^53 − 1)` and
	 * 9,007,199,254,740,991 `2^53 − 1`, while `long` can hold values between
	 * `-2^63` and `2^63 - 1`, while `unsigned long`
	 * goes all the way up to `2^64-1`.
	 *
	 * What happens when you go beyond those limits is that some numbers just
	 * cannot be expressed. `9007199254740992+1` is the same as
	 * `9007199254740992+1+1+1+1` and if you try to set a variable to
	 * `9007199254740993` it just gets rounded down.
	 *
	 * @param {number|string} value Long to write accepted both as a string
	 * (for 100% precision in very low/high numbers) and number,
	 * when precision is not a requirement.
	 *
	 * @throws {@link InvalidArgumentError} Thrown when `value` is `NaN` or +/- infinite.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than -9,223,372,036,854,775,808 more than 9,223,372,036,854,775,807 +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Int64_)
	 */
	public writeLong(value: number | string): void {
		if (typeof value === 'number' && (Number.isNaN(value) || !Number.isFinite(value))) {
			throw new InvalidArgumentError('Value cannot be infinite or NaN', 'value', value);
		}

		assertBigIntSize('long', Numbers.LONG.MIN, Numbers.LONG.MAX, value);

		const bigint = BigInt(value);

		const smallHalf = Number(bigint & BigInt(0xFFFFFFFF))
		const bigHalf = Number((bigint >> BigInt(32)) & BigInt(0xFFFFFFFF))

		if (this.endianness === Endianness.Little) {
			this._buffer[this._position++] = smallHalf & 0xFF;
			this._buffer[this._position++] = (smallHalf >> 8 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 24 & 0xFF);

			this._buffer[this._position++] = bigHalf & 0xFF;
			this._buffer[this._position++] = (bigHalf >> 8 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 24 & 0xFF);

		} else {
			this._buffer[this._position++] = (bigHalf >> 24 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 8 & 0xFF);
			this._buffer[this._position++] = bigHalf & 0xFF;

			this._buffer[this._position++] = (smallHalf >> 24 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 8 & 0xFF);
			this._buffer[this._position++] = smallHalf & 0xFF;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes an `unsigned long` and advances the position by eight bytes. See the remark in {@link writeLong} for details about why strings are preferred.
	 *
	 * @param {number|string} value Unsigned long to write accepted both as a string (for 100% precision in very low/high numbers) and number, when precision is not a
	 * requirement.
	 * @throws {@link InvalidArgumentError} Thrown when `value` is `NaN` or +/- infinite.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than 0 more than 18,446,744,073,709,551,615 +/- infinity or `NaN`.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_UInt64_)
	 */
	public writeUnsignedLong(value: number | string): void {
		if (typeof value === 'number' && (Number.isNaN(value) || !Number.isFinite(value))) {
			throw new InvalidArgumentError('Value cannot be infinite or NaN', 'value', value);
		}

		assertBigIntSize('unsigned long', Numbers.ULONG.MIN, Numbers.ULONG.MAX, value);

		const bigint = BigInt(value);

		const smallHalf = Number(bigint & BigInt(0xFFFFFFFF))
		const bigHalf = Number((bigint >> BigInt(32)) & BigInt(0xFFFFFFFF))

		if (this.endianness === Endianness.Little) {
			this._buffer[this._position++] = smallHalf & 0xFF;
			this._buffer[this._position++] = (smallHalf >> 8 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 24 & 0xFF);

			this._buffer[this._position++] = bigHalf & 0xFF;
			this._buffer[this._position++] = (bigHalf >> 8 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 24 & 0xFF);
		} else {
			this._buffer[this._position++] = (bigHalf >> 24 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (bigHalf >> 8 & 0xFF);
			this._buffer[this._position++] = bigHalf & 0xFF;

			this._buffer[this._position++] = (smallHalf >> 24 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 16 & 0xFF);
			this._buffer[this._position++] = (smallHalf >> 8 & 0xFF);
			this._buffer[this._position++] = smallHalf & 0xFF;
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes a `float` and advances the position by four bytes.
	 * @param {boolean} value Float to write.
	 * @throws {@link OutOfBoundsError} Thrown when `value` is less than -3.4028235e+38 or more than 3.4028235e+38.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Single_)
	 */
	public writeFloat(value: number): void {
		if (Number.isFinite(value) && !Number.isNaN(value)) {
			assertNumberSize('float', Numbers.FLOAT.MIN, Numbers.FLOAT.MAX, value);
		}

		if (Number.isNaN(value)) {
			if (this.endianness === Endianness.Little) {
				this._buffer[this._position++] = 0x00;
				this._buffer[this._position++] = 0x00;
				this._buffer[this._position++] = 0xc0;
				this._buffer[this._position++] = 0xff;
			} else {
				this._buffer[this._position++] = 0xff;
				this._buffer[this._position++] = 0xc0;
				this._buffer[this._position++] = 0x00;
				this._buffer[this._position++] = 0x00;
			}

		} else {
			// @FIXME Float32Array uses CPU's endianness which makes this function not fully cross-platform
			// Right now the assumption is `Float32Array` is Little Endian and that needs to be addressed in the future

			const floatBuffer = new Float32Array([value]);
			const uintBuffer = new Uint8Array(floatBuffer.buffer, floatBuffer.byteOffset, 4);

			if (this.endianness === Endianness.Little) {
				this._buffer[this._position++] = uintBuffer[0];
				this._buffer[this._position++] = uintBuffer[1];
				this._buffer[this._position++] = uintBuffer[2];
				this._buffer[this._position++] = uintBuffer[3];
			} else {
				this._buffer[this._position++] = uintBuffer[3];
				this._buffer[this._position++] = uintBuffer[2];
				this._buffer[this._position++] = uintBuffer[1];
				this._buffer[this._position++] = uintBuffer[0];
			}
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes a `double` and advances the position by eight bytes.
	 * @param {boolean} value Double to write.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Double_)
	 */
	public writeDouble(value: number): void {
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
			// @FIXME Float64Array uses CPU's endianness which makes this function not fully cross-platform
			// Right now the assumption is `Float32Array` is Little Endian and that needs to be addressed in the future

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

	/**
	 * Writes a single character in the specified encoding and advances the
	 * position by the number of bytes the character takes in that encoding.
	 *
	 * @param {number|String} character Unicode codepoint of the character to
	 * write or a string, in which case only the first character is used.
	 * @param {Encoding} encoding Character encoding to use when writing the character.
	 * @throws {@link InvalidArgumentError} Thrown when `null` is passed for `character`
	 * or when the codepoint passed in `character` is negative, +/- infinite or `NaN`
	 * @throws {@link EncodingError} Thrown when unknown or unsupported `encoding` is passed.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Char_)
	 */
	public writeChar(character: number | string, encoding: Encoding = Encoding.Utf8): void {
		if (character === null) {
			throw new InvalidArgumentError('Cannot write null string.', 'value', character);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		this._position = writeUtf8StringFromCodePoints(
			this._buffer,
			this._position,
			typeof character === "number"
				? [character]
				: [character.codePointAt(0) ?? Number.NaN]
		);

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes multiple characters in the specified encoding and advances the
	 * position by the number of bytes the characters take in that encoding.
	 *
	 * @param {number[]|String} characters Unicode codepoints of the character
	 * to write or a string.
	 * @param {Encoding} encoding Character encoding to use when writing the characters.
	 * @throws {@link InvalidArgumentError} Thrown when `null` is passed for `character`
	 * or when any of the codepoints passed in `characters` is negative, +/- infinite or `NaN`
	 * @throws {@link EncodingError} Thrown when unknown or unsupported `encoding` is passed.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_Char___)
	 */
	public writeChars(characters: number[] | string, encoding: Encoding = Encoding.Utf8): void {
		if (characters === null) {
			throw new InvalidArgumentError('Cannot write null string.', 'value', characters);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		this._position = writeUtf8StringFromCodePoints(this._buffer, this._position, characters);

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Writes length-prefixed multiple characters in the specified encoding and
	 * advances the position by the number of bytes the characters take in that encoding.
	 *
	 * @param {number[]|String} value Unicode codepoints of the character to write or a string.
	 * @param {Encoding} encoding Character encoding to use when writing the characters.
	 * @throws {@link InvalidArgumentError} Thrown when `null` is passed for `character`
	 * or when any of the codepoints passed in `characters` is negative, +/- infinite or `NaN`
	 * @throws {@link EncodingError} Thrown when unknown or unsupported `encoding` is passed.
	 * @see [C# `BinaryWriter.Write(Boolean)` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write?view=netframework-4.7.2#System_IO_BinaryWriter_Write_System_String_)
	 */
	public writeString(value: number[] | string, encoding: Encoding = Encoding.Utf8): void {
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

		for (let i = 0; i < tempBuffer.length; i++) {
			this._buffer[this._position++] = tempBuffer[i];
		}

		this._length = Math.max(this._length, this._position);
	}

	/**
	 * Completely clears the underlying buffer and changes `position` and `length` to zero.
	 */
	public clear(): void {
		this._position = 0;
		this._length = 0;
	}

	/**
	 * Returns the contents of the writer as regular array of bytes.
	 * @returns {number[]}
	 */
	public toArray(): number[] {
		return this._buffer.slice(0, this._length);
	}

	/**
	 * Returns the contents of the writer as `Uint8Array`
	 * @returns {Uint8Array}
	 */
	public toUint8Array(): Uint8Array {
		return new Uint8Array(this.toArray());
	}
}