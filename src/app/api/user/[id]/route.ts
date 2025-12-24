// src/app/api/user/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
	request: Request,
	// Next.js 15 변경점: params는 이제 Promise임
	// 타입을 Promise<{ id: string }> 으로 지정해야 함
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// ** 중요: 여기서 await를 붙여서 params를 먼저 기다려야 id를 꺼낼 수 있음
		const { id } = await params;
		const userId = id;

		// 유저 정보와 연결된 지갑(wallets)을 함께 가져옴
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				wallets: true, // Join Wallets
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("API Error:", error); // 터미널에 에러 원인 출력
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}