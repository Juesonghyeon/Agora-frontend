import { css } from "@emotion/react";

export const container = css`
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #f0ece3, #d9d6cc);
  position: relative;
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
  pointer-events: none;   /* ✅ 클릭 완전 무시 */
  user-select: none;      /* ✅ 드래그 선택 방지 */
  z-index: 0;             /* ✅ 다른 UI보다 항상 뒤 */
`;

export const splitScreen = css`
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

export const centerBox = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

export const errorText = css`
  color: #a33;
`;
