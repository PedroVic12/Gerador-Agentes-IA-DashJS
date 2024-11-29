module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      watch: ['src'],
    },
    {
      name: 'backend',
      cwd: './backend',
      script: 'python',
      args: 'app.py',
      env: {
        FLASK_ENV: 'development',
        FLASK_APP: 'app.py',
      },
      watch: ['*.py'],
    },
  ],
}
