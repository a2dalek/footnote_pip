const { Buffer } = require('buffer');

function DecodeBoolean(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Input must be a Buffer');
    }

    // Check if any byte in the Buffer is non-zero
    return buffer.some((byte) => byte !== 0);
}

function DecodeUnit8(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 1) {
        throw new Error('Buffer must have at least one byte');
    }

    return buffer.readUInt8(0); // Read the first byte as an 8-bit unsigned integer
}

function DecodeUnit16(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 2) {
        throw new Error('Buffer must have at least two bytes');
    }

    return buffer.readUInt16BE(0); // Read as a little-endian 16-bit unsigned integer
}

function EncodeUnit32(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
        throw new Error('Buffer must have at least four bytes');
    }

    return buffer.readUInt32BE(0); // Read as a little-endian 16-bit unsigned integer
}

function DecodeUnit64(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 8) {
        throw new Error('Buffer must have at least 8 bytes');
    }

    // Convert the buffer to a BigInt
    const value = buffer.readBigUInt64BE(0); // Read as a big-endian 64-bit unsigned integer
    return value;
}

function DecodeString(value) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Input must be a Buffer');
    }

  const utf8String = buffer.toString('utf-8');
  return utf8String;
}

function DecodeArray(buffer, len, decodeElementFuntion) {
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
      const value = decodeElementFuntion(buffer.slice(offset, offset + n_buff_per_element));
      result.push(value);
      offset += n_buff_per_element;
    }
  
    return result;
}

function DecodeUvarintArray(buffer, decodeElementFuntion) {
    if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
    }

    let len = 0;
    let shift = 0;
    let offset = 0;

    while (offset < buffer.length) {
        const byte = buffer[offset];
        len += (byte & 0x7F) << shift; // Add the 7-bit value, shifted appropriately
        offset++;

        if ((byte & 0x80) === 0) {
            break;
        }

        shift += 7;

        if (shift >= 35) {
            throw new Error('Malformed Uvarint: too many bytes');
        }
    }
    
    const remain_buffer = buffer.slice(offset, buffer.length);
    return DecodeArray(remain_buffer, len, decodeElementFuntion);
}
