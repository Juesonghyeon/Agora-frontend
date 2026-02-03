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
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [team1Name, setTeam1Name] = useState("블루팀");
  const [team2Name, setTeam2Name] = useState("레드팀");
  const [textTeam1, setTextTeam1] = useState("");
  const [textTeam2, setTextTeam2] = useState("");
  const [judgeResult, setJudgeResult] = useState("");

  const stompClient = useRef(null);

  useEffect(() => {
    if (!gameCode) return;

    const connectToGame = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/game/info/${gameCode}`);
        const numericId = res.data.id;
        setLobbyId(numericId);

        const stateRes = await axios.get(`http://localhost:8080/api/game/${numericId}`);
        if (stateRes.data) {
           setPhaseString(stateRes.data.phase);
           setCurrentTopic(stateRes.data.topic);
           setTimeLeft(stateRes.data.timeLeft);
        }

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
          webSocketFactory: () => socket,
          onConnect: () => {
            console.log("✅ STOMP 연결됨");
            client.subscribe(`/topic/game/${numericId}`, (message) => {
              const data = JSON.parse(message.body);
              
              if (data.type === "ERROR") {
                alert("🚫 " + data.message);
                setLoading(false);
                return;
              }
              if (data.type === "RESULT") {
                setJudgeResult(data.message);
                alert(data.message);
                return;
              }

              if (data.phase) {
                  setPhaseString(data.phase);
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

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const submitTopic = async () => {
    if (!topicInput.trim() || !lobbyId) return;
    setLoading(true);
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
      alert("전송 오류 발생");
    }
  };

  if (!lobbyId) return <div css={s.container}>로딩 중...</div>;

  // 🔥 현재 누구 턴인지 확인하는 헬퍼 함수
  const isTeam1Turn = phaseString === "TEAM1_CLAIM" || phaseString === "TEAM1_REBUTTAL";
  const isTeam2Turn = phaseString === "TEAM2_CLAIM" || phaseString === "TEAM2_REBUTTAL";

  return (
    <div css={s.container}>
      <div css={s.logoBg}>AGORA</div>
      
      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px', position: 'relative', zIndex: 10}}>
        <div css={s.phaseLabel}>
            PHASE: {phaseString.replace("TEAM1_", "BLUE ").replace("TEAM2_", "RED ").replace("_CLAIM", " 주장").replace("_REBUTTAL", " 반박")}
        </div>
        <div css={s.timer}>⏳ {timeLeft}초</div>
      </div>
      
      {currentTopic && <h2 css={s.topicText}>📢 주제: {currentTopic}</h2>}
      
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
        <div css={s.splitScreen}>
          {/* TEAM 1 (Blue) */}
          <div css={s.teamSide(isTeam1Turn)}>
            <input 
              css={s.teamNameInput(true)} 
              value={team1Name} 
              onChange={(e) => setTeam1Name(e.target.value)} 
            />
            {isTeam1Turn && <div css={s.turnBadge}>🔵 {phaseString.includes("REBUTTAL") ? "반박 차례" : "발언 차례"}</div>}
            
            <div css={s.claimCard(isTeam1Turn)}>
              <textarea 
                value={textTeam1} 
                onChange={(e) => setTextTeam1(e.target.value)} 
                placeholder={isTeam1Turn ? "내용을 입력하세요..." : "상대방 턴입니다."}
                disabled={!isTeam1Turn}
              />
              <button 
                onClick={() => submitClaim("team1", textTeam1, setTextTeam1)}
                disabled={!isTeam1Turn}
              >
                제출
              </button>
            </div>
          </div>

          {/* TEAM 2 (Red) */}
          <div css={s.teamSide(isTeam2Turn)}>
             <input 
              css={s.teamNameInput(false)} 
              value={team2Name} 
              onChange={(e) => setTeam2Name(e.target.value)} 
            />
            {isTeam2Turn && <div css={s.turnBadge}>🔴 {phaseString.includes("REBUTTAL") ? "반박 차례" : "발언 차례"}</div>}

            <div css={s.claimCard(isTeam2Turn)}>
              <textarea 
                value={textTeam2} 
                onChange={(e) => setTextTeam2(e.target.value)}
                placeholder={isTeam2Turn ? "내용을 입력하세요..." : "상대방 턴입니다."}
                disabled={!isTeam2Turn}
              />
              <button 
                onClick={() => submitClaim("team2", textTeam2, setTextTeam2)}
                disabled={!isTeam2Turn}
              >
                {phaseString === "TEAM2_REBUTTAL" ? "제출 (판정 시작)" : "제출"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}