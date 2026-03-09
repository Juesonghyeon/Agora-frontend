/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef } from "react";
import * as s from "./styles"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DEBATE_STAGES = [
  { id: "OPENING", label: "주장", desc: "본인의 핵심 주장을 먼저 펼치세요." },
  { id: "EVIDENCE", label: "근거", desc: "주장을 뒷받침할 구체적인 근거를 제시하세요." },
  { id: "REBUTTAL", label: "반론/변론", desc: "AI의 논리를 반박하고, 당신의 논리를 방어하세요." },
  { id: "CLOSING", label: "최종발언", desc: "마지막으로 논리를 정리하여 쐐기를 박으세요." }
];

export default function AIDiscussion() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("TOPIC_SELECT"); 
  const [topic, setTopic] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [judgeResult, setJudgeResult] = useState("");
  const scrollRef = useRef(null);

  // 메시지 추가 시 하단 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  // 1. 토론 시작
  const handleStartDiscussion = async () => {
    if (!topicInput.trim()) return alert("주제를 입력해주세요.");
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:8080/api/ai/validate-topic`, { topic: topicInput });
      if (!res.data.isValid) return alert("부적절하거나 토론이 불가능한 주제입니다.");
      
      setTopic(topicInput);
      setPhase("DISCUSSING");
      setChatMessages([{ sender: "ai", content: `안녕하세요! [${topicInput}] 주제로 토론을 시작하죠. 먼저 본인의 [주장]을 들려주세요.` }]);
    } catch (err) {
      alert("서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  // 2. 메시지 전송
  const handleSendMessage = async () => {
    if (!chatInput.trim() || loading) return;

    const userMsg = { sender: "user", content: chatInput };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput("");
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:8080/api/ai/chat`, {
        topicTitle: topic,
        difficulty: "쉬움",
        history: newHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })),
        stage: DEBATE_STAGES[stageIdx].id
      });

      setChatMessages(prev => [...prev, { sender: "ai", content: res.data.content }]);
      if (stageIdx < DEBATE_STAGES.length - 1) setStageIdx(prev => prev + 1);
    } catch (err) {
      alert("AI 응답 오류");
    } finally {
      setLoading(false);
    }
  };

  // 3. 토론 종료 및 판정
  const handleFinishDiscussion = async () => {
    setLoading(true);
    setPhase("RESULT");
    try {
      const res = await axios.post(`http://localhost:8080/api/ai/judge`, {
        topicTitle: topic,
        history: chatMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }))
      });
      setJudgeResult(res.data.content);
    } catch (err) {
      setJudgeResult("판정 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 4. 메인으로 돌아가기 (삭제 로직 포함)
  const handleGoMain = async () => {
    setLoading(true);
    try {
      // 백엔드에 토론 종료 및 삭제 요청
      await axios.delete(`http://localhost:8080/api/ai/delete-topic`, {
        params: { title: topic }
      });
    } catch (err) {
      console.error("주제 삭제 실패:", err);
    } finally {
      setPhase("TOPIC_SELECT");
      setTopic("");
      setChatMessages([]);
      setStageIdx(0);
      setLoading(false);
      navigate("/main"); // 메인 화면 경로로 이동
    }
  };

  return (
    <div css={s.container}>
      {phase === "TOPIC_SELECT" ? (
        <div css={s.centerBox}>
          <h2>AI 논리 대결 1:1</h2>
          <p style={{color: '#888', marginBottom: '20px'}}>부적절한 주제는 AI 판사에 의해 거절될 수 있습니다.</p>
          <input css={s.modalInput} value={topicInput} onChange={(e) => setTopicInput(e.target.value)} placeholder="예: 아이언맨 vs 배트맨" />
          <button css={s.modalSendBtn} onClick={handleStartDiscussion} disabled={loading}>{loading ? "검증 중..." : "토론 시작"}</button>
        </div>
      ) : phase === "DISCUSSING" ? (
        <>
          <div css={s.topBar}>
            <div css={s.phaseLabel}>단계: {DEBATE_STAGES[stageIdx].label} ({stageIdx + 1}/4)</div>
            {stageIdx === 3 && chatMessages.length >= 8 && (
              <button css={s.modalSendBtn} style={{background: '#e67e22'}} onClick={handleFinishDiscussion}>최종 판정 받기</button>
            )}
          </div>
          <h2 css={s.topicText}>📢 {topic}</h2>
          <div css={s.splitScreen}>
            <div css={s.teamSide(false)}>
              <h3 css={s.teamTitle(false)}>AI DEBATER</h3>
              <div css={s.historyBox} ref={scrollRef}>
                {chatMessages.filter(m => m.sender === 'ai').map((msg, i) => <div key={i} css={s.bubble}>{msg.content}</div>)}
                
                {/* AI 타이핑 애니메이션 적용 */}
                {loading && (
                  <div css={s.typingContainer}>
                    <div css={s.dot("0s")} />
                    <div css={s.dot("0.2s")} />
                    <div css={s.dot("0.4s")} />
                  </div>
                )}
              </div>
            </div>
            <div css={s.teamSide(true)}>
              <h3 css={s.teamTitle(true)}>나 (USER)</h3>
              <div css={s.historyBox}>
                {chatMessages.filter(m => m.sender === 'user').map((msg, i) => <div key={i} css={s.bubble}>{msg.content}</div>)}
              </div>
              <div css={s.strategyBox}>
                <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={DEBATE_STAGES[stageIdx].desc} disabled={loading} style={{width:'100%', height:'80px', padding:'10px', borderRadius:'10px', border:'1px solid #ddd'}} />
                <button css={s.modalSendBtn} onClick={handleSendMessage} disabled={loading || !chatInput.trim()} style={{width:'100%', marginTop:'10px'}}>{loading ? "AI 분석 중..." : "발언 전송"}</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div css={s.resultBox}>
          <h2>🏆 AI 토론 판정서</h2>
          <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: '#fdfdfd', padding: 30, borderRadius: 20, lineHeight: '1.8', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            {loading ? "전체 토론 내용을 정밀 심사 중입니다..." : judgeResult}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button css={s.modalSendBtn} onClick={() => window.location.reload()}>다시 하기</button>
            <button css={s.modalSendBtn} style={{ background: '#2c3e50' }} onClick={handleGoMain}>확인 및 메인으로</button>
          </div>
        </div>
      )}
    </div>
  );
}