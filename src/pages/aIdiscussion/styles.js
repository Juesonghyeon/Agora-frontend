import { css, keyframes } from "@emotion/react";

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
    color: #444;
  }
`;

export const modalInput = css`
  width: 450px;
  padding: 18px;
  border-radius: 15px;
  border: 2px solid #ddd;
  font-size: 18px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  &:focus {
    outline: none;
    border-color: #bfa76f;
    box-shadow: 0 4px 20px rgba(191, 167, 111, 0.2);
  }
`;

export const modalSendBtn = css`
  padding: 15px 40px;
  border-radius: 12px;
  border: none;
  background: #6a5c3a;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #54492e;
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const splitScreen = css`
  display: flex;
  height: calc(100vh - 180px);
  padding: 0 25px 25px 25px;
  gap: 25px;
`;

export const teamSide = (isUser) => css`
  flex: 1;
  background: ${isUser ? "rgba(255, 255, 255, 0.95)" : "rgba(248, 249, 250, 0.9)"};
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  padding: 30px;
  border: ${isUser ? "3px solid #bfa76f" : "1px solid #e0e0e0"};
  box-shadow: ${isUser ? "0 15px 35px rgba(191, 167, 111, 0.15)" : "0 5px 15px rgba(0,0,0,0.03)"};
  transition: all 0.3s ease;
`;

export const teamTitle = (isUser) => css`
  color: ${isUser ? "#6a5c3a" : "#555"};
  font-size: 20px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${isUser ? "#f4f1ea" : "#eee"};
`;

export const historyBox = css`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
`;

export const bubble = css`
  background: white;
  padding: 18px 22px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  line-height: 1.7;
  font-size: 15px;
  border: 1px solid #f0f0f0;
  white-space: pre-wrap;
  position: relative;
  max-width: 90%;
`;

export const strategyBox = css`
  margin-top: 20px;
  padding: 20px;
  background: #fdfdfb;
  border-radius: 18px;
  border: 1px solid #ecebe4;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
`;

export const resultBox = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 50px;
  border-radius: 35px;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
  text-align: center;
  z-index: 1000;
  width: 700px;
  max-height: 85vh;
  overflow-y: auto;

  h2 {
    font-size: 30px;
    color: #6a5c3a;
    margin-bottom: 25px;
    font-weight: 800;
  }
`;

// 디스코드 스타일 타이핑 애니메이션
const typing = keyframes`
  0% { transform: translateY(0px); opacity: 0.4; }
  28% { transform: translateY(-7px); opacity: 1; }
  44% { transform: translateY(0px); opacity: 0.4; }
`;

export const typingBubble = css`
  background: #e9e9e9;
  padding: 15px 20px;
  border-radius: 20px;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 5px;
`;

// 통통 튀는 애니메이션 정의 (Jumping Dot)
const jumpingDot = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
`;

// 애니메이션을 감싸는 회색 말풍선 컨테이너
export const typingContainer = css`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
  background: #f0f0f0;
  border-radius: 20px;
  width: fit-content;
  margin-bottom: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
`;

// 개별 점의 통통 튀는 스타일 (delay로 순차적 움직임 구현)
export const dot = (delay) => css`
  width: 6px;
  height: 6px;
  background-color: #888;
  border-radius: 50%;
  animation: ${jumpingDot} 1.4s infinite ease-in-out;
  animation-delay: ${delay};
`;