import { css } from "@emotion/react";

/* ===== 기본 ===== */
export const container = css`
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #f0ece3, #d9d6cc);
  overflow: hidden;
  user-select: none;
`;

export const logoBg = css`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 120px;
  font-weight: 900;
  color: rgba(200, 200, 200, 0.18);
  pointer-events: none;
`;

/* ===== 상단 ===== */
export const topBar = css`
  position: absolute;
  top: 48px;
  left: 24px;
  z-index: 5;
`;

export const backButton = css`
  padding: 8px 12px;
  background: rgba(210, 200, 180, 0.8);
  border-radius: 8px;
  cursor: pointer;
  border: none;
`;

/* ===== 게임 시작 버튼 ===== */
export const startButton = css`
  position: absolute;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  padding: 18px 32px;
  font-size: 22px;
  font-weight: bold;
  background: rgba(191, 167, 111, 0.95);
  color: #fff;
  border-radius: 12px;
  border: none;
  cursor: pointer;

  &:disabled {
    background: rgba(160, 150, 120, 0.6);
    cursor: not-allowed;
  }
`;

/* ===== 참가자 ===== */
export const sidebar = css`
  position: absolute;
  right: 0;
  top: 10px;
  width: 240px;
  height: calc(100% - 10px);
  background: rgba(250, 245, 235, 0.95);
  padding: 16px;

  display: flex;
  flex-direction: column-reverse;
  gap: 14px;

  overflow-y: auto;
  z-index: 1;
`;

export const participantItem = css`
  display: flex;
  gap: 10px;
  background: rgba(215, 205, 185, 0.6);
  padding: 6px 8px;
  border-radius: 8px;
`;

export const avatarCircle = css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #c4a669;
`;

export const participantName = css`
  font-size: 18px;
`;

/* ===== 채팅 ===== */
export const chatBox = (open) => css`
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 360px;
  background: rgba(120, 120, 120, 0.55);
  border-radius: 12px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  z-index: 5;
  user-select: text;
`;

export const chatMessages = (open) => css`
  height: ${open ? "200px" : "0px"};
  padding: ${open ? "12px" : "0 12px"};
  overflow-y: auto;
  color: #fff;
  font-size: 14px;
  transition: height 0.25s, padding 0.25s;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.35);
    border-radius: 4px;
  }
`;

export const chatMessage = css`
  margin-bottom: 6px;
`;

export const chatInputWrapper = css`
  display: flex;
  background: rgba(210, 190, 140, 0.95);
  border-radius: 0 0 12px 12px;
`;

export const chatInput = css`
  flex: 1;
  padding: 10px;
  background: transparent;
  border: none;
  outline: none;
  color: #4a3f2a;
`;

export const chatSendButton = css`
  padding: 0 16px;
  background: rgba(191, 167, 111, 1);
  color: #fff;
  border: none;
  cursor: pointer;
`;

/* ===== 로딩 ===== */
export const loadingContainer = css`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const loadingSpinner = css`
  width: 48px;
  height: 48px;
  border: 5px solid #ddd;
  border-top: 5px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const loadingText = css`
  margin-top: 16px;
  font-size: 1.1rem;
  color: #555;
`;

export const gameCode = css`
  user-select: text;
`

/* ===== 카운트다운 오버레이 ===== */
export const countdownOverlay = css`
  position: fixed;   /* 🔥 핵심 */
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 96px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.35);

  z-index: 9999;
`;
