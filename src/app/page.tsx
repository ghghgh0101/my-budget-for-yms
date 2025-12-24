'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TransactionModal from '@/components/TransactionModal';
// import Link from 'next/link';

// [추가] 쿠키 문자열에서 특정 값을 뽑아내는 함수
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// 타입 정의 (TypeScript의 장점)
interface Wallet {
  id: string;
  currencyCode: string;
  balance: string; // Decimal은 JSON으로 넘어올 때 string이 됨
}

interface User {
  id: string;
  name: string;
  email: string;
  wallets: Wallet[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  // 데이터 가져오기 함수 분리 (재사용)
  const fetchUserData = useCallback(async () => {
    // 1. 로컬 스토리지에서 유저 ID 확인 OR 쿠키 확인 (양쪽 다 체크!)
    let userId = localStorage.getItem('userId');

    // 로컬 스토리지가 비어있다면 쿠키를 뒤져본다
    if (!userId) {
      userId = getCookie('userId') || null;

      // 만약 쿠키에서 찾았다면, 다음을 위해 로컬 스토리지에도 다시 채워넣음 (선택사항)
      if (userId) {
        localStorage.setItem('userId', userId);
      }
    }

    // 2. 둘 다 찾아봤는데도 없으면 그때 쫓아냄
    if (!userId) {
      // 로그인 안 되어 있으면 가입 페이지로 리다이렉트
      router.push('/register');
      return;
    }

    // 3. 데이터 가져오기 (Fetch)
    // const fetchData = async () => {
      try {
        // API 호출
        const res = await fetch(`/api/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // 유저 정보 조회 실패 시 (ID는 있는데 DB에 없을 때) 다시 가입 페이지로(>>로그아웃)
          console.error("유저 정보를 불러오지 못했습니다.");
          localStorage.removeItem('userId');
          // 쿠키도 삭제 (만료 시간을 과거로 설정)
          document.cookie = 'userId=; path=/; max-age=0';
          router.push('/register');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        // 성공하든 실패하든 로딩 화면은 꺼야 함!
        setLoading(false);
      }
    // };
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 로딩 화면 (Skeleton UI)
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pt-20">
          <div className="w-full max-w-2xl animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-40 bg-gray-200 rounded-2xl"></div>
              <div className="h-40 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <main className="min-h-screen bg-gray-50 p-6 pt-12">
        <div className="max-w-2xl mx-auto">

          {/* 헤더 섹션 */}
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-gray-500 text-sm font-medium mb-1">Total Assets</h2>
              <h1 className="text-3xl font-bold text-gray-900">
                Hello, <span className="text-brand-600">{user?.name}</span> 👋
              </h1>
            </div>
            {/* 로그아웃 버튼 (임시) */}
            <button
                onClick={() => {
                  localStorage.removeItem('userId');
                  router.push('/register');
                }}
                className="text-sm text-gray-400 hover:text-red-500 transition"
            >
              Sign out
            </button>
          </header>

          {/* 지갑 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {user?.wallets.map((wallet) => (
                <div
                    key={wallet.id}
                    className={`p-6 rounded-2xl shadow-sm border transition duration-300 hover:shadow-md
                ${wallet.currencyCode === 'GBP'
                        ? 'bg-brand-600 text-white border-brand-500' // GBP는 강조색
                        : 'bg-white text-gray-900 border-gray-100'   // KRW는 흰색
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full 
                  ${wallet.currencyCode === 'GBP' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {wallet.currencyCode} Wallet
                </span>
                    {/* 영국 국기 / 태극기 아이콘 (텍스트로 대체) */}
                    <span className="text-2xl">{wallet.currencyCode === 'GBP' ? '🇬🇧' : '🇰🇷'}</span>
                  </div>

                  <div className="mt-2">
                <span className={`text-3xl font-bold tracking-tight
                  ${wallet.currencyCode === 'GBP' ? 'text-white' : 'text-gray-900'}`}>
                  {wallet.currencyCode === 'GBP' ? '£' : '₩'}
                  {Number(wallet.balance).toLocaleString()} {/* 숫자 콤마 포맷팅 */}
                </span>
                  </div>
                </div>
            ))}
          </div>

          {/* 액션 버튼들 (다음 단계 예고) */}
          <div className="grid grid-cols-1 gap-4">
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Add New Transaction
            </button>
            {/*<button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm">*/}
            {/*  <span>💸</span> Add Expense*/}
            {/*</button>*/}
            {/*<button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm">*/}
            {/*  <span>💰</span> Add Income*/}
            {/*</button>*/}
          </div>

          {/* [추가] 트랜잭션 모달 */}
          {user && (
              <TransactionModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  wallets={user.wallets}
                  onSuccess={fetchUserData} // 성공 시 데이터 다시 불러오기
              />
          )}

        </div>
      </main>
  );
}

// import Image from "next/image";
//
// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
