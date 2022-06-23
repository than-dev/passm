const FileSystem = require('./helpers/fs-helper');
const Encrypter = require('./encrypter');
const env = require('./config/env');

const { writeFileSync } = require('fs');

class PasswordManager {
	static list() {
		FileSystem.getData((data) => {
			const passwords = data.passwords;

			console.log('\n---------------------------');
			for (let i = 0; i < passwords.length; i++) {
				console.log(`${i + 1}-${passwords[i].name}`);
			}
			console.log('---------------------------\n');
		});
	}

	static check(passwordName) {
		FileSystem.getData((data) => {
			const passwords = data.passwords;
			const formattedPasswordName = passwordName.toString().trim();
			const passwordIndex = passwords.findIndex(
				(password) => password.name === formattedPasswordName
			);

			if (!passwords[passwordIndex]) {
				return console.error('password not exists');
			} else {
				const { iv, encryptedData, key } = passwords[passwordIndex];

				const decryptedPassword = Encrypter.decrypt({ iv, encryptedData, key });

				console.log('\n---------------------------');
				console.log(`${formattedPasswordName}: ${decryptedPassword}`);
				console.log('---------------------------\n');
			}
		});
	}

	static remove(passwordName) {
		FileSystem.getData((data) => {
			const passwords = data.passwords;
			const passwordIndex = passwords.findIndex(
				(password) => password.name === passwordName
			);

			if (!passwords[passwordIndex]) {
				return console.error('password not exists');
			} else {
				passwords.splice(passwordIndex, 1);

				writeFileSync(
					env.DATA_PATH,
					JSON.stringify(
						Object.assign(data, {
							passwords
						})
					)
				);
			}
		});
	}

	static edit(passwordName, newPassword) {
		FileSystem.getData((data) => {
			const passwords = data.passwords;
			const passwordIndex = passwords.findIndex(
				(password) => password.name === passwordName.toString().trim()
			);

			if (!passwords[passwordIndex]) {
				return console.error('password not exists');
			} else {
				const encryptedPassword = Encrypter.encrypt(newPassword);

				passwords[passwordIndex] = { name: passwordName, ...encryptedPassword };

				writeFileSync(
					env.DATA_PATH,
					JSON.stringify(
						Object.assign(data, {
							passwords
						})
					)
				);
			}
		});
	}

	static new(passwordName, password) {
		FileSystem.getData((data) => {
			const passwords = data.passwords;
			const passwordIndex = passwords.findIndex(
				(password) => password.name === passwordName
			);

			if (passwords[passwordIndex]) {
				return console.error('password already exists');
			} else {
				const encryptedPassword = Encrypter.encrypt(password);

				writeFileSync(
					env.DATA_PATH,
					JSON.stringify(
						Object.assign(data, {
							passwords: [
								...passwords,
								{ name: passwordName, ...encryptedPassword }
							]
						})
					)
				);
			}
		});
	}

	static 'set-global-password'(newPassword, currentPassword) {
		FileSystem.getData((data) => {
			const globalPassword = data['global-password'];

			if (!newPassword) {
				return console.log('a new password is required\n');
			}

			if (!globalPassword) {
				Encrypter.hash(newPassword, (hashedPassword) => {
					writeFileSync(
						env.DATA_PATH,
						JSON.stringify(
							Object.assign(data, {
								'global-password': hashedPassword
							})
						)
					);
				});
			} else {
				Encrypter.verify(currentPassword, globalPassword, (isValid) => {
					if (isValid) {
						Encrypter.hash(newPassword, (hashedPassword) => {
							writeFileSync(
								env.DATA_PATH,
								JSON.stringify(
									Object.assign(data, {
										'global-password': hashedPassword
									})
								)
							);
						});
					} else {
						console.log('Invalid current password');
					}
				});
			}
		});
	}
}

module.exports = PasswordManager;
