module.exports = {
	entryPoints: [
		'./src/',
	],
	tsconfig: 'tsconfig.json',
	out: './docs',
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	readme: 'README.md',
	name: 'CSharp Binary Stream library',
	validation: {
		invalidLink: true,
	}
};