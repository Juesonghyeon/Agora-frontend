import { css } from "@emotion/react";

/* 전체 화면 배경 */
export const container = css`
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #f0ece3, #d9d6cc);
  overflow: hidden;
`;

/* 반투명 큰 로고 */
export const logoBg = css`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 120px;
  font-weight: 900;
  color: rgba(200, 200, 200, 0.18);
  user-select: none;
  pointer-events: none;
`;

/* Top bar */
export const topBar = css`
  position: absolute;
  top: 16px;
  left: 16px;
`;

/* 뒤로 가기 버튼 */
export const backButton = css`
  padding: 8px 12px;
  font-size: 16px;
  cursor: pointer;
  background: rgba(210, 200, 180, 0.8);
  border-radius: 8px;
`;

/* 중앙 액션 버튼 */
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
  border: 2px solid #bfa76f;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);

  &:hover {
    background: rgba(170, 140, 80, 1);
  }
`;

/* 오른쪽 참가자 사이드바 */
export const sidebar = css`
  position: absolute;
  top: 0;
  right: 0;
  width: 240px;
  height: 100%;
  background: rgba(250, 245, 235, 0.95);
  border-left: 2px solid #d9d6cc;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
`;

/* 참가자 한 줄 */
export const participantItem = css`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 6px 8px;
  background: rgba(215, 205, 185, 0.6);
  border-radius: 8px;
  transition: 0.2s;

  &:hover {
    background: rgba(215, 205, 185, 0.8);
  }
`;

/* 아바타 원 */
export const avatarCircle = css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #c4a669;
  color: #fff;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #bfa76f;
`;

/* 참가자 이름 */
export const participantName = css`
  font-size: 18px;
  font-weight: 500;
  color: #5a534f;
`;
