(function () {
  function escapeAttr(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function flash(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#c62828" : "var(--blue)";
    el.hidden = false;
    setTimeout(() => {
      el.hidden = true;
    }, 2500);
  }

  async function loadList(listEl, messageEl, onUnauthorized) {
    const res = await fetch("/api/vacancies");
    const vacancies = await res.json();

    listEl.innerHTML = vacancies
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

    listEl.querySelectorAll(".btn-save").forEach((btn) => {
      btn.addEventListener("click", () =>
        saveItem(btn.closest(".admin-list__item"), listEl, messageEl, onUnauthorized)
      );
    });

    listEl.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteItem(btn.closest(".admin-list__item"), listEl, messageEl, onUnauthorized)
      );
    });
  }

  async function saveItem(row, listEl, messageEl, onUnauthorized) {
    const id = row.dataset.id;
    const title = row.querySelector("input").value.trim();
    if (!title) return;

    const res = await fetch(`/api/vacancies/${id}`, {
      method: "PUT",
      headers: StudyWorkAuth.authHeaders(),
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      await loadList(listEl, messageEl, onUnauthorized);
      flash(messageEl, "Сохранено");
      if (typeof window.reloadVacanciesOnSite === "function") {
        window.reloadVacanciesOnSite();
      }
    } else if (res.status === 401) {
      onUnauthorized();
    } else {
      flash(messageEl, "Ошибка сохранения", true);
    }
  }

  async function deleteItem(row, listEl, messageEl, onUnauthorized) {
    if (!confirm("Удалить эту вакансию?")) return;
    const id = row.dataset.id;

    const res = await fetch(`/api/vacancies/${id}`, {
      method: "DELETE",
      headers: StudyWorkAuth.authHeaders(),
    });

    if (res.ok) {
      await loadList(listEl, messageEl, onUnauthorized);
      flash(messageEl, "Удалено");
      if (typeof window.reloadVacanciesOnSite === "function") {
        window.reloadVacanciesOnSite();
      }
    } else if (res.status === 401) {
      onUnauthorized();
    } else {
      flash(messageEl, "Ошибка удаления", true);
    }
  }

  function bindAddForm(form, listEl, messageEl, onUnauthorized) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="text"]');
      const title = input.value.trim();
      if (!title) return;

      const res = await fetch("/api/vacancies", {
        method: "POST",
        headers: StudyWorkAuth.authHeaders(),
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        input.value = "";
        await loadList(listEl, messageEl, onUnauthorized);
        flash(messageEl, "Вакансия добавлена");
        if (typeof window.reloadVacanciesOnSite === "function") {
          window.reloadVacanciesOnSite();
        }
      } else if (res.status === 401) {
        onUnauthorized();
      } else {
        const data = await res.json().catch(() => ({}));
        flash(messageEl, data.error || "Ошибка", true);
      }
    });
  }

  window.StudyWorkAdminPanel = {
    loadList,
    bindAddForm,
    flash,
  };
})();
