import { css, keyframes } from "@emotion/react";

/* 애니메이션 정의 */
export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const swing = keyframes`
  0% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  100% { transform: rotate(-15deg); }
`;

/* 기존 공통 스타일 */
export const container = css`
  width: 100%;
  height: 100vh;
  background: #f4f7f6; /* 약간 더 시원한 배경색으로 변경 */
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
  background: #ecf0f1;
  padding: 8px 16px;
  border-radius: 20px;
`;

export const timerBox = css`
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  background: #fdedec;
  padding: 8px 16px;
  border-radius: 20px;
`;

export const topicText = css`
  text-align: center;
  font-size: 28px;
  margin: 25px 0;
  color: #2c3e50;
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
    font-size: 26px;
    margin-bottom: 10px;
    color: #34495e;
  }
  p {
    color: #7f8c8d;
    margin-bottom: 15px;
    font-size: 16px;
  }
`;

/* 입력 폼 & 버튼 스타일 개선 (둥글둥글) */
export const modalInput = css`
  width: 500px;
  padding: 18px 24px;
  border-radius: 25px;
  border: 2px solid #bdc3c7;
  font-size: 18px;
  background: #fff;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  
  &::placeholder { color: #bdc3c7; }
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
  }
`;

export const opinionArea = css`
  width: 600px;
  height: 200px;
  padding: 24px;
  border-radius: 20px;
  border: 2px solid #bdc3c7;
  font-size: 16px;
  resize: none;
  line-height: 1.6;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: all 0.2s;

  &::placeholder { color: #bdc3c7; }
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
  }
`;

export const modalSendBtn = css`
  padding: 15px 40px;
  border-radius: 25px;
  border: none;
  background: #34495e;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);

  &:hover:not(:disabled) {
    background: #2c3e50;
    transform: translateY(-2px);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  &:disabled { /* 비활성화 시 회색 처리 */
    background: #bdc3c7;
    color: #ecf0f1;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

/* 대기 UI (스피너 포함) */
export const waitingUI = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 40px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
`;

export const spinner = css`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 10px;
`;

/* 투표 UI */
export const teamTitle = (isBlue) => css`
  color: ${isBlue ? "#2980b9" : "#c0392b"};
  font-size: 26px;
  font-weight: 900;
`;

export const voteContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 20px 0 30px 0;
`;

export const voteLabel = css`
  cursor: pointer;
  background: white;
  padding: 12px 24px;
  border-radius: 20px;
  border: 2px solid #ddd;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover { border-color: #3498db; }
  input:checked + span { color: #3498db; }
`;

/* 본격 토론장 UI (딱딱했던 선 제거, 둥글게) */
export const debateLayout = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 40px 40px 40px;
  height: calc(100vh - 180px);
`;

export const claimsBoard = css`
  display: flex;
  gap: 20px;
  height: 40%;
`;

export const teamClaimBox = (isBlue) => css`
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 20px;
  border-top: 8px solid ${isBlue ? "#3498db" : "#e74c3c"};
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0 0 15px 0;
    color: ${isBlue ? "#2980b9" : "#c0392b"};
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export const leaderBadge = css`
  font-size: 14px;
  background: #f1c40f;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
`;

export const claimList = css`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 10px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
`;

export const claimItem = css`
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  b { color: #7f8c8d; margin-right: 8px; }
`;

/* 우리 팀 본부 (채팅 & 팀장 발언) */
export const headquarters = (isBlue) => css`
  flex: 1;
  background: ${isBlue ? "#f0f8ff" : "#fff5f5"};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
`;

export const hqTitle = css`
  margin: 0 0 15px 0;
  color: #34495e;
`;

export const hqContent = css`
  display: flex;
  gap: 20px;
  flex: 1;
  height: 100%;
`;

/* 채팅 영역 */
export const chatSection = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eee;
`;

export const chatScrollArea = css`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
`;

export const chatBubbleWrapper = (isMe) => css`
  display: flex;
  flex-direction: column;
  align-items: ${isMe ? "flex-end" : "flex-start"};
`;

export const chatSender = css`
  font-size: 12px;
  color: #95a5a6;
  margin-bottom: 4px;
  margin-left: 8px;
`;

export const chatBubble = (isMe) => css`
  background: ${isMe ? "#3498db" : "#ecf0f1"};
  color: ${isMe ? "white" : "#2c3e50"};
  padding: 10px 16px;
  border-radius: 20px;
  border-bottom-right-radius: ${isMe ? "4px" : "20px"};
  border-bottom-left-radius: ${!isMe ? "4px" : "20px"};
  font-size: 14px;
  max-width: 80%;
  word-break: break-word;
`;

export const chatInputWrapper = css`
  display: flex;
  padding: 10px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  gap: 10px;
`;

export const chatInput = css`
  flex: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  &:focus { border-color: #3498db; }
`;

export const chatSendBtn = css`
  padding: 0 20px;
  border-radius: 20px;
  background: #34495e;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
`;

/* 팀장 영역 */
export const leaderSection = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #eee;
`;

export const leaderSectionTitle = css`
  margin: 0 0 15px 0;
  color: #2c3e50;
`;

export const leaderControls = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 15px;
`;

export const actionTextarea = css`
  flex: 1;
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #ddd;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

export const waitLeaderBox = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 12px;
  gap: 10px;
  
  span {
    font-size: 13px;
    color: #95a5a6;
  }
`;

/* 판결 애니메이션 및 모달 (저울) */
export const overlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const judgingBox = css`
  background: white;
  padding: 50px;
  border-radius: 30px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  h2 { color: #2c3e50; margin: 0; }
  p { color: #7f8c8d; font-size: 18px; margin: 0; }
`;

export const scaleAnimation = css`
  width: 150px;
  height: auto;
  animation: ${swing} 2s ease-in-out infinite;
  transform-origin: top center; /* 위쪽을 축으로 좌우로 흔들림 */
  margin-bottom: 20px;
`;

export const resultBox = css`
  background: white;
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;

  h2 {
    font-size: 32px;
    color: #e74c3c;
    margin: 0;
  }
`;

export const resultText = css`
  font-size: 18px;
  line-height: 1.8;
  color: #34495e;
  white-space: pre-wrap;
  background: #f8f9fa;
  padding: 30px;
  border-radius: 20px;
  width: 100%;
  text-align: left;
  border: 1px solid #eee;
  overflow-y: auto;
`;