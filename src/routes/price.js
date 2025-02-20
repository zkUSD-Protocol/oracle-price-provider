const express = require("express");
const router = express.Router();
const { redis } = require("../utils/clients/redis.js");
const { PRICE_CACHE_KEY } = require("../constants/others.js");

router.get("/price", async (req, res) => {
  try {
    const price = JSON.parse(await redis.get(PRICE_CACHE_KEY));
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

module.exports = router;
