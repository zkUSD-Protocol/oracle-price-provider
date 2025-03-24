const Client = require("mina-signer");
const testnetSignatureClient = new Client({ network: "testnet" });
const mainnetSignatureClient = new Client({ network: "mainnet" });

const signatureClient =
  process.env.CHAIN === "mainnet"
    ? mainnetSignatureClient
    : testnetSignatureClient;

module.exports = { signatureClient };
