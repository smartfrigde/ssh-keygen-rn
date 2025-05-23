export type OnLoadEventPayload = {
  url: string;
};

export type SshKeygenRnModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type genKeyPairProps = {
  alg?: 'RSASSA-PKCS1-v1_5',
  size: 1024 | 2048 | 4096,
  hash: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  name: string,
  encryption: "pkcs8" | "jwk",
  passphrase?: string,
}