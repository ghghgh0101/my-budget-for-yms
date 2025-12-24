// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
	try {
		const { walletId, amount, type, category, description } = await request.json();

		// 1. 유효성 검사
		if (!walletId || !amount) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// 2. 금액 계산 (지출이면 음수, 수입이면 양수)
		// 프론트에서 넘어온 amount는 항상 양수라고 가정하고, type으로 판별
		const finalAmount = type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount);

		// 3. 트랜잭션 실행 (잔액 업데이트 + 기록 생성)
		const result = await prisma.$transaction(async (tx) => {
			// (1) 지갑 잔액 업데이트
			const updatedWallet = await tx.wallet.update({
				where: { id: walletId },
				data: {
					balance: {
						increment: finalAmount, // 기존 잔액에 더하기 (음수면 빼기 됨)
					},
				},
			});

			// (2) 거래 내역 기록
			const transaction = await tx.transaction.create({
				data: {
					walletId,
					amount: finalAmount,
					category,
					description,
				},
			});

			return { wallet: updatedWallet, transaction };
		});

		return NextResponse.json(result, { status: 201 });

	} catch (error) {
		console.error('Transaction Error:', error);
		return NextResponse.json(
			{ error: 'Failed to process transaction' },
			{ status: 500 }
		);
	}
}