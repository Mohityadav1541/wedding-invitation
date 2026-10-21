module.exports = {
  apps: [
    {
      name: 'wedding-invitation',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
    },
  ],
}
