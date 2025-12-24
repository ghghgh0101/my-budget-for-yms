// src/components/TransactionModal.tsx
'use client';

import { useState } from 'react';

interface Wallet {
	id: string;
	currencyCode: string;
}

interface TransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	wallets: Wallet[];
	onSuccess: () => void; // 성공 시 대시보드 새로고침용
}

export default function TransactionModal({ isOpen, onClose, wallets, onSuccess }: TransactionModalProps) {
	const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		walletId: wallets[0]?.id || '', // 첫 번째 지갑 기본 선택
		amount: '',
		category: 'Food',
		description: '',
	});

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const res = await fetch('/api/transactions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...formData, type }),
			});

			if (!res.ok) throw new Error('Failed');

			onSuccess(); // 데이터 새로고침
			onClose();   // 모달 닫기
			setFormData({ ...formData, amount: '', description: '' }); // 폼 초기화
		} catch (error) {
			alert('Error processing transaction');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
			<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">

				{/* 헤더 & 탭 */}
				<div className="flex border-b">
					<button
						onClick={() => setType('EXPENSE')}
						className={`flex-1 py-4 text-sm font-semibold transition ${
							type === 'EXPENSE' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-50'
						}`}
					>
						💸 Expense
					</button>
					<button
						onClick={() => setType('INCOME')}
						className={`flex-1 py-4 text-sm font-semibold transition ${
							type === 'INCOME' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'
						}`}
					>
						💰 Income
					</button>
				</div>

				{/* 폼 */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">

					{/* 지갑 선택 */}
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-1">Select Wallet</label>
						<select
							className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
							value={formData.walletId}
							onChange={(e) => setFormData({...formData, walletId: e.target.value})}
						>
							{wallets.map(w => (
								<option key={w.id} value={w.id}>
									{w.currencyCode} Wallet
								</option>
							))}
						</select>
					</div>

					{/* 금액 입력 */}
					<div>
						<label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
						<div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 font-bold">
                {wallets.find(w => w.id === formData.walletId)?.currencyCode === 'GBP' ? '£' : '₩'}
              </span>
							<input
								type="number"
								required
								placeholder="0.00"
								className="w-full pl-10 pr-4 py-3 text-lg font-bold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
								value={formData.amount}
								onChange={(e) => setFormData({...formData, amount: e.target.value})}
							/>
						</div>
					</div>

					{/* 카테고리 & 설명 */}
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
							<select
								className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
								value={formData.category}
								onChange={(e) => setFormData({...formData, category: e.target.value})}
							>
								<option>Food</option>
								<option>Transport</option>
								<option>Shopping</option>
								<option>Salary</option>
								<option>Rent</option>
								<option>Others</option>
							</select>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
							<input
								type="text"
								placeholder="What for?"
								className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-brand-500"
								value={formData.description}
								onChange={(e) => setFormData({...formData, description: e.target.value})}
							/>
						</div>
					</div>

					{/* 버튼 */}
					<div className="flex gap-3 mt-6 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95
                ${type === 'EXPENSE' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'}`}
						>
							{isLoading ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}