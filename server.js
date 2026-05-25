const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "studywork2024";
const DATA_FILE = path.join(__dirname, "data", "vacancies.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readVacancies() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function writeVacancies(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

function checkAuth(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Неверный пароль" });
    return false;
  }
  return true;
}

app.post("/api/login", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "Неверный пароль" });
  }
});

app.get("/api/vacancies", (req, res) => {
  res.json(readVacancies());
});

app.post("/api/vacancies", (req, res) => {
  if (!checkAuth(req, res)) return;
  const { title } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: "Укажите название вакансии" });
  }
  const list = readVacancies();
  const item = { id: Date.now(), title: title.trim().toUpperCase() };
  list.push(item);
  writeVacancies(list);
  res.json(item);
});

app.put("/api/vacancies/:id", (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = Number(req.params.id);
  const { title } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: "Укажите название вакансии" });
  }
  const list = readVacancies();
  const index = list.findIndex((v) => v.id === id);
  if (index === -1) return res.status(404).json({ error: "Не найдено" });
  list[index].title = title.trim().toUpperCase();
  writeVacancies(list);
  res.json(list[index]);
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.delete("/api/vacancies/:id", (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = Number(req.params.id);
  const current = readVacancies();
  const list = current.filter((v) => v.id !== id);
  if (list.length === current.length) {
    return res.status(404).json({ error: "Не найдено" });
  }
  writeVacancies(list);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`StudyWork: http://localhost:${PORT}`);
  console.log(`Админка: http://localhost:${PORT}/admin.html`);
});
