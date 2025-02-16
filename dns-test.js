const dns = require('dns');

dns.lookup('api.telegram.org', (err, address, family) => {
  if (err) {
    console.error('DNS lookup failed:', err);
  } else {
    console.log('Resolved api.telegram.org to:', address);
  }
});

