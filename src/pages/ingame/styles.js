import { css } from "@emotion/react";

export const container = css`
  width: 100%;
  height: 100vh;
  background: #f4f4f2;
  position: relative;
  overflow: hidden;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const topBar = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 70px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  position: relative;
`;

export const phaseLabel = css`
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
`;

export const timerBox = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const timer = css`
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
`;

export const topicText = css`
  text-align: center;
  font-size: 28px;
  margin: 20px 0;
  color: #34495e;
  font-weight: 800;
`;

export const centerBox = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200px);
  gap: 20px;
  text-align: center;

  h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  p {
    color: #666;
    margin-bottom: 15px;
  }
`;

export const modalInput = css`
  width: 400px;
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #ddd;
  font-size: 18px;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #6a5c3a;
  }
`;

export const opinionArea = css`
  width: 500px;
  height: 180px;
  padding: 20px;
  border-radius: 15px;
  border: 2px solid #bdc3c7;
  font-size: 16px;
  resize: none;
  line-height: 1.6;
  &:focus {
    outline: none;
    border-color: #6a5c3a;
  }
`;

export const modalSendBtn = css`
  padding: 15px 40px;
  border-radius: 10px;
  border: none;
  background: #6a5c3a;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  &:hover {
    background: #54492e;
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    background: #999;
    cursor: not-allowed;
  }
`;

export const splitScreen = css`
  display: flex;
  height: calc(100vh - 180px);
  padding: 0 20px 20px 20px;
  gap: 20px;
`;

export const teamSide = (isMyTeam) => css`
  flex: 1;
  background: ${isMyTeam ? "rgba(255, 255, 255, 0.95)" : "rgba(240, 240, 240, 0.7)"};
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  padding: 25px;
  border: ${isMyTeam ? "4px solid #3498db" : "1px solid #ddd"};
  box-shadow: ${isMyTeam ? "0 10px 30px rgba(52, 152, 219, 0.15)" : "none"};
  transition: all 0.3s ease;
`;

export const teamTitle = (isBlue) => css`
  color: ${isBlue ? "#2980b9" : "#c0392b"};
  font-size: 22px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${isBlue ? "#ebf5fb" : "#fdedec"};
`;

export const historyBox = css`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  /* 스크롤바 커스텀 */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
`;

export const bubble = css`
  background: white;
  padding: 15px 20px;
  border-radius: 18px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  line-height: 1.6;
  font-size: 15px;
  border: 1px solid #f0f0f0;
  white-space: pre-wrap;
`;

export const strategyBox = css`
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

export const actionArea = css`
  margin-top: 15px;
  textarea {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: 2px solid #3498db;
    font-size: 15px;
    resize: none;
    &:focus { outline: none; }
  }
`;
export const resultBox = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 1000;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;

  h2 {
    font-size: 28px;
    color: #6a5c3a;
    margin-bottom: 20px;
  }
`;

export const logoBg = css`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 150px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.02);
  pointer-events: none;
`;

export const turnBadge = css`
  background: #333;
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 10px;
`;