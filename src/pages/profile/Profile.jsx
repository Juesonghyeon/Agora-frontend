/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import * as s from "./styles"; 
import axios from "axios";

const API_BASE = "http://localhost:8080";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Profile() {
  const userId = Number(localStorage.getItem("userId") || 0);
  const [activeMenu, setActiveMenu] = useState("친구 관리");
  const [friendTab, setFriendTab] = useState("LIST");

  const [user, setUser] = useState({ username: "", email: "", profileImageUrl: "", emailVerified: false });
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [tempProfileImage, setTempProfileImage] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [emailForm, setEmailForm] = useState({ email: "", code: "", isSent: false });
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [idForm, setIdForm] = useState({ currentPw: "", newId: "", confirmId: "" });

  const [openChats, setOpenChats] = useState([]); 
  const [chatMessages, setChatMessages] = useState({}); 
  const [chatInputs, setChatInputs] = useState({}); 

  // 🌟 소셜 로그인 유저 판별
  const isOAuthUser = 
    localStorage.getItem("isOAuth") === "true" || 
    user.username?.startsWith("google_") || 
    user.username?.startsWith("naver_") || 
    user.username?.startsWith("discord_");

  // 🌟 아이디 변경은 소셜 유저에게도 보이게 수정!
  const menuList = ["친구 관리", "이메일 연동", "아이디 변경"];
  if (!isOAuthUser) {
    menuList.push("비밀번호 변경"); // 비밀번호 변경만 소셜 유저에게 숨김
  }

  const isAtBottom = (el) => {
    const threshold = 100; // 하단에서 100px 이내면 바닥으로 간주
    return el.scrollHeight - el.scrollTop <= el.clientHeight + threshold;
  };

  useEffect(() => {
    setSearchKeyword(""); setSearchResults([]);
    setEmailForm({ email: "", code: "", isSent: false });
    setPwForm({ current: "", new: "", confirm: "" });
    setIdForm({ currentPw: "", newId: "", confirmId: "" });
    setFriendTab("LIST");
  }, [activeMenu]);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
    loadFriendsData();
  }, [userId]);

  useEffect(() => {
    openChats.forEach(friend => {
      const el = document.getElementById(`chat-scroll-${friend.friendId}`);
      if (!el) return;

      const messages = chatMessages[friend.friendId] || [];
      if (messages.length === 0) return;

      // 마지막 메시지가 내가 보낸 것이거나, 사용자가 이미 바닥을 보고 있었다면 스크롤 이동
      const lastMessage = messages[messages.length - 1];
      const isMyMessage = Number(lastMessage.senderId) === Number(userId);

      if (isMyMessage || isAtBottom(el)) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, [chatMessages]); // openChats는 제거 (불필요한 트리거 방지)

  useEffect(() => {
    openChats.forEach(friend => {
      const el = document.getElementById(`chat-scroll-${friend.friendId}`);
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [chatMessages, openChats]);

  // 🚨 [수정됨] 프로필 정보 로드 시 localStorage 동기화
  const loadProfile = async () => {
    try {
      const res = await api.get(`/api/profile/info?userId=${userId}`);
      setUser(res.data);
      if (res.data.profileImageUrl) {
        localStorage.setItem("profileImageUrl", res.data.profileImageUrl);
      }
    } catch (err) { console.error("프로필 로드 실패", err); }
  };

  const loadFriendsData = async () => {
    try {
      const res = await api.get(`/api/profile/friends/all?userId=${userId}`);
      setFriends(res.data.friends || []);
      setReceivedRequests(res.data.received || []);
    } catch (err) { console.error("친구 목록 로드 실패", err); }
  };

  const fetchMessages = async (targetFriendId) => {
    if (!targetFriendId) return;
    try {
      const res = await api.get(`/api/profile/messages`, {
        params: { user1: userId, user2: targetFriendId }
      });
      setChatMessages(prev => ({ ...prev, [targetFriendId]: res.data }));
    } catch (err) { console.error("메시지 로드 실패", err); }
  };

  const handleDeleteFriend = async (friendId) => {
    if(!window.confirm("정말 이 친구를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/profile/friends/remove`, { params: { userId, targetId: friendId } });
      alert("삭제되었습니다.");
      loadFriendsData();
      closeChat(friendId); 
    } catch (err) { alert("삭제 실패"); }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const res = await api.get(`/api/profile/search?userId=${userId}&keyword=${searchKeyword}`);
      setSearchResults(res.data);
    } catch (err) { alert("검색 실패"); }
  };

  const sendFriendRequest = async (targetId) => {
    try {
      await api.post(`/api/profile/friends/request`, { userId, targetId });
      alert("친구 요청을 보냈습니다.");
      handleSearch(); 
      loadFriendsData();
    } catch (err) { alert(err.response?.data || "요청 실패"); }
  };

  const respondRequest = async (friendshipId, accept) => {
    try {
        await api.post(`/api/profile/friends/respond`, { friendshipId, accept });
        alert(accept ? "수락했습니다." : "거절했습니다.");
        loadFriendsData();
    } catch (err) { alert("처리에 실패했습니다."); }
  };

  const openChat = (friend) => {
    if (!friend.friendId) return;
    if (openChats.length >= 3 && !openChats.find(c => c.friendId === friend.friendId)) {
      alert("채팅창은 동시에 3개까지만 열 수 있습니다.");
      return;
    }
    if (!openChats.find(c => c.friendId === friend.friendId)) {
      setOpenChats(prev => [...prev, friend]);
      fetchMessages(friend.friendId).then(() => {
        // 메시지 페치 후 다음 틱에서 스크롤 최하단으로
        setTimeout(() => {
          const el = document.getElementById(`chat-scroll-${friend.friendId}`);
          if (el) el.scrollTop = el.scrollHeight;
        }, 100);
      });
    }
  };
  const closeChat = (friendId) => {
    setOpenChats(prev => prev.filter(c => c.friendId !== friendId));
  };

  const handleSendDM = async (friendId) => {
    const text = chatInputs[friendId];
    if(!text || !text.trim()) return;

    try {
      await api.post(`/api/profile/messages/send`, { senderId: userId, receiverId: friendId, content: text.trim() });
      setChatInputs(prev => ({ ...prev, [friendId]: "" }));
      fetchMessages(friendId);
    } catch (err) { alert("메시지 전송 실패"); }
  };

  const handleInputChange = (friendId, value) => {
    setChatInputs(prev => ({ ...prev, [friendId]: value }));
  };

  // 🚨 [수정됨] 이미지 업로드 시 localStorage 동기화
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);
    try {
      const res = await api.post(`/api/profile/upload-image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUser({ ...user, profileImageUrl: res.data });
      localStorage.setItem("profileImageUrl", res.data);
      alert("이미지가 변경되었습니다.");
    } catch (err) { alert("업로드 실패"); }
  };

  const requestEmailCode = async () => {
    try {
      await api.post(`/api/profile/email/request`, { userId, email: emailForm.email });
      setEmailForm({ ...emailForm, isSent: true });
      alert("인증번호 발송 완료");
    } catch (err) { alert("발송 실패"); }
  };

  const verifyEmailCode = async () => {
    try {
      await api.post(`/api/profile/email/verify`, { userId, email: emailForm.email, code: emailForm.code });
      alert("이메일 등록 완료!");
      loadProfile();
    } catch (err) { alert("코드 불일치"); }
  };

  const changePassword = async () => {
    if (pwForm.new !== pwForm.confirm) return alert("새 비밀번호 불일치");
    try {
      await api.post(`/api/profile/change-password`, { userId, currentPassword: pwForm.current, newPassword: pwForm.new });
      alert("비밀번호 변경 성공!");
      setPwForm({ current: "", new: "", confirm: "" });
    } catch (err) { alert("현재 비밀번호 확인 필요"); }
  };

  // 🌟 아이디 변경 로직 수정
  const changeId = async () => {
    if (idForm.newId !== idForm.confirmId) return alert("아이디 확인 불일치");
    // 일반 유저인데 비번 안 적었으면 컷
    if (!isOAuthUser && !idForm.currentPw) return alert("현재 비밀번호를 입력해주세요.");

    try {
      await api.post(`/api/profile/change-username`, { 
        userId, 
        password: idForm.currentPw || "", 
        newUsername: idForm.newId,
        isOAuth: isOAuthUser // 🌟 백엔드에 소셜 유저임을 알려줌!
      });
      alert("변경 성공! 다시 로그인하세요.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) { alert(err.response?.data || "변경 실패"); }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "친구 관리":
        return (
          <div css={s.mainContent}>
            <div style={{ display: 'flex', marginBottom: '25px', gap: '10px' }}>
              <button onClick={() => setFriendTab("LIST")} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: friendTab === "LIST" ? '#c8b496' : '#f0f0f0', color: friendTab === "LIST" ? '#fff' : '#666', cursor: 'pointer' }}>1. 친구 목록</button>
              <button onClick={() => setFriendTab("REQUESTS")} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: friendTab === "REQUESTS" ? '#c8b496' : '#f0f0f0', color: friendTab === "REQUESTS" ? '#fff' : '#666', cursor: 'pointer' }}>2. 친구 찾기/요청</button>
            </div>

            {friendTab === "LIST" ? (
              <>
                <h3>👥 내 친구 목록</h3>
                {friends.length === 0 ? <p>친구가 없습니다.</p> : 
                  friends.map(f => (
                    <div key={f.friendId} css={s.friendItem}>
                      <div css={s.searchResultProfile}>
                        <img src={f.profileImageUrl ? `${API_BASE}${f.profileImageUrl}` : "/default_profile.png"} alt="p" />
                        <span>{f.username}</span>
                      </div>
                      <div css={s.buttonGroup}>
                        <button css={s.actionBtn} style={{background:'#5dade2'}} onClick={() => openChat(f)}>메시지</button>
                        <button css={s.actionBtn} style={{background:'#e74c3c'}} onClick={() => handleDeleteFriend(f.friendId)}>삭제</button>
                      </div>
                    </div>
                  ))
                }
              </>
            ) : (
              <>
                <h3>🔍 친구 찾기</h3>
                <div style={{ display:'flex', gap:'8px', marginBottom:'25px' }}>
                  <input css={s.textInput} style={{ flex: 1 }} placeholder="아이디 검색..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                  <button css={s.actionBtn} onClick={handleSearch}>검색</button>
                </div>
                {searchResults.map(res => (
                  <div key={res.userId} css={s.friendItem}>
                    <div css={s.searchResultProfile}><img src={res.profileImageUrl ? `${API_BASE}${res.profileImageUrl}` : "/default_profile.png"} alt="p" /><span>{res.username}</span></div>
                    <div css={s.buttonGroup}>
                      {res.relationStatus === "NONE" && <button css={s.actionBtn} onClick={() => sendFriendRequest(res.userId)}>친구 추가</button>}
                      {res.relationStatus === "PENDING" && <button css={s.actionBtn} style={{background:'#95a5a6'}} disabled>요청 중</button>}
                    </div>
                  </div>
                ))}
                <hr style={{ margin: '30px 0', borderTop: '1px solid #eee' }} />
                <h3>📩 받은 친구 신청</h3>
                {receivedRequests.length === 0 ? <p>신청 내역이 없습니다.</p> : 
                  receivedRequests.map(req => (
                    <div key={req.friendshipId} css={s.friendItem}>
                      <div css={s.searchResultProfile}><img src={req.profileImageUrl ? `${API_BASE}${req.profileImageUrl}` : "/default_profile.png"} alt="p" /><span>{req.username}</span></div>
                      <div css={s.buttonGroup}>
                        <button css={s.actionBtn} style={{background:'#2ecc71'}} onClick={() => respondRequest(req.friendshipId, true)}>수락</button>
                        <button css={s.actionBtn} style={{background:'#e74c3c'}} onClick={() => respondRequest(req.friendshipId, false)}>거절</button>
                      </div>
                    </div>
                  ))
                }
              </>
            )}
          </div>
        );

      case "이메일 연동":
        return (
          <div css={s.mainContent}>
            <h3>📨 유저 이메일 연동</h3>
            {user.emailVerified ? (
              <div style={{ padding: '20px', background: '#eafaf1', borderRadius: '8px', border: '1px solid #2ecc71' }}>
                <p>✅ 인증 완료: <strong>{user.email}</strong></p>
              </div>
            ) : (
              <div css={s.inputGroup}>
                <input css={s.textInput} placeholder="이메일 주소" value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} disabled={emailForm.isSent} />
                {!emailForm.isSent ? <button css={s.actionBtn} onClick={requestEmailCode}>인증번호 발송</button> : 
                <><input css={s.textInput} placeholder="코드 입력" value={emailForm.code} onChange={e => setEmailForm({...emailForm, code: e.target.value})} /><button css={s.actionBtn} onClick={verifyEmailCode}>인증 완료</button></>}
              </div>
            )}
          </div>
        );

      case "비밀번호 변경":
        return (
          <div css={s.mainContent}>
            <h3>🔒 비밀번호 변경</h3>
            <div css={s.inputGroup}>
              <input css={s.textInput} type="password" placeholder="현재 비밀번호" value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} />
              <input css={s.textInput} type="password" placeholder="새 비밀번호" value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} />
              <input css={s.textInput} type="password" placeholder="확인" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} />
              <button css={s.actionBtn} onClick={changePassword}>변경</button>
            </div>
          </div>
        );

      case "아이디 변경":
        return (
          <div css={s.mainContent}>
            <h3>👤 아이디 변경</h3>
            <div css={s.inputGroup}>
              {/* 🌟 소셜 유저가 아니면 기존 비밀번호 입력창 표시 */}
              {!isOAuthUser && (
                <input css={s.textInput} type="password" placeholder="현재 비밀번호 인증" value={idForm.currentPw} onChange={e => setIdForm({...idForm, currentPw: e.target.value})} />
              )}
              <input css={s.textInput} type="text" placeholder="새 아이디" value={idForm.newId} onChange={e => setIdForm({...idForm, newId: e.target.value})} />
              <input css={s.textInput} type="text" placeholder="확인" value={idForm.confirmId} onChange={e => setIdForm({...idForm, confirmId: e.target.value})} />
              <button css={s.actionBtn} onClick={changeId}>변경</button>
            </div>
          </div>
        );

      default: return <div>준비 중...</div>;
    }
  };

  return (
    <div css={s.profileContainer}>
      <div css={s.contentWrapper}>
        <div css={s.sidebar}>
          <div css={s.profileImageWrapper}>
            <img 
              src={tempProfileImage || (user.profileImageUrl ? `${API_BASE}${user.profileImageUrl}` : "/default_profile.png")} 
              alt="Profile" 
              onClick={() => document.getElementById("fileInput").click()} 
            />
            <input id="fileInput" type="file" onChange={(e) => {
              const file = e.target.files[0];
              if(file) {
                const r = new FileReader(); r.onload = () => setTempProfileImage(r.result); r.readAsDataURL(file);
                handleImageUpload(file);
              }
            }} hidden />
          </div>
          <div css={s.username}>
            {user.username}
            {isOAuthUser && <span style={{display: 'block', fontSize: '12px', color: '#999', marginTop: '4px'}}>(소셜 연동 계정)</span>}
          </div>
          <div css={s.sidebarMenu}>
            {menuList.map(m => (
              <div key={m} css={s.sidebarItem(activeMenu === m)} onClick={() => setActiveMenu(m)}>{m}</div>
            ))}
          </div>
        </div>
        <div css={s.mainPanel}>{renderContent()}</div>
      </div>

      {/* 🌟 다중 채팅창 영역 🌟 */}
      <div style={{ position: 'fixed', bottom: '0', right: '20px', display: 'flex', gap: '15px', zIndex: 1000, alignItems: 'flex-end' }}>
        {openChats.map((friend) => {
          const messages = chatMessages[friend.friendId] || [];
          const currentInput = chatInputs[friend.friendId] || "";

          return (
            <div key={friend.friendId} style={{
              width: '320px', height: '420px', background: '#fff', 
              borderTopLeftRadius: '12px', borderTopRightRadius: '12px', 
              boxShadow: '0 -2px 15px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
              <div style={{ background: '#2c3e50', padding: '12px 15px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={friend.profileImageUrl ? `${API_BASE}${friend.profileImageUrl}` : "/default_profile.png"} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt="profile" />
                  <strong style={{ fontSize: '15px' }}>{friend.username}</strong>
                </div>
                <button onClick={() => closeChat(friend.friendId)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>✖</button>
              </div>

              <div id={`chat-scroll-${friend.friendId}`} style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f5f6fa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginTop: '20px' }}>메시지를 보내 대화를 시작해보세요!</p>
                ) : (
                  messages.map(msg => {
                    const isMe = Number(msg.senderId) === Number(userId);
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          background: isMe ? '#3498db' : '#fff', color: isMe ? '#fff' : '#333',
                          padding: '8px 12px', borderRadius: '15px', maxWidth: '75%', fontSize: '14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)', borderBottomRightRadius: isMe ? '4px' : '15px', borderBottomLeftRadius: isMe ? '15px' : '4px',
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ padding: '10px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '6px' }}>
                <input 
                  style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '13px' }} 
                  value={currentInput} 
                  onChange={e => handleInputChange(friend.friendId, e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && handleSendDM(friend.friendId)}
                  placeholder="메시지를 입력하세요" 
                />
                <button onClick={() => handleSendDM(friend.friendId)} style={{ padding: '8px 14px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  전송
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}