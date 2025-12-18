/** @jsxImportSource @emotion/react */
import React from "react";
import * as s from "./styles";

export default function DebateLobby({
  participants = [],
  onStartGame,
  onBack,
  gameStarted
}) {
  return (
    <div css={s.container}>
      {/* 반투명 로고 */}
      <div css={s.logoBg}>Agora</div>

      {/* 뒤로 가기 버튼 */}
      <div css={s.topBar}>
        <button css={s.backButton} onClick={onBack}>
          ← 뒤로가기
        </button>
      </div>

      {/* 게임 시작 버튼 */}
      <button css={s.startButton} onClick={onStartGame}>
        {gameStarted ? "게임 시작됨" : "게임 시작"}
      </button>

      {/* 참가자 목록 */}
      <div css={s.sidebar}>
        {participants.map((p, index) => (
          <div key={p.id ?? index} css={s.participantItem}>
            <div css={s.avatarCircle}>
              {p.avatar ? (
                <img
                  src={p.avatar}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                />
              ) : (
                p.name.charAt(0)
              )}
            </div>
            <div css={s.participantName}>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
