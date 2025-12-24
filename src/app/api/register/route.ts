// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
	try {
		const { email, name } = await request.json();

		// 1. 유효성 검사
		if (!email || !name) {
			return NextResponse.json(
				{ error: 'Email and Name are required' },
				{ status: 400 }
			);
		}

		// 2. 이미 존재하는 이메일인지 확인
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: 'User already exists' },
				{ status: 409 }
			);
		}

		// 3. 트랜잭션 실행 (핵심!)
		// 유저 생성 + GBP 지갑 생성 + KRW 지갑 생성
		// 이 중 하나라도 실패하면 모두 취소됩니다.
		const result = await prisma.$transaction(async (tx) => {
			// (1) 유저 생성
			const user = await tx.user.create({
				data: { email, name },
			});

			// (2) GBP 지갑 생성
			await tx.wallet.create({
				data: {
					userId: user.id,
					currencyCode: 'GBP',
					balance: 0,
				},
			});

			// (3) KRW 지갑 생성
			await tx.wallet.create({
				data: {
					userId: user.id,
					currencyCode: 'KRW',
					balance: 0,
				},
			});

			return user;
		});

		return NextResponse.json({
			message: 'User registered successfully',
			user: result
		}, { status: 201 });

	} catch (error) {
		console.error('Registration Error:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}