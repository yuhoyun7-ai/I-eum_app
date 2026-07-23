import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://prlxvwvglhktnrzgkpqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh3dndnbGhrdG5yemdrcHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjUzMzcsImV4cCI6MjEwMDMwMTMzN30.xKu7xNCzH9cvPhBYeBdEpz2IUlvIMsR3R57GSXpCCvY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(false);

  useEffect(() => {
    // 세션 정보 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 로그인/로그아웃 상태 변화 감지
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*');
    if (data) setPosts(data);
  }

  // 구글 로그인 함수
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      alert('구글 로그인 실패: ' + error.message);
    }
  }

  // 로그아웃
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // 로그인 화면
  if (isLoginView) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => setIsLoginView(false)}>이음</h1>
        </header>
        <div style={styles.authBox}>
          <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>로그인</h2>
          
          <button style={styles.googleBtn} onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google 계정으로 로그인
          </button>

          <button style={styles.subBtn} onClick={() => setIsLoginView(false)}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  // 메인 화면
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>이음</h1>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px' }}>{user.user_metadata?.full_name || user.email?.split('@')[0]}님</span>
            <button style={styles.headerAuthBtn} onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <button style={styles.headerAuthBtn} onClick={() => setIsLoginView(true)}>
            로그인/회원가입
          </button>
        )}
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>전체게시판</h2>
          </div>
          
          <div style={styles.categoryTitle}>
            <span>일반게시글 ❯</span>
            <span style={styles.count}>[{posts.length}]</span>
          </div>

          <div style={styles.list}>
            {posts.length === 0 ? (
              <p style={styles.emptyText}>등록된 게시글이 없습니다.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} style={styles.postItem}>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  <p style={styles.postMeta}>{post.author} | {post.category}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <button 
          style={styles.bottomBtn} 
          onClick={() => {
            if (!user) {
              alert('로그인이 필요한 기능입니다.');
              setIsLoginView(true);
            } else {
              alert('이음질문 페이지로 이동합니다.');
            }
          }}
        >
          이음질문 바로가기
        </button>
      </main>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
    paddingBottom: '80px',
  },
  header: {
    background: 'linear-gradient(90deg, #4A70E2, #C061CB)',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    width: '100%',
    boxSizing: 'border-box',
  },
  logo: { fontSize: '24px', fontWeight: 'bold', margin: 0, cursor: 'pointer' },
  headerAuthBtn: { 
    background: 'none', 
    border: 'none', 
    color: '#fff', 
    fontSize: '14px', 
    fontWeight: 'bold',
    cursor: 'pointer' 
  },
  main: { padding: '20px', width: '100%', boxSizing: 'border-box' },
  section: { marginBottom: '24px' },
  sectionHeader: { borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '16px' },
  categoryTitle: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' },
  count: { color: '#e53e3e' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  emptyText: { color: '#888', textAlign: 'center', padding: '40px 0' },
  postItem: { padding: '14px', border: '1px solid #eee', borderRadius: '8px' },
  postTitle: { fontSize: '16px', margin: '0 0 6px 0' },
  postMeta: { fontSize: '12px', color: '#666', margin: 0 },
  bottomBtn: {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    right: '16px',
    padding: '16px',
    background: 'linear-gradient(90deg, #4A70E2, #C061CB)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  authBox: { padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  subBtn: { padding: '12px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

