module.exports = {
  apps: [
    {
      name: "physicsbot",
      script: "npm -- start",
      out: "./physicsbot.log",
      error: "./physicsbot.log"
    },
    {
      name: "physicstest",
      script: "npm -- run dev",
      out: "./physicstest.log",
      error: "./physicstest.log"
    }
  ]
};
