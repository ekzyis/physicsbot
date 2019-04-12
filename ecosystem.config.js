module.exports = {
  apps: [
    {
      name: "physicsbot",
      script: "npm -- run start",
      out: "~/physicsbot/physicsbot.log",
      error: "~/physicsbot/physicsbot.log"
    },
    {
      name: "physicstest",
      script: "npm -- run dev",
      out: "~/physicsbot/physicstest.log",
      error: "~/physicsbot/physicstest.log"
    }
  ]
};
