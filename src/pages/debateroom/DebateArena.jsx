/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from "react";
import * as s from "./styles";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:8080";

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
  const [messages, setMessages] = useState(["시스템: 토론을 시작하세요."]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [countdown, setCountdown] = useState(null);
  
  // 프로필 모달 대상 유저 상태
  const [selectedUser, setSelectedUser] = useState(null);
  // 프로필 데이터 로딩 상태
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const isHost = participants.some(
    (p) => p.userId === userId && p.role === "HOST"
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!gameCode || !userId) return;
    // 백엔드 API 컨트롤러 주소가 /api/lobby 라면 이 부분을 /api/lobby/join 으로 수정해야 할 수 있습니다.
    axios.post("/api/game/join", null, { params: { gameCode, userId } })
      .catch(err => console.error("입장 에러", err));
  }, [gameCode, userId]);

  useEffect(() => {
    if (!gameCode || !username) return;
    socketRef.current = io("http://localhost:8081");

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", { gameCode, username });
    });

    socketRef.current.on("system", (data) => {
      const msg = data.type === "JOIN" ? `📢 ${data.username}님이 입장했습니다.` : `🚪 ${data.username}님이 퇴장했습니다.`;
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("chat", (data) => {
      setMessages((prev) => [...prev, `${data.username}: ${data.message}`]);
    });

    socketRef.current.on("COUNTDOWN", (num) => {
      setCountdown(num);
      if (num === 0) {
        navigate(`/game/${gameCode}`);
      }
    });
  
    socketRef.current.on("GAME_START", () => {
      navigate(`/game/${gameCode}`);
    });

    return () => {
      if(socketRef.current) socketRef.current.disconnect();
    };
  }, [gameCode, username, navigate]);

  useEffect(() => {
    if (!gameCode) return;
    const fetchPlayers = async () => {
      try {
        const res = await axios.get("/api/game/players", { params: { gameCode } });
        const list = Array.isArray(res.data) ? res.data : [];
        setParticipants(list);
        if (list.some((p) => p.userId === userId)) setIsJoining(false);
      } catch (e) {
        console.error("플레이어 목록 실패", e);
      }
    };
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, [gameCode, userId]);

  const handleStartGame = async () => {
    if (!isHost) return;
    await axios.post("/api/game/start", null, { params: { gameCode, userId } });
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit("chat", { gameCode, username, message: chatInput });
    setChatInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // ★ 추가된 기능: 유저 클릭 시 최신 프로필 정보 가져오기
  const handleUserClick = async (user) => {
    setSelectedUser(user); // 일단 기본 정보로 모달 띄우기
    setIsProfileLoading(true);
    try {
      // 프로필 정보를 관리하는 API를 찔러서 최신 이미지와 정보를 가져옵니다.
      const res = await axios.get(`${API_BASE}/api/profile/info?userId=${user.userId}`);
      if (res.data) {
        setSelectedUser((prev) => ({ ...prev, ...res.data })); // 최신 정보 덮어쓰기
      }
    } catch (err) {
      console.error("최신 프로필 정보를 불러오지 못했습니다.", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 친구 추가 요청 함수
  const handleFriendRequest = async (targetId) => {
    try {
      await axios.post(`${API_BASE}/api/profile/friends/request`, { userId, targetId });
      alert("친구 요청을 보냈습니다.");
      setSelectedUser(null);
    } catch (err) {
      alert(err.response?.data || "이미 친구이거나 요청 중입니다.");
    }
  };

  if (isJoining) return <LobbyLoading />;

  return (
    <div css={s.container}>
      <div css={s.logoBg}>Agora</div>

      <div css={s.topBar}>
        <button css={s.backButton} onClick={() => navigate("/main")}>
          ← 뒤로가기
        </button>
        <div css={s.gameCode}>참여코드 : {gameCode}</div>
      </div>

      <div css={s.mainRow}>
        <button
          css={s.startButton}
          disabled={!isHost}
          onClick={handleStartGame}
        >
          {isHost ? "게임 시작" : "HOST만 시작 가능"}
        </button>

        {countdown !== null && (
          <div css={s.countdownOverlay}>{countdown}</div>
        )}

        <div
          css={s.chatBox}
          ref={chatRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsChatOpen(true);
          }}
        >
          <div css={s.chatMessages(isChatOpen)}>
            {messages.map((msg, i) => (
              <div key={i} css={s.chatMessage}>{msg}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div css={s.chatInputWrapper}>
            <input
              css={s.chatInput}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="채팅을 입력하세요..."
              onFocus={() => setIsChatOpen(true)}
            />
            <button css={s.chatSendButton} onClick={handleSend}>전송</button>
          </div>
        </div>
      </div>

      <div css={s.sidebar}>
        <div css={s.sidebarTitle}>참가자 ({participants.length})</div>
        <div css={s.participantList}>
          {participants.map((p) => (
            <div 
              key={p.userId} 
              css={s.participantItem}
              onClick={() => handleUserClick(p)} // 본인 여부 상관없이 클릭 가능하게 수정
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={p.profileImageUrl ? `${API_BASE}${p.profileImageUrl}` : "/default_profile.png"} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                alt="profile"
              />
              <div css={s.participantName}>
                {p.username} {p.role === "HOST" && "⭐"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 디스코드 스타일 프로필 모달 */}
      {selectedUser && (
        <div 
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#2b2d31', /* 디스코드 다크테마 배경색 */
              borderRadius: '8px', 
              width: '300px', 
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0,0,0,0.24)',
              color: '#dbdee1'
            }}
          >
            {/* 상단 배너 */}
            <div style={{ background: '#5865F2', height: '60px', width: '100%' }}></div>
            
            {/* 프로필 이미지 (배너에 걸치게 설정) */}
            <div style={{ 
              marginTop: '-30px', marginLeft: '16px', width: '76px', height: '76px', 
              borderRadius: '50%', background: '#2b2d31', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <img 
                src={selectedUser.profileImageUrl ? `${API_BASE}${selectedUser.profileImageUrl}` : "/default_profile.png"} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                alt="profile"
              />
            </div>

            {/* 유저 정보 */}
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '20px' }}>
                {selectedUser.username}
              </h3>
              <div style={{ fontSize: '14px', color: '#b5bac1', marginBottom: '20px' }}>
                {selectedUser.role === "HOST" ? "방장 (Host)" : "참가자 (Participant)"}
                {isProfileLoading && " (데이터 동기화 중...)"}
              </div>

              {/* 본인이 아닐 때만 친구추가/메시지 버튼 표시 */}
              {selectedUser.userId !== userId ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleFriendRequest(selectedUser.userId)}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '4px', border: 'none',
                      background: '#248046', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    친구 추가
                  </button>
                  <button 
                    onClick={() => alert("메시지 기능 준비 중")}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '4px', border: 'none',
                      background: '#4e5058', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    메시지
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '10px', textAlign: 'center', background: '#1e1f22', 
                  borderRadius: '4px', color: '#949ba4', fontSize: '14px'
                }}>
                  내 프로필입니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}