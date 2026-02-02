import { css } from "@emotion/react";

/* ===== 기본 컨테이너 (고정) ===== */
export const container = css`
  position: fixed;
  inset: 0;
  width: 100vw;
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
  color: rgba(200, 200, 200, 0.12);
  pointer-events: none;
`;

export const topBar = css`
  position: absolute;
  top: 40px; /* 기존 48px에서 8px 위로 */
  left: 24px;
  z-index: 10;
`;

export const backButton = css`
  padding: 8px 12px;
  background: rgba(210, 200, 180, 0.8);
  border-radius: 8px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  color: #555;
`;

export const gameCode = css`
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  user-select: text;
`;

/* ===== 게임 시작 버튼 ===== */
export const startButton = css`
  position: absolute;
  bottom: 60px; /* 기존 48px에서 12px 위로 */
  left: 50%;
  transform: translateX(-50%);
  padding: 18px 40px;
  font-size: 22px;
  font-weight: bold;
  background: rgba(191, 167, 111, 0.95);
  color: #fff;
  border-radius: 50px; /* 라운드 처리 */
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:active { transform: translateX(-50%) scale(0.98); }
  &:disabled { background: rgba(160, 150, 120, 0.6); cursor: not-allowed; }
`;

/* ===== 사이드바 (참가자 리스트) ===== */
export const sidebar = css`
  position: absolute;
  right: 24px;
  top: 40px; /* 기존보다 조금 위로 */
  width: 260px;
  max-height: calc(100% - 80px); /* 화면을 벗어나지 않게 */
  display: flex;
  flex-direction: column;
  z-index: 5;
`;

export const sidebarTitle = css`
  font-size: 14px;
  font-weight: bold;
  color: #888;
  margin-bottom: 12px;
  text-align: right;
  padding-right: 4px;
`;

export const participantList = css`
  display: flex;
  flex-direction: column-reverse; /* 🔥 나중에 들어온 사람이 위로 쌓임 */
  gap: 10px;
  overflow-y: auto; /* 🔥 이름 영역만 스크롤 */
  padding-right: 8px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
`;

export const participantItem = css`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.6);
  padding: 10px 14px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  /* 애니메이션 효과 (선택사항) */
  animation: fadeIn 0.3s ease-out;
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

export const avatarCircle = css`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #c4a669;
  flex-shrink: 0;
`;

export const participantName = css`
  font-size: 15px;
  color: #4a3f2a;
  font-weight: 500;
`;

/* ===== 채팅창 ===== */
export const chatBox = css`
  position: absolute;
  bottom: 40px; /* 24px에서 위로 조정 */
  left: 24px;
  width: 360px;
  background: rgba(70, 70, 70, 0.75);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  z-index: 20;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
`;

export const chatMessages = (open) => css`
  height: ${open ? "280px" : "0px"};
  padding: ${open ? "16px" : "0 16px"};
  overflow-y: auto;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
`;

export const chatMessage = css`
  margin-bottom: 8px;
  line-height: 1.5;
`;

export const chatInputWrapper = css`
  display: flex;
  background: #fff;
  padding: 4px;
`;

export const chatInput = css`
  flex: 1;
  padding: 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
`;

export const chatSendButton = css`
  padding: 0 20px;
  background: #c4a669;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin: 4px;
`;

/* ===== 로딩 & 카운트다운 ===== */
export const loadingContainer = css`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0ece3;
`;

export const loadingSpinner = css`
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top: 4px solid #c4a669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export const loadingText = css`
  margin-top: 16px;
  color: #888;
`;

export const countdownOverlay = css`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 160px;
  font-weight: 900;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  text-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;