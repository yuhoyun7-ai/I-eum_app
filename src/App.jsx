import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
  'IT', '콘텐츠', '영업•마케팅', '유통', '요식업', '바이오•헬스케어', 
  '환경•에너지', '패션•뷰티', '모빌리티', '서비스', '금융•비즈니스', 
  '교육', '복지', '인테리어', '디자인', '기술'
];

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '강원', '경남', '경북', '전남', '전북', '충남', '충북', '제주'];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginLockModal, setShowLoginLockModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [region, setRegion] = useState(REGIONS[0]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname, category, region }
        }
      });
      if (error) alert(error.message);
      else {
        alert('회원가입 완료! 로그인 해주세요.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else setShowAuthModal(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleActionRequireAuth = (actionCallback: () => void) => {
    if (!session) {
      setShowLoginLockModal(true);
    } else {
      actionCallback();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-12">
      {/* 1. 상단 그라데이션 헤더 (보내주신 시안 UI 완전 동일) */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-3xl font-extrabold tracking-wider">이음</h1>
        <div>
          {session && profile ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">
                {profile.nickname} {profile.is_admin && '🎖️'}
              </span>
              <span className="text-xs bg-black/20 px-2 py-1 rounded">
                {profile.category} | {profile.region}
              </span>
              <button onClick={handleSignOut} className="ml-2 underline text-xs">로그아웃</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)} 
              className="font-bold text-sm hover:underline"
            >
              로그인/회원가입
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-lg border-x border-gray-200">
        
        {/* 전체게시판 타이틀 */}
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-2xl font-black">전체게시판</h2>
        </div>

        {/* 2. 일반게시글 섹션 */}
        <section className="border-b border-gray-300">
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
            <span className="font-bold text-lg flex items-center gap-1">
              일반게시글 <span className="text-sm font-normal">❯</span>
            </span>
            <span className="text-red-500 font-bold text-sm">[999+]</span>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => handleActionRequireAuth(() => {})}>
              <div>
                <h3 className="font-bold text-base">창업할때 하면 좋은 꿀팁</h3>
                <p className="text-xs text-gray-500 mt-1">너혼자산다 | 요식업 | 서울 | 좋아요 11개 | 댓글 27개</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">🖼️</div>
            </div>
            <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => handleActionRequireAuth(() => {})}>
              <div>
                <h3 className="font-bold text-base">점심메뉴 추천좀</h3>
                <p className="text-xs text-gray-500 mt-1">오리너구리 | 모빌리티 | 대구 | 좋아요 4개 | 댓글 49개</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">🖼️</div>
            </div>
          </div>
        </section>

        {/* 3. 이음스와이프 (카드뉴스 가로 스크롤형 UI) */}
        <section className="border-b border-gray-300 py-3">
          <div className="flex justify-between items-center px-3 mb-2">
            <span className="font-bold text-lg flex items-center gap-1">
              이음스와이프 <span className="text-sm font-normal">❯</span>
            </span>
            <span className="text-red-500 font-bold text-sm">[999+]</span>
          </div>
          
          {/* 가로 스크롤 카드들 */}
          <div className="flex gap-3 overflow-x-auto px-3 pb-2 scrollbar-hide">
            {[
              { tag: '카드값줘제리 | 패션 | 부산', title: '돈 쉽게 버는법', img: 'https://via.placeholder.com/150', count: '4장' },
              { tag: '비즈니스맨 | 영업•마케팅 | 광주', title: '여행사 차리겠다고 사퇴한지 1년 후기', img: 'https://via.placeholder.com/150', count: '10장' },
              { tag: '도친놈레친놈미친놈 | IT | 경기', title: '지금부터 1년, IT로 대박나겠습니다', img: 'https://via.placeholder.com/150', count: '7장' },
            ].map((card, idx) => (
              <div key={idx} className="min-w-[140px] max-w-[140px] border rounded-lg p-2 shadow-sm bg-white shrink-0 cursor-pointer" onClick={() => handleActionRequireAuth(() => {})}>
                <p className="text-[10px] text-gray-500 truncate">{card.tag}</p>
                <div className="w-full h-28 bg-gray-800 text-white font-bold text-xs p-2 my-1 flex flex-col justify-end relative rounded">
                  <span>{card.title}</span>
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 px-1 rounded">{card.count}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-600 mt-1">
                  <span>👍 23</span>
                  <span>💬 44</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 이음파트너 */}
        <section className="border-b border-gray-300">
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
            <span className="font-bold text-lg flex items-center gap-1">
              이음파트너 <span className="text-sm font-normal">❯</span>
            </span>
            <span className="text-red-500 font-bold text-sm">[999+]</span>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => handleActionRequireAuth(() => {})}>
              <div>
                <h3 className="font-bold text-base">저랑 같이 중국집 차리실 분</h3>
                <p className="text-xs text-gray-500 mt-1">광개토대왕 | 요식업 | 인천 | 좋아요 4개 | 댓글 49개</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">🖼️</div>
            </div>
          </div>
        </section>

        {/* 5. 기타 게시판 하단 메뉴 */}
        <div className="flex justify-around items-center p-4 text-sm font-bold text-gray-700 border-b">
          <span>• 실 제 사 례</span>
          <span>• 사 기 피 해</span>
          <span>• 공 지 사 항</span>
        </div>

        {/* 6. 하단 분홍색 대형 이음질문 바로가기 버튼 */}
        <div className="p-4">
          <button 
            onClick={() => handleActionRequireAuth(() => {})} 
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl rounded-2xl shadow-lg hover:opacity-95"
          >
            이음질문 바로가기
          </button>
        </div>
      </main>

      {/* 팝업 1: 권한 제어 모달 (시안 2번째 이미지 정확히 구현) */}
      {showLoginLockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-lg font-bold mb-6 text-gray-800">로그인해야 가능한 기능입니다</h3>
            <button 
              onClick={() => { setShowLoginLockModal(false); setShowAuthModal(true); }}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg border border-gray-300"
            >
              로그인 하러가기
            </button>
          </div>
        </div>
      )}

      {/* 팝업 2: 로그인 & 회원가입 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-3 right-3 text-gray-500 font-bold">✕</button>
            <h2 className="text-xl font-black mb-4 text-center">{isSignUp ? '창업자 회원가입' : '로그인'}</h2>
            
            <form onSubmit={handleAuth} className="flex flex-col gap-3">
              <input 
                type="email" placeholder="이메일" value={email} required
                onChange={(e) => setEmail(e.target.value)} 
                className="p-2 border rounded text-sm"
              />
              <input 
                type="password" placeholder="비밀번호" value={password} required
                onChange={(e) => setPassword(e.target.value)} 
                className="p-2 border rounded text-sm"
              />

              {isSignUp && (
                <>
                  <input 
                    type="text" placeholder="닉네임" value={nickname} required
                    onChange={(e) => setNickname(e.target.value)} 
                    className="p-2 border rounded text-sm"
                  />
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">분야 카테고리 (택1)</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">지역 선택</label>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
                      {REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="w-full py-2 bg-pink-500 text-white font-bold rounded hover:bg-pink-600 mt-2">
                {isSignUp ? '가입하기' : '로그인'}
              </button>
            </form>

            <div className="mt-3 flex flex-col gap-2 border-t pt-3">
              <button onClick={handleGoogleLogin} className="w-full py-2 bg-white border border-gray-300 font-bold text-sm rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                🔍 Google로 계속하기
              </button>
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-gray-500 underline text-center">
                {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

