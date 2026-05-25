async function loadVacancies() {
  const listEl = document.getElementById("vacancy-list");
  if (!listEl) return;

  try {
    const res = await fetch("/api/vacancies");
    if (!res.ok) throw new Error("Ошибка загрузки");
    const vacancies = await res.json();

    if (!vacancies.length) {
      listEl.innerHTML = '<li class="vacancy-list__empty">Вакансии скоро появятся</li>';
      return;
    }

    listEl.innerHTML = vacancies
      .map((v) => `<li>${escapeHtml(v.title)}</li>`)
      .join("");
  } catch {
    listEl.innerHTML = '<li class="vacancy-list__empty">Не удалось загрузить вакансии</li>';
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

window.reloadVacanciesOnSite = loadVacancies;
loadVacancies();

/* ——— Вход в админку с главной ——— */
(function initAdminEntry() {
  const openBtn = document.getElementById("open-admin");
  const modal = document.getElementById("admin-modal");
  const closeBtn = document.getElementById("close-admin-modal");
  const loginView = document.getElementById("admin-login-view");
  const panelView = document.getElementById("admin-panel-view");
  const loginForm = document.getElementById("home-login-form");
  const loginError = document.getElementById("home-login-error");
  const logoutBtn = document.getElementById("home-logout");
  const homeAddForm = document.getElementById("home-add-form");
  const homeAdminList = document.getElementById("home-admin-list");
  const homePanelMessage = document.getElementById("home-panel-message");
  const footerAdminBtn = document.getElementById("footer-admin-btn");

  if (!openBtn || !modal) return;

  function updateFooterButton() {
    if (StudyWorkAuth.isLoggedIn()) {
      footerAdminBtn.textContent = "Управление вакансиями";
      footerAdminBtn.setAttribute("aria-label", "Открыть панель управления вакансиями");
    } else {
      footerAdminBtn.textContent = "Вход для администратора";
      footerAdminBtn.setAttribute("aria-label", "Войти в панель администратора");
    }
  }

  function showLoginView() {
    loginView.hidden = false;
    panelView.hidden = true;
  }

  function showPanelView() {
    loginView.hidden = true;
    panelView.hidden = false;
    StudyWorkAdminPanel.loadList(homeAdminList, homePanelMessage, () => {
      StudyWorkAuth.clearToken();
      showLoginView();
      updateFooterButton();
    });
  }

  function openModal() {
    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (StudyWorkAuth.isLoggedIn()) {
      showPanelView();
    } else {
      showLoginView();
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  openBtn.addEventListener("click", openModal);
  footerAdminBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("home-password").value;
    loginError.hidden = true;

    try {
      const result = await StudyWorkAuth.login(password);
      if (result.ok) {
        showPanelView();
        updateFooterButton();
      } else {
        loginError.textContent = result.error;
        loginError.hidden = false;
      }
    } catch {
      loginError.textContent = "Ошибка соединения с сервером";
      loginError.hidden = false;
    }
  });

  logoutBtn.addEventListener("click", () => {
    StudyWorkAuth.clearToken();
    showLoginView();
    updateFooterButton();
    document.getElementById("home-password").value = "";
  });

  StudyWorkAdminPanel.bindAddForm(homeAddForm, homeAdminList, homePanelMessage, () => {
    StudyWorkAuth.clearToken();
    showLoginView();
    updateFooterButton();
  });

  updateFooterButton();
})();
