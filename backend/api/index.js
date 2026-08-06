"use strict";

let cachedServer = null;

async function getServer() {
  if (cachedServer) return cachedServer;

  const { NestFactory } = require("@nestjs/core");
  const { ExpressAdapter } = require("@nestjs/platform-express");
  const express = require("express");
  const { AppModule } = require("../dist/src/app.module");

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp)
  );

  app.use(require("helmet")());

  app.enableCors({
    origin: [
      process.env.ADMIN_PANEL_URL || "http://localhost:5173",
      process.env.FLUTTER_APP_URL || "http://localhost:8080",
      "http://localhost:3000",
    ],
    credentials: true,
  });

  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

module.exports = async function handler(req, res) {
  const server = await getServer();
  return server(req, res);
};
