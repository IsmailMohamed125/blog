const devData = require("../data/development-data/index.js");
const seed = require("./seed.js");
const db = require("../connection.js");

const runSeed = async () => {
  try {
    await seed(devData);
  } catch (error) {
    console.error("Error while running seed:", error);
  } finally {
    await db.end();
  }
};

runSeed();
