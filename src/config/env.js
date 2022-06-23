const crypto = require('crypto');

const { join } = require('path');

module.exports = {
	DATA_PATH: join(__dirname, '..', '..', 'data.json'),
	ALGORITHM: 'aes-256-cbc',
	KEY: crypto.randomBytes(32),
	IV: crypto.randomBytes(16)
};
