const express = require("express");
const router = express.Router();
const { getLatestPrice } = require("../utils/redis.js");

router.get("/price", async (req, res) => {
  try {
    const price = await getLatestPrice();
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

module.exports = router;
