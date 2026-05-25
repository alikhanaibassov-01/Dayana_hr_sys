# Как задеплоить StudyWork

Сайт — это Node.js-приложение (Express). Статические HTML/CSS/JS + API для вакансий.

## Быстрый деплой на Render (бесплатно)

1. Залейте проект на **GitHub** (весь каталог `Dayana_hr_product`).
2. Зайдите на [render.com](https://render.com) → **New** → **Blueprint** или **Web Service**.
3. Подключите репозиторий.
4. Render подхватит `render.yaml` автоматически, либо укажите вручную:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
5. В **Environment** добавьте переменную:
   - `ADMIN_PASSWORD` — ваш секретный пароль для админки (обязательно смените!).
6. После деплоя откройте URL вида `https://studywork-xxxx.onrender.com`.

### Вход в админку на продакшене

- Кнопка внизу страницы: **«Вход для администратора»**
- Или иконка ⚙ справа внизу
- Пароль — тот, что задали в `ADMIN_PASSWORD`

Отдельная страница: `https://ваш-домен.onrender.com/admin.html`

---

## Альтернатива: Railway

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Переменная окружения `ADMIN_PASSWORD`.
3. Railway сам определит `npm start` из `package.json`.

---

## Важно про сохранение вакансий

Вакансии хранятся в файле `data/vacancies.json` на диске сервера.

На бесплатном хостинге при **перезапуске** или **новом деплое** изменения могут сброситься к версии из Git. Для постоянного хранения:

- регулярно коммитьте `data/vacancies.json` в Git после правок, или
- подключите постоянный диск (Render Disk / Railway Volume).

---

## Свой домен

В панели Render/Railway: **Settings** → **Custom Domain** → укажите `www.studywork.kz` и DNS-записи по инструкции хостинга.

---

## Локальный запуск

```bash
npm install
ADMIN_PASSWORD=мой_пароль npm start
```

Сайт: http://localhost:3000
