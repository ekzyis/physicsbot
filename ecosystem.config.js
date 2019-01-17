module.exports = {
  apps: [
    {
      name: "physicsbot",
      script: "npm -- run pistart",
      out: "~/physicsbot/physicsbot.log",
      error: "~/physicsbot/physicsbot.log"
    },
    {
      name: "physicstest",
      script: "npm -- run pidev",
      out: "~/physicsbot/physicstest.log",
      error: "~/physicsbot/physicstest.log"
    }
  ]
};
