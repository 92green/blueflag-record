// @flow
module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        "(src|packages)/**/*.{js,jsx}",
        "!**/lib/**",
        "!**/node_modules/**"
    ],
    coverageReporters: ["json", "lcov", "text-summary"]
};
