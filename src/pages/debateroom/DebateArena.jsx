/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from "react";
import * as s from "./styles";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

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

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const isHost = participants.some(
    (p) => p.userId === userId && p.role === "HOST"
  );

  // 외부 클릭 시 채팅창 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 게임 입장/퇴장 API
  useEffect(() => {
    if (!gameCode || !userId) return;
    axios.post("/api/game/join", null, { params: { gameCode, userId } })
      .catch(err => console.error("입장 에러", err));
      
    return () => {
       // 컴포넌트 언마운트 시 퇴장 처리는 신중해야 함 (게임 시작으로 이동할 때도 언마운트 되므로)
       // 게임 시작이 아닐 때만 퇴장 처리하거나, 소켓 disconnect로 처리하는 것이 일반적
       // 여기서는 일단 유지하되, 게임 시작 시에는 socket이 끊기면서 처리됨
    };
  }, [gameCode, userId]);

  // 소켓 연결
  useEffect(() => {
    if (!gameCode || !username) return;
    socketRef.current = io("http://localhost:8081");

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", { gameCode, username });
    });

  // ... (system, chat 이벤트 기존 동일) ...

    socketRef.current.on("COUNTDOWN", (num) => {
      setCountdown(num);
    // 만약 서버가 0이나 "START"를 카운트다운 끝난 직후 안 보내줄 경우를 대비한 안전장치 (선택)
      if (num === 0) {
        navigate(`/game/${gameCode}`);
      }
    });
  
  // 🔥 [핵심 수정] Router에 InGame 컴포넌트가 연결된 '/game/' 경로로 수정
    socketRef.current.on("GAME_START", () => {
      navigate(`/game/${gameCode}`);
    });

    return () => {
      if(socketRef.current) socketRef.current.disconnect();
    };
}, [gameCode, username, navigate]);

  // 플레이어 목록 갱신
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
    const interval = setInterval(fetchPlayers, 2000); // 1초 -> 2초로 부하 줄임
    return () => clearInterval(interval);
  }, [gameCode, userId]);

  const handleStartGame = async () => {
    if (!isHost) return;
    // 서버에 게임 시작 요청 -> 서버가 소켓으로 GAME_START 뿌림
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

      {/* 사이드바 영역 */}
      <div css={s.sidebar}>
        <div css={s.sidebarTitle}>참가자 ({participants.length})</div>
        <div css={s.participantList}>
          {participants.map((p) => (
            <div key={p.userId} css={s.participantItem}>
              <div css={s.avatarCircle} />
              <div css={s.participantName}>
                {p.username} {p.role === "HOST" && "⭐"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}