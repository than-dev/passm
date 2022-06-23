#! /usr/bin/env node

const { registerEvents } = require('./config/events');

registerEvents();

process.emit('connected', process.argv.slice(2, this.length));
