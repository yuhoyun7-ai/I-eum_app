import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  MessageSquare, ThumbsUp, Award, User, LogOut, Trash2, 
  Search, PlusCircle, DollarSign, Calendar, Flame, CheckCircle, 
  MapPin, Briefcase, Lock, ShieldAlert, Image as ImageIcon, TrendingUp
} from 'lucide-react';

// ==========================================
// 1. Supabase 설정 (본인 정보 입력)
// ==========================================
const SUPABASE_URL = "https://prlxwvwglhktnrzgkpqz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh3dndnbGhrdG5yemdrcHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjUzMzcsImV4cCI6MjEwMDMwMTMzN30.xKu7xNCzH9cvPhBYeBdEpz2IUlvIMsR3R57GSXpCCvY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 카테고리 목록
const CATEGORIES = [
  "전체", "이음스와이프", "이음지원", "이음질문", 
  "이음모의투자", "인기글", "자유게시판", "창업정보", "출석체크"
];

const BIZ_CATEGORIES = [
  "외식/음식점", "카페/디저트", "IT/소프트웨어", "쇼핑몰/커머스", 
  "교육/학원", "뷰티/미용", "건강/헬스", "물류/유통", 
  "제조/생산", "농림축수산", "문화/예술", "관광/숙박", 
  "부동산/건설", "전문서비스", "기타 서비스", "예비창업"
];

const REGIONS = [
  "서울", "경기", "인천", "강원", "충북", "충남", 
  "대전", "세종", "전북", "전남", "광주", "경북", 
  "경남", "대구", "울산", "부산", "제주"
];

export default function App() {
  // 상태 관리
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("전체");
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  
  // 모달 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // 폼 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [bizCategory, setBizCategory] = useState(BIZ_CATEGORIES[0]);
  const [region, setRegion] = useState(REGIONS[0]);

  // 글쓰기 폼
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('자유게시판');
  const [postContent, setPostContent] = useState('');
  const [postTarget, setPostTarget] = useState('');
  const [postRegion, setPostRegion] = useState('');
  const [postImages, setPostImages] = useState([]);
  
  // 댓글 폼
  const [commentInput, setCommentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 초기 세션 및 게시글 로드
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

    fetchPosts();
    return () => subscription.unsubscribe();
  }, [activeTab]);

  // 프로필 조회
  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  // 게시글 로드
  const fetchPosts = async () => {
    let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
    
    if (activeTab === "인기글") {
      query = query.gte('likes', 20);
    } else if (activeTab !== "전체") {
      query = query.eq('category', activeTab);
    }

    const { data } = await query;
    if (data) setPosts(data);
  };

  // 회원가입
  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname, biz_category: bizCategory, region }
      }
    });

    if (error) alert(error.message);
    else {
      alert("회원가입이 완료되었습니다!");
      setShowAuthModal(false);
    }
  };

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("로그인 정보가 올바르지 않습니다.");
    else setShowAuthModal(false);
  };

  // 비로그인 차단 가드
  const requireAuth = (actionCallback) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    actionCallback();
  };

  // 게시글 상세 열기
  const openPostDetail = async (post) => {
    requireAuth(async () => {
      setSelectedPost(post);
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    });
  };

  // 게시글 작성
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!session) return;

    let rewardMoney = 0;
    if (postCategory === "이음스와이프") rewardMoney = 100000;

    const { data, error } = await supabase.from('posts').insert([{
      user_id: session.user.id,
      author_nickname: profile?.nickname || '익명',
      author_biz: profile?.biz_category,
      author_region: profile?.region,
      is_admin: profile?.is_admin || false,
      title: postTitle,
      category: postCategory,
      content: postContent,
      target_user: postTarget,
      support_region: postRegion,
      images: postImages
    }]).select();

    if (!error) {
      if (rewardMoney > 0) {
        await supabase.rpc('add_eum_money', { user_id: session.user.id, amount: rewardMoney });
        alert(`${postCategory} 작성 보상으로 ${rewardMoney.toLocaleString()}원 지급!`);
        fetchProfile(session.user.id);
      }
      setShowWriteModal(false);
      setPostTitle('');
      setPostContent('');
      fetchPosts();
    }
  };

  // 댓글 작성
  const handleCreateComment = async () => {
    if (!commentInput.trim() || !selectedPost) return;

    const { error } = await supabase.from('comments').insert([{
      post_id: selectedPost.id,
      user_id: session.user.id,
      author_nickname: profile?.nickname || '익명',
      author_biz: profile?.biz_category,
      author_region: profile?.region,
      is_admin: profile?.is_admin || false,
      content: commentInput
    }]);

    if (!error) {
      setCommentInput('');
      openPostDetail(selectedPost);
    }
  };

  // 삭제 권한 (본인 또는 관리자)
  const handleDeletePost = async (postId) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setSelectedPost(null);
      fetchPosts();
    }
  };

  // 좋아요 클릭
  const handleLike = async (post) => {
    requireAuth(async () => {
      const newLikes = (post.likes || 0) + 1;
      await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);
      
      // 20개 달성 시 인기글 보상
      if (newLikes === 20) {
        await supabase.rpc('add_eum_money', { user_id: post.user_id, amount: 100000 });
        alert("🎉 좋아요 20개 달성! 작성자에게 10만원 이음머니 지급!");
      }
      
      setSelectedPost({ ...post, likes: newLikes });
      fetchPosts();
    });
  };

  // 출석 체크
  const handleAttendance = async () => {
    requireAuth(async () => {
      const { data, error } = await supabase.rpc('claim_daily_attendance', { user_id: session.user.id });
      if (error) alert("오늘 이미 출석체크를 하셨습니다!");
      else {
        alert("출석체크 완료! 1,000원이 지급되었습니다.");
        fetchProfile(session.user.id);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("전체")}>
            <div className="bg-indigo-600 text-white font-black px-2.5 py-1 rounded-lg text-xl tracking-wider">
              이음
            </div>
            <span className="font-bold text-slate-700 text-sm hidden sm:inline">창업자 커뮤니티</span>
          </div>

          {/* 프로필 / 로그인 버튼 */}
          <div className="flex items-center space-x-3">
            {session && profile ? (
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full py-1 px-3">
                <div className="flex items-center space-x-1 text-xs">
                  {profile.is_admin && <span className="text-amber-500 font-extrabold">🎖️관리자</span>}
                  <span className="font-bold text-slate-800">{profile.nickname}</span>
                  <span className="text-slate-400">({profile.region})</span>
                </div>
                <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-700 font-bold text-xs px-2 py-0.5 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  <span>{profile.eum_money?.toLocaleString()}원</span>
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. 게시판 카테고리 탭 (가로 스크롤) */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-2 flex space-x-1 overflow-x-auto scrollbar-none py-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat === "인기글" && <Flame className="w-3 h-3 inline mr-1 text-amber-400" />}
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* 3. 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 상단 액션 바: 검색 & 글쓰기 & 출석체크 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="게시글 및 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAttendance}
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>출석체크 (+1천원)</span>
            </button>

            <button
              onClick={() => requireAuth(() => setShowWriteModal(true))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>글쓰기</span>
            </button>
          </div>
        </div>

        {/* 게시글 목록 (피드 리스트 형태) */}
        <div className="space-y-3">
          {posts
            .filter(p => p.title.includes(searchQuery) || p.content.includes(searchQuery))
            .map((post) => (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 hover:border-indigo-300 transition cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    {post.likes >= 20 && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
                        <Flame className="w-3 h-3 mr-0.5 fill-amber-500" /> 인기
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>

                {/* 하단 메타 정보 */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-50">
                  <div className="flex items-center space-x-2">
                    {post.is_admin && <span className="text-amber-500 font-bold">🎖️</span>}
                    <span className="font-medium text-slate-700">{post.author_nickname}</span>
                    <span>•</span>
                    <span>{post.author_biz}</span>
                    <span>•</span>
                    <span>{post.author_region}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-500">
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{post.likes || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.comment_count || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

          {posts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 text-xs">등록된 게시글이 없습니다. 첫 글을 작성해 보세요!</p>
            </div>
          )}
        </div>
      </main>

      {/* 4. 로그인 / 회원가입 팝업 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl relative">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-indigo-50 rounded-full text-indigo-600 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {authMode === 'login' ? '로그인이 필요합니다' : '이음 회원가입'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                커뮤니티 활동을 위해 계정에 로그인하세요.
              </p>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600">이메일</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">비밀번호</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="******"
                />
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">닉네임</label>
                    <input
                      type="text"
                      required
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      placeholder="창업자 닉네임"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">업종 분야 (택1)</label>
                      <select
                        value={bizCategory}
                        onChange={(e) => setBizCategory(e.target.value)}
                        className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        {BIZ_CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600">지역</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition mt-4"
              >
                {authMode === 'login' ? '로그인' : '가입하기'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                {authMode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </div>

            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 5. 글쓰기 모달 */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 mb-4">게시글 작성</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600">게시판 선택</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {CATEGORIES.filter(c => c !== "전체" && c !== "인기글").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">제목</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">내용</label>
                <textarea
                  required
                  rows={5}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="내용을 작성하세요..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. 게시글 상세보기 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded">
                {selectedPost.category}
              </span>
              
              {/* 삭제 버튼 (본인 또는 관리자) */}
              {(profile?.is_admin || profile?.id === selectedPost.user_id) && (
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제</span>
                </button>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 my-3">{selectedPost.title}</h2>

            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6 pb-3 border-b border-slate-100">
              {selectedPost.is_admin && <span className="text-amber-500 font-bold">🎖️</span>}
              <span className="font-bold text-slate-700">{selectedPost.author_nickname}</span>
              <span>•</span>
              <span>{selectedPost.author_biz}</span>
              <span>•</span>
              <span>{selectedPost.author_region}</span>
            </div>

            <div className="text-slate-800 text-xs leading-relaxed space-y-3 mb-6 whitespace-pre-wrap">
              {selectedPost.content}
            </div>

            {/* 좋아요 버튼 */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => handleLike(selectedPost)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full font-bold text-xs transition"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>좋아요 {selectedPost.likes || 0}</span>
              </button>
            </div>

            {/* 댓글 영역 */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-bold text-xs text-slate-800 mb-3">댓글 {comments.length}개</h4>
              
              <div className="space-y-2 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-3 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700">{c.author_nickname}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* 댓글 작성 폼 */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="댓글을 작성하세요..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={handleCreateComment}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-lg"
                >
                  등록
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

