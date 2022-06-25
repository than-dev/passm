const FileSystem = require('./helpers/fs-helper');
const Encrypter = require('./encrypter');
const env = require('./config/env');

const { writeFile, writeFileSync } = require('fs');
const { logger } = require('./helpers/logger/logger');

class PasswordManager {
	static list() {
		FileSystem.getData((data) => {
			const passwords = data.passwords;

			logger.black('\n---------------------------');
			for (let i = 0; i < passwords.length; i++) {
				logger.white(`${i + 1}-${passwords[i].name}`);
			}
			logger.black('---------------------------\n');
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
				return logger.red('\npassword not exists\n');
			} else {
				const { iv, encryptedData, key } = passwords[passwordIndex];

				const decryptedPassword = Encrypter.decrypt({ iv, encryptedData, key });

				logger.black('\n---------------------------');
				logger.white(`${formattedPasswordName}: ${decryptedPassword}`);
				logger.black('---------------------------\n');
			}
		});
	}

	static remove(passwordName) {
		FileSystem.getData((data) => {
			const passwords = data.passwords;
			const passwordIndex = passwords.findIndex(
				(password) => password.name === passwordName.toString().trim()
			);

			if (!passwords[passwordIndex]) {
				return logger.red('\npassword not exists\n');
			} else {
				passwords.splice(passwordIndex, 1);

				writeFile(
					env.DATA_PATH,
					JSON.stringify(
						Object.assign(data, {
							passwords
						})
					),
					(err, _) => {
						if (err) {
							logger.red('\nerror on delete\n');
						} else {
							logger.green('\ndeleted with success\n');
						}
					}
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
				return logger.red('\npassword not exists\n');
			} else if (!newPassword) {
				return logger.red('\nyou should provide a new password\n');
			} else {
				const encryptedPassword = Encrypter.encrypt(newPassword);

				passwords[passwordIndex] = { name: passwordName, ...encryptedPassword };

				writeFile(
					env.DATA_PATH,
					JSON.stringify(
						Object.assign(data, {
							passwords
						})
					),
					(err, _) => {
						if (err) {
							logger.red('\nerror on edit\n');
						} else {
							logger.green('\nedited with success\n');
						}
					}
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
				return logger.red('\npassword already exists\n');
			} else if (!password) {
				logger.red('\nyou should provide a password\n');
			} else {
				const encryptedPassword = Encrypter.encrypt(password);

				writeFile(
					env.DATA_PATH,
					JSON.stringify(
						Object.assign(data, {
							passwords: [
								...passwords,
								{ name: passwordName, ...encryptedPassword }
							]
						})
					),
					(err, _) => {
						if (err) {
							logger.red('\nerror on creation\n');
						} else {
							logger.green('\ncreated with success\n');
						}
					}
				);
			}
		});
	}

	static 'set-global-password'(newPassword, currentPassword) {
		FileSystem.getData((data) => {
			const globalPassword = data['global-password'];

			if (!newPassword) {
				return logger.red('\na new password is required\n');
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
							writeFile(
								env.DATA_PATH,
								JSON.stringify(
									Object.assign(data, {
										'global-password': hashedPassword
									})
								),
								(err, _) => {
									if (err) {
										logger.red('\nerror on set a new password\n');
									} else {
										logger.green('\npassword updated with success\n');
									}
								}
							);
						});
					} else {
						logger.red('\ninvalid current password\n');
					}
				});
			}
		});
	}
}

module.exports = PasswordManager;
