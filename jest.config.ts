import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
	// Next.js 앱의 경로 (보통 현재 폴더 './')
	// next.config.js 및 .env 파일을 로드하기 위함
	dir: './',
})

// Jest 커스텀 설정
const config: Config = {
	coverageProvider: 'v8',
	testEnvironment: 'jsdom',
	// 1. setup 파일 설정 (기존과 동일하게 적용하되, 확장자는 .ts 권장)
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	// 2. 절대 경로 별칭 설정 (@ -> src/)
	// 참고: tsconfig.json에 paths 설정이 잘 되어 있다면 Next.js가 자동으로 처리해주지만,
	// 명시적으로 적어두는 것이 안전합니다.
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
}

// createJestConfig를 내보낼 때 export default 사용
export default createJestConfig(config)