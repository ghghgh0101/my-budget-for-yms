const nextJest = require('next/jest')

const createJestConfig = nextJest({
	// next.config.js 및 .env 파일을 로드하기 위함
	dir: './',
})

// 커스텀 Jest 설정
const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	testEnvironment: 'jest-environment-jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1', // 절대 경로 별칭(@) 설정
	},
}

module.exports = createJestConfig(customJestConfig)