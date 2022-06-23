const PasswordManager = require('../password-manager');
const FileSystem = require('../helpers/fs-helper');
const handleCommand = require('./commands');

const { verify } = require('../encrypter');

function registerEvents() {
	process.on('connected', async (arguments) => {
		if (!arguments[0]) {
			console.log(
				'You should provide a password as argument, if is your first access, the provided password will be yours, to change it, consult the commands with --help flag\n'
			);

			process.exit();
		}

		FileSystem.getData((data) => {
			const globalPassword = data['global-password'];

			if (!globalPassword) {
				PasswordManager['set-global-password'](arguments[0]);
			} else {
				verify(arguments[0], globalPassword, (isValid) => {
					if (!isValid) {
						console.log('Invalid password\n');
						process.exit();
					}
				});
			}
		});
	});

	process.stdin.on('data', (buffer) => {
		const [command, ...arguments] = buffer.toString().split(' ');

		const formattedCommand = new String(command).trim();

		handleCommand(formattedCommand, arguments);
	});
}

module.exports = { registerEvents };
