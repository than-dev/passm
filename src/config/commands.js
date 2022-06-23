const PasswordManager = require('../password-manager');

const commands = {
	'--help': () =>
		console.log(`
        list: list all password;\n
        check "password name": display the required password;\n
        remove "password name": remove a password;\n
        edit "password name": edit a password;\n
        new "password name" "password": register a new password;\n
        set-global-password "new password" "current password: to set a new access password;"
    `),
	'set-global-password': (arguments) =>
		PasswordManager['set-global-password'](arguments[0], arguments[1]),
	list: () => PasswordManager.list(),
	new: (arguments) => PasswordManager.new(arguments[0], arguments[1]),
	remove: (arguments) => PasswordManager.remove(arguments[0]),
	check: (arguments) => PasswordManager.check(arguments[0]),
	edit: (arguments) => PasswordManager.edit(arguments[0], arguments[1])
};

function handleCommand(receivedCommand, arguments = []) {
	const command = commands[receivedCommand];

	if (!command) {
		console.error('invalid command');
	} else {
		command(arguments);
	}
}

module.exports = handleCommand;
