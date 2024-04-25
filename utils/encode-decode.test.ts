import {
  Message,
  MessageEnvelope,
  MessageType,
  decodeMessageEnvelope,
  encodeMessageEnvelope,
} from "../types/protocol";

// function compareMessageEnvelope(
//   a: MessageEnvelope,
//   b: MessageEnvelope
// ): boolean {
//   return (
//     a.message.type === b.message.type &&
//     a.magic === b.magic &&
//     a.timestamp === b.timestamp &&
//     Buffer.compare(a.signature, b.signature) === 0
//   );
// }

describe("Test protocol encode decode message", () => {
  test("nothing", () => {
    const message: Message = {
      type: MessageType.HELLO_ACK_MESSAGE_TYPE,
      nonce: Buffer.from("hihi", "utf-8"),
    };
    const expectedMessageEnvelope: MessageEnvelope = {
      magic: 696969,
      timestamp: Math.floor(Date.now() / 1000),
      message: message,
      signature: Buffer.from("hihihihihihihihi", "utf-8"),
    };
    const result = decodeMessageEnvelope(
      encodeMessageEnvelope(expectedMessageEnvelope)
    )[0];
    const a = expectedMessageEnvelope;
    const b = result;
    expect(
      a.message.type === b.message.type &&
        a.magic === b.magic &&
        a.timestamp === b.timestamp &&
        Buffer.compare(a.signature, b.signature) === 0
    ).toBeTruthy();
  });
});
