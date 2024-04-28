export namespace BaseEncoder {
  export function encodeBoolean(value: boolean): Buffer {
    return value ? Buffer.from([0x00]) : Buffer.from([0x01]);
  }

  export function encodeUnit8(value: number): Buffer {
    if (value < 0x00 || value > 0xff) {
      throw new Error("Not a Unit8");
    }

    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(value, 0);
    return buffer;
  }

  export function encodeUnit16(value: number): Buffer {
    if (value < 0x0000 || value > 0xffff) {
      throw new Error("Not a Unit16");
    }

    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(value, 0);
    return buffer;
  }

  export function encodeUnit32(value: number): Buffer {
    if (value < 0x00000000 || value > 0xffffffff) {
      throw new Error("Not a Unit32");
    }

    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value, 0);
    return buffer;
  }

  // number can not handle UInt64, so this must use bigint
  export function encodeUnit64(value: bigint): Buffer {
    //0x0000000000000000n && 0xffffffffffffffffn
    if (value < 0n || value > 18446744073709551615n) {
      throw new Error("Not a Unit64");
    }

    const buffer = Buffer.alloc(8);
    buffer.writeBigUint64BE(value, 0);
    return buffer;
  }

  export function encodeUvarint(value: number): Buffer {
    const buffer: number[] = [];
    while (value > 0x7f) {
      buffer.push(Number((value & 0x7f) | 0x80));
      value >>= 7;
    }
    buffer.push(Number(value & 0x7f));
    return Buffer.from(buffer);
  }

  export function encodeString(value: string): Buffer {
    const buf = Buffer.from(value, "utf-8");
    return Buffer.concat([encodeUvarint(buf.length), buf]);
  }

  export function encodeBuffer(value: Buffer): Buffer {
    return Buffer.concat([encodeUvarint(value.length), value]);
  }

  export function encodeArray<T>(
    array: T[],
    encodeElementFuntion: (x: T) => Buffer
  ): Buffer {
    const lengthPrefix = encodeUvarint(array.length);
    var buffer = Buffer.alloc(0);
    buffer = Buffer.concat([buffer, lengthPrefix]);
    for (var [key, element] of array.entries()) {
      var tmp : Buffer = encodeElementFuntion(element);
      buffer = Buffer.concat([buffer, tmp]); 
    }
    return buffer;
  }
}
