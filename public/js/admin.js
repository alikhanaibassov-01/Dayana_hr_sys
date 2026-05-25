const loginSection = document.getElementById("login-section");
const panelSection = document.getElementById("panel-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const addForm = document.getElementById("add-form");
const adminList = document.getElementById("admin-list");
const panelMessage = document.getElementById("panel-message");

function showPanel() {
  loginSection.hidden = true;
  panelSection.hidden = false;
  StudyWorkAdminPanel.loadList(adminList, panelMessage, showLogin);
}

function showLogin() {
  loginSection.hidden = false;
  panelSection.hidden = true;
  StudyWorkAuth.clearToken();
}

if (StudyWorkAuth.isLoggedIn()) {
  showPanel();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value;
  loginError.hidden = true;

  try {
    const result = await StudyWorkAuth.login(password);
    if (result.ok) {
      showPanel();
    } else {
      showLogin();
      loginError.textContent = result.error;
      loginError.hidden = false;
    }
  } catch {
    loginError.textContent = "Ошибка соединения с сервером";
    loginError.hidden = false;
  }
});

StudyWorkAdminPanel.bindAddForm(addForm, adminList, panelMessage, showLogin);
