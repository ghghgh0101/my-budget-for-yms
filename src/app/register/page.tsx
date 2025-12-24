'use client'; // 훅(useState)을 사용하므로 클라이언트 컴포넌트 선언

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		name: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	// 입력값 변경 핸들러
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// 폼 제출 핸들러
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Something went wrong');
			}

			const userId = data.user.id || data.user?.id; // 가입된 유저 ID
			if (!userId) {
				// ID가 없으면 경고창 띄우고 이동 안 함 (디버깅용)
				alert(`가입은 됐는데 ID를 못 찾겠어요.\n응답 데이터: ${JSON.stringify(data)}`);
				return;
			}

			// 1. 미들웨어(서버 문지기) 통과용 -> 쿠키에 저장
			// (path=/ 는 사이트 전체에서 유효하다는 뜻)
			document.cookie = `userId=${userId}; path=/; max-age=86400`;

			// 2. 대시보드(화면 UI) 표시용 -> 로컬 스토리지에 저장
			localStorage.setItem('userId', userId);

			console.log('저장된 ID:', userId); // 개발자 도구 콘솔 확인용

			// 성공 시 (일단 알림창 띄우고 메인으로 이동)
			alert('Registration successful! Welcome to Global Wallet.');
			router.push('/'); // 메인 페이지로 이동

		} catch (err: unknown) {
			// setError(err.message);
			if (err instanceof Error) {
				setError(err.message); // Error 객체라면 message 속성 사용
			} else {
				setError('알 수 없는 에러가 발생했습니다.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			{/* 메인 카드 컨테이너 */}
			<div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

				{/* 헤더 섹션 */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Join <span className="text-brand-600">Global Wallet</span>
					</h1>
					<p className="text-gray-500 mt-2">
						Start managing your multi-currency finances nicely.
					</p>
				</div>

				{/* 에러 메시지 표시 */}
				{error && (
					<div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
						{error}
					</div>
				)}

				{/* 폼 섹션 */}
				<form onSubmit={handleSubmit} className="space-y-6">

					{/* 이메일 입력 */}
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							placeholder="london.dev@example.com"
							className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition duration-200 outline-none"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>

					{/* 이름 입력 */}
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						<input
							id="name"
							name="name"
							type="text"
							required
							placeholder="Your Name"
							className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition duration-200 outline-none"
							value={formData.name}
							onChange={handleChange}
						/>
					</div>

					{/* 제출 버튼 */}
					<button
						type="submit"
						disabled={isLoading}
						className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
					>
						{isLoading ? (
							<div className="flex items-center justify-center">
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Creating Account...
							</div>
						) : (
							'Create Account'
						)}
					</button>
				</form>

				{/* 하단 링크 */}
				<p className="text-center text-sm text-gray-500 mt-6">
					Already have an account?{' '}
					<a href="#" className="font-medium text-brand-600 hover:text-brand-500 transition">
						Sign in instead
					</a>
				</p>
			</div>
		</div>
	);
}