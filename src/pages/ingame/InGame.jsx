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
  const realUsername = localStorage.getItem("username") || "익명";

  const [players, setPlayers] = useState({});
  const [socketSessionId, setSocketSessionId] = useState(""); 
  const [lobbyId, setLobbyId] = useState(null);
  const [phase, setPhase] = useState("TOPIC_SELECT");
  const [timeLeft, setTimeLeft] = useState(0);
  const [topic, setTopic] = useState("");
  const [team1Leader, setTeam1Leader] = useState("");
  const [team2Leader, setTeam2Leader] = useState("");
  const [team1Claims, setTeam1Claims] = useState([]);
  const [team2Claims, setTeam2Claims] = useState([]);

  const [isTopicSubmitted, setIsTopicSubmitted] = useState(false);
  const [isOpinionSubmitted, setIsOpinionSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const [topicInput, setTopicInput] = useState("");
  const [opinionInput, setOpinionInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]); 
  const [judgeResult, setJudgeResult] = useState("");

  const stompClient = useRef(null);
  const chatEndRef = useRef(null);

  const myId = Object.keys(players).find(key => players[key].nickname === realUsername) || socketSessionId;
  const myInfo = players[myId] || {};
  const myTeam = myInfo.team; 
  const isHost = myInfo.isHost === true;
  
  const isBlueTeam = myTeam === "team1" || myTeam === "사용자" || myTeam === "user";
  const teamDisplayName = isBlueTeam ? "BLUE" : "RED";

  const isLeader = (isBlueTeam && team1Leader === myId) || (!isBlueTeam && team2Leader === myId);

  const isMyTurn = () => {
    if (!isLeader) return false;
    const bC = team1Claims.length;
    const rC = team2Claims.length;
    if (isBlueTeam) {
      return (bC === 0 && rC === 1) || (bC === 1 && rC === 2) || (bC === 2 && rC === 2) || (bC === 3 && rC === 3);
    } else {
      return (bC === 0 && rC === 0) || (bC === 1 && rC === 1) || (bC === 3 && rC === 2) || (bC === 4 && rC === 3);
    }
  };

  useEffect(() => {
    if (!gameCode) return;
    const connectToGame = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/game/info/${gameCode}`);
        const id = res.data.id;
        setLobbyId(id);

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
          webSocketFactory: () => socket,
          onConnect: () => {
            const sessionId = socket._transport.url.split("/").reverse()[1];
            setSocketSessionId(sessionId);
            axios.post(`http://localhost:8080/api/game/${id}/join`, { nickname: realUsername, socketId: sessionId });
            
            client.subscribe(`/topic/game/${id}`, (msg) => {
              const data = JSON.parse(msg.body);
              
              if (data.type === "CHAT") { 
                setChatMessages(p => [...p, data]); 
                return; 
              }
              
              // 🌟 [핵심 수정] 백엔드에서 판결 시작(JUDGEMENT) 신호를 보내면 즉시 움짤 로딩 단계로 진입
              if (data.phase === "JUDGEMENT") {
                setPhase("JUDGING_ANIMATION");
                return;
              }

              // 🌟 [핵심 수정] 결과 메시지가 오면, 로딩 화면에서 결과 화면으로 전환
              if (data.type === "RESULT") { 
                setJudgeResult(data.message); 
                // 너무 순식간에 결과가 나오면 움짤이 씹히므로 1.5초 정도 여유를 주고 전환
                setTimeout(() => {
                  setPhase("RESULT");
                }, 1500);
                return; 
              }
              
              if (data.type === "RESET") { alert("의견이 쏠려 다시 정합니다."); setPhase("TOPIC_SELECT"); setTopic(""); setIsTopicSubmitted(false); return; }
              if (data.phase) setPhase(data.phase);
              if (data.topic) setTopic(data.topic);
              if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
              if (data.players) setPlayers(data.players);
              if (data.team1Leader) setTeam1Leader(data.team1Leader);
              if (data.team2Leader) setTeam2Leader(data.team2Leader);
              if (data.team1Claims) setTeam1Claims(data.team1Claims);
              if (data.team2Claims) setTeam2Claims(data.team2Claims);
            });
          },
        });
        client.activate();
        stompClient.current = client;
      } catch (err) { console.error(err); }
    };
    connectToGame();
    return () => stompClient.current?.deactivate();
  }, [gameCode, realUsername]);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [timeLeft]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleTopicSubmit = async () => {
    if (!topicInput.trim()) return;

    // 1. 먼저 AI에게 주제가 적절한지 물어봅니다.
    try {
      // GameController에 만들어두신 검증 API 호출
      const res = await axios.post(`http://localhost:8080/api/game/validate-topic`, { 
        topic: topicInput 
      });

      if (!res.data.isValid) {
        alert("⚠️ 부적절한 주제입니다. (나치즘, 범죄, 혐오 발언 등은 금지됩니다)");
        return; // 부적절하면 여기서 중단!
      }

      // 2. 검증을 통과했을 때만 실제로 주제를 서버에 등록합니다.
      setIsTopicSubmitted(true);
      axios.post(`http://localhost:8080/api/game/${lobbyId}/topic`, { 
        socketId: myId, 
        title: topicInput 
      });
    } catch (err) {
      console.error("주제 검증 실패:", err);
      alert("주제 검증 중 오류가 발생했습니다.");
    }
  };

  const handleOpinionSubmit = () => {
    if (!opinionInput.trim()) return;
    setIsOpinionSubmitted(true);
    axios.post(`http://localhost:8080/api/game/${lobbyId}/opinion`, { socketId: myId, opinion: opinionInput });
  };

  const handleVoteSubmit = () => {
    if (!selectedCandidate) return;
    setHasVoted(true);
    axios.post(`http://localhost:8080/api/game/${lobbyId}/vote`, { voterId: myId, candidateId: selectedCandidate });
  };

  const handleActionSubmit = () => {
    if (!actionInput.trim()) return;
    axios.post(`http://localhost:8080/api/game/${lobbyId}/action`, { leaderId: myId, content: actionInput, team: myTeam });
    setActionInput("");
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const optimisticMsg = { type: "CHAT", sender: myId, content: chatInput, isOptimistic: true };
    setChatMessages(prev => [...prev, optimisticMsg]);
    axios.post(`http://localhost:8080/api/game/${lobbyId}/suggest`, { socketId: myId, content: chatInput })
      .catch(err => console.log("채팅 전송 실패:", err));
    setChatInput("");
  };

  const phaseNames = ["입론", "근거", "반론", "변론"];

  return (
    <div css={s.container}>
      <div css={s.topBar}>
        <div css={s.phaseLabel}>{phase === "JUDGING_ANIMATION" ? "판결 중" : phase}</div>
        <div css={s.timerBox}>⏳ {timeLeft}s</div>
      </div>

      {topic && <h2 css={s.topicText}>📢 {topic}</h2>}

      {/* 단계별 UI 렌더링 */}
      {phase === "TOPIC_SELECT" && (
        <div css={s.centerBox}>
          {isHost ? (
            isTopicSubmitted ? (
              <div css={s.waitingUI}><div css={s.spinner}></div><h2>주제를 등록했습니다.</h2><p>대기 중...</p></div>
            ) : (
              <>
                <h2>어떤 주제로 토론하시겠습니까?</h2>
                <input css={s.modalInput} value={topicInput} onChange={e=>setTopicInput(e.target.value)} placeholder="주제를 입력하세요" />
                <button css={s.modalSendBtn} onClick={handleTopicSubmit} disabled={!topicInput.trim()}>주제 확정</button>
              </>
            )
          ) : (
            <div css={s.waitingUI}><div css={s.spinner}></div><h2>방장이 주제를 고르는 중입니다.</h2></div>
          )}
        </div>
      )}

      {phase === "GATHER_OPINIONS" && (
        <div css={s.centerBox}>
          {isOpinionSubmitted ? (
            <div css={s.waitingUI}><div css={s.spinner}></div><h2>의견 제출 완료!</h2><p>다른 분들을 기다립니다.</p></div>
          ) : (
            <>
              <h2>당신의 생각은 어떠한가요?</h2>
              <textarea css={s.opinionArea} value={opinionInput} onChange={e=>setOpinionInput(e.target.value)} placeholder="자유롭게 적어주세요!" />
              <button css={s.modalSendBtn} onClick={handleOpinionSubmit} disabled={!opinionInput.trim()}>의견 제출</button>
            </>
          )}
        </div>
      )}

      {phase === "VOTE_LEADER" && (
        <div css={s.centerBox}>
          {hasVoted ? (
             <div css={s.waitingUI}><div css={s.spinner}></div><h2>투표 완료!</h2></div>
          ) : (
            <>
              <h2 css={s.teamTitle(isBlueTeam)}>{teamDisplayName}팀장 투표</h2>
              <div css={s.voteContainer}>
                {Object.entries(players).filter(([_, p]) => p.team === myTeam).map(([id, p]) => (
                  <label key={id} css={s.voteLabel}>
                    <input type="radio" name="v" value={id} onChange={e=>setSelectedCandidate(e.target.value)} /> 
                    <span>{p.nickname}</span>
                  </label>
                ))}
              </div>
              <button css={s.modalSendBtn} onClick={handleVoteSubmit} disabled={!selectedCandidate}>투표하기</button>
            </>
          )}
        </div>
      )}

      {/* 토론 메인 레이아웃 */}
      {["ARGUMENT", "EVIDENCE", "REBUTTAL", "CLOSING"].includes(phase) && (
        <div css={s.debateLayout}>
          <div css={s.claimsBoard}>
             <div css={s.teamClaimBox(true)}>
                <h3>BLUE 팀 {team1Leader && <span css={s.leaderBadge}>👑 {players[team1Leader]?.nickname}</span>}</h3>
                <div css={s.claimList}>{team1Claims.map((c, i) => <div key={i} css={s.claimItem}><b>[{phaseNames[i]}]</b> {c}</div>)}</div>
             </div>
             <div css={s.teamClaimBox(false)}>
                <h3>RED 팀 {team2Leader && <span css={s.leaderBadge}>👑 {players[team2Leader]?.nickname}</span>}</h3>
                <div css={s.claimList}>{team2Claims.map((c, i) => <div key={i} css={s.claimItem}><b>[{phaseNames[i]}]</b> {c}</div>)}</div>
             </div>
          </div>

          {myTeam && (
            <div css={s.headquarters(isBlueTeam)}>
              <h3 css={s.hqTitle}>🛡️ {teamDisplayName} 팀 베이스캠프</h3>
              <div css={s.hqContent}>
                <div css={s.chatSection}>
                  <div css={s.chatScrollArea}>
                    {chatMessages.filter((m) => {
                      if (m.isOptimistic) return true;
                      const senderObj = players[m.sender] || Object.values(players).find(p => p.nickname === m.sender);
                      return senderObj?.team === myTeam || m.sender === myId;
                    }).map((m, i) => {
                      const senderObj = players[m.sender] || Object.values(players).find(p => p.nickname === m.sender);
                      const isMe = m.sender === myId || m.isOptimistic;
                      const senderName = isMe ? realUsername : (senderObj ? senderObj.nickname : "익명");
                      return (
                        <div key={i} css={s.chatBubbleWrapper(isMe)}>
                          {!isMe && <span css={s.chatSender}>{senderName}</span>}
                          <div css={s.chatBubble(isMe)}>{m.content}</div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <div css={s.chatInputWrapper}>
                    <input css={s.chatInput} value={chatInput} placeholder="작전 회의..." onChange={e=>setChatInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleChatSubmit()} />
                    <button css={s.chatSendBtn} onClick={handleChatSubmit}>전송</button>
                  </div>
                </div>
                <div css={s.leaderSection}>
                  <h4 css={s.leaderSectionTitle}>🎤 팀장 발언대</h4>
                  {isLeader ? (
                    <div css={s.leaderControls}>
                      <textarea css={s.actionTextarea} value={actionInput} placeholder={isMyTurn() ? "발언을 입력하세요." : "상대팀 차례입니다."} onChange={e=>setActionInput(e.target.value)} disabled={!isMyTurn()} />
                      <button css={s.modalSendBtn} onClick={handleActionSubmit} disabled={!isMyTurn() || !actionInput.trim()}>제출</button>
                    </div>
                  ) : (
                    <div css={s.waitLeaderBox}><div css={s.spinner}></div><p>팀장의 발언을 기다리는 중...</p></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🌟 판결 로딩(움짤) 화면: phase가 JUDGING_ANIMATION일 때 계속 유지됨 */}
      {phase === "JUDGING_ANIMATION" && (
        <div css={s.overlay}>
          <div css={s.judgingBox}>
            <img src="/예제.gif" alt="판결 중" width="250" style={{marginBottom: "20px", display: "block"}} />
            <h2>배심원(AI)이 판결을 내리고 있습니다...</h2>
            <p>과연 어느 팀이 더 논리적이었을까요?</p>
          </div>
        </div>
      )}

      {/* 🌟 최종 결과 화면 */}
      {phase === "RESULT" && (
        <div css={s.overlay}>
          <div css={s.resultBox}>
            <h2>🎉 최종 판결 🎉</h2>
            <div css={s.resultText} style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
              {judgeResult}
            </div>
            <button css={s.modalSendBtn} style={{marginTop: "20px"}} onClick={()=>navigate("/main")}>로비로 돌아가기</button>
          </div>
        </div>
      )}
    </div>
  );
}