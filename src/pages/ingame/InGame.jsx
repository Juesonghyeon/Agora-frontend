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
  const [myId, setMyId] = useState(""); 
  const [team1Leader, setTeam1Leader] = useState("");
  const [team2Leader, setTeam2Leader] = useState("");
  const [team1Claims, setTeam1Claims] = useState([]);
  const [team2Claims, setTeam2Claims] = useState([]);

  // 입력값들
  const [topicInput, setTopicInput] = useState("");
  const [opinionInput, setOpinionInput] = useState("");
  
  // [수정] 양쪽 팀 입력창 분리 (슈퍼 유저 편의성)
  const [actionInput1, setActionInput1] = useState(""); // 블루팀용
  const [actionInput2, setActionInput2] = useState(""); // 레드팀용

  const [loading, setLoading] = useState(false);
  const [judgeResult, setJudgeResult] = useState("");

  const stompClient = useRef(null);

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
            const sessionId = socket._transport.url.split("/").reverse()[1];
            setMyId(sessionId);

            // [중요] 슈퍼 유저 테스트를 위해 닉네임 하드코딩 가능, 혹은 입력받기
            // 여기서는 기존 로직 유지하되, 만약 특정 조건이면 서버에서 juice080321로 인식하도록 해야 함.
            // *주의*: 서버는 sessionId를 키로 씁니다. juice080321로 테스트하려면 
            // 1. 소켓 연결 시 헤더를 조작하거나 
            // 2. 이 join API에서 닉네임만 보내는 게 아니라 socketId를 속일 수 없으니
            // ==> *서버 코드를 보면 sessionId를 키로 씁니다.* // ==> 로컬 테스트 시 sessionId가 매번 변하므로, 
            // ==> **GameService의 joinPlayer에서 nickname이 "juice080321"이면 players 맵의 키를 "juice080321"로 강제 저장하도록 수정하거나**,
            // ==> **가장 쉬운 방법**: 아래 axios.post join에서 socketId를 보내는데, 
            // ==> 서버 GameService.joinPlayer가 req.getSocketId()를 키로 씁니다.
            // ==> 따라서 클라이언트에서 socketId를 "juice080321"로 보내버리면 됩니다.
            
            // 슈퍼 유저 테스트용 ID 스위칭 (실제로는 로그인 정보 등 사용)
            const isSuperUser = true; // 테스트 할 때 true로 변경하세요!
            const realSocketId = isSuperUser ? "juice080321" : sessionId;
            
            // 내 ID 상태 업데이트 (그래야 화면이 정상 작동)
            setMyId(realSocketId); 

            axios.post(`http://localhost:8080/api/game/${numericId}/join`, {
              nickname: isSuperUser ? "Admin_Juice" : `플레이어_${sessionId.substring(0, 4)}`,
              socketId: realSocketId 
            });

            client.subscribe(`/topic/game/${numericId}`, (message) => {
              const data = JSON.parse(message.body);
              
              if (data.type === "ERROR") return alert(data.message);
              if (data.type === "RESULT") return setJudgeResult(data.message);

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
    // 성공 여부는 소켓으로 오므로 loading 해제는 소켓 수신부에서
  };

  const submitOpinion = async () => {
    if (!opinionInput.trim()) return;
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/opinion`, {
      socketId: myId,
      opinion: opinionInput
    });
    setOpinionInput("");
    setLoading(true);
  };

  const handleVote = async (candidateId) => {
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/vote`, {
      voterId: myId,
      candidateId: candidateId
    });
  };

  // [수정] 팀을 지정해서 발언 제출
  const submitAction = async (content, teamName) => {
    if (!content.trim()) return;
    await axios.post(`http://localhost:8080/api/game/${lobbyId}/action`, {
      leaderId: myId,
      content: content,
      team: teamName // "team1" or "team2"
    });
    // 입력창 초기화
    if (teamName === "team1") setActionInput1("");
    if (teamName === "team2") setActionInput2("");
  };

  // --- 렌더링 헬퍼 ---
  const myTeam = myInfo.team; // "team1", "team2", "BOTH"
  
  // 내가 해당 팀을 컨트롤 할 수 있는가?
  const canControlTeam1 = (myTeam === 'team1' || myTeam === 'BOTH') && (team1Leader === myId);
  const canControlTeam2 = (myTeam === 'team2' || myTeam === 'BOTH') && (team2Leader === myId);
  
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

      {/* 2. 의견 제출 단계 */}
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
          <div css={s.teamSide(true)}>
            <h3 css={s.teamTitle(true)}>BLUE TEAM {team1Leader === myId && "(나)"}</h3>
            <div css={s.historyBox}>
              {team1Claims.map((c, i) => <div key={i} css={s.bubble}>{c}</div>)}
            </div>
            {canControlTeam1 && (
              <div css={s.actionArea}>
                <textarea 
                  value={actionInput1} 
                  onChange={e => setActionInput1(e.target.value)} 
                  placeholder="[블루팀] 의견을 입력하세요..." 
                />
                <button onClick={() => submitAction(actionInput1, "team1")}>발언 제출</button>
              </div>
            )}
          </div>

          {/* 팀 2 (우) */}
          <div css={s.teamSide(false)}>
            <h3 css={s.teamTitle(false)}>RED TEAM {team2Leader === myId && "(나)"}</h3>
            <div css={s.historyBox}>
              {team2Claims.map((c, i) => <div key={i} css={s.bubble}>{c}</div>)}
            </div>
            {canControlTeam2 && (
              <div css={s.actionArea}>
                <textarea 
                  value={actionInput2} 
                  onChange={e => setActionInput2(e.target.value)} 
                  placeholder="[레드팀] 의견을 입력하세요..." 
                />
                <button onClick={() => submitAction(actionInput2, "team2")}>발언 제출</button>
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