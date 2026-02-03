import { css } from "@emotion/react";

export const container = css`
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #f0ece3, #d9d6cc);
  position: relative;
  overflow: hidden;
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
  z-index: 0;
`;

/* 상단 UI */
export const timer = css`
  font-size: 24px;
  font-weight: bold;
  color: #d32f2f;
`;

export const phaseLabel = css`
  font-size: 20px;
  font-weight: bold;
  color: #4b4532;
`;

/* 주제 텍스트 (잘 보이게) */
export const topicText = css`
  position: absolute;
  top: 80px;
  width: 100%;
  text-align: center;
  color: #2c2c2c;
  font-size: 36px;
  font-weight: 800;
  text-shadow: 2px 2px 0px rgba(255,255,255,0.6);
  z-index: 5;
`;

/* 중앙 박스 */
export const centerBox = css`
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  
  h2 { color: #3f3a2a; }
`;

export const modalInput = css`
  width: 320px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #aaa;
  font-size: 16px;
`;

export const modalSendBtn = css`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  background: #6a5c3a;
  color: white;
  font-weight: bold;
  cursor: pointer;
  &:disabled { background: #999; }
`;

/* 분할 화면 */
export const splitScreen = css`
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  padding-top: 100px;
`;

/* 팀 영역 (Active 상태에 따라 강조) */
export const teamSide = (isActive) => css`
  flex: 1;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: 0.3s;
  
  opacity: ${isActive ? 1 : 0.5}; /* 내 턴 아니면 흐리게 */
  transform: ${isActive ? "scale(1.02)" : "scale(0.98)"};
`;

/* 팀명 입력 (수정 가능) */
export const teamNameInput = (isBlue) => css`
  font-size: 32px;
  font-weight: 900;
  color: ${isBlue ? "#2a4a8b" : "#a83232"};
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  text-align: center;
  margin-bottom: 10px;
  width: 200px;
  &:focus {
    outline: none;
    border-bottom: 2px solid #555;
  }
`;

export const turnBadge = css`
  background: #333;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 15px;
  font-weight: bold;
`;

/* 카드 스타일 */
export const claimCard = (isActive) => css`
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 16px;
  box-shadow: ${isActive ? "0 10px 25px rgba(0,0,0,0.2)" : "none"};
  border: ${isActive ? "3px solid #6a5c3a" : "1px solid #ddd"};
  
  textarea {
    width: 100%;
    height: 150px;
    border: none;
    resize: none;
    background: transparent;
    font-size: 18px;
    outline: none;
  }

  button {
    margin-top: 12px;
    padding: 12px;
    width: 100%;
    border-radius: 8px;
    border: none;
    background: ${isActive ? "#6a5c3a" : "#ccc"};
    color: white;
    font-weight: bold;
    cursor: ${isActive ? "pointer" : "not-allowed"};
  }
`;

export const resultBox = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  font-size: 24px;
  font-weight: bold;
  color: #333;
  z-index: 100;
  text-align: center;
  border: 4px solid #6a5c3a;
`;

