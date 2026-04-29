const cp = require('child_process');
process.env.TZ = 'Asia/Makassar';
const bsp = cp.spawn('bash', [], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc']
});
