module.exports = {
	src: [
		'./src/',
	],
	mode: 'file',
	includeDeclarations: true,
	tsconfig: 'tsconfig.json',
	out: './docs',
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	readme: 'README.md',
	name: 'CSharp Binary Stream library',
	ignoreCompilerErrors: true,
	plugin: 'typedoc-plugin-as-member-of',
	listInvalidSymbolLinks: true,
};