'use strict';
const { migrate } = require('../src/migrations');
migrate()
  .then(() => { console.log('Xong.'); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
