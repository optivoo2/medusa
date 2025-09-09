module.exports = {
  apps: [{
    name: 'medusa-production',
    script: './app.js',
    cwd: '/home/arthur/medusa',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      DATABASE_URL: 'postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-winter-shape-acyx74fh-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
      JWT_SECRET: '6f03a2a0b822da8660e63e3fc557a999ad08927579ff2ace45f0a5c7d8ac738ee3a94c60ea843cc1e8ad7fccc03189408dc77ba98198a40314a393857627902b',
      COOKIE_SECRET: '32245595c98c836f7c833265699d222072297d105ccd109e06dacc8a382ebf8e29e05486b81f973e55f728b7cf5bea0bcf6e4a2c998f6bfb823c505052a57de2',
      ADMIN_JWT_SECRET: 'b55d968d1368d0582966311ea6e2400876a30fe330a5384c830c7d1ed0b6fc93eaff707336e446e29db1fd097707002124580dd791c8255801dd2dabea67839d',
      CORS_ORIGIN: 'https://store.optivoo.com'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: './logs/medusa.log',
    out_file: './logs/medusa-out.log',
    error_file: './logs/medusa-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true
  }]
};