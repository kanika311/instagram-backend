/**
 * index.js
 * @description :: index route of platforms
 */

const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const rateLimiter = rateLimit({
    windowMs:2 * 60 * 1000,
    max:200,
    message:'Rate limit exceeded, please try again after 2 minutes',
    skip: (req) => {
        if (req.url.includes('/swagger') || req.url.includes('/favicon')) {
          return true;
        } else {
          return false;
        }
      }
  });

router.use(rateLimiter,require("./userapp/index"));
router.use(rateLimiter,require("./admin/index"));

module.exports = router;