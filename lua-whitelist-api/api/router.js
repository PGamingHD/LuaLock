const express = require("express");
const app = express();
const apiRouter = express.Router();

const findEndpoint = require("./v1/find");
apiRouter.use('/find', findEndpoint);

const keysEndpoint = require("./v1/keys");
apiRouter.use('/keys', keysEndpoint);

const statusEndpoint = require("./v1/status");
apiRouter.use('/status', statusEndpoint);

const createEndpoint = require("./v1/create");
apiRouter.use('/create', createEndpoint);

const deleteEndpoint = require("./v1/delete");
apiRouter.use('/delete', deleteEndpoint);

const updateEndpoint = require("./v1/update");
apiRouter.use('/update', updateEndpoint);

const authEndpoint = require("./v1/auth.js");
apiRouter.use('/auth', authEndpoint);

module.exports = apiRouter;