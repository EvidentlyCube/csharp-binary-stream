const replaceInFile = require('replace-in-file');

const dirname = __dirname.replace(/\\/g, '/');
const dirnameForRegex = escapeRegExp(dirname);

replaceInFile({
	files: 'docs/**/*',
	from: [
		new RegExp(`Defined in ${dirnameForRegex}.+?:\\d+`, 'g'),
		/<li>\s*<\/li>/g,
		/<ul>\s*<\/ul>/g,
		/<aside[^>]*>\s*<\/aside>/g,
	],
	to: ''
});

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}