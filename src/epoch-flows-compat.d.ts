import "@epoch-protocol/epoch-flows-sdk";

declare module "@epoch-protocol/epoch-flows-sdk" {
  interface PaySubmitInput {
    midenSource?: unknown;
    midenDest?: unknown;
  }

  interface PaySessionConfig {
    getGasless?: () => boolean;
  }
}
