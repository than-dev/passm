const env = require('./config/env');
const crypto = require('crypto');

class Encrypter {
	static hash(password, callback) {
		const salt = crypto.randomBytes(16).toString('hex');

		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) {
				console.log('an error ocurred');
			}

			callback(salt + ':' + derivedKey.toString('hex'));
		});
	}

	static verify(password, globalPassword, callback) {
		const [salt, key] = globalPassword.split(':');
		const keyBuffer = Buffer.from(key, 'hex');
		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) {
				console.log('an error ocurred');
			}
			callback(crypto.timingSafeEqual(keyBuffer, derivedKey));
		});
	}

	static encrypt(text) {
		const key = env.KEY;

		const cipher = crypto.createCipheriv(
			env.ALGORITHM,
			Buffer.from(key),
			env.IV
		);

		const encrypted = Buffer.concat([
			cipher.update(text.toString().trim()),
			cipher.final()
		]);
		return {
			iv: env.IV.toString('hex'),
			encryptedData: encrypted.toString('hex'),
			key
		};
	}

	static decrypt({ iv, encryptedData, key }) {
		const bufferedIv = Buffer.from(iv, 'hex');
		const encryptedText = Buffer.from(encryptedData, 'hex');

		const decipher = crypto.createDecipheriv(
			env.ALGORITHM,
			Buffer.from(key),
			bufferedIv
		);

		return Buffer.concat([
			decipher.update(encryptedText),
			decipher.final()
		]).toString();
	}
}

module.exports = Encrypter;
