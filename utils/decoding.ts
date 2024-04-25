export namespace BaseDecoder {
  export function decodeBoolean(buffer: Buffer): [boolean, Buffer] {
    if (buffer.length < 1) {
      throw Error("invalid buffer's length");
    }
    // Check if any byte in the Buffer is non-zero
    const remainingBuffer = buffer.subarray(1);
    return [buffer[0] === 1, remainingBuffer];
  }

  export function decodeUnit8(buffer: Buffer): [number, Buffer] {
    if (buffer.length < 1) {
      throw Error("invalid buffer's length");
    }

    const remainingBuffer = buffer.subarray(1);
    return [buffer.readUInt8(0), remainingBuffer]; // Read the first byte as an 8-bit unsigned integer
  }

  export function decodeUnit16(buffer: Buffer): [number, Buffer] {
    if (buffer.length < 2) {
      throw Error("invalid buffer's length");
    }

    const remainingBuffer = buffer.subarray(2);
    return [buffer.readUInt16BE(0), remainingBuffer]; // Read as a big-endian 16-bit unsigned integer
  }

  export function decodeUnit32(buffer: Buffer): [number, Buffer] {
    if (buffer.length < 4) {
      throw Error("invalid buffer's length");
    }

    const remainingBuffer = buffer.subarray(4);
    return [buffer.readUInt32BE(0), remainingBuffer]; // Read as a big-endian 32-bit unsigned integer
  }

  export function decodeUnit64(buffer: Buffer): [bigint, Buffer] {
    if (buffer.length < 8) {
      throw Error("invalid buffer's length");
    }

    // Convert the buffer to a BigInt
    const remainingBuffer = buffer.subarray(8);
    const value = buffer.readBigUInt64BE(0); // Read as a big-endian 64-bit unsigned integer
    return [value, remainingBuffer];
  }

  export function decodeUvarint(buffer: Buffer): [number, Buffer] {
    let len = 0;
    let shift = 0;
    let offset = 0;

    while (offset < buffer.length) {
      const byte = buffer[offset];
      len += (byte & 0x7f) << shift; // Add the 7-bit value, shifted appropriately
      offset++;

      if ((byte & 0x80) === 0) {
        break;
      }

      shift += 7;

      if (shift >= 35) {
        throw new Error("Malformed Uvarint: too many bytes");
      }
    }

    const remainingBuffer = buffer.subarray(offset);
    return [len, remainingBuffer];
  }

  export function decodeString(buffer: Buffer): [string, Buffer] {
    const [length, remainingBuffer] = decodeUvarint(buffer);
    if (remainingBuffer.length < length) {
      throw Error("invalid buffer's length");
    }
    const utf8String = remainingBuffer
      .subarray(0, Number(length))
      .toString("utf-8");
    return [utf8String, remainingBuffer.subarray(length)];
  }

  export function decodeBuffer(buffer: Buffer): [Buffer, Buffer] {
    const [length, remainingBuffer] = decodeUvarint(buffer);
    if (remainingBuffer.length < length) {
      throw Error("invalid buffer's length");
    }
    return [
      remainingBuffer.subarray(0, length),
      remainingBuffer.subarray(length),
    ];
  }

  function decodeArray<T>(
    buffer: Buffer,
    decodeElementFunction: (buf: Buffer) => [T, Buffer]
  ): T[] {
    let remainingBuffer: Buffer;
    let length: number;
    [length, remainingBuffer] = decodeUvarint(buffer);
    const result: T[] = [];
    while (length--) {
      let x: T;
      [x, remainingBuffer] = decodeElementFunction(buffer);
      result.push(x);
    }
    return result;
  }
}
