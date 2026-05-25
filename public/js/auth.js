(function () {
  const STORAGE_KEY = "studywork_admin_token";

  function getToken() {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  function setToken(token) {
    sessionStorage.setItem(STORAGE_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
  }

  async function login(password) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setToken(password);
      return { ok: true };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || "Неверный пароль" };
  }

  window.StudyWorkAuth = {
    getToken,
    setToken,
    clearToken,
    isLoggedIn,
    authHeaders,
    login,
  };
})();
