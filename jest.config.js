export default {
    testEnvironment: 'node',
    transform: {},
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'services/**/*.js',
        'routes/**/*.js',
        '!**/node_modules/**',
    ],
    coveragePathIgnorePatterns: ['/node_modules/'],
    verbose: true,
}
