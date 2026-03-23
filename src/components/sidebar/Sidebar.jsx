/** @jsxImportSource @emotion/react */
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as s from "./styles";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  // 로그아웃
  const handleLogout = () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    localStorage.clear();
    navigate("/");
  };

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    if (window.confirm("정말로 탈퇴하시겠습니까? 친구 목록을 포함한 모든 데이터가 삭제됩니다.")) {
      try {
        // 백엔드 DeleteMapping("/api/users/{id}") 호출
        const response = await axios.delete(`http://localhost:8080/api/users/${userId}`);
        
        alert(response.data || "회원탈퇴가 완료되었습니다.");
        localStorage.clear(); // 로컬 스토리지 비우기
        navigate("/"); // 초기 페이지로 이동
      } catch (err) {
        console.error("탈퇴 에러 상세:", err.response);
        alert(err.response?.data || "탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <aside css={[s.sidebar, sidebarOpen ? s.sidebarOpen : s.sidebarClosed]}>
      <button
        css={s.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      <ul css={s.menuList}>
        {sidebarOpen && (
          <>
            <li onClick={() => navigate("/main")}>토론 목록</li>
            <li onClick={() => navigate("/profile")}>프로필</li>
            <li onClick={handleLogout}>로그아웃</li>
            {/* 회원탈퇴 버튼 스타일 추가 */}
            <li 
              onClick={handleDeleteAccount}
            >
              회원탈퇴
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}