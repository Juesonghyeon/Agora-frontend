/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef } from "react";
import * as s from "./styles";
import { IoMdMore } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Main() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const [newTopic, setNewTopic] = useState({
    title: "",
    type: "멀티",
    scale: "소규모",
    difficulty: "쉬움",
  });

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { 
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "" 
      }
    };
  };

  const fetchTopics = async () => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/topics/user/${currentUserId}`, getAuthHeaders());
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setTopics(data);
    } catch (err) {
      console.error("토픽 로드 실패:", err);
    }
  };

  useEffect(() => {
    fetchTopics();
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveTopic = async () => {
    if (!newTopic.title) return;
    const currentUserId = localStorage.getItem("userId");

    const topicPayload = {
      ...newTopic,
      userId: currentUserId,
      type: ["AI", "ai", "Ai"].includes(newTopic.type) ? "AI" : "멀티",
    };

    try {
      if (editingTopic) {
        const targetId = editingTopic.id || editingTopic.topicId;
        await axios.patch(`http://localhost:8080/api/topics/${targetId}`, topicPayload, getAuthHeaders());
        await fetchTopics();
        setShowModal(false);
        setEditingTopic(null);
        alert("수정되었습니다.");
      } else {
        const res = await axios.post("http://localhost:8080/api/topics", topicPayload, getAuthHeaders());
        const createdData = res.data;
        
        const code = createdData.participationCode || (createdData.data && createdData.data.participationCode);
        const newId = createdData.id || createdData.topicId;

        setShowModal(false);
        setNewTopic({ title: "", type: "멀티", scale: "소규모", difficulty: "쉬움" });
        
        if (topicPayload.type === "AI") {
          navigate(`/aidiscussion?id=${newId}`); // 1. AI면 바로 이동
        } else if (code) {
          navigate(`/topic/${code}`);            // 2. 멀티방(코드있음)이면 바로 이동
        } else {
          await fetchTopics();                   // 3. 사실상 여기까지 올 일이 거의 없음!
          alert("방이 생성되었습니다.");
        }
      }
    } catch (err) {
      console.error("생성 실패:", err);
      alert("오류가 발생했습니다.");
    }
  };

  const handleDeleteTopic = async (topic) => {
    const targetId = topic.id || topic.topicId;
    if (!window.confirm(`'${topic.title}' 토론을 삭제하시겠습니까?`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/topics/${targetId}`, getAuthHeaders());
      if (topic.participationCode) {
         await axios.post(`http://localhost:8081/room-deleted`, { gameCode: topic.participationCode }).catch(() => {});
      }
      setTopics(prev => prev.filter((t) => (t.id || t.topicId) !== targetId));
      setOpenMenuId(null);
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  return (
    <div css={s.container}>
      <main css={s.mainContent}>
        <h2 css={s.sectionTitle}>토론 목록</h2>
        <div css={s.topicList}>
          {topics.map((topic, index) => {
            const currentId = topic.id || topic.topicId || index;
            return (
              <div key={currentId} css={s.topicCard}>
                <p css={s.topicText}>{topic.title}</p>
                <div css={s.topicActions}>
                  <button css={s.participateButton} onClick={() => {
                    const type = String(topic.type).toUpperCase();
                    if (type === "AI") navigate(`/aidiscussion?id=${topic.id || topic.topicId}`);
                    else if (topic.participationCode) navigate(`/topic/${topic.participationCode}`);
                  }}>참여하기</button>
                  {String(topic.type).toUpperCase() !== "AI" && topic.participationCode && (
                    <div css={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input type="text" css={s.participationInput} value={topic.participationCode} readOnly />
                      <button css={s.copyButton} onClick={() => {
                        navigator.clipboard.writeText(topic.participationCode);
                        alert("복사완료!");
                      }}>복사</button>
                    </div>
                  )}
                  <IoMdMore size={24} css={s.moreIcon} onClick={() => setOpenMenuId(openMenuId === currentId ? null : currentId)} />
                </div>
                {openMenuId === currentId && (
                  <div ref={menuRef} css={[s.moreMenu, s.moreMenuOpen]}>
                    <div css={s.moreMenuItem} onClick={() => { setEditingTopic(topic); setNewTopic(topic); setShowModal(true); setOpenMenuId(null); }}>수정</div>
                    <div css={s.moreMenuItem} onClick={() => handleDeleteTopic(topic)}>삭제</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div css={s.addButtonWrapper} style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button css={s.addButton} onClick={() => { setEditingTopic(null); setNewTopic({ title: "", type: "멀티", scale: "소규모", difficulty: "쉬움" }); setShowModal(true); }}>방 만들기</button>
          <button css={s.participateButton} onClick={() => { const code = prompt("코드 입력"); if (code) navigate(`/topic/${code}`); }}>코드 입력</button>
        </div>
      </main>

      {showModal && (
        <div css={s.modalOverlay}>
          <div css={s.modalCard}>
            <h2 css={s.modalTitle}>{editingTopic ? "토론 수정" : "방 만들기"}</h2>
            <input type="text" placeholder="제목" css={s.modalInput} value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} />
            <select css={s.modalInput} value={newTopic.type} onChange={(e) => setNewTopic({ ...newTopic, type: e.target.value })} disabled={!!editingTopic}>
              <option value="멀티">멀티</option>
              <option value="AI">AI</option>
            </select>
            <div css={s.modalButtonRow}>
              <button css={s.modalSendBtn} onClick={handleSaveTopic}>{editingTopic ? "수정" : "생성 후 입장"}</button>
              <button css={s.closeButton} onClick={() => setShowModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}