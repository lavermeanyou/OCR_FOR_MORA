/**
 * Auth: 소셜 로그인 상태 관리 (Google, Kakao)
 */

const AUTH_TOKEN_KEY = 'mora_token';
const AUTH_USER_KEY = 'mora_user';

// ===== Token Management =====
function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function removeToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

function getUser() {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
}

function setUser(user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function isLoggedIn() {
    return !!getToken();
}

// ===== UI Update =====
function updateAuthUI() {
    const loginBtn = document.getElementById('navLoginBtn');
    const userInfo = document.getElementById('navUserInfo');
    const heroLoginBtn = document.getElementById('heroLoginBtn');

    if (isLoggedIn()) {
        const user = getUser();
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            const pic = document.getElementById('navUserPic');
            const name = document.getElementById('navUserName');
            if (pic && user?.picture) {
                pic.src = user.picture;
                pic.style.display = 'block';
            } else if (pic) {
                pic.style.display = 'none';
            }
            if (name) name.textContent = user?.name || user?.email || '';
        }
        if (heroLoginBtn) heroLoginBtn.style.display = 'none';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userInfo) userInfo.style.display = 'none';
        if (heroLoginBtn) heroLoginBtn.style.display = 'inline-flex';
    }
}

// ===== Login Page =====
function showLogin() {
    if (typeof showPage === 'function') {
        showPage('loginPage');
    }
}

// ===== Logout =====
function doLogout() {
    removeToken();
    updateAuthUI();
    if (typeof showLanding === 'function') {
        showLanding();
    }
}

// ===== OAuth Callback 처리 =====
async function handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);

    // 토큰이 URL에 있으면 (OAuth 콜백 리다이렉트)
    const token = params.get('token');
    if (token) {
        setToken(token);
        // URL에서 토큰 제거
        window.history.replaceState({}, '', '/');

        // 사용자 정보 조회
        try {
            const res = await fetch(`${API_BASE || ''}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const user = await res.json();
                setUser(user);
            }
        } catch (e) {
            console.error('Failed to fetch user info:', e);
        }

        updateAuthUI();
        return;
    }

    // 에러가 있으면
    const authError = params.get('auth_error');
    if (authError) {
        window.history.replaceState({}, '', '/');
        console.error('Auth error:', authError);
    }
}

// ===== 기존 토큰 검증 =====
async function validateExistingToken() {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE || ''}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
            const user = await res.json();
            setUser(user);
        } else {
            // 토큰 만료
            removeToken();
        }
    } catch (e) {
        // 서버 연결 실패 시 로컬 데이터 유지
    }
    updateAuthUI();
}

// ===== Init =====
(function initAuth() {
    // OAuth 콜백 먼저 처리
    handleAuthCallback().then(() => {
        // 기존 토큰 있으면 검증
        if (isLoggedIn() && !new URLSearchParams(window.location.search).get('token')) {
            validateExistingToken();
        }
        updateAuthUI();
    });
})();
