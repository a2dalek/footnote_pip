import * as grpc from "grpc";
import * as protoLoader from "@grpc/proto-loader";
import {
  Message,
  MessageEnvelope,
  MessageType,
  decodeMessageEnvelope,
  encodeMessageEnvelope,
} from "../types";

const PROTO_PATH = "hihi/hihi.proto";

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the service definition
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const hihiService = protoDescriptor["Hihi"] as any;
const port = process.argv[2];
// Create a new client instance
const client = new hihiService(
  `localhost:${port}`,
  grpc.credentials.createInsecure()
);

// Function to make a request to the server
function hihi(messageEnvelope: MessageEnvelope): void {
  const request = { blob: encodeMessageEnvelope(messageEnvelope) };

  client.sayHi(request, (error: grpc.ServiceError | null, response: any) => {
    if (error) {
      console.error("Error:", error.message);
      return;
    }
    console.log(
      "Response:",
      JSON.stringify(decodeMessageEnvelope(response.blob))
    );
  });
}

const message: Message = {
  type: MessageType.HELLO_ACK_MESSAGE_TYPE,
  nonce: Buffer.from("hihi", "utf-8"),
};
const messageEnvelope: MessageEnvelope = {
  magic: 696969,
  timestamp: Math.floor(Date.now() / 1000),
  message: message,
  signature: Buffer.from("hihihihihihihihi", "utf-8"),
};

hihi(messageEnvelope);
