export function getAnkrBaseRpcUrl(apiKey?: string): string {
  const key = apiKey?.trim();
  return key
    ? `https://rpc.ankr.com/base/${key}`
    : "https://rpc.ankr.com/base";
}
