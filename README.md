# CSharp Binary Stream

Binary stream writing and reading classes compatible with CSharp's [BinaryReader](https://docs.microsoft.com/en-us/dotnet/api/system.io.binaryreader?view=netframework-4.7.2] and [BinaryWriter](https://docs.microsoft.com/en-us/dotnet/api/system.io.binarywriter?view=netframework-4.7.2).

## Getting Started

This library was written in TypeScript but will also work in projects written in JavaScript.

### Installing

Add it to your project via:

```
npm i --save csharp-binary-stream
```

### Documentation

The full documentation can be found [here](https://evidentlycube.github.io/chsarp-binary-stream/index.html). 

Use the reader like this:

```
import {BinaryReader, Encoding} from `csharp-binary-stream`;

const reader = new BinaryReader(existingArrayBuffer);
// or
const reader = new BinaryReader(existingUint8Array);
// or
const reader = new BinaryReader(new Uint8Array(otherTypedArray.buffer, otherTypedArray.byteOffset, otherTypedArray.byteLength));
reader.readByte();
reader.readChar(Encoding.Utf8);
reader.readFloat();
```

## Details

The validity of the compatibility with C# is achieved by comparing the data against fixtures generated in C#. Specifically, the file `test/fixtureSource.cs` is responsible for generating all the files in the directory `test/fixture/*`. Then the tests in `test/BinaryReader.fixtures.*.test.ts` attempt to read the files and compare the value provideded with static values stored in the test file.

At the moment only `BinaryReader` is supported, but `BinaryWriter` is soon to come.

There are some small well-document quirks to be aware of:

 - Using `readLong` and `readUnsignedLong` risks losing precision with really big numbers because JavaScript only supports `double` type.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
