const { Buffer } = require('buffer');

// Function to encode a Uvarint (unsigned variable-length integer)
function encodeUvarint(value) {
    const buffer = [];
    while (true) {
        let byte = value & 0x7F; // Take the lower 7 bits
        value >>= 7; // Right shift by 7 bits
        if (value > 0) {
            byte |= 0x80; // Set the continuation flag
        }
        buffer.push(byte); // Store the byte
        if (value === 0) {
            break; // No more continuation needed
        }
    }
    return Buffer.from(buffer);
}

// Function to encode a list of integers with a Uvarint length prefix
function encodeArrayWithUvarintPrefix(arr) {
    // Encode the length of the array as a Uvarint
    const lengthPrefix = encodeUvarint(arr.length);

    // Encode each element as a Buffer and concatenate them
    const buffers = arr.map((val) => Buffer.from([val]));
    const concatenatedBuffers = Buffer.concat(buffers);

    // Join the length prefix with the concatenated elements
    return Buffer.concat([lengthPrefix, concatenatedBuffers]);
}

function Encode(value, isUvarint) {
    if (Array.isArray(value)) {
        if (isUvarint == true) {
            return encodeArrayWithUvarintPrefix(value);
        }

        const buffers = value.map((element) => {
            return Encode(element);
        })

        return Buffer.concat(buffers);
    }

    if (Buffer.isBuffer(value)) {
        return value;
    }

    const type = typeof value;  // Get the basic type
    
    if (type === "boolean") {
      if (value == true) {
        Buffer.from([0x00]);
      } else {
        return Buffer.from([0x01]);
      }
    } else if (type == "number") {
      if (value >= 0x00 && value <= 0xff) {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(val, 0);
        return buffer;
      } else if (value >= 0x0000 && value <= 0xffff) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(val, 0);
        return buffer;
      } else if (value >= 0x00000000 && value <= 0xffffffff) {
        const buffer = Buffer.alloc(3);
        buffer.writeUInt32BE(val, 0);
        return buffer;
      }
    } else if (type == "bigint") {
        if (value >= 0x0000000000000000 && value <= 0xffffffffffffffff) {
            const buffer = Buffer.alloc(4);
            buffer.writeUInt64BE(val, 0);
            return buffer;
        }
    } else if (type == "string") {
        Buffer.from(value, 'utf-8');
    }
}