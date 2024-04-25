function encodeBoolean(value: boolean): Buffer {
  return value ? Buffer.from([0x00]) : Buffer.from([0x01]);
}

function encodeUnit8(value: number): Buffer {
  if (value < 0x00 || value > 0xff) {
    throw new Error("Not a Unit8");
  }

  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value, 0);
  return buffer;
}

function encodeUnit16(value: number): Buffer {
  if (value < 0x0000 || value > 0xffff) {
    throw new Error("Not a Unit16");
  }

  const buffer = Buffer.alloc(2);
  buffer.writeUInt16BE(value, 0);
  return buffer;
}

function encodeUnit32(value: number): Buffer {
  if (value < 0x00000000 || value > 0xffffffff) {
    throw new Error("Not a Unit32");
  }

  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value, 0);
  return buffer;
}

// number can not handle UInt64, so this must use bigint
function encodeUnit64(value: bigint): Buffer {
  if (value < 0x0000000000000000n || value > 0xffffffffffffffffn) {
    throw new Error("Not a Unit64");
  }

  const buffer = Buffer.alloc(8);
  buffer.writeBigUint64BE(value, 0);
  return buffer;
}

function encodeString(value: string): Buffer {
  return Buffer.from(value, "utf-8");
}

//TODO: convert below to ts
// function encodeUvarint(value) {
//   const buffer = [];
//   while (value > 0x7f) {
//     buffer.push((value & 0x7f) | 0x80);
//     value >>= 7;
//   }
//   buffer.push(value & 0x7f);
//   return Buffer.from(buffer);
// }

// // Function to encode an array with Uvarint length prefix and concatenated elements
// function encodeUvarintArray(array, encodeElementFuntion) {
//   if (!Array.isArray(array)) {
//     throw new Error("Input must be an array");
//   }

//   const lengthPrefix = encodeUvarint(array.length);

//   const elementBuffers = array.map((element) => {
//     return encodeElementFuntion(element);
//   });

//   const concatenatedElements = Buffer.concat(elementBuffers);

//   return Buffer.concat([lengthPrefix, concatenatedElements]);
// }

// // Function to encode an array concatenated elements
// function encodeArray(array, encodeElementFuntion) {
//   if (!Array.isArray(array)) {
//     throw new Error("Input must be an array");
//   }

//   const elementBuffers = array.map((element) => {
//     return encodeElementFuntion(element);
//   });

//   const concatenatedElements = Buffer.concat(elementBuffers);

//   return concatenatedElements;
// }
