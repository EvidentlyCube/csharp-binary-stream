// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
	_comment:
		"This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
	packageManager: "npm",
	reporters: ["html", "clear-text", "progress"],
	testRunner: "mocha",
	incremental: true,
	mochaOptions: {
		require: ['ts-node/register'],
		spec: ["test/**/*.test.ts"],
	},
	testRunner_comment:
		"Take a look at https://stryker-mutator.io/docs/stryker-js/mocha-runner for information about the mocha plugin.",
	coverageAnalysis: "perTest",
};
export default config;
