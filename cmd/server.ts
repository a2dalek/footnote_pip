import * as grpc from "grpc";
import { protocolService } from "../types/grpc";
import {
  decodeMessageEnvelope,
  encodeMessageEnvelope,
} from "../types/protocol";

function sayHi(
  call: grpc.ServerUnaryCall<any>,
  callback: grpc.sendUnaryData<any>
): void {
  const blob = call.request.blob;
  const [messageEnvelope, remainingBuffer] = decodeMessageEnvelope(blob);
  if (remainingBuffer.length !== 0) {
    throw Error("Invalid message type");
  }
  // handle logic

  console.log("Request:", JSON.stringify(decodeMessageEnvelope(blob)));

  const response = { blob: encodeMessageEnvelope(messageEnvelope) };
  callback(null, response);
}
function main() {
  const port = process.argv[2];
  const host = `0.0.0.0:${port}`;
  const server = new grpc.Server();
  server.addService(protocolService, { sayHi });
  server.bindAsync(
    host,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Server bind failed:", err);
        return;
      }
      console.log(port);
      console.log(`Server is listening on 127.0.0.1:${port}`);
      server.start();
    }
  );
}

main();
