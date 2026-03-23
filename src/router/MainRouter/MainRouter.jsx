import { Routes, Route } from "react-router-dom";
import Home from "../../pages/home/Home.jsx";
import Main from "../../pages/main/Main.jsx";
import Profile from "../../pages/profile/Profile.jsx";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import React from "react";
import DebateArena from "../../pages/debateroom/DebateArena.jsx";
import Login from "../../pages/login/login.jsx";
import InGame from "../../pages/ingame/InGame.jsx";
import AIDiscussion from "../../pages/aIdiscussion/AIDiscussion.jsx";

function WithSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    console.log("로그아웃 처리");
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default function MainRouter() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/main"
          element={
            <WithSidebar>
              <Main />
            </WithSidebar>
          }
        />
        <Route
          path="/profile"
          element={
            <WithSidebar>
              <Profile />
            </WithSidebar>
          }
        />

        <Route
          path="/topic/:gameCode"
          element={<DebateArena />}
        />

        <Route
          path="/game/:gameCode"
          element={<InGame/>}
        />
        <Route path="/aidiscussion" element={<AIDiscussion />} />
      </Routes>
    </>
  );
}
