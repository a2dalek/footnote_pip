import * as grpc from "grpc";
import { protocolService } from "../types/grpc"; // Assuming you have generated types from the .proto file
import { BaseDecoder, BaseEncoder } from "../utils";
import * as protoLoader from "@grpc/proto-loader";

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
const greeterService = protoDescriptor["Hihi"] as any;

// Create a new client instance
const client = new greeterService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Function to make a request to the server
function greet(): void {
  const request = { blob: BaseEncoder.encodeUnit64(12n) };

  client.sayHi(request, (error: grpc.ServiceError | null, response: any) => {
    if (error) {
      console.error("Error:", error.message);
      return;
    }
    console.log("Response:", BaseDecoder.decodeUnit64(response.blob));
  });
}

greet();
