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
  const [phase, setPhase] = useState("TOPIC_SELECT");
  const [timeLeft, setTimeLeft] = useState(0);
  const [topic, setTopic] = useState("");
  
  const [players, setPlayers] = useState({});
  const [myId, setMyId] = useState(""); 
  const [team1Leader, setTeam1Leader] = useState("");
  const [team2Leader, setTeam2Leader] = useState("");
  const [team1Claims, setTeam1Claims] = useState([]);
  const [team2Claims, setTeam2Claims] = useState([]);

  const [topicInput, setTopicInput] = useState("");
  const [opinionInput, setOpinionInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [judgeResult, setJudgeResult] = useState("");

  const stompClient = useRef(null);
  const myInfo = players[myId] || {};
  const myTeam = myInfo.team; 

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
            const sessionId = socket._transport.url.split("/").reverse()[1];
            setMyId(sessionId);

            axios.post(`http://localhost:8080/api/game/${numericId}/join`, {
              nickname: `Player_${sessionId.substring(0,4)}`,
              socketId: sessionId 
            });

            client.subscribe(`/topic/game/${numericId}`, (message) => {
              const data = JSON.parse(message.body);
              
              if (data.type === "ERROR") {
                alert(data.message);
                setLoading(false); 
                return;
              }
              
              if (data.type === "INFO") {
                  console.log(data.message);
                  return;
              }

              if (data.type === "CHAT") {
                setChatMessages(prev => [...prev, data]);
                return;
              }

              if (data.type === "RESULT") {
                setJudgeResult(data.message);
                return;
              }

              if (data.phase) {
                setPhase(data.phase);
                setLoading(false); 
                if (data.phase.startsWith("ACTION_")) setActionInput("");
              }
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
      } catch (err) {
        console.error(err);
        setLoading(false);
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

  useEffect(() => {
    if (phase === "VOTE_LEADER") setHasVoted(false);
    if (phase.startsWith("STRATEGY_")) setChatMessages([]);
  }, [phase]);

  const submitTopic = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/topic`, { title: topicInput });
  };

  const submitOpinion = async () => {
    if (!opinionInput.trim()) return;
    setLoading(true);
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/opinion`, {
      socketId: myId,
      opinion: opinionInput
    });
  };

  const submitVote = async () => {
    if (!selectedCandidate) return alert("투표할 팀원을 선택해주세요.");
    setHasVoted(true);
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/vote`, {
      voterId: myId,
      candidateId: selectedCandidate
    });
  };

  const submitSuggestChat = async () => {
    if (!chatInput.trim()) return;
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/suggest`, {
      socketId: myId,
      content: chatInput
    });
    setChatInput("");
  };

  const submitAction = async () => {
    if (!actionInput.trim()) return;
    setLoading(true);
    try {
        await axios.post(`http://localhost:8080/api/game/${lobbyId}/action`, {
          leaderId: myId,
          content: actionInput,
          team: myTeam
        });
    } catch (error) {
        console.error("Action submission failed:", error);
        setLoading(false);
        alert("발표 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const skipTimer = async () => {
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/skipTimer`);
  }

  const isStrategyPhase = phase.startsWith("STRATEGY_");
  const isActionPhase = phase.startsWith("ACTION_");
  const isMyTeamLeader = (myTeam === "team1" && team1Leader === myId) || (myTeam === "team2" && team2Leader === myId);
  
  const isMyTeamTurn = (phase.includes("TEAM1") && myTeam === "team1") || (phase.includes("TEAM2") && myTeam === "team2");
  const isMyTurn = isActionPhase && isMyTeamLeader && isMyTeamTurn;
  const isOtherTeamTurn = (phase.includes("TEAM1") && myTeam === "team2") || (phase.includes("TEAM2") && myTeam === "team1");


  const getCurrentStageName = () => {
      const suffix = phase.split("_")[2] || phase.split("_")[1];
      if (suffix === "ARGUMENT") return "입론(주장)";
      if (suffix === "EVIDENCE") return "근거 제시";
      if (suffix === "REBUTTAL") return "반론";
      return "진행";
  };

  const getPhaseTitle = () => {
    if (phase === "TOPIC_SELECT") return "주제 선정";
    if (phase === "GATHER_OPINIONS") return "의견 수렴 (AI 분석 중)";
    if (phase === "VOTE_LEADER") return "팀 대표(리더) 선출";
    if (isStrategyPhase) return `[작전 회의] ${getCurrentStageName()} 준비 중`;
    if (isActionPhase) {
        if (phase.includes("TEAM1")) return `[발표 진행] BLUE TEAM ${getCurrentStageName()} 중`;
        if (phase.includes("TEAM2")) return `[발표 진행] RED TEAM ${getCurrentStageName()} 중`;
        return `[발표 진행] ${getCurrentStageName()} 중`;
    }
    if (phase === "JUDGEMENT" || phase === "RESULT") return "AI 최종 심사";
    return "대기 중";
  };

  const myTeamPlayers = Object.entries(players).filter(([id, p]) => p.team === myTeam);
  
  const myTeamChatMessages = chatMessages.filter(msg => {
     const senderTeam = players[msg.sender]?.team;
     return senderTeam === myTeam;
  });

  return (
    <div css={s.container}>
      <div css={s.topBar}>
        <div css={s.phaseLabel}>{getPhaseTitle()}</div>
        <div css={s.timerBox}>
             <span css={s.timer}>⏳ {timeLeft}s</span>
             {(isStrategyPhase && isMyTeamLeader) || (isActionPhase && isMyTurn) ? (
               <button onClick={skipTimer} style={{marginLeft: 10, cursor: "pointer"}}>⏩ {isStrategyPhase ? "회의 종료 (Skip)" : "발표 종료 (Skip)"}</button>
             ) : null}
        </div>
      </div>

      {topic && <h2 css={s.topicText}>📢 {topic}</h2>}

      {phase === "TOPIC_SELECT" && (
        <div css={s.centerBox}>
          <h2>토론 주제를 정해주세요</h2>
          <input css={s.modalInput} value={topicInput} onChange={e => setTopicInput(e.target.value)} disabled={loading} placeholder="예: 민트초코는 맛있다" />
          <button css={s.modalSendBtn} onClick={submitTopic} disabled={loading}>
            {loading ? "AI 확인중..." : "시작"}
          </button>
        </div>
      )}

      {/* 2. 짧은 주장 작성 (AI 팀 분류용) */}
      {phase === "GATHER_OPINIONS" && (
        <div css={s.centerBox}>
          <h2>{topic}에 대한 짧은 생각은?</h2>
          <p>모든 참가자가 제출하면 AI가 의견을 분석하여 2개의 팀으로 나눕니다.</p>
          <textarea css={s.opinionArea} value={opinionInput} onChange={e => setOpinionInput(e.target.value)} disabled={myInfo.initialOpinion != null} />
          <button css={s.modalSendBtn} onClick={submitOpinion} disabled={myInfo.initialOpinion != null}>
            {myInfo.initialOpinion ? "제출 완료" : "제출"}
          </button>
          
          <div style={{marginTop: 20, fontSize: 14, color: '#666'}}>
             참가자 {Object.keys(players).length}명 중 
             {Object.values(players).filter(p => p.initialOpinion).length}명 제출 완료
          </div>
        </div>
      )}

      {phase === "VOTE_LEADER" && (
         <div css={s.centerBox}>
            <h2 style={{color: myTeam === 'team1' ? '#1E90FF' : '#FF4500'}}>
              당신은 {myTeam === 'team1' ? 'BLUE TEAM' : 'RED TEAM'} 입니다!
            </h2>
            <p>우리 팀을 대표하여 발표할 리더를 선택해주세요.</p>
            
            <div style={{
                display: 'grid', 
                gridTemplateColumns: myTeamPlayers.length > 5 ? '1fr 1fr' : '1fr',
                gap: '10px', 
                marginTop: '20px', 
                textAlign: 'left', 
                width: myTeamPlayers.length > 5 ? '500px' : '300px', 
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '10px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: '#fff'
            }}>
              {myTeamPlayers.map(([id, p]) => (
                <label key={id} style={{padding: '10px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                  <input 
                    type="radio" 
                    name="leaderVote" 
                    value={id} 
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    disabled={hasVoted}
                    style={{marginRight: '10px'}}
                  />
                  <span style={{flex: 1}}>{p.nickname} {id === myId ? " (나)" : ""}</span>
                </label>
              ))}
            </div>

            <button css={s.modalSendBtn} onClick={submitVote} disabled={hasVoted} style={{marginTop: '20px'}}>
              {hasVoted ? "투표 완료 (다른 팀원 대기 중...)" : "투표하기"}
            </button>
         </div>
      )}

      {(isStrategyPhase || isActionPhase) && (
        <div css={s.splitScreen}>
          
          <div css={s.teamSide(myTeam === 'team1')}>
            <h3 css={s.teamTitle(true)}>BLUE TEAM {team1Leader ? `(Leader: ${players[team1Leader]?.nickname})` : ""}</h3>
            
            <div css={s.historyBox}>
              {team1Claims.map((c, i) => (
                  <div key={i} css={s.bubble}>
                      <span style={{fontWeight:'bold', display:'block', marginBottom:4}}>
                          {i === 0 ? "🗣 입론" : i === 1 ? "🛡️ 근거" : "⚔️ 반론"}
                      </span>
                      {c}
                  </div>
              ))}
            </div>

            {myTeam === 'team1' && (
              <div style={{marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #ddd'}}>
                {isStrategyPhase && (
                  <div css={s.strategyBox}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '14px'}}>💬 팀 작전 회의 ({getCurrentStageName()} 준비)</h4>
                    <div style={{height: '100px', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '13px', textAlign: 'left'}}>
                      {myTeamChatMessages.map((msg, idx) => (
                        <div key={idx}><strong>{players[msg.sender]?.nickname}:</strong> {msg.content}</div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: '5px'}}>
                      <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && submitSuggestChat()} placeholder="팀원에게 의견 제안..." style={{flex: 1, padding: '5px'}}/>
                      <button onClick={submitSuggestChat}>전송</button>
                    </div>
                  </div>
                )}

                {isActionPhase && team1Leader === myId && isMyTurn && (
                   <div css={s.actionArea}>
                     <textarea 
                       placeholder={`[${getCurrentStageName()}] 우리 팀의 주장을 작성하여 발표하세요.`}
                       value={actionInput}
                       onChange={e => setActionInput(e.target.value)}
                       disabled={loading}
                       style={{width: '100%', height: '80px', marginBottom: '10px', opacity: loading ? 0.5 : 1}}
                     />
                     <button css={s.modalSendBtn} onClick={submitAction} disabled={loading}>
                        {loading ? "발표 제출 중..." : "발표하기"}
                     </button>
                   </div>
                )}
                {isActionPhase && team1Leader === myId && isOtherTeamTurn && (
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '20px'}}>
                     상대 팀(RED TEAM)이 발표 중입니다. 경청해주세요.
                   </div>
                )}
                {isActionPhase && team1Leader !== myId && isMyTeamTurn && (
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '20px'}}>
                     📢 리더가 <strong>{getCurrentStageName()}</strong> 내용을 작성 중입니다...
                   </div>
                )}
                 {isActionPhase && team1Leader !== myId && isOtherTeamTurn && (
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '20px'}}>
                     상대 팀(RED TEAM)이 발표 중입니다.
                   </div>
                )}
              </div>
            )}
            
            {myTeam === 'team2' && isActionPhase && phase.includes("TEAM1") && (
                <div style={{marginTop: 'auto', paddingTop: '15px'}}>
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '10px', background: '#e8f4f8', border: '1px solid #b3d4fc'}}>
                     📢 현재 BLUE TEAM 발표 진행 중
                   </div>
                </div>
            )}
          </div>

          <div css={s.teamSide(myTeam === 'team2')}>
            <h3 css={s.teamTitle(false)}>RED TEAM {team2Leader ? `(Leader: ${players[team2Leader]?.nickname})` : ""}</h3>
            
            <div css={s.historyBox}>
              {team2Claims.map((c, i) => (
                   <div key={i} css={s.bubble}>
                      <span style={{fontWeight:'bold', display:'block', marginBottom:4}}>
                          {i === 0 ? "🗣 입론" : i === 1 ? "🛡️ 근거" : "⚔️ 반론"}
                      </span>
                      {c}
                  </div>
              ))}
            </div>

            {myTeam === 'team2' && (
              <div style={{marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #ddd'}}>
                {isStrategyPhase && (
                  <div css={s.strategyBox}>
                    <h4 style={{margin: '0 0 10px 0', fontSize: '14px'}}>💬 팀 작전 회의 ({getCurrentStageName()} 준비)</h4>
                    <div style={{height: '100px', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '13px', textAlign: 'left'}}>
                      {myTeamChatMessages.map((msg, idx) => (
                        <div key={idx}><strong>{players[msg.sender]?.nickname}:</strong> {msg.content}</div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: '5px'}}>
                      <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && submitSuggestChat()} placeholder="팀원에게 의견 제안..." style={{flex: 1, padding: '5px'}}/>
                      <button onClick={submitSuggestChat}>전송</button>
                    </div>
                  </div>
                )}

                {isActionPhase && team2Leader === myId && isMyTurn && (
                   <div css={s.actionArea}>
                     <textarea 
                       placeholder={`[${getCurrentStageName()}] 우리 팀의 주장을 작성하여 발표하세요.`}
                       value={actionInput}
                       onChange={e => setActionInput(e.target.value)}
                       disabled={loading}
                       style={{width: '100%', height: '80px', marginBottom: '10px', opacity: loading ? 0.5 : 1}}
                     />
                     <button css={s.modalSendBtn} onClick={submitAction} disabled={loading}>
                        {loading ? "발표 제출 중..." : "발표하기"}
                     </button>
                   </div>
                )}
                {isActionPhase && team2Leader === myId && isOtherTeamTurn && (
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '20px'}}>
                     상대 팀(BLUE TEAM)이 발표 중입니다. 경청해주세요.
                   </div>
                )}
                {isActionPhase && team2Leader !== myId && isMyTeamTurn && (
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '20px'}}>
                     📢 리더가 <strong>{getCurrentStageName()}</strong> 내용을 작성 중입니다...
                   </div>
                )}
                {isActionPhase && team2Leader !== myId && isOtherTeamTurn && (
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '20px'}}>
                     상대 팀(BLUE TEAM)이 발표 중입니다.
                   </div>
                )}
              </div>
            )}
            
            {/* 내가 속하지 않은 팀(BLUE TEAM)이 발표 중일 때 시각적 표시 */}
            {myTeam === 'team1' && isActionPhase && phase.includes("TEAM2") && (
                <div style={{marginTop: 'auto', paddingTop: '15px'}}>
                   <div css={s.strategyBox} style={{textAlign: 'center', padding: '10px', background: '#fce8e6', border: '1px solid #f5c6cb'}}>
                     📢 현재 RED TEAM 발표 진행 중
                   </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* 6. AI 최종 판정 */}
      {(phase === "JUDGEMENT" || phase === "RESULT") && (
        <div css={s.resultBox}>
          <h2>🏆 AI 심사 결과</h2>
          <div style={{whiteSpace: 'pre-wrap', textAlign: 'left', background: '#f0f0f0', padding: 20, borderRadius: 8}}>
            {judgeResult || "AI가 양 팀의 토론 내용을 바탕으로 심사 중입니다. 잠시만 기다려주세요..."}
          </div>
          <button onClick={() => navigate("/")} style={{marginTop: 20, padding: '10px 20px', cursor: 'pointer'}}>
            로비로 돌아가기
          </button>
        </div>
      )}

    </div>
  );
}