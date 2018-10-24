// @flow
module.exports = {
    collectCoverage: true,
    testPathIgnorePatterns: ["<rootDir>/lib/", "<rootDir>/node_modules/"],
    collectCoverageFrom: [
        "(src|packages)/**/*.{js,jsx}",
        "!**/lib/**",
        "!**/node_modules/**"
    ],
    coverageReporters: ["json", "lcov", "text-summary"]
};
