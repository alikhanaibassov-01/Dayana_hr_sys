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

loadVacancies();
