module.exports = {
  apps: [
    {
      name: "spending-tracker-frontend",
      script: "npx",
      args: "vite preview --port 3000 --host",
      cwd: "./",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        VITE_API_URL: "https://api.spending-tracker.dhaniansyahr.space",
      },
    },
  ],
};
