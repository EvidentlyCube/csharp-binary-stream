import { EndOfStreamError } from "./errors/EndOfStreamError";
import { EndOfStreamMessageFactory } from "./errors/ErrorMessageFactory";

/** @ignore */
export function read7BitEncodedInt(position: number, buffer: Uint8Array): [number, number] {
	// Read out an Int32 7 bits at a time.  The high bit
	// of the byte when on means to continue reading more bytes.
	let count = 0;
	let shift = 0;
	let b: number | null;
	do {
		// Check for a corrupted stream.  Read a max of 5 bytes.
		// In a future version, add a DataFormatException.
		if (shift === 5 * 7)  // 5 bytes max per Int32, shift += 7
		{
			throw new EndOfStreamError(EndOfStreamMessageFactory.readStringTooLongPrefix());
		}

		if (position >= buffer.byteLength) {
			throw new EndOfStreamError(EndOfStreamMessageFactory.readStringLengthNotEnoughBytesLeft());
		}
		b = buffer[position++];
		count |= (b & 0x7F) << shift;
		shift += 7;
	} while ((b & 0x80) != 0);

	return [count, position];
}