module.exports = {
  verbose: true,
  testURL: 'http://localhost/',
  collectCoverage: true,
  roots: ['./spec'],
  setupFilesAfterEnv: ['<rootDir>spec/jest.setup.js']
}
