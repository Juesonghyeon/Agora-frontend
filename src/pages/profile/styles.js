import { css } from "@emotion/react";

export const profileContainer = css`
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: #f0ece3;
  padding: 2rem 1rem;
  box-sizing: border-box;
`;

export const contentWrapper = css`
  display: flex;
  width: 100%;
  max-width: 1000px;
  gap: 2rem;
`;

export const sidebar = css`
  width: 260px;
  background: #fffaf0;
  border: 1px solid #c8b496;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: fit-content;
`;

export const profileImageWrapper = css`
  margin-bottom: 1.5rem;
  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #c8b496;
    cursor: pointer;
  }
`;

export const username = css`
  font-size: 1.2rem;
  font-weight: 600;
  color: #5a534f;
  margin-bottom: 2rem;
`;

export const sidebarMenu = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
`;

export const sidebarItem = (active) => css`
  padding: 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  background: ${active ? "#bfa76f" : "transparent"};
  color: ${active ? "#fff" : "#5a534f"};
  font-weight: ${active ? "600" : "400"};
  transition: 0.2s;
  &:hover { background: ${active ? "#bfa76f" : "#e5dfd1"}; }
`;

export const mainPanel = css`
  flex: 1;
  background: #fffaf0;
  border: 1px solid #c8b496;
  border-radius: 12px;
  padding: 2rem;
  min-height: 500px;
`;

export const actionBtn = css`
  padding: 0.7rem 1.2rem;
  background: #bfa76f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #a9905e; }
`;

export const friendItem = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid #e5dfd1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
`;

export const searchResultProfile = css`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #c8b496;
    background: #fdfbf7;
  }

  span {
    font-weight: 600;
    color: #5a534f;
    font-size: 1rem;
  }
`;

export const buttonGroup = css`
  display: flex;
  gap: 6px;
`;

export const mainContent = css`
  display: flex;
  flex-direction: column;
  min-height: 400px; /* [추가] 최소 높이 확보 */
`;

export const inputGroup = css`
  display: flex;
  flex-direction: column;
  gap: 15px; /* 간격 확대 */
  max-width: 400px;
  padding: 20px 0; /* 상하 여백 추가 */
`;

export const textInput = css`
  padding: 0.8rem; /* 패딩 살짝 증가 */
  border: 1px solid #c8b496;
  border-radius: 8px; /* 타원형 방지를 위해 반경 조절 */
  outline: none;
  background: white;
  &:focus { border-color: #bfa76f; box-shadow: 0 0 0 2px rgba(191, 167, 111, 0.2); }
  &:disabled { background: #f5f5f5; cursor: not-allowed; }
`;