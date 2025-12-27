/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import * as s from "./styles";
import { PHASES } from "../../constants/phases";

export default function InGame() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];

  const [timeLeft, setTimeLeft] = useState(phase.time);

  const [topic, setTopic] = useState("");
  const [topicApproved, setTopicApproved] = useState(null);

  const [claims, setClaims] = useState({ team1: [], team2: [] });
  const [currentText, setCurrentText] = useState("");

  /* ================= 타이머 ================= */
  useEffect(() => {
    if (timeLeft <= 0) {
      nextPhase();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(phase.time);
  }, [phaseIndex]);

  /* ================= 단계 이동 ================= */
  const nextPhase = () => {
    setCurrentText("");
    setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1));
  };

  /* ================= 역할 판단 ================= */
  const isTeam1Turn = phase.key.includes("TEAM1");
  const isTeam2Turn = phase.key.includes("TEAM2");

  /* ================= Gemini API 토론 주제 요청 ================= */
  const fetchTopicFromGemini = async () => {
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gemini-1.5",
          messages: [
            {
              role: "user",
              content: "토론하기 좋은 흥미로운 주제를 추천해줘. 한 문장으로."
            }
          ],
          temperature: 0.7
        }),
      });

      const data = await response.json();
      if (data?.output?.[0]?.content?.[0]?.text) {
        setTopic(data.output[0].content[0].text);
        setTopicApproved(true);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setTopicApproved(false);
    }
  };

  /* ================= 주제 제출 ================= */
  const submitTopic = () => {
    if (topic.length < 5) {
      setTopicApproved(false);
      return;
    }

    setTopicApproved(true);
    nextPhase();
  };

  /* ================= 발언 제출 ================= */
  const submitClaim = (team) => {
    if (!currentText.trim()) return;

    setClaims((prev) => ({
      ...prev,
      [team]: [...prev[team], currentText],
    }));

    nextPhase();
  };

  /* ================= useEffect: TOPIC_SELECT 단계에서 Gemini 호출 ================= */
  useEffect(() => {
    if (phase.key === "TOPIC_SELECT" && !topic) {
      fetchTopicFromGemini();
    }
  }, [phase.key]);

  return (
    <div css={s.container}>
      <div css={s.logoBg}>Agora</div>

      <div css={s.timer}>
        ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </div>

      <div css={s.phaseLabel}>{phase.label}</div>

      {/* ===== 주제 선정 ===== */}
      {phase.key === "TOPIC_SELECT" && (
        <div css={s.centerBox}>
          <h2>토론 주제 입력</h2>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="주제를 입력하세요"
          />
          <button onClick={submitTopic}>제출</button>

          {topicApproved === false && (
            <p css={s.errorText}>부적절한 주제입니다.</p>
          )}
        </div>
      )}

      {/* ===== 토론 화면 ===== */}
      {phase.key !== "TOPIC_SELECT" && phase.key !== "JUDGEMENT" && (
        <div css={s.splitScreen}>
          <div css={s.teamSide(isTeam1Turn)}>
            <h2>팀 1</h2>
            {isTeam1Turn ? (
              <div css={s.claimCard}>
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                />
                <button onClick={() => submitClaim("team1")}>제출</button>
              </div>
            ) : (
              <div css={s.waitingText}>팀 2 발언 중</div>
            )}
          </div>

          <div css={s.teamSide(isTeam2Turn)}>
            <h2>팀 2</h2>
            {isTeam2Turn ? (
              <div css={s.claimCard}>
                <textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                />
                <button onClick={() => submitClaim("team2")}>제출</button>
              </div>
            ) : (
              <div css={s.waitingText}>팀 1 발언 중</div>
            )}
          </div>
        </div>
      )}

      {/* ===== 판정 ===== */}
      {phase.key === "JUDGEMENT" && (
        <div css={s.centerBox}>
          <h2>토론 종료</h2>
          <pre>{JSON.stringify(claims, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
