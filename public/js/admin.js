const STORAGE_KEY = "studywork_admin_token";

const loginSection = document.getElementById("login-section");
const panelSection = document.getElementById("panel-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const addForm = document.getElementById("add-form");
const adminList = document.getElementById("admin-list");
const panelMessage = document.getElementById("panel-message");

function getToken() {
  return sessionStorage.getItem(STORAGE_KEY);
}

function setToken(token) {
  sessionStorage.setItem(STORAGE_KEY, token);
}

function clearToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function showPanel() {
  loginSection.hidden = true;
  panelSection.hidden = false;
  loadList();
}

function showLogin() {
  loginSection.hidden = false;
  panelSection.hidden = true;
  clearToken();
}

if (getToken()) {
  showPanel();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value;
  loginError.hidden = true;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setToken(password);
      showPanel();
    } else {
      showLogin();
      const data = await res.json().catch(() => ({}));
      loginError.textContent = data.error || "Неверный пароль";
      loginError.hidden = false;
    }
  } catch {
    loginError.textContent = "Ошибка соединения с сервером";
    loginError.hidden = false;
  }
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("new-title");
  const title = input.value.trim();
  if (!title) return;

  const res = await fetch("/api/vacancies", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });

  if (res.ok) {
    input.value = "";
    loadList();
    flash("Вакансия добавлена");
  } else {
    if (res.status === 401) {
      showLogin();
      return;
    }
    const data = await res.json().catch(() => ({}));
    flash(data.error || "Ошибка", true);
  }
});

async function loadList() {
  const res = await fetch("/api/vacancies");
  const vacancies = await res.json();

  adminList.innerHTML = vacancies
    .map(
      (v) => `
    <li class="admin-list__item" data-id="${v.id}">
      <input type="text" value="${escapeAttr(v.title)}" aria-label="Название вакансии">
      <div class="admin-list__actions">
        <button type="button" class="btn btn--ghost btn-save">Сохранить</button>
        <button type="button" class="btn btn--danger btn-delete">Удалить</button>
      </div>
    </li>`
    )
    .join("");

  adminList.querySelectorAll(".btn-save").forEach((btn) => {
    btn.addEventListener("click", () => saveItem(btn.closest(".admin-list__item")));
  });

  adminList.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteItem(btn.closest(".admin-list__item")));
  });
}

async function saveItem(row) {
  const id = row.dataset.id;
  const title = row.querySelector("input").value.trim();
  if (!title) return;

  const res = await fetch(`/api/vacancies/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });

  if (res.ok) {
    loadList();
    flash("Сохранено");
  } else if (res.status === 401) {
    showLogin();
  } else {
    flash("Ошибка сохранения", true);
  }
}

async function deleteItem(row) {
  if (!confirm("Удалить эту вакансию?")) return;
  const id = row.dataset.id;

  const res = await fetch(`/api/vacancies/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (res.ok) {
    loadList();
    flash("Удалено");
  } else if (res.status === 401) {
    showLogin();
  } else {
    flash("Ошибка удаления", true);
  }
}

function flash(text, isError) {
  panelMessage.textContent = text;
  panelMessage.style.color = isError ? "#c62828" : "var(--blue)";
  panelMessage.hidden = false;
  setTimeout(() => {
    panelMessage.hidden = true;
  }, 2500);
}

function escapeAttr(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
