/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import * as s from "./styles"; 
import axios from "axios";
import { css } from "@emotion/react"; 

const API_BASE = "http://localhost:8080";

export default function Profile() {
  const userId = localStorage.getItem("userId");
  const [activeMenu, setActiveMenu] = useState("친구 관리");
  
  // 친구 관리 내부 탭 상태 ('LIST': 친구목록, 'REQUESTS': 친구찾기 및 신청)
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

  useEffect(() => {
    setSearchKeyword("");
    setSearchResults([]);
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

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/profile/info?userId=${userId}`);
      setUser(res.data);
    } catch (err) { console.error("프로필 로드 실패", err); }
  };

  const loadFriendsData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/profile/friends/all?userId=${userId}`);
      setFriends(res.data.friends || []);
      setReceivedRequests(res.data.received || []);
    } catch (err) { console.error("친구 목록 로드 실패", err); }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_BASE}/api/profile/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser({ ...user, profileImageUrl: res.data });
      alert("이미지가 변경되었습니다.");
    } catch (err) { alert("업로드 실패"); }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const res = await axios.get(`${API_BASE}/api/profile/search?userId=${userId}&keyword=${searchKeyword}`);
      setSearchResults(res.data);
    } catch (err) { alert("검색 실패"); }
  };

  const sendFriendRequest = async (targetId) => {
    try {
      await axios.post(`${API_BASE}/api/profile/friends/request`, { userId, targetId });
      alert("친구 요청을 보냈습니다.");
      handleSearch(); 
      loadFriendsData();
    } catch (err) { alert(err.response?.data || "요청 실패"); }
  };

  const respondRequest = async (friendshipId, accept) => {
    try {
        await axios.post(`${API_BASE}/api/profile/friends/respond`, { friendshipId, accept });
        alert(accept ? "수락했습니다." : "거절했습니다.");
        loadFriendsData();
    } catch (err) { alert("처리에 실패했습니다."); }
  };

  // 나머지 기능(이메일, 비밀번호, 아이디 변경)은 그대로 유지됨
  const requestEmailCode = async () => {
    try {
      await axios.post(`${API_BASE}/api/profile/email/request`, { userId, email: emailForm.email });
      setEmailForm({ ...emailForm, isSent: true });
      alert("인증번호 발송 완료");
    } catch (err) { alert("발송 실패"); }
  };

  const verifyEmailCode = async () => {
    try {
      await axios.post(`${API_BASE}/api/profile/email/verify`, { userId, email: emailForm.email, code: emailForm.code });
      alert("이메일 등록 완료!");
      loadProfile();
    } catch (err) { alert("코드 불일치"); }
  };

  const changePassword = async () => {
    if (pwForm.new !== pwForm.confirm) return alert("새 비밀번호 불일치");
    try {
      await axios.post(`${API_BASE}/api/profile/change-password`, { userId, currentPassword: pwForm.current, newPassword: pwForm.new });
      alert("비밀번호 변경 성공!");
      setPwForm({ current: "", new: "", confirm: "" });
    } catch (err) { alert("현재 비밀번호 확인 필요"); }
  };

  const changeId = async () => {
    if (idForm.newId !== idForm.confirmId) return alert("아이디 확인 불일치");
    try {
      await axios.post(`${API_BASE}/api/profile/change-username`, { userId, password: idForm.currentPw, newUsername: idForm.newId });
      alert("변경 성공! 다시 로그인하세요.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) { alert("변경 실패"); }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "친구 관리":
        return (
          <div css={s.mainContent}>
            {/* 상단 탭 버튼 2개 */}
            <div style={{ display: 'flex', marginBottom: '25px', gap: '10px' }}>
              <button 
                onClick={() => setFriendTab("LIST")}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
                         background: friendTab === "LIST" ? '#c8b496' : '#f0f0f0', 
                         color: friendTab === "LIST" ? '#fff' : '#666', cursor: 'pointer' }}
              >
                1. 친구 목록
              </button>
              <button 
                onClick={() => setFriendTab("REQUESTS")}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
                         background: friendTab === "REQUESTS" ? '#c8b496' : '#f0f0f0', 
                         color: friendTab === "REQUESTS" ? '#fff' : '#666', cursor: 'pointer' }}
              >
                2. 친구 추가 및 신청
              </button>
            </div>

            {friendTab === "LIST" ? (
              <>
                <h3>👥 내 친구 목록</h3>
                {friends.length === 0 ? <p>친구가 없습니다.</p> : 
                  friends.map(f => (
                    <div key={f.userId} css={s.friendItem}>
                      <div css={s.searchResultProfile}>
                        <img src={f.profileImageUrl ? `${API_BASE}${f.profileImageUrl}` : "/default_profile.png"} alt="p" />
                        <span>{f.username}</span>
                      </div>
                      <div css={s.buttonGroup}>
                        <button css={s.actionBtn} style={{background:'#5dade2'}}>메시지</button>
                        <button css={s.actionBtn} style={{background:'#e74c3c'}}>삭제</button>
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
                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />
                <h3>📩 받은 친구 신청</h3>
                {receivedRequests.length === 0 ? <p>신청 내역이 없습니다.</p> : 
                  receivedRequests.map(req => (
                    <div key={req.id} css={s.friendItem}>
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
            <h3>비밀번호 변경</h3>
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
            <h3>아이디 변경</h3>
            <div css={s.inputGroup}>
              <input css={s.textInput} type="password" placeholder="비밀번호 인증" value={idForm.currentPw} onChange={e => setIdForm({...idForm, currentPw: e.target.value})} />
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
                const r = new FileReader(); 
                r.onload = () => setTempProfileImage(r.result); 
                r.readAsDataURL(file);
                handleImageUpload(file);
              }
            }} hidden />
          </div>
          <div css={s.username}>{user.username}</div>
          <div css={s.sidebarMenu}>
            {["친구 관리", "이메일 연동", "비밀번호 변경", "아이디 변경"].map(m => (
              <div key={m} css={s.sidebarItem(activeMenu === m)} onClick={() => setActiveMenu(m)}>{m}</div>
            ))}
          </div>
        </div>
        <div css={s.mainPanel}>{renderContent()}</div>
      </div>
    </div>
  );
}