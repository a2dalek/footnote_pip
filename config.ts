import * as dotenv from "dotenv";

dotenv.config();
export enum User {
  ALICE = "Alice",
  BOB = "Bob",
}
export function loadUser(): User {
  return process.argv[2] as User;
}
export const localUser = loadUser();

export function getPort(user: User = localUser): number {
  switch (user) {
    case User.ALICE: {
      return Number(process.env.ALICE_PORT);
    }
    case User.BOB: {
      return Number(process.env.BOB_PORT);
    }
  }
  throw Error("Invalid user");
}

export function getIP(user: User = localUser): string {
  return `127.0.0.1`;
}

export function getHost(user: User = localUser): string {
  const port = getPort(user);
  return `127.0.0.1:${port}`;
}
