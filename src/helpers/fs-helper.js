const { readFile } = require('fs');
const env = require('../config/env');

class FileSystem {
	static async getData(callback = () => {}) {
		readFile(env.DATA_PATH, (err, data) => {
			if (err) {
				console('an error occurred');
			} else {
				callback(JSON.parse(data));
			}
		});
	}
}

module.exports = FileSystem;
