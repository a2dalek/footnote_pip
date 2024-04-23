const { Buffer } = require('buffer');

function EncodeBoolean(value) {
  if (!(typeof(value) == "boolean")) {
    throw new Error("Not a Boolean");
  }

  if (value == true) {
    Buffer.from([0x00]);
  } else {
    return Buffer.from([0x01]);
  }
}

function EncodeUnit8(value) {
  if (value < 0x00 && value > 0xff) {
    throw new Error("Not a Unit8");
  }

  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(val, 0);
  return buffer;
}

function EncodeUnit16(value) {
  if (value < 0x0000 && value > 0xffff) {
    throw new Error("Not a Unit16");
  }

  const buffer = Buffer.alloc(2);
  buffer.writeUInt16BE(val, 0);
  return buffer;
}

function EncodeUnit32(value) {
  if (value < 0x00000000 && value > 0xffffffff) {
    throw new Error("Not a Unit32");
  }

  const buffer = Buffer.alloc(3);
  buffer.writeUInt32BE(val, 0);
  return buffer;
}

function EncodeUnit64(value) {
  if (value < 0x0000000000000000 && value > 0xffffffffffffffff) {
    throw new Error("Not a Unit32");
  }
  
  const buffer = Buffer.alloc(4);
  buffer.writeUInt64BE(val, 0);
  return buffer;
}

function EncodeString(value) {
  if (!(typeof(value) == "string")) {
    throw new Error("Not a String");
  }

  return Buffer.from(value, 'utf-8');
}

function encodeUvarint(value) {
  const buffer = [];
  while (value > 0x7F) {
    buffer.push((value & 0x7F) | 0x80);
    value >>= 7;
  }
  buffer.push(value & 0x7F);
  return Buffer.from(buffer);
}

// Function to encode an array with Uvarint length prefix and concatenated elements
function EncodeUvarintArray(array, encodeElementFuntion) {
  if (!Array.isArray(array)) {
    throw new Error('Input must be an array');
  }

  const lengthPrefix = encodeUvarint(array.length);

  const elementBuffers = array.map((element) => {
    return encodeElementFuntion(element);
  });

  const concatenatedElements = Buffer.concat(elementBuffers);

  return Buffer.concat([lengthPrefix, concatenatedElements]);
}

// Function to encode an array concatenated elements
function EncodeArray(array, encodeElementFuntion) {
  if (!Array.isArray(array)) {
    throw new Error('Input must be an array');
  }

  const elementBuffers = array.map((element) => {
    return encodeElementFuntion(element);
  });

  const concatenatedElements = Buffer.concat(elementBuffers);

  return concatenatedElements;
}
