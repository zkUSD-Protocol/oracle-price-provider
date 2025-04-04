const Devnet = {
  mina: ["https://api.minascan.io/node/devnet/v1/graphql"],
  archive: ["https://api.minascan.io/archive/devnet/v1/graphql"],
  explorerAccountUrl: "https://minascan.io/devnet/account/",
  explorerTransactionUrl: "https://minascan.io/devnet/tx/",
  chainId: "devnet",
  name: "Devnet",
};

const Mainnet = {
  mina: ["https://api.minascan.io/node/mainnet/v1/graphql"],
  archive: ["https://api.minascan.io/archive/mainnet/v1/graphql"],
  explorerAccountUrl: "https://minascan.io/mainnet/account/",
  explorerTransactionUrl: "https://minascan.io/mainnet/tx/",
  chainId: "mainnet",
  name: "Mainnet",
};

module.exports = { Devnet, Mainnet };
