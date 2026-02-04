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
  
  // 게임 상태 관리
  const [lobbyId, setLobbyId] = useState(null);
  const [phase, setPhase] = useState("TOPIC_SELECT");
  const [timeLeft, setTimeLeft] = useState(0);
  const [topic, setTopic] = useState("");
  
  // 플레이어 및 팀 정보
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState(""); // 내 소켓 ID
  const [team1Leader, setTeam1Leader] = useState("");
  const [team2Leader, setTeam2Leader] = useState("");
  const [team1Claims, setTeam1Claims] = useState([]);
  const [team2Claims, setTeam2Claims] = useState([]);

  // 입력값들
  const [topicInput, setTopicInput] = useState("");
  const [opinionInput, setOpinionInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [judgeResult, setJudgeResult] = useState("");

  const stompClient = useRef(null);

  // 내 정보 찾기용 헬퍼
  const myInfo = players[myId] || {};

  useEffect(() => {
    if (!gameCode) return;

    const connectToGame = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/game/info/${gameCode}`);
        const numericId = res.data.id;
        setLobbyId(numericId);

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
          webSocketFactory: () => socket,
          onConnect: (frame) => {
            // 소켓 연결 시 생성된 고유 ID 저장 (내 식별자)
            const sessionId = socket._transport.url.split("/").reverse()[1];
            setMyId(sessionId);

            // 입장 알림 (닉네임은 임시로 '익명+ID' 처리, 실제론 이전 페이지에서 받아와야 함)
            axios.post(`http://localhost:8080/api/game/${numericId}/join`, {
              nickname: `플레이어_${sessionId.substring(0, 4)}`,
              socketId: sessionId
            });

            client.subscribe(`/topic/game/${numericId}`, (message) => {
              const data = JSON.parse(message.body);
              
              if (data.type === "ERROR") return alert(data.message);
              if (data.type === "RESULT") return setJudgeResult(data.message);

              // 전체 상태 업데이트
              if (data.phase) setPhase(data.phase);
              if (data.topic) setTopic(data.topic);
              if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
              if (data.players) setPlayers(data.players);
              if (data.team1Leader) setTeam1Leader(data.team1Leader);
              if (data.team2Leader) setTeam2Leader(data.team2Leader);
              if (data.team1Claims) setTeam1Claims(data.team1Claims);
              if (data.team2Claims) setTeam2Claims(data.team2Claims);
              
              setLoading(false);
            });
          },
        });
        client.activate();
        stompClient.current = client;
      } catch (err) {
        navigate("/main");
      }
    };
    connectToGame();
    return () => stompClient.current?.deactivate();
  }, [gameCode]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // --- API 호출 함수들 ---

  const submitTopic = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/topic`, { title: topicInput });
  };

  const submitOpinion = async () => {
    if (!opinionInput.trim()) return;
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/opinion`, {
      socketId: myId,
      opinion: opinionInput
    });
    setOpinionInput("");
    setLoading(true); // 팀 배정 대기
  };

  const handleVote = async (candidateId) => {
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/vote`, {
      voterId: myId,
      candidateId: candidateId
    });
  };

  const submitAction = async () => {
    if (!actionInput.trim()) return;
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/action`, {
      leaderId: myId,
      content: actionInput
    });
    setActionInput("");
  };

  // --- 렌더링 헬퍼 ---
  const isLeader = myId === team1Leader || myId === team2Leader;
  const myTeam = myInfo.team; // "team1" or "team2"
  
  // 단계 한글화
  const getPhaseName = () => {
    switch(phase) {
      case "GATHER_OPINIONS": return "의견 수렴 중";
      case "VOTE_LEADER": return "팀장 투표";
      case "ARGUMENT": return "1단계: 입론(주장)";
      case "EVIDENCE": return "2단계: 근거 제시";
      case "REBUTTAL": return "3단계: 반론";
      case "CLOSING": return "4단계: 최종 변론";
      case "JUDGEMENT": return "AI 판정 중";
      default: return "대기 중";
    }
  };

  return (
    <div css={s.container}>
      <div css={s.logoBg}>AGORA</div>
      
      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', padding: '20px', zIndex: 10}}>
        <div css={s.phaseLabel}>PHASE: {getPhaseName()}</div>
        <div css={s.timer}>⏳ {timeLeft}초</div>
      </div>

      {topic && <h2 css={s.topicText}>📢 {topic}</h2>}

      {/* 1. 주제 선정 단계 */}
      {phase === "TOPIC_SELECT" && (
        <div css={s.centerBox}>
          <h2>토론 주제를 정해주세요</h2>
          <input css={s.modalInput} value={topicInput} onChange={e => setTopicInput(e.target.value)} placeholder="예: AI가 예술을 대체할 수 있는가?" />
          <button css={s.modalSendBtn} onClick={submitTopic} disabled={loading}>주제 확정</button>
        </div>
      )}

      {/* 2. 의견 제출 단계 (팀 빌딩) */}
      {phase === "GATHER_OPINIONS" && (
        <div css={s.centerBox}>
          <h2>당신의 짧은 견해를 적어주세요</h2>
          <p>AI가 이 의견을 바탕으로 팀을 나눕니다.</p>
          <textarea css={s.opinionArea} value={opinionInput} onChange={e => setOpinionInput(e.target.value)} placeholder="나는 ~라고 생각한다. 왜냐하면..." />
          <button css={s.modalSendBtn} onClick={submitOpinion} disabled={loading}>
            {loading ? "다른 유저 기다리는 중..." : "의견 제출"}
          </button>
        </div>
      )}

      {/* 3. 팀장 투표 단계 */}
      {phase === "VOTE_LEADER" && (
        <div css={s.centerBox}>
          <h2>우리 팀({myTeam === 'team1' ? '블루' : '레드'})의 팀장을 뽑아주세요</h2>
          <div css={s.voteGrid}>
            {Object.entries(players)
              .filter(([id, info]) => info.team === myTeam)
              .map(([id, info]) => (
                <button key={id} css={s.voteBtn} onClick={() => handleVote(id)}>
                  {info.nickname} (현재 {info.voteCount}표)
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 4. 토론 진행 단계 */}
      {["ARGUMENT", "EVIDENCE", "REBUTTAL", "CLOSING"].includes(phase) && (
        <div css={s.splitScreen}>
          {/* 팀 1 (좌) */}
          <div css={s.teamSide(myTeam === 'team1')}>
            <h3 css={s.teamTitle(true)}>BLUE TEAM {team1Leader === myId && "(나)"}</h3>
            <div css={s.historyBox}>
              {team1Claims.map((c, i) => <div key={i} css={s.bubble}>{c}</div>)}
            </div>
            {myTeam === 'team1' && isLeader && (
              <div css={s.actionArea}>
                <textarea value={actionInput} onChange={e => setActionInput(e.target.value)} placeholder="팀의 의견을 정리해서 입력하세요..." />
                <button onClick={submitAction}>발언 제출</button>
              </div>
            )}
          </div>

          {/* 팀 2 (우) */}
          <div css={s.teamSide(myTeam === 'team2')}>
            <h3 css={s.teamTitle(false)}>RED TEAM {team2Leader === myId && "(나)"}</h3>
            <div css={s.historyBox}>
              {team2Claims.map((c, i) => <div key={i} css={s.bubble}>{c}</div>)}
            </div>
            {myTeam === 'team2' && isLeader && (
              <div css={s.actionArea}>
                <textarea value={actionInput} onChange={e => setActionInput(e.target.value)} placeholder="팀의 의견을 정리해서 입력하세요..." />
                <button onClick={submitAction}>발언 제출</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 결과 창 */}
      {phase === "JUDGEMENT" && (
        <div css={s.resultBox}>
          <h2>최종 판정</h2>
          <p>{judgeResult || "AI가 토론 내용을 분석하고 있습니다..."}</p>
          {judgeResult && <button onClick={() => navigate("/main")}>로비로 이동</button>}
        </div>
      )}
    </div>
  );
}