export type MessageEnvelope = {
  magic: number;
  type: number;
  timestamp: number;
  message: Buffer;
  signature: Buffer;
};
