module.exports = {
  apps: [
    {
      name: "canvaskit",
      script: "npm",
      args: "run start",
      cwd: "/var/www/evspc/data/www/evspc.com",
      env: {
        NODE_ENV: "production",
        PORT: 4047,
      },
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
