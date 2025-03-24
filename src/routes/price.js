const express = require("express");
const router = express.Router();
const { redis } = require("../utils/clients/redis.js");
const { PRICE_CACHE_KEY } = require("../constants/others.js");
const { signPriceWithLatestBlock } = require("../services/priceService.js");

router.get("/price", async (req, res) => {
  try {
    console.log("Fetching price from redis: ", PRICE_CACHE_KEY);
    const cachedPrice = JSON.parse(await redis.get(PRICE_CACHE_KEY));

    if (!cachedPrice) {
      return res.status(404).json({ error: "Price data not available" });
    }

    // Sign the price with the latest block height
    const priceWithLatestBlock = await signPriceWithLatestBlock(cachedPrice);

    res.json(priceWithLatestBlock);
  } catch (error) {
    console.error("Failed to fetch price:", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

module.exports = router;
