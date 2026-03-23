/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { SiNaver, SiDiscord } from "react-icons/si";
import * as s from "./styles";

const logoPath = "/천칭.png";

export default function Login() {
  const navigate = useNavigate();

  // 로그인/회원가입 상태
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordCheckError, setPasswordCheckError] = useState("");

  // 모달 상태
  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);

  // 아이디 찾기
  const [findIdEmail, setFindIdEmail] = useState("");
  const [idSent, setIdSent] = useState(false);
  const [idVerificationCode, setIdVerificationCode] = useState("");
  const [idCountdown, setIdCountdown] = useState(0);

  // 비밀번호 찾기
  const [findPwEmail, setFindPwEmail] = useState("");
  const [findPwUsername, setFindPwUsername] = useState("");
  const [pwSent, setPwSent] = useState(false);
  const [pwVerificationCode, setPwVerificationCode] = useState("");
  const [pwCountdown, setPwCountdown] = useState(0);

  // ----------------- OAuth Redirect 처리 -----------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        
        if (decoded.userId) localStorage.setItem("userId", decoded.userId);
        if (decoded.sub) localStorage.setItem("username", decoded.sub);
        
        // 🌟 [수정된 부분] 소셜 로그인 유저 여부 저장
        if (decoded.sub && (decoded.sub.startsWith("google_") || decoded.sub.startsWith("naver_") || decoded.sub.startsWith("discord_"))) {
          localStorage.setItem("isOAuth", "true");
        }
        
        navigate("/main");
      } catch (error) {
        console.error("토큰 처리 중 오류:", error);
      }
    }
  }, [navigate]);

  // ----------------- 유효성 검사 -----------------
  useEffect(() => {
    if (!isLogin) {
      const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      setUsernameError(username && !usernameRegex.test(username) ? "아이디: 8자 이상, 영문/숫자 포함" : "");
    }
  }, [username, isLogin]);

  useEffect(() => {
    if (!isLogin) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
      setPasswordError(password && !passwordRegex.test(password) ? "비밀번호 조건을 확인하세요." : "");
      setPasswordCheckError(passwordCheck && passwordCheck !== password ? "비밀번호가 일치하지 않습니다." : "");
    }
  }, [password, passwordCheck, isLogin]);

  const handleTabChange = (isLoginPage) => {
    setIsLogin(isLoginPage);
    setUsername(""); setPassword(""); setPasswordCheck("");
  };

  // ----------------- 로그인 / 회원가입 제출 -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && (usernameError || passwordError || passwordCheckError)) {
      alert("입력 정보를 다시 확인해주세요.");
      return;
    }

    try {
      const url = isLogin ? "http://localhost:8080/api/users/login" : "http://localhost:8080/api/users/register";
      const res = await axios.post(url, { username, password });

      if (isLogin) {
        if (!res.data || !res.data.token) {
          alert("아이디 또는 비밀번호가 올바르지 않습니다.");
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("username", res.data.username);
        // 일반 로그인은 소셜 로그인이 아니므로 명시적으로 제거하거나 설정하지 않음
        localStorage.removeItem("isOAuth");

        const card = document.querySelector("#login-card");
        if(card) {
          card.style.transition = "all 0.5s ease";
          card.style.opacity = 0;
          card.style.transform = "translateY(-20px)";
        }

        setTimeout(() => {
          navigate("/main");
        }, 500);
      } else {
        alert("회원가입 성공! 로그인해주세요.");
        handleTabChange(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  // ----------------- 아이디/비밀번호 찾기 로직 -----------------
  const sendFindIdCode = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/find-username", { email: findIdEmail });
      setIdSent(true); setIdCountdown(60);
    } catch (err) { alert(err.response?.data || "등록되지 않은 이메일입니다."); }
  };

  const verifyFindIdCode = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-id-code", { email: findIdEmail, code: idVerificationCode });
      alert(res.data);
      setShowFindId(false);
    } catch (err) { alert("인증코드가 틀립니다."); }
  };

  const sendFindPwCode = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", { email: findPwEmail, username: findPwUsername });
      setPwSent(true); setPwCountdown(60);
    } catch (err) { alert("정보가 일치하지 않습니다."); }
  };

  const verifyFindPwCode = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-pw-code", { email: findPwEmail, code: pwVerificationCode });
      alert(res.data);
      setShowFindPw(false);
    } catch (err) { alert("인증코드가 틀립니다."); }
  };

  // 타이머
  useEffect(() => {
    if (idCountdown > 0) setTimeout(() => setIdCountdown(idCountdown - 1), 1000);
    if (pwCountdown > 0) setTimeout(() => setPwCountdown(pwCountdown - 1), 1000);
  }, [idCountdown, pwCountdown]);

  return (
    <div css={s.container}>
      <div css={s.card} id="login-card">
        <img src={logoPath} alt="Logo" css={s.logo} />

        <div css={s.tabContainer}>
          <button css={[s.tabButton, isLogin && s.activeTab]} onClick={() => handleTabChange(true)}>로그인</button>
          <button css={[s.tabButton, !isLogin && s.activeTab]} onClick={() => handleTabChange(false)}>회원가입</button>
        </div>

        <form css={s.form} onSubmit={handleSubmit}>
          <input type="text" placeholder="아이디" css={s.inputField} value={username} onChange={(e) => setUsername(e.target.value)} required />
          {!isLogin && usernameError && <div css={s.errorText}>{usernameError}</div>}

          <input type="password" placeholder="비밀번호" css={s.inputField} value={password} onChange={(e) => setPassword(e.target.value)} required />
          {!isLogin && passwordError && <div css={s.errorText}>{passwordError}</div>}

          {!isLogin && (
            <>
              <input type="password" placeholder="비밀번호 확인" css={s.inputField} value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} required />
              {passwordCheckError && <div css={s.errorText}>{passwordCheckError}</div>}
            </>
          )}

          <button type="submit" css={s.submitButton}>{isLogin ? "로그인" : "회원가입"}</button>
        </form>

        {isLogin && (
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button type="button" onClick={() => handleSocialLogin("google")} style={socialBtnStyle}><FcGoogle size={20} /> 구글 로그인</button>
            <button type="button" onClick={() => handleSocialLogin("naver")} style={{...socialBtnStyle, background: "#03c75a", color: "#fff"}}><SiNaver size={18} /> 네이버 로그인</button>
            <button type="button" onClick={() => handleSocialLogin("discord")} style={{...socialBtnStyle, background: "#5865F2", color: "#fff"}}><SiDiscord size={20} /> 디스코드 로그인</button>
          </div>
        )}

        {isLogin && (
          <div css={s.findRow}>
            <button css={s.findButton} onClick={() => setShowFindId(true)}>아이디 찾기</button>
            <span css={s.findDivider}>|</span>
            <button css={s.findButton} onClick={() => setShowFindPw(true)}>비밀번호 찾기</button>
          </div>
        )}

        {/* 아이디 찾기 모달 */}
        {showFindId && (
          <div css={s.modalOverlay}>
            <div css={s.modalCard}>
              <div css={s.modalTitle}>아이디 찾기</div>
              {!idSent ? (
                <>
                  <input type="email" placeholder="이메일 입력" css={s.modalInput} value={findIdEmail} onChange={(e) => setFindIdEmail(e.target.value)} />
                  <button css={s.modalSendBtn} onClick={sendFindIdCode} disabled={idCountdown > 0}>{idCountdown > 0 ? `${idCountdown}초 후 재전송` : "인증코드 전송"}</button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="인증 코드" css={s.modalInput} value={idVerificationCode} onChange={(e) => setIdVerificationCode(e.target.value)} />
                  <button css={s.modalSendBtn} onClick={verifyFindIdCode}>확인</button>
                </>
              )}
              <button css={s.closeButton} onClick={() => setShowFindId(false)}>닫기</button>
            </div>
          </div>
        )}

        {/* 비밀번호 찾기 모달 */}
        {showFindPw && (
          <div css={s.modalOverlay}>
            <div css={s.modalCard}>
              <div css={s.modalTitle}>비밀번호 재설정</div>
              {!pwSent ? (
                <>
                  <input type="text" placeholder="아이디" css={s.modalInput} value={findPwUsername} onChange={(e) => setFindPwUsername(e.target.value)} />
                  <input type="email" placeholder="이메일" css={s.modalInput} value={findPwEmail} onChange={(e) => setFindPwEmail(e.target.value)} />
                  <button css={s.modalSendBtn} onClick={sendFindPwCode} disabled={pwCountdown > 0}>{pwCountdown > 0 ? `${pwCountdown}초 후 재전송` : "인증코드 전송"}</button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="인증 코드" css={s.modalInput} value={pwVerificationCode} onChange={(e) => setPwVerificationCode(e.target.value)} />
                  <button css={s.modalSendBtn} onClick={verifyFindPwCode}>확인</button>
                </>
              )}
              <button css={s.closeButton} onClick={() => setShowFindPw(false)}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const socialBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", 
  borderRadius: "5px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", 
  fontWeight: "bold", gap: "10px"
};