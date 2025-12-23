/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from "react";
import * as s from "./styles";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

/* ================= 로딩 화면 ================= */
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

  /* ================= HOST 판별 ================= */
  const isHost = participants.some(
    (p) => p.userId === userId && p.role === "HOST"
  );

  /* ================= HTTP 게임 입장 / 퇴장 ================= */
  useEffect(() => {
    if (!gameCode || !userId) return;

    axios.post("/api/game/join", null, { params: { gameCode, userId } });

    return () => {
      axios.post("/api/game/leave", null, { params: { gameCode, userId } });
    };
  }, [gameCode, userId]);

  /* ================= Socket 연결 ================= */
  useEffect(() => {
    if (!gameCode || !username) return;

    socketRef.current = io("http://localhost:8081");

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", { gameCode, username });
    });

    socketRef.current.on("system", (data) => {
      if (data.type === "JOIN") {
        setMessages((prev) => [
          ...prev,
          `시스템: ${data.username}님이 들어오셨습니다.`,
        ]);
      }
      if (data.type === "LEAVE") {
        setMessages((prev) => [
          ...prev,
          `시스템: ${data.username}님이 나가셨습니다.`,
        ]);
      }
    });

    socketRef.current.on("chat", (data) => {
      setMessages((prev) => [...prev, `${data.username}: ${data.message}`]);
    });

    // 🔥 카운트다운 수신
    socketRef.current.on("COUNTDOWN", (num) => {
      setCountdown(num);
    });

    // 🔥 게임 시작 수신 → 화면 이동
    socketRef.current.on("GAME_START", () => {
      navigate(`/game/${gameCode}`);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [gameCode, username, navigate]);

  /* ================= 참가자 목록 ================= */
  useEffect(() => {
    if (!gameCode) return;

    const fetchPlayers = async () => {
      try {
        const res = await axios.get("/api/game/players", {
          params: { gameCode },
        });
        const list = Array.isArray(res.data) ? res.data : [];
        setParticipants(list);

        if (list.some((p) => p.userId === userId)) {
          setIsJoining(false);
        }
      } catch (e) {
        console.error("플레이어 목록 실패", e);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000);
    return () => clearInterval(interval);
  }, [gameCode, userId]);

  /* ================= 게임 시작 (HOST만) ================= */
  const handleStartGame = async () => {
    if (!isHost) return;

    await axios.post("/api/game/start", null, {
      params: { gameCode, userId },
    });
  };

  /* ================= 채팅 전송 ================= */
  const handleSend = () => {
    if (!chatInput.trim()) return;

    socketRef.current.emit("chat", {
      gameCode,
      username,
      message: chatInput,
    });
    setChatInput("");
  };

  /* ================= 자동 스크롤 ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  /* ================= 로딩 화면 ================= */
  if (isJoining) return <LobbyLoading />;

  /* ================= 실제 로비 ================= */
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
          css={s.chatBox(isChatOpen)}
          ref={chatRef}
          onClick={() => setIsChatOpen(true)}
        >
          <div css={s.chatMessages(isChatOpen)}>
            {messages.map((msg, i) => (
              <div key={i} css={s.chatMessage}>
                {msg}
              </div>
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
            />
            <button css={s.chatSendButton} onClick={handleSend}>
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 사이드바 */}
      <div css={s.sidebar}>
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
  );
}
