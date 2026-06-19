const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const apiRouter = express.Router();

const endpointLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
});

apiRouter.use('/', endpointLimiter);

apiRouter.get("/", async (req, res, next) => {
    res.status(200).json({
        "message": "Success",
        "Status": "API is currently WORKING!"
    });
});

module.exports = apiRouter;