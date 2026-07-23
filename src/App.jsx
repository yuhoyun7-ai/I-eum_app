import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://prlxvwvglhktnrzgkpqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh3dndnbGhrdG5yemdrcHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjUzMzcsImV4cCI6MjEwMDMwMTMzN30.xKu7xNCzH9cvPhBYeBdEpz2IUlvIMsR3R57GSXpCCvY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [posts, setPosts] = useState([]);
  const [isLoginView, setIsLoginView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*');
    if (data) setPosts(data);
  }

  // 로그인 페이지 화면
  if (isLoginView) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={() => setIsLoginView(false)}>이음</h1>
        </header>
        <div style={styles.authBox}>
          <h2 style={{ marginBottom: '20px' }}>로그인</h2>
          <input 
            type="email" 
            placeholder="이메일 입력" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="비밀번호 입력" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button style={styles.mainBtn} onClick={() => alert('로그인 기능 준비 중')}>
            로그인
          </button>
          <button style={styles.subBtn} onClick={() => setIsLoginView(false)}>
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 메인 화면
  return (
    <div style={styles.container}>
      {/* 상단 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.logo}>이음</h1>
        <button style={styles.headerAuthBtn} onClick={() => setIsLoginView(true)}>
          로그인/회원가입
        </button>
      </header>

      {/* 메인 콘텐츠 */}
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

        {/* 하단 고정 버튼 */}
        <button style={styles.bottomBtn} onClick={() => setIsLoginView(true)}>
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
  authBox: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ccc' },
  mainBtn: { padding: '14px', backgroundColor: '#4A70E2', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', marginTop: '10px' },
  subBtn: { padding: '12px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '6px' },
};

