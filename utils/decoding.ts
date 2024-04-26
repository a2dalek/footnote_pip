export namespace BaseDecoder {
  export function decodeBoolean(buffer: Buffer): boolean {
    if (buffer.length < 1) {
      throw Error("invalid buffer's length");
    }

    return buffer[0] === 1;
  }

  export function decodeUnit8(buffer: Buffer): number {
    if (buffer.length < 1) {
      throw Error("invalid buffer's length");
    }

    return buffer.readUInt8(0); // Read the first byte as an 8-bit unsigned integer
  }

  export function decodeUnit16(buffer: Buffer): number {
    if (buffer.length < 2) {
      throw Error("invalid buffer's length");
    }

    return buffer.readUInt16BE(0); // Read as a big-endian 16-bit unsigned integer
  }

  export function decodeUnit32(buffer: Buffer): number {
    if (buffer.length < 4) {
      throw Error("invalid buffer's length");
    }

    return buffer.readUInt32BE(0); // Read as a big-endian 32-bit unsigned integer
  }

  export function decodeUnit64(buffer: Buffer): bigint {
    if (buffer.length < 8) {
      throw Error("invalid buffer's length");
    }

    // Convert the buffer to a BigInt
    const value = buffer.readBigUInt64BE(0); // Read as a big-endian 64-bit unsigned integer
    return value;
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

  export function decodeString(buffer: Buffer): string {
    // if (!Buffer.isBuffer(buffer)) {
    //     throw new Error('Input must be a Buffer');
    // }

    const utf8String = buffer.toString('utf-8');
    return utf8String;
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

  export function decodeArray<T>(
    buffer: Buffer,
    len: number,
    decodeElementFunction: (buf: Buffer) => T
  ): T[] {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Input must be a Buffer');
    }

    if (buffer.length % len != 0) {
        throw new Error('Not suitable type');
    }

    let n_buff_per_element = buffer.length / len;

    const result = [];
    let offset = 0;

    for (let i = 0; i < len; i++) {
      const value = decodeElementFunction(buffer.slice(offset, offset + n_buff_per_element));
      result.push(value);
      offset += n_buff_per_element;
    }

    return result;
  }

  export function decodeUvarintArray<T>(
    buffer: Buffer,
    decodeElementFunction: (buf: Buffer) => T
  ): T[] {
    let remainingBuffer: Buffer;
    let length: number;
    [length, remainingBuffer] = decodeUvarint(buffer);
    return decodeArray<T>(remainingBuffer, length, decodeElementFunction);
  }
}
