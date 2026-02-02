/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef } from "react";
import * as s from "./styles"; 
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function InGame() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  
  const [lobbyId, setLobbyId] = useState(null);
  const [phaseString, setPhaseString] = useState("TOPIC_SELECT");
  const [topicInput, setTopicInput] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 타이머 & 팀명 & 입력값
  const [timeLeft, setTimeLeft] = useState(0);
  const [team1Name, setTeam1Name] = useState("블루팀");
  const [team2Name, setTeam2Name] = useState("레드팀");
  const [textTeam1, setTextTeam1] = useState("");
  const [textTeam2, setTextTeam2] = useState("");
  const [judgeResult, setJudgeResult] = useState("");

  const stompClient = useRef(null);

  // 1. 방 접속 및 소켓 연결
  useEffect(() => {
    if (!gameCode) return;

    const connectToGame = async () => {
      try {
        // ID 조회
        const res = await axios.get(`http://localhost:8080/api/game/info/${gameCode}`);
        const numericId = res.data.id;
        setLobbyId(numericId);

        // 초기 상태 로드
        const stateRes = await axios.get(`http://localhost:8080/api/game/${numericId}`);
        if (stateRes.data) {
           setPhaseString(stateRes.data.phase);
           setCurrentTopic(stateRes.data.topic);
           setTimeLeft(stateRes.data.timeLeft);
        }
        

        // 소켓 연결
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
          webSocketFactory: () => socket,
          onConnect: () => {
            console.log("✅ STOMP 연결됨");
            client.subscribe(`/topic/game/${numericId}`, (message) => {
              const data = JSON.parse(message.body);
              
              // 1. 에러/시스템 메시지 처리
              if (data.type === "ERROR") {
                alert("🚫 " + data.message);
                setLoading(false);
                return;
              }
              // 2. 판정 결과
              if (data.type === "RESULT") {
                setJudgeResult(data.message);
                alert(data.message); // 결과 알림
                return;
              }

              // 3. 게임 상태 업데이트
              if (data.phase) {
                  setPhaseString(data.phase);
                  // 페이즈 바뀌면 로딩 해제
                  setLoading(false);
              }
              if (data.topic) setCurrentTopic(data.topic);
              if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
            });
          },
        });
        client.activate();
        stompClient.current = client;

      } catch (err) {
        console.error("접속 실패:", err);
        navigate("/main");
      }
    };
    connectToGame();
    return () => stompClient.current?.deactivate();
  }, [gameCode, navigate]);

  // 2. 타이머 1초씩 감소 (프론트 처리)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 주제 제출
  const submitTopic = async () => {
    if (!topicInput.trim() || !lobbyId) return;
    setLoading(true); // AI 검증 대기 표시
    try {
      await axios.post(`http://localhost:8080/api/game/${lobbyId}/topic`, {
        title: topicInput,
        type: "AI", scale: "MEDIUM", difficulty: "NORMAL", participationCode: gameCode
      });
    } catch (e) {
      alert("전송 실패");
      setLoading(false);
    }
  };

  // 발언 제출
  const submitClaim = async (team, text, setTextFunc) => {
    if (!text.trim() || !lobbyId) return;
    try {
      await axios.post(`http://localhost:8080/api/game/${lobbyId}/claim`, {
        team: team, 
        text: text
      });
      setTextFunc(""); 
    } catch (e) {
      console.error(e);
    }
  };

  if (!lobbyId) return <div css={s.container}>로딩 중...</div>;

  return (
    <div css={s.container}>
      <div css={s.logoBg}>AGORA</div>
      
      {/* 상단바 */}
      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px', position: 'relative', zIndex: 10}}>
        <div css={s.phaseLabel}>PHASE: {phaseString}</div>
        <div css={s.timer}>⏳ {timeLeft}초</div>
      </div>
      
      {/* 주제 표시 (잘 보이게 수정됨) */}
      {currentTopic && <h2 css={s.topicText}>📢 주제: {currentTopic}</h2>}
      
      {/* 판정 결과 표시 (있을 경우) */}
      {phaseString === "JUDGEMENT" && (
          <div css={s.resultBox}>{judgeResult || "판정 중입니다..."}</div>
      )}

      {phaseString === "TOPIC_SELECT" ? (
        <div css={s.centerBox}>
          <h2>토론 주제를 정해주세요</h2>
          <input
            css={s.modalInput}
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="예: 민초 vs 반민초"
          />
          <button css={s.modalSendBtn} onClick={submitTopic} disabled={loading}>
            {loading ? "AI가 주제를 심사 중입니다..." : "주제 제안하기"}
          </button>
        </div>
      ) : (
        /* 토론 화면 (양쪽 다 보임) */
        <div css={s.splitScreen}>
          {/* TEAM 1 (Blue) */}
          <div css={s.teamSide(phaseString === "TEAM1_CLAIM")}>
            <input 
              css={s.teamNameInput(true)} 
              value={team1Name} 
              onChange={(e) => setTeam1Name(e.target.value)} 
            />
            {phaseString === "TEAM1_CLAIM" && <div css={s.turnBadge}>🔵 발언 차례</div>}
            
            <div css={s.claimCard(phaseString === "TEAM1_CLAIM")}>
              <textarea 
                value={textTeam1} 
                onChange={(e) => setTextTeam1(e.target.value)} 
                placeholder={`${team1Name} 의견을 입력하세요.`}
                disabled={phaseString !== "TEAM1_CLAIM"}
              />
              <button 
                onClick={() => submitClaim("team1", textTeam1, setTextTeam1)}
                disabled={phaseString !== "TEAM1_CLAIM"}
              >
                제출
              </button>
            </div>
          </div>

          {/* TEAM 2 (Red) */}
          <div css={s.teamSide(phaseString === "TEAM2_CLAIM")}>
             <input 
              css={s.teamNameInput(false)} 
              value={team2Name} 
              onChange={(e) => setTeam2Name(e.target.value)} 
            />
            {phaseString === "TEAM2_CLAIM" && <div css={s.turnBadge}>🔴 발언 차례</div>}

            <div css={s.claimCard(phaseString === "TEAM2_CLAIM")}>
              <textarea 
                value={textTeam2} 
                onChange={(e) => setTextTeam2(e.target.value)}
                placeholder={`${team2Name} 반박을 입력하세요.`}
                disabled={phaseString !== "TEAM2_CLAIM"}
              />
              <button 
                onClick={() => submitClaim("team2", textTeam2, setTextTeam2)}
                disabled={phaseString !== "TEAM2_CLAIM"}
              >
                제출 (판정 시작)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}