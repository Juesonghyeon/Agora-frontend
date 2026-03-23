/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as s from "./styles";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { keyframes } from "@emotion/react";

const API_BASE = "http://localhost:8080";
const SOCKET_SERVER = "http://localhost:8081";

const slideOut = keyframes`
  0% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(50px); }
`;

const LobbyLoading = () => (
  <div css={s.loadingContainer}>
    <div css={s.loadingSpinner} />
    <div css={s.loadingText}>게임 입장 중...</div>
  </div>
);

export default function DebateLobby() {
  const { gameCode } = useParams();
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("userId"));
  const username = localStorage.getItem("username");

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState(["시스템: 로비에 입장했습니다."]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [countdown, setCountdown] = useState(null);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [leavingPlayers, setLeavingPlayers] = useState([]);

  const [friends, setFriends] = useState([]);
  const [openChats, setOpenChats] = useState([]); 
  const [chatMessages, setChatMessages] = useState({}); 
  const [chatInputs, setChatInputs] = useState({});

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
  }, []);

  const isHost = participants.some(
    (p) => p.userId === userId && p.role === "HOST"
  );

  const getFullImageUrl = (url) => {
    if (!url || url === "" || url === "null" || url === "undefined") {
      return "/default_profile.png";
    }
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };

  // 친구 데이터 로드
  const loadFriendsData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/profile/friends/all?userId=${userId}`, getAuthHeaders());
      setFriends(res.data.friends || []);
    } catch (err) { console.error("친구 로드 실패", err); }
  }, [userId, getAuthHeaders]);

  // --- [핵심 수정] 방 참가 및 소켓 연결 통합 로직 ---
  useEffect(() => {
    if (!gameCode || !userId || !username) return;

    const initLobby = async () => {
      try {
        setIsJoining(true);

        // 1. 서버 DB에 입장 기록
        await axios.post(`${API_BASE}/api/game/join-room-action`, { gameCode, userId }, getAuthHeaders());
        await loadFriendsData();

        // 2. 최신 참가자 명단(DB) 가져오기 -> 여기서 내 정확한 프로필 URL 확인 가능
        const res = await axios.get(`${API_BASE}/api/game/api/game/join-room-players`, {
          params: { gameCode },
          ...getAuthHeaders()
        });
        const dbPlayers = Array.isArray(res.data) ? res.data : [];
        setParticipants(dbPlayers);

        // 3. 내 진짜 프로필 이미지 찾기
        const myInfo = dbPlayers.find(p => p.userId === userId);
        const myRealProfileImg = myInfo ? myInfo.profileImageUrl : "";

        // 4. 소켓 연결 시작
        socketRef.current = io(SOCKET_SERVER);

        socketRef.current.on("connect", () => {
          socketRef.current.emit("joinRoom", { 
            gameCode, 
            username, 
            userId, 
            profileImageUrl: myRealProfileImg // DB에서 가져온 따끈따끈한 이미지 주소 전송
          });
        });

        socketRef.current.on("updatePlayers", (serverPlayers) => {
          setParticipants(prev => {
            const justLeft = prev.filter(p => !serverPlayers.some(sp => sp.userId === p.userId));
            if (justLeft.length > 0) {
              setTimeout(() => { setParticipants(serverPlayers); }, 500);
              return [...serverPlayers, ...justLeft];
            }
            return serverPlayers;
          });
        });

        socketRef.current.on("system", (data) => {
          const safeName = data.username || "알 수 없는 유저";
          if (data.type === "JOIN") {
            setMessages((prev) => [...prev, `📢 ${safeName}님이 입장하셨습니다.`]);
          } else if (data.type === "LEAVE") {
            setMessages((prev) => [...prev, `🚪 ${safeName}님이 퇴장하셨습니다.`]);
            setLeavingPlayers(prev => [...prev, safeName]);
            setTimeout(() => { setLeavingPlayers(prev => prev.filter(name => name !== safeName)); }, 500);
          }
        });

        socketRef.current.on("chat", (data) => {
          setMessages((prev) => [...prev, `${data.username}: ${data.message}`]);
        });

        socketRef.current.on("COUNTDOWN", (num) => {
          setCountdown(num);
          if (num === 0) navigate(`/game/${gameCode}`);
        });
      
        socketRef.current.on("GAME_START", () => navigate(`/game/${gameCode}`));

      } catch (err) {
        console.error("로비 초기화 실패", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setIsJoining(false);
      }
    };

    initLobby();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [gameCode, userId, username, navigate, getAuthHeaders, loadFriendsData]);

  // 나머지 핸들러들 (변화 없음)
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) setIsChatOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartGame = async () => {
    if (!isHost) return;
    try { await axios.post(`${SOCKET_SERVER}/start`, null, { params: { gameCode } }); } 
    catch (err) { console.error("시작 실패", err); }
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit("chat", { gameCode, username, message: chatInput });
    setChatInput("");
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setIsProfileLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/profile/info`, { params: { userId: user.userId }, ...getAuthHeaders() });
      if (res.data) setSelectedUser(prev => ({ ...prev, ...res.data }));
    } catch (err) { console.error(err); } 
    finally { setIsProfileLoading(false); }
  };

  const handleAddFriend = async (targetId) => {
    try {
      await axios.post(`${API_BASE}/api/profile/friends/request`, { userId, targetId }, getAuthHeaders());
      alert("친구 요청 전송!");
      setSelectedUser(null);
    } catch (err) { alert("이미 친구이거나 요청 중입니다."); }
  };

  const handleOpenMessage = () => {
    const targetUserId = selectedUser.userId;
    const isFriend = friends.some(f => f.friendId === targetUserId || f.userId === targetUserId);
    if (isFriend) {
      openChat({ 
        friendId: targetUserId, 
        username: selectedUser.username, 
        profileImageUrl: selectedUser.profileImageUrl 
      });
      setSelectedUser(null);
    } else { alert("친구가 되어야 메시지를 보낼 수 있습니다."); }
  };

  const fetchMessages = async (targetFriendId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/profile/messages`, { params: { user1: userId, user2: targetFriendId }, ...getAuthHeaders() });
      setChatMessages(prev => ({ ...prev, [targetFriendId]: res.data }));
    } catch (err) { console.error("메시지 로드 실패", err); }
  };

  const openChat = (friend) => {
    if (!friend.friendId) return;
    if (openChats.length >= 3 && !openChats.find(c => c.friendId === friend.friendId)) {
      return alert("채팅창은 동시에 3개까지만 열 수 있습니다.");
    }
    if (!openChats.find(c => c.friendId === friend.friendId)) {
      setOpenChats(prev => [...prev, friend]);
      fetchMessages(friend.friendId).then(() => {
        setTimeout(() => {
          const el = document.getElementById(`chat-scroll-${friend.friendId}`);
          if (el) el.scrollTop = el.scrollHeight;
        }, 100);
      });
    }
  };

  const closeChat = (friendId) => setOpenChats(prev => prev.filter(c => c.friendId !== friendId));

  const handleSendDM = async (friendId) => {
    const text = chatInputs[friendId];
    if(!text || !text.trim()) return;
    try {
      await axios.post(`${API_BASE}/api/profile/messages/send`, { senderId: userId, receiverId: friendId, content: text.trim() }, getAuthHeaders());
      setChatInputs(prev => ({ ...prev, [friendId]: "" }));
      fetchMessages(friendId);
    } catch (err) { alert("메시지 전송 실패"); }
  };

  if (isJoining) return <LobbyLoading />;

  return (
    <div css={s.container}>
      <div css={s.logoBg}>Agora</div>
      <div css={s.topBar}>
        <button css={s.backButton} onClick={() => navigate("/main")}>← 뒤로가기</button>
        <div css={s.gameCode}>참여코드 : {gameCode}</div>
      </div>
      <div css={s.mainRow}>
        <button css={s.startButton} disabled={!isHost} onClick={handleStartGame}>
          {isHost ? "게임 시작" : "방장 대기 중..."}
        </button>
        {countdown !== null && <div css={s.countdownOverlay}>{countdown}</div>}
        <div css={s.chatBox} ref={chatRef} onClick={(e) => { e.stopPropagation(); setIsChatOpen(true); }}>
          <div css={s.chatMessages(isChatOpen)}>
            {messages.map((m, i) => <div key={i} css={s.chatMessage}>{m}</div>)}
            <div ref={messagesEndRef} />
          </div>
          <div css={s.chatInputWrapper}>
            <input 
              css={s.chatInput} value={chatInput} onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()} onFocus={() => setIsChatOpen(true)}
              placeholder="메시지를 입력하세요..."
            />
            <button css={s.chatSendButton} onClick={handleSend}>전송</button>
          </div>
        </div>
      </div>
      <div css={s.sidebar}>
        <div css={s.sidebarTitle}>참가자 ({participants.length})</div>
        <div css={s.participantList}>
          {participants.map((p) => {
            const isLeaving = leavingPlayers.includes(p.username);
            return (
              <div 
                key={p.userId} 
                css={[s.participantItem, isLeaving && { animation: `${slideOut} 0.5s forwards` }]} 
                onClick={() => handleUserClick(p)} 
                style={{ cursor: 'pointer' }}
              >
                <img src={getFullImageUrl(p.profileImageUrl)} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="p" />
                <div css={s.participantName}>{p.username} {p.role === "HOST" && "👑"}</div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedUser && (
        <div css={s.profileModalOverlay} onClick={() => setSelectedUser(null)}>
          <div css={s.profileModalCard} onClick={(e) => e.stopPropagation()}>
            <div css={s.profileBanner} />
            <div css={s.profileAvatarWrapper}>
              <img src={getFullImageUrl(selectedUser.profileImageUrl)} css={s.profileAvatarImg} alt="avatar" />
            </div>
            <div css={s.profileContent}>
              <div css={s.profileUsername}>{selectedUser.username} {isProfileLoading && "..."}</div>
              <div css={s.profileRole}>{selectedUser.role === "HOST" ? "👑 방장 (Host)" : "👤 참가자 (Participant)"}</div>
              {selectedUser.userId !== userId ? (
                <div css={s.profileBtnRow}>
                  <button css={s.profileAddBtn} onClick={() => handleAddFriend(selectedUser.userId)}>친구 추가</button>
                  <button css={s.profileMsgBtn} onClick={handleOpenMessage}>메시지</button>
                </div>
              ) : (
                <div style={{ marginTop: '20px', padding: '10px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '13px', color: '#888' }}>
                  내 프로필입니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ position: 'fixed', bottom: '0', right: '20px', display: 'flex', gap: '15px', zIndex: 1000, alignItems: 'flex-end' }}>
        {openChats.map((friend) => {
          const msgs = chatMessages[friend.friendId] || [];
          const currentInput = chatInputs[friend.friendId] || "";
          return (
            <div key={friend.friendId} style={{ width: '320px', height: '420px', background: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', boxShadow: '0 -2px 15px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#2c3e50', padding: '12px 15px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={getFullImageUrl(friend.profileImageUrl)} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt="profile" />
                  <strong style={{ fontSize: '15px' }}>{friend.username}</strong>
                </div>
                <button onClick={() => closeChat(friend.friendId)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>✖</button>
              </div>
              <div id={`chat-scroll-${friend.friendId}`} style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f5f6fa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {msgs.map(msg => {
                  const isMe = Number(msg.senderId) === Number(userId);
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ background: isMe ? '#3498db' : '#fff', color: isMe ? '#fff' : '#333', padding: '8px 12px', borderRadius: '15px', maxWidth: '75%', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', borderBottomRightRadius: isMe ? '4px' : '15px', borderBottomLeftRadius: isMe ? '15px' : '4px', wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '10px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '6px' }}>
                <input style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '13px' }} value={currentInput} onChange={e => setChatInputs(prev => ({ ...prev, [friend.friendId]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSendDM(friend.friendId)} placeholder="메시지를 입력하세요" />
                <button onClick={() => handleSendDM(friend.friendId)} style={{ padding: '8px 14px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>전송</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}