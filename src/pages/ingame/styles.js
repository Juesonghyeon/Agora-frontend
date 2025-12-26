import { css } from "@emotion/react";

export const container = css`
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #f0ece3, #d9d6cc);
  position: relative;
  overflow: hidden;
`;

/* ===== 배경 로고 ===== */
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
  user-select: none;
  z-index: 0;
`;

/* ===== 상단 UI ===== */
export const timer = css`
  position: absolute;
  top: 20px;
  right: 32px;
  font-size: 18px;
  font-weight: bold;
  color: #4b4532;
  z-index: 2;
`;

export const phaseLabel = css`
  position: absolute;
  top: 20px;
  left: 32px;
  font-size: 18px;
  font-weight: bold;
  color: #4b4532;
  z-index: 2;
`;

/* ===== 중앙 박스 ===== */
export const centerBox = css`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;

  h2 {
    color: #3f3a2a;
  }

  input {
    width: 320px;
    padding: 10px 14px;
    border-radius: 12px;
    border: none;
    font-size: 16px;
  }

  button {
    padding: 10px 24px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    background: #6a5c3a;
    color: white;
    font-weight: bold;
  }
`;

export const errorText = css`
  color: #a33;
  font-weight: bold;
`;

/* ===== 양팀 화면 ===== */
export const splitScreen = css`
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
`;

export const teamSide = (active) => css`
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.4s;

  filter: ${active ? "none" : "blur(2px)"};
  opacity: ${active ? 1 : 0.6};

  h2 {
    margin-bottom: 20px;
    color: #3f3a2a;
  }
`;

export const claimCard = css`
  width: 80%;
  background: rgba(250, 245, 235, 0.95);
  padding: 24px;
  border-radius: 16px;
  animation: slide 0.4s ease;

  textarea {
    width: 100%;
    height: 160px;
    border: none;
    resize: none;
    background: transparent;
    font-size: 16px;
    outline: none;
  }

  button {
    margin-top: 12px;
    padding: 10px;
    width: 100%;
    border-radius: 12px;
    border: none;
    background: #6a5c3a;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }

  @keyframes slide {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
`;

export const waitingText = css`
  font-size: 20px;
  font-weight: bold;
  color: #6a5c3a;
`;
