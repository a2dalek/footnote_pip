import * as grpc from "grpc";
import { protocolService } from "../types/grpc";
import { BaseDecoder, BaseEncoder } from "../utils";

function sayHi(
  call: grpc.ServerUnaryCall<any>,
  callback: grpc.sendUnaryData<any>
): void {
  const blob = call.request.blob;
  console.log("receive data", BaseDecoder.decodeUnit64(blob));
  // decode message
  // handle logic
  // encode responce
  const response = { blob: BaseEncoder.encodeUnit64(23n) };
  callback(null, response);
}
function main() {
  const server = new grpc.Server();
  server.addService(protocolService, { sayHi });
  server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Server bind failed:", err);
        return;
      }
      console.log(`Server is listening on 127.0.0.1:${port}`);
      server.start();
    }
  );
}

main();
