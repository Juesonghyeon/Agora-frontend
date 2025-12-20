/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from "react";
import * as s from "./styles";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function DebateLobby({ onStartGame, gameStarted }) {
  const { gameCode } = useParams();
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("userId"));
  const username = localStorage.getItem("username");

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState(["시스템: 토론을 시작하세요."]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevParticipantsRef = useRef([]);

  /* ================= 게임 입장 / 퇴장 ================= */
  useEffect(() => {
    if (!gameCode || !userId) return;

    console.log("[Debug] 게임 입장 시도:", { gameCode, userId });

    axios
      .post("/api/game/join", null, {
        params: { gameCode, userId }, // ✅ 핵심 수정
      })
      .then(() => console.log("[Debug] 게임 참여 성공"))
      .catch((err) => console.error("[Debug] 게임 참여 실패", err));

    return () => {
      console.log("[Debug] 게임 퇴장 시도:", { gameCode, userId });

      axios
        .post("/api/game/leave", null, {
          params: { gameCode, userId }, // ✅ 핵심 수정
        })
        .then(() => console.log("[Debug] 게임 퇴장 성공"))
        .catch((err) => console.error("[Debug] 게임 퇴장 실패", err));
    };
  }, [gameCode, userId]);

  /* ================= 참가자 목록 ================= */
  useEffect(() => {
    if (!gameCode) return;

    const fetchPlayers = async () => {
      try {
        const res = await axios.get("/api/game/players", {
          params: { gameCode },
        });

        console.log("[Debug] API 응답 participants:", res.data);

        const newList = Array.isArray(res.data) ? res.data : [];
        const prevList = prevParticipantsRef.current;

        // 새로 들어온 사람
        const joined = newList.filter(
          (p) => !prevList.some((prev) => prev.userId === p.userId)
        );

        if (joined.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...joined.map(
              (p) => `시스템: ${p.username}님이 들어오셨습니다.`
            ),
          ]);
        }

        setParticipants(newList);
        prevParticipantsRef.current = newList;
      } catch (e) {
        console.error("[Debug] 플레이어 목록 불러오기 실패:", e);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [gameCode]);

  /* ================= 채팅 ================= */
  const handleSend = () => {
    if (!chatInput.trim()) return;

    const currentUser = participants.find((p) => p.userId === userId);
    const name = currentUser?.username || username || "알 수 없음";

    console.log("[Debug] 채팅 전송:", {
      userId,
      username: name,
      message: chatInput,
    });

    setMessages((prev) => [...prev, `${name}: ${chatInput}`]);
    setChatInput("");
  };

  /* ================= 자동 스크롤 ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  /* ================= 바깥 클릭 시 채팅 닫힘 ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= 뒤로가기 ================= */
  const handleBack = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      return;
    }
    navigate("/main");
  };

  /* ================= 디버그 ================= */
  useEffect(() => {
    console.log("[Debug] participants 상태:", participants);
    console.log("[Debug] messages 상태:", messages);
  }, [participants, messages]);

  return (
    <div css={s.container}>
      <div css={s.logoBg}>Agora</div>

      {/* 상단 */}
      <div css={s.topBar}>
        <button css={s.backButton} onClick={handleBack}>
          ← 뒤로가기
        </button>
        <div css={s.gameCode}>
          CODE: {gameCode} | 내 ID: {userId}
        </div>
      </div>

      {/* 메인 영역 */}
      <div css={s.mainRow}>
        <button css={s.startButton} onClick={onStartGame}>
          {gameStarted ? "게임 시작됨" : "게임 시작"}
        </button>

        {/* 채팅 */}
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

      {/* 참가자 사이드바 */}
      <div css={s.sidebar}>
        {participants.map((p) => (
          <div key={p.userId} css={s.participantItem}>
            <div css={s.avatarCircle} />
            <div>
              {p.username}
              {p.role === "CAPTAIN" ? " 👑" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
