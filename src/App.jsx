import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://prlxvwvglhktnrzgkpqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybHh3dndnbGhrdG5yemdrcHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjUzMzcsImV4cCI6MjEwMDMwMTMzN30.xKu7xNCzH9cvPhBYeBdEpz2IUlvIMsR3R57GSXpCCvY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(false);
    // Supabase 테이블(posts) 생성 후 주석 해제하면 실제 DB 데이터를 로드합니다.
    // const { data, error } = await supabase.from('posts').select('*');
    // if (!error && data) setPosts(data);
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.logo}>이음</h1>
        <button style={styles.authBtn} onClick={() => setShowLoginModal(true)}>
          로그인/회원가입
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={styles.main}>
        {/* 전체게시판 */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>전체게시판</h2>
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
                  <div>
                    <h3 style={styles.postTitle}>{post.title}</h3>
                    <p style={styles.postMeta}>{post.author} | {post.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 하단 고정 버튼 */}
        <button style={styles.bottomBtn} onClick={() => setShowLoginModal(true)}>
          이음질문 바로가기
        </button>
      </main>

      {/* 로그인 팝업 모달 */}
      {showLoginModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p style={styles.modalText}>로그인해야 가능한 기능입니다</p>
            <button style={styles.modalBtn} onClick={() => setShowLoginModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#fff',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    position: 'relative',
    paddingBottom: '80px',
  },
  header: {
    background: 'linear-gradient(90deg, #4A70E2, #C061CB)',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
  },
  logo: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  authBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '14px', cursor: 'pointer' },
  main: { padding: '16px' },
  section: { marginBottom: '24px' },
  sectionHeader: { borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' },
  categoryTitle: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '12px' },
  count: { color: '#e53e3e' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  emptyText: { color: '#888', textAlign: 'center', padding: '20px 0' },
  postItem: { padding: '12px', border: '1px solid #eee', borderRadius: '8px' },
  postTitle: { fontSize: '16px', margin: '0 0 4px 0' },
  postMeta: { fontSize: '12px', color: '#666', margin: 0 },
  bottomBtn: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '448px',
    padding: '14px',
    background: 'linear-gradient(90deg, #4A70E2, #C061CB)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', textAlign: 'center', width: '280px' },
  modalText: { marginBottom: '16px', fontWeight: 'bold' },
  modalBtn: { width: '100%', padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px' },
};

