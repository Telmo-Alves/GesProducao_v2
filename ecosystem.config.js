module.exports = {
  apps: [{
    name: 'gesproducao-api',
    script: 'dist/server.js',
    cwd: '/var/www/html/gesproducao_v2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/gesproducao-error.log',
    out_file: '/var/log/pm2/gesproducao-out.log',
    log_file: '/var/log/pm2/gesproducao-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'your_jwt_secret_here_change_in_production'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'your_jwt_secret_here_change_in_production'
    }
  }]
};