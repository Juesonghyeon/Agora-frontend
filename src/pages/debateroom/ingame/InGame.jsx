/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import * as s from "./styles";

/* ================= 토론 단계 정의 ================= */
const PHASES = [
  "TOPIC_SELECT",

  "TEAM1_CLAIM",
  "TEAM2_CLAIM",

  "REPRESENTATIVE_VOTE",

  "TEAM1_OPENING",
  "TEAM2_MEETING",
  "TEAM2_OPENING",
  "TEAM1_MEETING",

  "TEAM1_ARGUMENT",
  "TEAM2_MEETING_2",
  "TEAM2_ARGUMENT",
  "TEAM1_MEETING_2",

  "TEAM2_REBUTTAL",
  "TEAM1_DEFENSE",
  "TEAM1_REBUTTAL",
  "TEAM2_DEFENSE",

  "JUDGEMENT",
];

export default function InGame() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];

  const [topic, setTopic] = useState("");
  const [topicApproved, setTopicApproved] = useState(null);

  const [claims, setClaims] = useState({
    team1: [],
    team2: [],
  });

  const [currentText, setCurrentText] = useState("");

  const isTeam1Turn = phase.includes("TEAM1");
  const isTeam2Turn = phase.includes("TEAM2");

  /* ================= 단계 이동 ================= */
  const nextPhase = () => {
    setCurrentText("");
    setPhaseIndex((i) => i + 1);
  };

  /* ================= 주제 제출 (GPT 판단) ================= */
  const submitTopic = async () => {
    // 실제로는 GPT 호출
    const gptResult = "O"; // mock

    if (gptResult === "O") {
      setTopicApproved(true);
      nextPhase();
    } else {
      setTopicApproved(false);
    }
  };

  /* ================= 주장 제출 ================= */
  const submitClaim = (team) => {
    if (!currentText.trim()) return;

    setClaims((prev) => ({
      ...prev,
      [team]: [...prev[team], currentText],
    }));

    nextPhase();
  };

  /* ================= GEMINI 판별 ================= */
  const judgeDebate = async () => {
    const debatePayload = {
      topic,
      team1: claims.team1,
      team2: claims.team2,
    };

    console.log("📌 GEMINI 판별 데이터", debatePayload);
    // 여기서 백엔드로 POST
  };

  return (
    <div css={s.container}>
      <div css={s.logoBg}>Agora</div>

      {/* ================= 주제 선정 ================= */}
      {phase === "TOPIC_SELECT" && (
        <div css={s.centerBox}>
          <h2>토론 주제 입력</h2>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="주제를 입력하세요"
          />
          <button onClick={submitTopic}>주제 제출</button>

          {topicApproved === false && (
            <p css={s.errorText}>부적합한 주제입니다.</p>
          )}
        </div>
      )}

      {/* ================= 토론 화면 ================= */}
      {phase !== "TOPIC_SELECT" && phase !== "JUDGEMENT" && (
        <div css={s.splitScreen}>
          {/* 팀1 */}
          <div css={s.teamSide(isTeam1Turn)}>
            <h2>팀 1</h2>

            {isTeam1Turn ? (
              <div css={s.claimCard}>
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="팀 1 발언 입력"
                />
                <button onClick={() => submitClaim("team1")}>
                  제출
                </button>
              </div>
            ) : (
              <div css={s.waitingText}>
                팀2가 자신의 주장을 정하고 있습니다.
              </div>
            )}
          </div>

          {/* 팀2 */}
          <div css={s.teamSide(isTeam2Turn)}>
            <h2>팀 2</h2>

            {isTeam2Turn ? (
              <div css={s.claimCard}>
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="팀 2 발언 입력"
                />
                <button onClick={() => submitClaim("team2")}>
                  제출
                </button>
              </div>
            ) : (
              <div css={s.waitingText}>
                팀1이 자신의 주장을 정하고 있습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 판별 ================= */}
      {phase === "JUDGEMENT" && (
        <div css={s.centerBox}>
          <h2>토론 종료</h2>
          <button onClick={judgeDebate}>AI 판별 요청</button>
        </div>
      )}
    </div>
  );
}
