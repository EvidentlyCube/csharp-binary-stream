import {Encoding, isValidEncoding} from "./Encoding";
import * as bigInt from 'big-integer';
import {EndOfStreamError} from "./errors/EndOfStreamError";
import * as Utf8 from './Utf8';
import * as Int7 from './Int7';
import {EncodingMessageFactory, EndOfStreamMessageFactory} from "./errors/ErrorMessageFactory";
import {EncodingError} from "./errors/EncodingError";
import {InvalidArgumentError} from "./errors/InvalidArgumentError";

/**
 * A binary stream reader compatible with majority of methods in C#'s [BinaryReader](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader?view=netframework-4.7.2).
 *
 * Any time the word _stream_ is used in the documentation it refers to the `ArrayBuffer` provided in the constructor of this class.
 */
export class BinaryReader
{
	private _stream: ArrayBuffer;
	private _view: Uint8Array;

	private _position: number;

	private _bufferStart: number;
	private _bufferLength: number;

	/**
	 * Length of the stream, in bytes loaded, into the reader.
	 */
	public get length(): number
	{
		return this._bufferLength;
	}

	/**
	 * Return the current position in the stream from which the read operations happen.
	 */
	public get position(): number
	{
		return this._position;
	}

	/**
	 * Changes the current position in the stream from which the read operations happen.
	 * Trying to set it to value smaller than `0` will set it to `0` instead (the beginning of the stream).
	 * Trying to set it to value larger than `length` will set it to `length` instead (the end of the stream).
	 */
	public set position(value: number)
	{
		this._position = Math.max(0, Math.min(this._stream.byteLength, value));
	}

	/**
	 * Returns true if the `position` of the stream is past the final byte (equal to `length`).
	 */
	public get isEndOfStream(): boolean
	{
		return this._position >= this._bufferLength;
	}

	private get internalPosition(): number
	{
		return this._position + this._bufferStart;
	}

	/**
	 * @ignore
	 */
	private get remainingBytes(): number
	{
		return this.length - this.position;
	}

	/**
	 * Creates a new reader powered by an ArrayBuffer.
	 *
	 * @remark
	 * There is a danger when accessing a `TypedArray`'s [`buffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/buffer) property, because the `TypeArray` is just a view into the `ArrayBuffer` that can have different offset and length.
	 *
	 * For example, imagine a buffer `00 01 02 03 04 05`. `const arr = new Uint8Array(buffer, 1, 2)` will only have access to `01 02`, but it is still powered by the same,
	 * 6-byte buffer, and doing `new BinaryReader(arr.buffer)` will also refer to the longer buffer.
	 *
	 * There are three solutions:
	 *
	 *  1. If you have access to `Uint8Array`, simply use that.
	 *  2. Create a new `Uint8Array` from a differently typed array: `new Uint8Array(other.buffer, other.byteOffset, other.byteLength);`
	 *  3. Create a new `ArrayBuffer` using slice: `arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);`
	 *
	 * @param {ArrayBuffer|Uint8Array} stream Stream from which to read the data.
	 */
	public constructor(stream: ArrayBuffer | Uint8Array)
	{
		if (stream instanceof ArrayBuffer) {
			this._stream = stream;
			this._view = new Uint8Array(stream);
			this._bufferStart = 0;
			this._bufferLength = this._stream.byteLength;

		} else if (stream instanceof Uint8Array) {
			this._stream = stream.buffer;
			this._view = stream;
			this._bufferStart = stream.byteOffset;
			this._bufferLength = stream.byteLength;
		} else {
			throw new InvalidArgumentError("Stream is neither instance of ArrayBuffer nor Uint8Array.", 'stream', stream);
		}

		this._position = 0;
	}

	/**
	 * Reads a `boolean` from the stream and advances the stream by one byte.
	 *
	 * @returns {boolean} `false` if it's zero and `true` if it is not zero.
	 * @throws [[EndOfStreamError]] Thrown when there are no bytes left in the stream.
	 * @link [C# `BinaryReader.ReadBoolean` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readboolean?view=netframework-4.7.2)
	 */
	public readBoolean(): boolean
	{
		this.assertRemainingBytes(1, 'readBoolean');

		const byte = this._view[this._position];
		this._position++;

		return byte > 0;
	}

	/**
	 * Reads a `byte` (unsigned 8-bit number)  from the stream and advances the stream by one byte.
	 *
	 * @returns {number} Number between 0 and 255.
	 * @throws [[EndOfStreamError]] Thrown when there are no bytes left in the stream.
	 * @link [C# `BinaryReader.ReadByte` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readbyte?view=netframework-4.7.2)
	 */
	public readByte(): number
	{
		this.assertRemainingBytes(1, 'readByte');

		const byte = this._view[this._position];
		this._position++;

		return byte;
	}

	/**
	 * Reads a specified number of  `byte`s (unsigned 8-bit number)  from the stream and advances the stream by the requested number of bytes.
	 *
	 * @param {number} bytesToRead The number of bytes to read from the stream. must be an integer larger or equal than zero.
	 * @returns {number[]} Array of bytes (numbers between 0 and 255) read from the stream. If `bytesToRead` is `0` it returns an empty array.
	 * @throws [[InvalidArgumentError]] when `bytesToRead` is less than zero.
	 * @throws [[EndOfStreamError]] Thrown when there are no bytes left in the stream.
	 * @link [C# `BinaryReader.ReadBytes` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readbytes?view=netframework-4.7.2)
	 */
	public readBytes(bytesToRead: number): number[]
	{
		if (bytesToRead < 0) {
			throw new InvalidArgumentError('Cannot read less than 0 bytes', 'bytesToRead', bytesToRead);
		}

		this.assertRemainingBytes(bytesToRead, 'readBytes');

		const result = [];
		for(let i = 0; i < bytesToRead; i++) {
			result[i] = this._view[this._position++];
		}
		return result;
	}

	/**
	 * Reads a `signed byte` (signed 8-bit number)  from the stream and advances the stream by one byte.
	 *
	 * @returns {number} Number between -128 and 127.
	 * @throws [[EndOfStreamError]] Thrown when there are no bytes left in the stream.
	 * @link [C# `BinaryReader.ReadSByte` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readsbyte?view=netframework-4.7.2)
	 */
	public readSignedByte(): number
	{
		this.assertRemainingBytes(1, 'readSignedByte');

		const byte = this._view[this._position];
		this._position++;

		return byte < 128
			? byte
			: byte - 256;
	}

	/**
	 * Reads a `short` (signed 16-bit number) from the stream and advances the stream by two bytes.
	 *
	 * @returns {number} Number between -65,536 and 32,767.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadInt16` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readint16?view=netframework-4.7.2)
	 */
	public readShort(): number
	{
		this.assertRemainingBytes(2, 'readShort');

		const byte1 = this._view[this._position];
		const byte2 = this._view[this._position + 1];
		this._position += 2;

		const short = byte2 * 256 + byte1;

		return short < 32768
			? short
			: short - 65536;
	}

	/**
	 * Reads an `unsigned short` (unsigned 16-bit number) from the stream and advances the stream by two bytes.
	 *
	 * @returns {number} Number between 0 and 65,535.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadUInt16` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readuint16?view=netframework-4.7.2)
	 */
	public readUnsignedShort(): number
	{
		this.assertRemainingBytes(2, 'readUnsignedShort');

		const byte1 = this._view[this._position];
		const byte2 = this._view[this._position + 1];
		this._position += 2;

		return byte2 * 256 + byte1;
	}

	/**
	 * Reads an `int` (signed 32-bit number) from the stream and advances the stream by four bytes.
	 *
	 * @returns {number} Number between -2,147,483,648 and 2,147,483,647.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadInt32` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readint32?view=netframework-4.7.2)
	 */
	public readInt(): number
	{
		this.assertRemainingBytes(4, 'readInt');

		const byte1 = this._view[this._position];
		const byte2 = this._view[this._position + 1];
		const byte3 = this._view[this._position + 2];
		const byte4 = this._view[this._position + 3];
		this._position += 4;

		const int = byte4 * 256 * 256 * 256
			+ byte3 * 256 * 256
			+ byte2 * 256
			+ byte1;

		return int < 2147483648
			? int
			: int - 4294967296;
	}

	/**
	 * Reads an `unsigned int` (unsigned 32-bit number) from the stream and advances the stream by four bytes.
	 *
	 * @returns {number} Number between 0 and 4,294,967,296.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadUInt32` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readuint32?view=netframework-4.7.2)
	 */
	public readUnsignedInt(): number
	{
		this.assertRemainingBytes(4, 'readUnsignedInt');

		const byte1 = this._view[this._position];
		const byte2 = this._view[this._position + 1];
		const byte3 = this._view[this._position + 2];
		const byte4 = this._view[this._position + 3];
		this._position += 4;

		return byte4 * 256 * 256 * 256
			+ byte3 * 256 * 256
			+ byte2 * 256
			+ byte1;
	}

	/**
	 * Reads a `long` (signed 64-bit number) from the stream as a string and advances the stream by eight bytes. The number is returned as string to return
	 * any precision loss caused by the value being stored in `double` internalle (check the *remarks* for more details).
	 *
	 * @remarks
	 * JavaScript internally uses `double` to represent all numbers. The smallest and largest number that can be represented without loss of precision are,
	 * respectively, −9,007,199,254,740,991 `−(2^53 − 1)` and 9,007,199,254,740,991 `2^53 − 1`, while `long` can hold values between `-2^63` and `2^63 - 1`, while
	 * `unsigned long` goes all the way up to `2^64-1`.
	 *
	 * What happens when you go beyond those limits is that some numbers just cannot be expressed. `9007199254740992+1` is the same as `9007199254740992+1+1+1+1`
	 * and if you try to set a variable to `9007199254740993` it just gets rounded down.
	 *
	 * @returns {string} String representing a number between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadInt64` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readint64?view=netframework-4.7.2)
	 */
	public readLongString(): string
	{
		this.assertRemainingBytes(8, 'readLongString');

		const byte1 = this._view[this._position];
		const byte2 = this._view[this._position + 1];
		const byte3 = this._view[this._position + 2];
		const byte4 = this._view[this._position + 3];
		const byte5 = this._view[this._position + 4];
		const byte6 = this._view[this._position + 5];
		const byte7 = this._view[this._position + 6];
		const byte8 = this._view[this._position + 7];
		this._position += 8;

		const m256 = bigInt(256);
		const long = bigInt(byte1)
			.add(bigInt(byte2).multiply(m256))
			.add(bigInt(byte3).multiply(m256.pow(2)))
			.add(bigInt(byte4).multiply(m256.pow(3)))
			.add(bigInt(byte5).multiply(m256.pow(4)))
			.add(bigInt(byte6).multiply(m256.pow(5)))
			.add(bigInt(byte7).multiply(m256.pow(6)))
			.add(bigInt(byte8).multiply(m256.pow(7)));

		return long.lesser("9223372036854775808")
			? long.toString()
			: long.subtract("18446744073709551616").toString();
	}

	/**
	 * Reads a `long` (signed 64-bit number) from the stream and advances the stream by eight bytes. If the number is too big or too small precision errors
	 * may occur, refer to the remark in [[readLongString]] for more details.
	 *
	 * @returns {number} Number between -9,223,372,036,854,775,808 and 9,223,372,036,854,775,807
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadInt64` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readint64?view=netframework-4.7.2)
	 */
	public readLong(): number
	{
		this.assertRemainingBytes(8, 'readLong');

		return parseInt(this.readLongString());
	}

	/**
	 * Reads an `unsigned long` (unsigned 64-bit number) from the stream as a string and advances the stream by eight bytes. The number is returned as string to return
	 * any precision loss caused by the value being stored in `double` internalle, refer to the remark in [[readLongString]] for more details.
	 *
	 * @returns {string} String representing a number between 0 and 18,446,744,073,709,551,615.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadUInt64` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readuint64?view=netframework-4.7.2)
	 */
	public readUnsignedLongString(): string
	{
		this.assertRemainingBytes(8, 'readUnsignedLongString');

		const byte1 = this._view[this._position];
		const byte2 = this._view[this._position + 1];
		const byte3 = this._view[this._position + 2];
		const byte4 = this._view[this._position + 3];
		const byte5 = this._view[this._position + 4];
		const byte6 = this._view[this._position + 5];
		const byte7 = this._view[this._position + 6];
		const byte8 = this._view[this._position + 7];
		this._position += 8;

		const m256 = bigInt(256);
		const long = bigInt(byte1)
			.add(bigInt(byte2).multiply(m256))
			.add(bigInt(byte3).multiply(m256.pow(2)))
			.add(bigInt(byte4).multiply(m256.pow(3)))
			.add(bigInt(byte5).multiply(m256.pow(4)))
			.add(bigInt(byte6).multiply(m256.pow(5)))
			.add(bigInt(byte7).multiply(m256.pow(6)))
			.add(bigInt(byte8).multiply(m256.pow(7)));

		return long.toString();
	}

	/**
	 * Reads an `unsigned long` (unsigned 64-bit number) from the stream and advances the stream by eight bytes. If the number is too big precision errors may occur, refer to the remark in
	 * [[readLongString]] for more details.
	 *
	 * @returns {number} Number between 0 and 18,446,744,073,709,551,615.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadUInt64` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readuint64?view=netframework-4.7.2)
	 */
	public readUnsignedLong(): number
	{
		this.assertRemainingBytes(8, 'readUnsignedLong');

		return parseInt(this.readUnsignedLongString());
	}

	/**
	 * Reads a `float` (single-precision floating-point number) from the stream and advances the stream by four bytes.
	 *
	 * @returns {number} Float number
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadSingle` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readsingle?view=netframework-4.7.2)
	 */
	public readFloat(): number
	{
		this.assertRemainingBytes(4, 'readFloat');

		const floatArray = this.internalPosition % 4 === 0
			? new Float32Array(this._stream, this.internalPosition, 1)
			: new Float32Array(this._stream.slice(this.internalPosition, this.internalPosition + 4), 0, 1);

		this._position += 4;

		return floatArray[0];
	}

	/**
	 * Reads a `double` (double-precision floating-point number) from the stream and advances the stream by eight bytes.
	 *
	 * @returns {number} Double number
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @link [C# `BinaryReader.ReadDouble` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readdouble?view=netframework-4.7.2)
	 */
	public readDouble(): number
	{
		this.assertRemainingBytes(8, 'readDouble');

		const doubleArray = this.internalPosition % 8 === 0
			? new Float64Array(this._stream, this.internalPosition, 1)
			: new Float64Array(this._stream.slice(this.internalPosition, this.internalPosition + 8), 0, 1);

		this._position += 8;

		return doubleArray[0];
	}

	/**
	 * Reads a single character from the string, the number of bytes read dependant on the encoding used.
	 *
	 * @param {Encoding} encoding The encoding to use when reading the chars.
	 * @returns {string} A single character read from the stream
	 * @throws [[EncodingError]] Thrown when an unknown encoding is provided as the argument.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @throws [[InvalidUtf8CharacterError]] Thrown when using UTF-8 encoding when an incorrect UTF-8 character sequence is encountered.
	 * @link [C# `BinaryReader.ReadDouble` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readdouble?view=netframework-4.7.2)
	 */
	public readChar(encoding: Encoding): string
	{
		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		if (this.remainingBytes === 0) {
			throw new EndOfStreamError(EndOfStreamMessageFactory.readCharZeroBytesLeft());
		}

		const result = Utf8.readUtf8StringFromBytes(this._view, this._position, 1);
		this._position = result.finalPosition;

		return result.readString;
	}

	/**
	 * Reads multiple characters from the string, the number of bytes read dependant on the encoding used.
	 *
	 * @param {number} charactersToRead The number of characters to read from the stream. If the number is fractional it is rounded down. Has to be at least 1.
	 * @param {Encoding} encoding The encoding to use when reading the chars.
	 * @returns {string} A string read from the stream.
	 * @throws [[InvalidArgumentError]] Thrown when `charactersToRead` is not a number nor numeric string or when it is less than 1.
	 * @throws [[EncodingError]] Thrown when an unknown encoding is provided as the argument.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream. Position of the stream does not change if this exception is thrown.
	 * @throws [[InvalidUtf8CharacterError]] Thrown when using UTF-8 encoding when an incorrect UTF-8 character sequence is encountered.
	 * @link [C# `BinaryReader.ReadChars` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readchars?view=netframework-4.7.2)
	 */
	public readChars(charactersToRead: number, encoding: Encoding): string
	{
		if (isNaN(charactersToRead)) {
			throw new InvalidArgumentError('`charactersToRead` is not a number', 'charactersToRead', charactersToRead);
		}

		charactersToRead = Math.floor(charactersToRead);

		if (charactersToRead < 1) {
			throw new InvalidArgumentError('`charactersToRead` cannot be less than 0', 'charactersToRead', charactersToRead);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		if (this.remainingBytes === 0) {
			throw new EndOfStreamError(EndOfStreamMessageFactory.readCharZeroBytesLeft());
		}

		const result = Utf8.readUtf8StringFromBytes(this._view, this._position, charactersToRead);
		this._position = result.finalPosition;

		return result.readString;
	}

	/**
	 * Reads the specified number of bytes in the provided encoding and advances the stream by that number.
	 *
	 * @param {number} bytesToRead The number of bytes to read from the stream. If the number is fractional it is rounded down. Has to be at least 1.
	 * @param {Encoding} encoding The encoding to use when reading the chars.
	 * @returns {string} A string read from the stream.
	 * @throws [[InvalidArgumentError]] Thrown when `bytesToRead` is not a number nor numeric string or when it is less than 1.
	 * @throws [[EncodingError]] Thrown when an unknown encoding is provided as the argument.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream or when the function stops reading in the middle of a
	 * character sequence in multibyte character encodings. Position of the stream does not change if this exception is thrown.
	 * @throws [[InvalidUtf8CharacterError]] Thrown when using UTF-8 encoding when an incorrect UTF-8 character sequence is encountered.
	 */
	public readCharBytes(bytesToRead: number, encoding: Encoding): string
	{
		if (isNaN(bytesToRead)) {
			throw new InvalidArgumentError('`charactersToRead` is not a number', 'bytesToRead', bytesToRead);
		}

		bytesToRead = Math.floor(bytesToRead);

		if (bytesToRead < 1) {
			throw new InvalidArgumentError('`charactersToRead` cannot be less than 0', 'bytesToRead', bytesToRead);
		}

		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		if (this.remainingBytes === 0) {
			throw new EndOfStreamError(EndOfStreamMessageFactory.readCharZeroBytesLeft());
		}

		const result = Utf8.readUtf8StringFromBytes(this._view, this._position, Number.MAX_SAFE_INTEGER, bytesToRead);
		this._position = result.finalPosition;

		return result.readString;
	}

	/**
	 * Reads a string from the stream that is prefixed with its length, encoded as an integer seven bits at a time.
	 *
	 * @param {Encoding} encoding The encoding to use when reading the string.
	 * @returns {string} A string read from the stream.
	 * @throws [[InvalidArgumentError]] Thrown when `charactersToRead` is not a number nor numeric string or when it is less than 1.
	 * @throws [[EncodingError]] Thrown when an unknown encoding is provided as the argument.
	 * @throws [[EndOfStreamError]] Thrown when there are not enough bytes left in the stream or when the lenfth prefix is longer than 5 bytes.
	 * @throws [[InvalidUtf8CharacterError]] Thrown when using UTF-8 encoding when an incorrect UTF-8 character sequence is encountered.
	 * @link [C# `BinaryReader.ReadString` documentation](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader.readstring?view=netframework-4.7.2)
	 */
	public readString(encoding: Encoding): string
	{
		if (!isValidEncoding(encoding)) {
			throw new EncodingError(EncodingMessageFactory.unknownEncoding(encoding));
		}

		if (this.remainingBytes === 0) {
			throw new EndOfStreamError(EndOfStreamMessageFactory.readStringZeroBytesLeft());
		}

		const [stringLength, newPosition] = Int7.read7BitEncodedInt(this._position, this._view);

		const remainingBytes = this.length - newPosition;
		if (remainingBytes < stringLength) {
			throw new EndOfStreamError(EndOfStreamMessageFactory.readStringTooLongLeft(stringLength, remainingBytes));
		}

		const data = Utf8.readUtf8StringFromBytes(this._view, newPosition, Number.MAX_SAFE_INTEGER, stringLength);

		this._position = newPosition + stringLength;

		return data.readString;
	}

	private assertRemainingBytes(bytesExpected: number, operationName: string): void
	{
		const bytesRemaining = this.remainingBytes;

		if (bytesRemaining < bytesExpected) {
			throw new EndOfStreamError(
				EndOfStreamMessageFactory.notEnoughBytesInBuffer(bytesExpected, bytesRemaining, operationName),
			);
		}
	}
}