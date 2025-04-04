const {
  logInfo,
} = require("../helpers");

const Client = require("mina-signer");

const testnetSignatureClient = new Client({ network: "testnet" });
const mainnetSignatureClient = new Client({ network: "mainnet" });

const chain = process.env.CHAIN?.toLowerCase();
const signatureClient = chain === "mainnet" ? mainnetSignatureClient : testnetSignatureClient;

logInfo(`[oracle] Using ${chain === "mainnet" ? "mainnet" : "testnet"} signer client`);

module.exports = {
  signatureClient,
};
