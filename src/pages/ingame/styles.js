import { css } from "@emotion/react";

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














export const container = css`
  width: 100%;
  height: 100vh;
  background: #f4f4f2;
  position: relative;
  overflow: hidden;
  font-family: 'Pretendard', sans-serif;
`;

export const logoBg = css`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 150px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.03);
  pointer-events: none;
`;

export const timer = css` font-size: 24px; font-weight: bold; color: #e74c3c; `;
export const phaseLabel = css` font-size: 20px; font-weight: bold; color: #2c3e50; `;
export const topicText = css` text-align: center; font-size: 32px; margin-top: 20px; color: #34495e; `;

export const centerBox = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70%;
  gap: 20px;
`;

export const opinionArea = css`
  width: 400px;
  height: 150px;
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #bdc3c7;
  font-size: 16px;
  resize: none;
`;

export const voteGrid = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

export const voteBtn = css`
  padding: 15px 30px;
  border-radius: 8px;
  border: 1px solid #3498db;
  background: white;
  cursor: pointer;
  &:hover { background: #ebf5fb; }
`;

export const splitScreen = css`
  display: flex;
  height: calc(100vh - 150px);
  padding: 20px;
  gap: 20px;
`;

export const teamSide = (isMyTeam) => css`
  flex: 1;
  background: ${isMyTeam ? "rgba(255,255,255,0.8)" : "rgba(240,240,240,0.5)"};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: ${isMyTeam ? "2px solid #3498db" : "1px solid #ccc"};
`;

export const teamTitle = (isBlue) => css`
  color: ${isBlue ? "#2980b9" : "#c0392b"};
  text-align: center;
  margin-bottom: 20px;
`;

export const historyBox = css`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`;

export const bubble = css`
  background: white;
  padding: 12px 18px;
  border-radius: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  line-height: 1.5;
`;

export const actionArea = css`
  margin-top: 20px;
  textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
    resize: none;
  }
  button {
    width: 100%;
    margin-top: 10px;
    padding: 12px;
    background: #2c3e50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
`;

export const resultBox = css`
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  text-align: center;
  z-index: 1000;
  width: 500px;
`;
