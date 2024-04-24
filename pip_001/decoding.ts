function decodeBoolean(buffer: Buffer): boolean {
  if (buffer.length !== 1) {
    throw Error("decodeBoolean: invalid buffer's length");
  }
  // Check if any byte in the Buffer is non-zero
  return buffer.some((byte) => byte !== 0);
}

function decodeUnit8(buffer: Buffer): number {
  if (buffer.length !== 1) {
    throw Error("decodeUnit8: invalid buffer's length");
  }

  return buffer.readUInt8(0); // Read the first byte as an 8-bit unsigned integer
}

function decodeUnit16(buffer: Buffer): number {
  if (buffer.length !== 2) {
    throw Error("decodeUnit16: invalid buffer's length");
  }

  return buffer.readUInt16BE(0); // Read as a big-endian 16-bit unsigned integer
}

function decodeUnit32(buffer: Buffer): number {
  if (buffer.length !== 4) {
    throw Error("decodeUnit32: invalid buffer's length");
  }

  return buffer.readUInt32BE(0); // Read as a big-endian 32-bit unsigned integer
}

function decodeUnit64(buffer: Buffer): bigint {
  if (buffer.length !== 8) {
    throw Error("decodeUnit64: invalid buffer's length");
  }

  // Convert the buffer to a BigInt
  const value = buffer.readBigUInt64BE(0); // Read as a big-endian 64-bit unsigned integer
  return value;
}

function decodeString(buffer: Buffer): string {
  const utf8String = buffer.toString("utf-8");
  return utf8String;
}

//TODO rechceck below
// function decodeArray(
//   buffer: Buffer,
//   len: number,
//   decodeElementFunction: (buf: Buffer) => any
// ): any[] {
//   if (!Buffer.isBuffer(buffer)) {
//     throw new Error("Input must be a Buffer");
//   }

//   if (buffer.length % len !== 0) {
//     throw new Error("Not suitable type");
//   }

//   const result: any[] = [];
//   let offset = 0;

//   while (offset < buffer.length) {
//     const value = decodeElementFunction(buffer.slice(offset, offset + len));
//     result.push(value);
//     offset += len;
//   }

//   return result;
// }

// function decodeUvarintArray(
//   buffer: Buffer,
//   decodeElementFunction: (buf: Buffer) => any
// ): any[] {
//   if (!Buffer.isBuffer(buffer)) {
//     throw new Error("Input must be a Buffer");
//   }

//   let len = 0;
//   let shift = 0;
//   let offset = 0;

//   while (offset < buffer.length) {
//     const byte = buffer[offset];
//     len += (byte & 0x7f) << shift; // Add the 7-bit value, shifted appropriately
//     offset++;

//     if ((byte & 0x80) === 0) {
//       break;
//     }

//     shift += 7;

//     if (shift >= 35) {
//       throw new Error("Malformed Uvarint: too many bytes");
//     }
//   }

//   const remainingBuffer = buffer.slice(offset);
//   return decodeArray(remainingBuffer, len, decodeElementFunction);
// }
