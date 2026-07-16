module.exports = {
  apps: [
    {
      name: "canvaskit",
      script: "npm",
      args: "run start",
      cwd: "/home/evspc/www/evspc.com",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
