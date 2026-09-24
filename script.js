// =====================================================
// API
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// SHEETS / МОДАЛЬНЫЕ ОКНА
// =====================================================

window.closeAllSheets = function () {
    document.querySelectorAll(".sheet").forEach(function (sheet) {
        sheet.classList.remove("show");
    });

    const overlay = document.getElementById("overlay");

    if (overlay) {
        overlay.classList.remove("show");
    }

    document.body.style.overflow = "";
};


window.openSheet = function (id) {
    const sheet = document.getElementById(id);

    if (!sheet) return;

    window.closeAllSheets();

    sheet.classList.add("show");

    const overlay = document.getElementById("overlay");

    if (overlay) {
        overlay.classList.add("show");
    }

    document.body.style.overflow = "hidden";
};


// Закрытие по кнопке / overlay
document.addEventListener(
    "click",
    function (e) {
        const target =
            e.target && e.target.closest
                ? e.target.closest("[data-close]")
                : null;

        if (target) {
            window.closeAllSheets();
            return;
        }

        if (
            e.target &&
            (
                e.target.id === "overlay" ||
                (
                    e.target.classList &&
                    e.target.classList.contains("overlay")
                )
            )
        ) {
            window.closeAllSheets();
        }
    },
    true
);


// Закрытие по Escape
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        window.closeAllSheets();
    }
});


// =====================================================
// ОШИБКИ
// =====================================================

window.onerror = function (message, source, line, column, error) {
    console.error("JS error:", message);
    return true;
};


// =====================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// =====================================================

const STUDENT_ID = "e929722a-3de6-4ee0-8872-4945e831ce36";
const GROUP_ID   = "11111111-1111-1111-1111-111111111111";

let dbProfile    = null;
let dbGroup      = null;
let dbGrades     = [];
let dbHomework   = [];
let dbAttendance = [];
let dbLessons    = [];
let dbSubjects   = [];

let selectedDayNum = "";
let currentWeek    = 3;
let weekStartDate  = new Date(2026, 8, 14);


// =====================================================
// ОСНОВНОЙ КОД
// =====================================================

try {

    // =================================================
    // TOAST
    // =================================================

    const toastEl = document.getElementById("toast");

    let toastTimer = null;

    function showToast(message, duration = 1900) {
        if (!toastEl) return;

        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        toastEl.textContent = message;
        toastEl.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toastEl.classList.remove("show");
        }, duration);
    }

    window.showToast = showToast;


    // =================================================
    // ВКЛАДКИ
    // =================================================

    const navItems = document.querySelectorAll(".nav-item");
    const tabs = document.querySelectorAll(".tab");

    const barTitle = document.getElementById("barTitle");
    const barEyebrow = document.getElementById("barEyebrow");


    function goToTab(name, options = {}) {

        window.closeAllSheets();

        const button = document.querySelector(
            `.nav-item[data-tab="${name}"]`
        );

        if (!button) return;

        navItems.forEach((item) => {
            item.classList.toggle("active", item === button);
        });

        tabs.forEach((tab) => {
            tab.classList.toggle(
                "active",
                tab.id === `tab-${name}`
            );
        });

        if (barTitle) {
            barTitle.textContent = button.dataset.title || "";
        }

        if (barEyebrow) {

            if (name === "schedule") {
                barEyebrow.textContent = "Колледж · Группа ИС-21";
            }
            else if (name === "grades") {
                barEyebrow.textContent = "1 семестр · 2026";
            }
            else if (name === "homework") {
                const count =
                    document.querySelectorAll(".task:not(.done)").length;
                barEyebrow.textContent = `${count} активных заданий`;
            }
            else {
                barEyebrow.textContent = "Личный кабинет";
            }
        }

        try {
            localStorage.setItem("diary_tab", name);
        } catch (error) {
            console.warn(error);
        }

        if (!options.noScroll) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }

    window.goToTab = goToTab;


    navItems.forEach((button) => {
        button.addEventListener("click", () => {
            goToTab(button.dataset.tab);
        });
    });


    // Клавиши 1-4
    document.addEventListener("keydown", (e) => {

        if (
            e.key >= "1" &&
            e.key <= "4" &&
            !e.metaKey &&
            !e.ctrlKey &&
            document.activeElement.tagName !== "INPUT"
        ) {

            const map = [
                "schedule",
                "grades",
                "homework",
                "profile"
            ];

            goToTab(map[Number(e.key) - 1]);
        }
    });


    // Восстановление вкладки
    try {

        const savedTab = localStorage.getItem("diary_tab");

        if (savedTab) {
            goToTab(savedTab, { noScroll: true });
        }

    } catch (error) {
        console.warn(error);
    }


    // =================================================
    // АВАТАР
    // =================================================

    const avatarButton = document.getElementById("avatarBtn");

    if (avatarButton) {

        avatarButton.addEventListener("click", () => {

            const profileTab = document.getElementById("tab-profile");

            if (profileTab && profileTab.classList.contains("active")) {
                showToast("Вы уже в профиле");
            } else {
                goToTab("profile");
            }

        });

    }


    // =================================================
    // ОБЩИЕ УТИЛИТЫ
    // =================================================

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatDate(dateValue) {

        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }


    function formatShortDate(dateValue) {

        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit"
        });
    }


    function getDayName(dateValue) {

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("ru-RU", { weekday: "short" });
    }


    function getFullDayName(dateValue) {

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("ru-RU", { weekday: "long" });
    }


    function getDateKey(date) {

        const year  = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day   = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function startOfWeek(date) {

        const result = new Date(date);

        const day  = result.getDay();
        const diff = day === 0 ? -6 : 1 - day;

        result.setDate(result.getDate() + diff);
        result.setHours(0, 0, 0, 0);

        return result;
    }


    function addDays(date, amount) {

        const result = new Date(date);
        result.setDate(result.getDate() + amount);
        return result;
    }


    function normalizeTime(time) {

        if (!time) return "";

        return String(time).slice(0, 5);
    }


    // =================================================
    // РАСПИСАНИЕ
    // =================================================

    const weekTitle = document.getElementById("weekTitle");
    const weekSub   = document.getElementById("weekSub");
    const weekPrev  = document.getElementById("weekPrev");
    const weekNext  = document.getElementById("weekNext");

    const wdButtons = Array.from(document.querySelectorAll(".wd"));

    const lessonsWrap = document.querySelector(".lessons");

    const sectionLabelSmall =
        document.querySelector("#tab-schedule .section-label small");


    // =================================================
    // НАЗВАНИЯ ДНЕЙ / МЕСЯЦЕВ
    // =================================================

    const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    const monthNames = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];


    // =================================================
    // ПОЛУЧЕНИЕ НАЗВАНИЯ ПРЕДМЕТА
    // =================================================

    function getSubjectName(subjectId) {

        const subject = dbSubjects.find(
            (item) => item.id === subjectId
        );

        if (!subject) return "Предмет";

        return (
            subject.name ||
            subject.title ||
            subject.subject_name ||
            subject.subject ||
            "Предмет"
        );
    }


    // =================================================
    // ПОЛУЧЕНИЕ ДАННЫХ ПАРЫ
    // =================================================

    function getLessonViewData(lesson) {

        const subject = getSubjectName(lesson.subject_id);

        const room =
            lesson.room
                ? `каб. ${lesson.room}`
                : "Кабинет не указан";

        const start = normalizeTime(lesson.start_time);
        const end   = normalizeTime(lesson.end_time);

        let lessonType = lesson.lesson_type || "занятие";
        lessonType = String(lessonType).toLowerCase();

        let statusText = lessonType;
        let status = "";

        const today = new Date();

        const lessonDate = new Date(
            `${lesson.lesson_date}T${start || "00:00"}:00`
        );

        if (lessonDate.toDateString() === today.toDateString()) {

            const now = today.getHours() * 60 + today.getMinutes();

            const [startHour, startMinute] = start.split(":").map(Number);
            const [endHour, endMinute]     = end.split(":").map(Number);

            const startMinutes = startHour * 60 + startMinute;
            const endMinutes   = endHour * 60 + endMinute;

            if (now >= startMinutes && now <= endMinutes) {
                status = "live";
                statusText = "идёт";
            } else if (now > endMinutes) {
                status = "done";
                statusText = "прошло";
            }
        }

        return {
            id: lesson.id,
            subject,
            room,
            start,
            end,
            type: lessonType,
            status,
            statusText,
            date: lesson.lesson_date
        };
    }


    // =================================================
    // НАЗВАНИЕ НЕДЕЛИ
    // =================================================

    function formatWeekTitle() {

        if (!weekTitle) return;

        const month = monthNames[weekStartDate.getMonth()];

        weekTitle.textContent = `Неделя ${currentWeek} · ${month}`;
    }


    // =================================================
    // ПОЛУЧЕНИЕ ПАР НА ДЕНЬ
    // =================================================

    function getLessonsForDate(dateKey) {

        return dbLessons
            .filter((lesson) => lesson.lesson_date === dateKey)
            .sort((a, b) =>
                String(a.start_time).localeCompare(String(b.start_time))
            );
    }


    // =================================================
    // РЕНДЕР НЕДЕЛИ
    // =================================================

    function renderWeekGrid() {

        wdButtons.forEach((button, index) => {

            const date = new Date(weekStartDate);
            date.setDate(weekStartDate.getDate() + index);

            const number  = date.getDate();
            const dateKey = getDateKey(date);

            const lessons    = getLessonsForDate(dateKey);
            const hasLessons = lessons.length > 0;

            const span = button.querySelector("span");
            const bold = button.querySelector("b");

            if (span) span.textContent = dayNames[index];
            if (bold) bold.textContent = number;

            button.dataset.date = dateKey;

            button.classList.toggle("has-dot", hasLessons);
            button.classList.toggle("active", dateKey === selectedDayNum);

        });
    }


    // =================================================
    // РЕНДЕР ПАР НА ВЫБРАННЫЙ ДЕНЬ
    // =================================================

    function renderLessonsForDay(dateKey) {

        selectedDayNum = dateKey;

        const list = getLessonsForDate(dateKey);

        const date = new Date(`${dateKey}T00:00:00`);

        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

        const dayName = dayNames[dayIndex];
        const lessonCount = list.length;


        let labelText;

        if (lessonCount === 0) {
            labelText = "Нет пар";
        } else if (lessonCount === 1) {
            labelText = "1 пара сегодня";
        } else if (lessonCount < 5) {
            labelText = `${lessonCount} пары сегодня`;
        } else {
            labelText = `${lessonCount} пар сегодня`;
        }

        if (weekSub) weekSub.textContent = labelText;


        if (sectionLabelSmall) {
            sectionLabelSmall.textContent =
                `${dayName} · ${date.getDate()} ${monthNames[date.getMonth()]}`;
        }


        if (!lessonsWrap) return;


        lessonsWrap.style.opacity = "0";
        lessonsWrap.style.transform = "translateY(6px)";
        lessonsWrap.style.transition =
            "opacity .18s ease, transform .18s ease";


        setTimeout(() => {

            if (list.length === 0) {

                lessonsWrap.innerHTML = `
                    <div class="empty">
                        <b>Пар нет</b>
                        <div style="margin-top:6px">
                            На этот день занятий нет
                        </div>
                        <button onclick="window.goToTab('homework')">
                            Перейти к ДЗ
                        </button>
                    </div>
                `;

            } else {

                lessonsWrap.innerHTML =
                    list.map((lesson) => {

                        const item = getLessonViewData(lesson);

                        const className = item.status || "";

                        const meta = `${item.room} · ${item.type}`;

                        return `
                            <article
                                class="lesson ${className}"
                                data-lesson-id="${escapeHtml(item.id)}"
                                data-subj="${escapeHtml(item.subject)}"
                                data-meta="${escapeHtml(meta)}"
                                data-time="${escapeHtml(item.start)}–${escapeHtml(item.end)}"
                                data-room="${escapeHtml(item.room)}"
                                data-type="${escapeHtml(item.type)}"
                            >
                                <div class="l-time">
                                    <b>${escapeHtml(item.start)}</b>
                                    <span>${escapeHtml(item.end)}</span>
                                </div>

                                <div class="l-body">
                                    <div class="l-subject">
                                        ${escapeHtml(item.subject)}
                                    </div>
                                    <div class="l-meta">
                                        ${escapeHtml(meta)}
                                    </div>
                                </div>

                                <span class="l-status ${className}">
                                    ${escapeHtml(item.statusText)}
                                </span>
                            </article>
                        `;

                    }).join("");


                lessonsWrap
                    .querySelectorAll(".lesson")
                    .forEach((lesson) => {

                        lesson.addEventListener("click", () => {
                            openLessonDetail(lesson);
                        });

                    });

            }


            lessonsWrap.style.opacity = "1";
            lessonsWrap.style.transform = "translateY(0)";

        }, 160);


        wdButtons.forEach((button) => {

            button.classList.toggle(
                "active",
                button.dataset.date === dateKey
            );

        });


        try {
            localStorage.setItem("diary_day", dateKey);
        } catch (error) {
            console.warn(error);
        }

    }


    // =================================================
    // ПЕРЕКЛЮЧЕНИЕ НЕДЕЛИ
    // =================================================

    function updateWeek(delta) {

        currentWeek += delta;

        if (currentWeek < 1)  currentWeek = 1;
        if (currentWeek > 52) currentWeek = 52;

        weekStartDate.setDate(weekStartDate.getDate() + delta * 7);

        formatWeekTitle();
        renderWeekGrid();

        const firstDate = getDateKey(weekStartDate);

        renderLessonsForDay(firstDate);


        const card = weekTitle?.closest(".card");

        if (card) {

            card.style.transition = "opacity .18s ease";
            card.style.opacity = "0.55";

            setTimeout(() => {
                card.style.opacity = "1";
            }, 180);

        }


        showToast(
            delta > 0 ? "Следующая неделя" : "Предыдущая неделя"
        );


        try {
            localStorage.setItem("diary_week", String(currentWeek));
            localStorage.setItem(
                "diary_weekStart",
                weekStartDate.toISOString()
            );
        } catch (error) {
            console.warn(error);
        }

    }


    // =================================================
    // КНОПКИ НЕДЕЛИ
    // =================================================

    if (weekPrev) {
        weekPrev.addEventListener("click", () => updateWeek(-1));
    }

    if (weekNext) {
        weekNext.addEventListener("click", () => updateWeek(1));
    }


    // =================================================
    // КНОПКИ ДНЕЙ
    // =================================================

    wdButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const dateKey = button.dataset.date;

            if (!dateKey) return;

            renderLessonsForDay(dateKey);

            if (navigator.vibrate) {
                navigator.vibrate(10);
            }

        });

    });


    // =================================================
    // ВОССТАНОВЛЕНИЕ НЕДЕЛИ
    // =================================================

    try {

        const savedWeek  = localStorage.getItem("diary_week");
        const savedStart = localStorage.getItem("diary_weekStart");
        const savedDay   = localStorage.getItem("diary_day");


        if (savedWeek) {

            const parsedWeek = parseInt(savedWeek, 10);

            if (Number.isFinite(parsedWeek)) {
                currentWeek = parsedWeek;
            }

        }


        if (savedStart) {

            const savedDate = new Date(savedStart);

            if (!Number.isNaN(savedDate.getTime())) {
                weekStartDate = savedDate;
            }

        }


        if (savedDay) {
            selectedDayNum = savedDay;
        }

    } catch (error) {
        console.warn(error);
    }


    // =================================================
    // ПЕРВИЧНЫЙ РЕНДЕР
    // =================================================

    formatWeekTitle();
    renderWeekGrid();


    // =================================================
    // ДЕТАЛИ ПАРЫ
    // =================================================

    function openLessonDetail(element) {

        const subject =
            element.dataset.subj ||
            element.querySelector(".l-subject")?.textContent ||
            "Пара";

        const meta =
            element.dataset.meta ||
            element.querySelector(".l-meta")?.textContent ||
            "";

        const time =
            element.dataset.time ||
            element.querySelector(".l-time b")?.textContent ||
            "";

        const room = element.dataset.room || "";
        const type = element.dataset.type || "";

        const status =
            element.querySelector(".l-status")?.textContent || "";

        const title = document.getElementById("lessonDetailTitle");
        const body  = document.getElementById("lessonDetailBody");


        if (title) title.textContent = subject.trim();


        if (body) {

            body.innerHTML = `
                <div class="l-detail-grid">

                    <div class="l-detail-card">
                        <b>Время</b>
                        <span>${escapeHtml(time)}</span>
                    </div>

                    <div class="l-detail-card">
                        <b>Кабинет</b>
                        <span>${escapeHtml(room || "—")}</span>
                    </div>

                    <div class="l-detail-card">
                        <b>Тип занятия</b>
                        <span>${escapeHtml(type || "—")}</span>
                    </div>

                    <div class="l-detail-card">
                        <b>Статус</b>
                        <span>
                            <span class="s-status ${
                                status.trim() === "идёт" ? "live" : ""
                            }">
                                ${escapeHtml(status.trim())}
                            </span>
                        </span>
                    </div>

                    <div style="display:flex; gap:8px; margin-top:4px;">
                        <button class="chip"
                            onclick="window.showToast('ДЗ скопировано'); window.closeAllSheets();">
                            Скопировать ДЗ
                        </button>

                        <button class="chip"
                            onclick="window.showToast('Напоминание поставлено'); window.closeAllSheets();">
                            Напомнить
                        </button>
                    </div>

                </div>
            `;

        }


        window.openSheet("sheet-lesson");

    }


    window.openLessonDetail = openLessonDetail;


    // =================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ БД
    // =================================================

    function setText(selector, value) {

        const element = document.querySelector(selector);

        if (!element) return;

        element.textContent = value ?? "";
    }


    function getProfileName(profile) {

        if (!profile) return "Студент";

        if (profile.full_name) return profile.full_name;

        if (profile.first_name || profile.last_name) {

            return [profile.first_name, profile.last_name]
                .filter(Boolean)
                .join(" ");

        }

        if (profile.name) return profile.name;

        return "Студент";
    }


    function getGroupName(group) {

        if (!group) return "Группа";

        return group.name || group.title || "Группа";
    }


    function getSpecialty(group) {

        if (!group) return "";

        return group.specialty || group.program || "";
    }


    function getSubjectById(subjectId) {

        return dbSubjects.find(
            (subject) => subject.id === subjectId
        );
    }


    function getSubjectTitle(subjectId) {

        const subject = getSubjectById(subjectId);

        if (!subject) return "Предмет";

        return (
            subject.name ||
            subject.title ||
            subject.subject_name ||
            subject.subject ||
            "Предмет"
        );
    }


    // =================================================
    // РЕНДЕР ПРОФИЛЯ
    // =================================================

    function renderDbProfile() {

        if (!dbProfile) return;


        const name      = getProfileName(dbProfile);
        const groupName = getGroupName(dbGroup);
        const specialty = getSpecialty(dbGroup);


        document
            .querySelectorAll(
                ".profile-name, .user-name, [data-profile-name]"
            )
            .forEach((element) => {
                element.textContent = name;
            });


        document
            .querySelectorAll(
                ".profile-group, .user-group, [data-profile-group]"
            )
            .forEach((element) => {
                element.textContent = groupName;
            });


        document
            .querySelectorAll(
                ".profile-specialty, [data-profile-specialty]"
            )
            .forEach((element) => {
                element.textContent = specialty;
            });


        setText("[data-profile-name]", name);
        setText("[data-profile-group]", groupName);
        setText("[data-profile-specialty]", specialty);


        const photo =
            dbProfile.photo_url ||
            dbProfile.avatar_url ||
            dbProfile.avatar ||
            "";


        if (photo) {

            document
                .querySelectorAll(
                    ".avatar img, .profile-avatar img, [data-profile-photo]"
                )
                .forEach((image) => {
                    image.src = photo;
                });

        }

    }


    // =================================================
    // РЕНДЕР ОЦЕНОК
    // =================================================

    function renderDbGrades() {

        if (!Array.isArray(dbGrades)) return;


        if (dbGrades.length > 0) {

            const total = dbGrades.reduce(
                (sum, grade) => sum + Number(grade.value || 0),
                0
            );

            const average = total / dbGrades.length;

            document
                .querySelectorAll(
                    ".average-grade, [data-average-grade]"
                )
                .forEach((element) => {
                    element.textContent = average.toFixed(1);
                });

        }


        const subjectElements =
            Array.from(document.querySelectorAll(".subject"));


        subjectElements.forEach((element) => {

            const title =
                element
                    .querySelector(".subject-name, .s-name, b")
                    ?.textContent
                    ?.trim()
                    .toLowerCase();

            if (!title) return;


            const related = dbGrades.filter((grade) => {

                const subject = getSubjectTitle(grade.subject_id);

                return (
                    subject.toLowerCase().includes(title) ||
                    title.includes(subject.toLowerCase())
                );

            });


            if (!related.length) return;


            const total = related.reduce(
                (sum, grade) => sum + Number(grade.value || 0),
                0
            );

            const average = total / related.length;

            const value =
                element.querySelector(".s-val, .subject-value, .grade");


            if (value) value.textContent = average.toFixed(1);

        });


        const gradeList =
            document.querySelector(".grades-list, [data-grades-list]");


        if (gradeList && dbGrades.length) {

            const sorted = [...dbGrades].sort((a, b) =>
                String(b.grade_date || "")
                    .localeCompare(String(a.grade_date || ""))
            );


            gradeList.innerHTML =
                sorted.map((grade) => {

                    const subject = getSubjectTitle(grade.subject_id);

                    return `
                        <div class="grade-item">
                            <div>
                                <b>${escapeHtml(subject)}</b>
                                <small>
                                    ${escapeHtml(grade.work_type || "")}
                                </small>
                            </div>
                            <strong>
                                ${escapeHtml(grade.value)}
                            </strong>
                        </div>
                    `;

                }).join("");

        }

    }


    // =================================================
    // ОБНОВЛЕНИЕ СЧЁТЧИКОВ ФИЛЬТРОВ ДЗ
    // =================================================

    function updateFilterCounts() {

        const tasks = document.querySelectorAll(".task-list .task");

        const all    = tasks.length;
        const active = document.querySelectorAll(".task-list .task:not(.done)").length;
        const done   = document.querySelectorAll(".task-list .task.done").length;


        document
            .querySelectorAll("[data-filter-count='all']")
            .forEach((el) => { el.textContent = all; });

        document
            .querySelectorAll("[data-filter-count='active']")
            .forEach((el) => { el.textContent = active; });

        document
            .querySelectorAll("[data-filter-count='done']")
            .forEach((el) => { el.textContent = done; });

    }

    window.updateFilterCounts = updateFilterCounts;


    // =================================================
    // РЕНДЕР ДОМАШНИХ ЗАДАНИЙ
    // =================================================

    function renderDbHomework() {

        if (!Array.isArray(dbHomework)) return;


        const tasks =
            Array.from(
                document.querySelectorAll(".task-list .task")
            );


        dbHomework.forEach((homework, index) => {

            const task = tasks[index];

            if (!task) return;


            task.dataset.id = homework.id;


            const subject = getSubjectTitle(homework.subject_id);

            const title = task.querySelector(".t-title, .task-title, b");
            const meta  = task.querySelector(".t-meta");
            const due   = task.querySelector(".t-due");


            if (title) {
                title.textContent =
                    homework.title || "Домашнее задание";
            }

            if (meta) meta.textContent = subject;

            if (due) {

                due.textContent =
                    homework.due_date
                        ? formatDate(homework.due_date)
                        : "—";


                if (
                    homework.due_date &&
                    !task.classList.contains("done")
                ) {

                    const today   = new Date();
                    const dueDate = new Date(
                        `${homework.due_date}T23:59:59`
                    );


                    if (dueDate < today) {
                        due.classList.add("late");
                    } else {
                        due.classList.remove("late");
                    }

                }

            }

        });


        tasks.forEach((task, index) => {

            if (index >= dbHomework.length) {
                task.style.display = "none";
            }

        });


        updateFilterCounts();

    }


    // =================================================
    // РЕНДЕР ПОСЕЩАЕМОСТИ
    // =================================================

    function renderDbAttendance() {

        if (!Array.isArray(dbAttendance)) return;
        if (!dbAttendance.length) return;


        let attended = 0;
        let total = 0;


        dbAttendance.forEach((item) => {

            total++;

            const value =
                item.present ??
                item.is_present ??
                item.attended;


            if (
                value === true ||
                value === 1 ||
                value === "true"
            ) {
                attended++;
            }

        });


        if (!total) return;


        const percentage = Math.round(attended / total * 100);


        const cells = document.querySelectorAll(".sem-bar2 .sem-cell");


        if (cells[1]) {

            const value = cells[1].querySelector(".sem-val");

            if (value) value.textContent = `${percentage}%`;

        }


        document
            .querySelectorAll("[data-attendance]")
            .forEach((element) => {
                element.textContent = `${percentage}%`;
            });

    }


    // =================================================
    // ОБНОВЛЕНИЕ ПРОФИЛЯ В HEADER
    // =================================================

    function renderDbHeader() {

        if (!dbProfile) return;


        const name = getProfileName(dbProfile);


        document
            .querySelectorAll(".student-name, [data-student-name]")
            .forEach((element) => {
                element.textContent = name;
            });


        if (dbGroup) {

            const groupName = getGroupName(dbGroup);

            document
                .querySelectorAll(".group-name, [data-group-name]")
                .forEach((element) => {
                    element.textContent = groupName;
                });

        }

    }


    // =================================================
    // РЕНДЕР ВСЕХ DB-ДАННЫХ
    // =================================================

    function renderAllDbData() {

        renderDbProfile();
        renderDbHeader();
        renderDbGrades();
        renderDbHomework();
        renderDbAttendance();

    }


    // =================================================
    // ОБНОВЛЕНИЕ РАСПИСАНИЯ ПОСЛЕ ЗАГРУЗКИ БД
    // =================================================

    function renderDbSchedule() {

        if (!Array.isArray(dbLessons)) return;


        if (!dbLessons.length) {

            if (weekSub) weekSub.textContent = "Нет занятий";

            if (lessonsWrap) {

                lessonsWrap.innerHTML = `
                    <div class="empty">
                        <b>Расписание пустое</b>
                        <div style="margin-top:6px">
                            Для группы пока нет занятий
                        </div>
                    </div>
                `;

            }

            return;
        }


        const dates =
            dbLessons
                .map((lesson) => lesson.lesson_date)
                .filter(Boolean)
                .sort();


        if (!dates.length) return;


        // Если пользователь уже выбрал день — оставляем его
        const savedDay = localStorage.getItem("diary_day");

        if (savedDay && dates.includes(savedDay)) {

            selectedDayNum = savedDay;

            const savedDate = new Date(`${savedDay}T00:00:00`);

            weekStartDate = startOfWeek(savedDate);

        } else {

            const firstDate = new Date(`${dates[0]}T00:00:00`);

            weekStartDate = startOfWeek(firstDate);

            selectedDayNum = dates[0];

        }


        formatWeekTitle();
        renderWeekGrid();
        renderLessonsForDay(selectedDayNum);

    }


    // =====================================================
    // API — ПОДКЛЮЧЕНИЕ К BACKEND
    // =====================================================

    async function apiFetch(endpoint, options = {}) {

        try {

            const response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,
                    headers: {
                        "Content-Type": "application/json",
                        ...(options.headers || {})
                    }
                }
            );


            const contentType =
                response.headers.get("content-type");


            let data;


            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }


            if (!response.ok) {

                const message =
                    typeof data === "object" ? data.error : data;

                throw new Error(
                    message || `Ошибка HTTP: ${response.status}`
                );

            }


            return data;

        } catch (error) {

            console.error(`Ошибка API ${endpoint}:`, error);
            throw error;

        }

    }


    // =====================================================
    // API: ЭНДПОИНТЫ
    // =====================================================

    async function getProfile() {
        return await apiFetch(`/profiles/${STUDENT_ID}`);
    }

    async function getGroup() {
        return await apiFetch(`/groups/${GROUP_ID}`);
    }

    async function getSubjects() {
        return await apiFetch("/subjects");
    }

    async function getLessons() {
        return await apiFetch(`/lessons?group_id=${GROUP_ID}`);
    }

    async function getGrades() {
    return await apiFetch(`/grades?student_id=${STUDENT_ID}`);
}

        async function getAttendance() {
            return await apiFetch(`/attendance?student_id=${STUDENT_ID}`);
        }

        async function getHomework() {
            return await apiFetch(`/homework?group_id=${GROUP_ID}`);
        }


        // =====================================================
        // ТЕСТ BACKEND
        // =====================================================

        async function testBackend() {

            try {

                const response = await fetch(`${API_URL}/test`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const text = await response.text();

                console.log("BACKEND:", text);

                return text;

            } catch (error) {

                console.error("Backend недоступен:", error);

            }

        }


        // =====================================================
        // ЗАГРУЗКА ВСЕХ ДАННЫХ ИЗ БД
        // =====================================================

        async function loadDbData() {

            console.log("Загрузка данных из БД...");


            // -------------------------------------------------
            // ПРОФИЛЬ
            // -------------------------------------------------

            try {

                dbProfile = await getProfile();
                console.log("Profile:", dbProfile);

            } catch (error) {

                console.error("Не удалось загрузить profile:", error);

            }


            // -------------------------------------------------
            // ГРУППА
            // -------------------------------------------------

            try {

                dbGroup = await getGroup();
                console.log("Group:", dbGroup);

            } catch (error) {

                console.error("Не удалось загрузить group:", error);

            }


            // -------------------------------------------------
            // ПРЕДМЕТЫ
            // -------------------------------------------------

            try {

                dbSubjects = await getSubjects();
                console.log("Subjects:", dbSubjects);

            } catch (error) {

                console.error("Не удалось загрузить subjects:", error);
                dbSubjects = [];

            }


            // -------------------------------------------------
            // ЗАНЯТИЯ
            // -------------------------------------------------

            try {

                dbLessons = await getLessons();
                console.log("Lessons:", dbLessons);

            } catch (error) {

                console.error("Не удалось загрузить lessons:", error);
                dbLessons = [];

            }


            // -------------------------------------------------
            // ОЦЕНКИ
            // -------------------------------------------------

            try {

                dbGrades = await getGrades();
                console.log("Grades:", dbGrades);

            } catch (error) {

                console.error("Не удалось загрузить grades:", error);
                dbGrades = [];

            }


            // -------------------------------------------------
            // ДОМАШНИЕ ЗАДАНИЯ
            // -------------------------------------------------

            try {

                dbHomework = await getHomework();
                console.log("Homework:", dbHomework);

            } catch (error) {

                console.error("Не удалось загрузить homework:", error);
                dbHomework = [];

            }


            // -------------------------------------------------
            // ПОСЕЩАЕМОСТЬ
            // -------------------------------------------------

            try {

                dbAttendance = await getAttendance();
                console.log("Attendance:", dbAttendance);

            } catch (error) {

                console.error("Не удалось загрузить attendance:", error);
                dbAttendance = [];

            }


            // =================================================
            // ОБНОВЛЯЕМ СТРАНИЦУ
            // =================================================

            try {
                renderAllDbData();
            } catch (error) {
                console.error("Ошибка отображения данных:", error);
            }


            // =================================================
            // ОБНОВЛЯЕМ РАСПИСАНИЕ
            // =================================================

            try {
                renderDbSchedule();
            } catch (error) {
                console.error("Ошибка отображения расписания:", error);
            }


            // =================================================
            // ОБНОВЛЯЕМ ФИЛЬТРЫ ДЗ
            // =================================================

            try {
                updateFilterCounts();
            } catch (error) {
                console.error("Ошибка обновления фильтров:", error);
            }


            console.log("Данные БД успешно загружены.");

        }


        // =====================================================
        // ЗАПУСК
        // =====================================================

        (async function () {

            try {
                await testBackend();
            } catch (error) {
                console.error("Ошибка проверки backend:", error);
            }


            try {
                await loadDbData();
            } catch (error) {
                console.error("Критическая ошибка загрузки БД:", error);
            }

        })();


    // =====================================================
    // ЗАЩИТА ОТ ОШИБОК DB-РЕНДЕРА
    // =====================================================

    window.addEventListener("error", function (event) {

        console.error(
            "Ошибка интерфейса:",
            event.error || event.message
        );

    });


} catch (globalError) {

    // =====================================================
    // ГЛОБАЛЬНЫЙ CATCH
    // =====================================================

    console.error("Критическая ошибка при инициализации:", globalError);

}

window.closeAllSheets=function(){
  document.querySelectorAll('.sheet').forEach(function(s){s.classList.remove('show')});
  var o=document.getElementById('overlay'); if(o)o.classList.remove('show');
  document.body.style.overflow='';
};
window.openSheet=function(id){
  var sheet=document.getElementById(id); if(!sheet)return;
  window.closeAllSheets();
  sheet.classList.add('show');
  var o=document.getElementById('overlay'); if(o)o.classList.add('show');
  document.body.style.overflow='hidden';
};
// Ранний делегированный клик: один X сверху + оверлей + Esc
document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest?e.target.closest('[data-close]'):null;
  if(t){window.closeAllSheets();return;}
  if(e.target&&(e.target.id==='overlay'||(e.target.classList&&e.target.classList.contains('overlay')))){window.closeAllSheets();}
},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape')window.closeAllSheets();});




window.onerror=function(m,s,l,c,e){console.log('JS error',m); return true;};
try{
  // === Toast — улучшен ===
  const toastEl = document.getElementById("toast");
  let toastTimer=null;
  function showToast(msg, duration=1900){
    if(!toastEl) return;
    if(navigator.vibrate) navigator.vibrate(10);
    toastEl.textContent=msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=> toastEl.classList.remove("show"), duration);
  }
  // === Вкладки — сохранение и клавиатура ===
  const navItems=document.querySelectorAll(".nav-item");
  const tabs=document.querySelectorAll(".tab");
  const barTitle=document.getElementById("barTitle");
  const barEyebrow=document.getElementById("barEyebrow");
  function goToTab(name, opts={}){
    closeAllSheets();
    const btn=document.querySelector(".nav-item[data-tab=\""+name+"\"]");
    if(!btn) return;
    navItems.forEach(b=> b.classList.toggle("active", b===btn));
    tabs.forEach(t=> t.classList.toggle("active", t.id==="tab-"+name));
    barTitle.textContent=btn.dataset.title;
    if(name==="schedule") barEyebrow.textContent="Колледж \u00B7 Группа ИС-21";
    else if(name==="grades") barEyebrow.textContent="1 семестр \u00B7 2026";
    else if(name==="homework"){ const c=document.querySelectorAll(".task:not(.done)").length; barEyebrow.textContent=c+" активных заданий"; }
    else barEyebrow.textContent="Личный кабинет";
    try{ localStorage.setItem("diary_tab", name);}catch(e){}
    if(!opts.noScroll) window.scrollTo({top:0, behavior:"smooth"});
  }
  navItems.forEach(btn=> btn.addEventListener("click", ()=> goToTab(btn.dataset.tab)));
  document.addEventListener("keydown", e=>{
    if(e.key>="1" && e.key<="4" && !e.metaKey && !e.ctrlKey && document.activeElement.tagName!=="INPUT"){
      const map=["schedule","grades","homework","profile"]; goToTab(map[+e.key-1]);
    }
    if(e.key==="Escape") closeAllSheets();
  });
  try{ const s=localStorage.getItem("diary_tab"); if(s) goToTab(s,{noScroll:true}); }catch(e){}
  const avatarBtn=document.getElementById("avatarBtn");
  if(avatarBtn) avatarBtn.addEventListener("click", ()=>{
    const isProfile=document.getElementById("tab-profile").classList.contains("active");
    if(isProfile) showToast("Вы уже в профиле"); else goToTab("profile");
  });
  // === Неделя — реальная логика ===
  const weekTitle=document.getElementById("weekTitle");
  const weekSub=document.getElementById("weekSub");
  const weekPrev=document.getElementById("weekPrev");
  const weekNext=document.getElementById("weekNext");
  const wdButtons=Array.from(document.querySelectorAll(".wd"));
  const lessonsWrap=document.querySelector(".lessons");
  const sectionLabelSmall=document.querySelector("#tab-schedule .section-label small");
  const scheduleByDay={
    "13":[{time:"09:00",end:"10:30",subj:"Математика",meta:"каб. 305 \u00B7 Петрова А.В.",status:"done",statusText:"прошло"},{time:"10:45",end:"12:15",subj:"История",meta:"каб. 112 \u00B7 Сидоров К.М.",status:"",statusText:"лекция"},{time:"13:00",end:"14:30",subj:"Физкультура",meta:"спортзал \u00B7 Орлов Д.С.",status:"",statusText:"практика"}],
    "14":[{time:"09:00",end:"10:30",subj:"Программирование",meta:"каб. 214 \u00B7 Иванов И.И.",status:"live",statusText:"идёт"},{time:"10:45",end:"12:15",subj:"Базы данных",meta:"каб. 210 \u00B7 Кузнецов П.С.",status:"",statusText:"лекция"},{time:"12:45",end:"14:15",subj:"Веб-разработка",meta:"каб. 301 \u00B7 Морозов А.В.",status:"",statusText:"практика"}],
    "15":[{time:"09:00",end:"10:30",subj:"Английский язык",meta:"каб. 204 \u00B7 Смирнова Е.Ю.",status:"",statusText:"практика"}],
    "16":[{time:"10:15",end:"11:45",subj:"Компьютерные сети",meta:"каб. 210 \u00B7 Лебедев Р.К.",status:"",statusText:"лекция"},{time:"12:00",end:"13:30",subj:"Программирование",meta:"каб. 214 \u00B7 Иванов И.И.",status:"",statusText:"практика"},{time:"13:45",end:"15:15",subj:"Базы данных",meta:"каб. 210 \u00B7 Кузнецов П.С.",status:"",statusText:"лаб"}],
    "17":[{time:"09:00",end:"10:30",subj:"Веб-разработка",meta:"каб. 301 \u00B7 Морозов А.В.",status:"",statusText:"практика"},{time:"12:45",end:"14:15",subj:"Математика",meta:"каб. 305 \u00B7 Петрова А.В.",status:"",statusText:"практика"}],
    "18":[{time:"10:00",end:"11:30",subj:"Физкультура",meta:"спортзал \u00B7 Орлов Д.С.",status:"",statusText:"зачёт"}],
    "19":[]
  };
  const dayNames=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  const monthNames=["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  let currentWeek=3;
  let weekStartDate=new Date(2026,8,13);
  let selectedDayNum="14";
  function formatWeekTitle(){ const m=monthNames[weekStartDate.getMonth()]; weekTitle.textContent="Неделя "+currentWeek+" \u00B7 "+m; }
  function renderWeekGrid(){
    wdButtons.forEach((btn,i)=>{
      const d=new Date(weekStartDate); d.setDate(weekStartDate.getDate()+i);
      btn.querySelector("b").textContent=d.getDate();
      btn.querySelector("span").textContent=dayNames[i];
      const ns=String(d.getDate());
      const has=(scheduleByDay[ns] && scheduleByDay[ns].length>0);
      btn.classList.toggle("has-dot", has);
      btn.classList.toggle("active", ns===selectedDayNum);
    });
  }
  function renderLessonsForDay(dayNum){
    selectedDayNum=dayNum;
    const list=scheduleByDay[dayNum]||[];
    const d=new Date(weekStartDate);
    const idx=wdButtons.findIndex(b=> b.querySelector("b").textContent===dayNum);
    const daySpan= idx>=0 ? dayNames[idx] : "";
    const dateObj=new Date(weekStartDate); dateObj.setDate(weekStartDate.getDate()+(idx>=0?idx:0));
    const labelText= list.length===0 ? "Нет пар" : list.length+" "+(list.length===1?"пара":list.length<5?"пары":"пар")+" сегодня";
    if(weekSub) weekSub.textContent=labelText;
    if(sectionLabelSmall){
      if(list.length===0) sectionLabelSmall.textContent=daySpan+" \u00B7 "+dateObj.getDate()+" "+monthNames[dateObj.getMonth()];
      else sectionLabelSmall.textContent=daySpan+" \u00B7 "+dateObj.getDate()+" "+monthNames[dateObj.getMonth()];
    }
    if(!lessonsWrap) return;
    lessonsWrap.style.opacity="0"; lessonsWrap.style.transform="translateY(6px)"; lessonsWrap.style.transition="opacity .18s ease, transform .18s ease";
    setTimeout(()=>{
      if(list.length===0){
        lessonsWrap.innerHTML="<div class=\"empty\"><b>Пар нет</b><div style=\"margin-top:6px\">Отдохни — заданий на завтра нет</div><button onclick=\"goToTab(`homework`)\">Перейти к ДЗ</button></div>";
      } else {
        lessonsWrap.innerHTML=list.map(item=>{
          let cls=""; if(item.status==="live") cls="live"; else if(item.status==="done") cls="done";
          return "<article class=\"lesson\" data-subj=\""+item.subj+"\" data-meta=\""+item.meta+"\" data-time=\""+item.time+"\u2013"+item.end+"\"><div class=\"l-time\"><b>"+item.time+"</b><span>"+item.end+"</span></div><div class=\"l-body\"><div class=\"l-subject\">"+item.subj+"</div><div class=\"l-meta\">"+item.meta+"</div></div><span class=\"l-status "+cls+"\">"+item.statusText+"</span></article>";
        }).join("");
        lessonsWrap.querySelectorAll(".lesson").forEach(el=> el.addEventListener("click", ()=> openLessonDetail(el)));
      }
      lessonsWrap.style.opacity="1"; lessonsWrap.style.transform="translateY(0)";
    },160);
    wdButtons.forEach(b=> b.classList.toggle("active", b.querySelector("b").textContent===dayNum));
    try{ localStorage.setItem("diary_day", dayNum);}catch(e){}
  }
  function updateWeek(delta){
    currentWeek+=delta; if(currentWeek<1) currentWeek=1; if(currentWeek>52) currentWeek=52;
    weekStartDate.setDate(weekStartDate.getDate()+delta*7);
    formatWeekTitle(); renderWeekGrid();
    const firstDayNum=wdButtons[0].querySelector("b").textContent;
    renderLessonsForDay(firstDayNum);
    const card=weekTitle.closest(".card"); if(card){ card.style.transition="opacity .18s ease"; card.style.opacity="0.55"; setTimeout(()=> card.style.opacity="1",180); }
    showToast(delta>0 ? "Следующая неделя" : "Предыдущая неделя");
    try{ localStorage.setItem("diary_week", currentWeek); localStorage.setItem("diary_weekStart", weekStartDate.toISOString());}catch(e){}
  }
  if(weekPrev) weekPrev.addEventListener("click", ()=> updateWeek(-1));
  if(weekNext) weekNext.addEventListener("click", ()=> updateWeek(1));
  wdButtons.forEach(d=> d.addEventListener("click", ()=>{
    const num=d.querySelector("b").textContent; renderLessonsForDay(num); if(navigator.vibrate) navigator.vibrate(10);
  }));
  try{ const sd=localStorage.getItem("diary_day"); if(sd && scheduleByDay[sd]!==undefined) selectedDayNum=sd; const sw=localStorage.getItem("diary_week"); const ss=localStorage.getItem("diary_weekStart"); if(sw) currentWeek=parseInt(sw,10); if(ss) weekStartDate=new Date(ss);}catch(e){}
  formatWeekTitle(); renderWeekGrid(); renderLessonsForDay(selectedDayNum);
  // Деталь пары
  const overlay=document.getElementById("overlay");
  function openSheet(id){
    const sheet=document.getElementById(id); if(!sheet){ return; }
    document.querySelectorAll(".sheet").forEach(s=> s.classList.remove("show"));
    sheet.classList.add("show");
    if(overlay) overlay.classList.add("show"); document.body.style.overflow="hidden";
  }
  function closeAllSheets(){ document.querySelectorAll(".sheet").forEach(s=> s.classList.remove("show")); if(overlay) overlay.classList.remove("show"); document.body.style.overflow=""; }
  window.closeAllSheets=closeAllSheets;
  window.openSheet=openSheet;
  window.showToast=showToast;
  if(overlay) overlay.addEventListener("click", closeAllSheets);
  function openLessonDetail(el){
    const subj=el.dataset.subj || el.querySelector(".l-subject").textContent;
    const meta=el.dataset.meta || el.querySelector(".l-meta").textContent;
    const time=el.dataset.time || el.querySelector(".l-time b").textContent;
    const status=el.querySelector(".l-status").textContent;
    const dt=document.getElementById("lessonDetailTitle");
    const db=document.getElementById("lessonDetailBody");
    if(dt) dt.textContent=subj;
    if(db){
      const parts=meta.split(" \u00B7 "); const cab=parts[0]||meta; const teacher=parts[1]||"\u2014";
      db.innerHTML="<div class=\"l-detail-grid\"><div class=\"l-detail-card\"><b>Время</b><span>"+time+"</span></div><div class=\"l-detail-card\"><b>Кабинет</b><span>"+cab+"</span></div><div class=\"l-detail-card\"><b>Преподаватель</b><span>"+teacher+"</span></div><div class=\"l-detail-card\"><b>Статус</b><span><span class=\"s-status "+(status==="идёт"?"live":"")+"\">"+status+"</span></span></div><div style=\"display:flex; gap:8px; margin-top:4px;\"><button class=\"chip\" onclick=\"showToast(`ДЗ скопировано`); closeAllSheets();\">Скопировать ДЗ</button><button class=\"chip\" onclick=\"showToast(`Напоминание поставлено`); closeAllSheets();\">Напомнить</button></div></div>";
    }
    openSheet("sheet-lesson");
  }
  window.openLessonDetail=openLessonDetail;
  document.querySelectorAll(".lesson").forEach(el=> el.addEventListener("click", ()=> openLessonDetail(el)));
  // Предметы — один открыт
  document.querySelectorAll(".subject").forEach(s=>{
    s.setAttribute("role","button"); s.setAttribute("tabindex","0");
    s.addEventListener("click", ()=>{
      const was=s.classList.contains("open");
      document.querySelectorAll(".subject").forEach(x=> x.classList.remove("open"));
      if(!was) s.classList.add("open");
    });
    s.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); s.click(); }});
  });
  // Фильтры ДЗ
  const filterBtns=Array.from(document.querySelectorAll(".fbtn"));
  const allTasks=Array.from(document.querySelectorAll(".task-list .task"));
  const hwBadge=document.querySelector(".nav-badge");
  function updateFilterCounts(){
    const total=allTasks.length;
    const active=allTasks.filter(t=> !t.classList.contains("done") && !t.querySelector(".t-due")?.classList.contains("late")).length;
    const overdue=allTasks.filter(t=> t.querySelector(".t-due")?.classList.contains("late") && !t.classList.contains("done")).length;
    const done=allTasks.filter(t=> t.classList.contains("done")).length;
    const counts=[total,active,overdue,done];
    filterBtns.forEach((btn,i)=>{
      let cnt=btn.querySelector(".f-count"); if(!cnt){ cnt=document.createElement("span"); cnt.className="f-count"; btn.appendChild(cnt); }
      cnt.textContent=counts[i];
    });
    const badgeCount=active+overdue;
    if(hwBadge){ hwBadge.textContent=badgeCount; hwBadge.style.display=badgeCount>0?"grid":"none"; }
    const activeLabel=document.querySelector("#tab-homework .section-label:nth-of-type(1) small");
    const doneLabel=document.querySelector("#tab-homework .section-label:nth-of-type(2) small");
    if(activeLabel) activeLabel.textContent=(active+overdue)+" заданий";
    if(doneLabel) doneLabel.textContent=done+" заданий";
    if(document.getElementById("tab-homework").classList.contains("active")) barEyebrow.textContent=(active+overdue)+" активных заданий";
  }
  function applyFilter(filter){
    const norm=(filter||"").toString().trim().toLowerCase();
    let mode="all";
    if(norm.includes("актуал") || norm.includes("актив") || norm.includes("сегодня")) mode="active";
    else if(norm.includes("просроч")) mode="overdue";
    else if(norm.includes("выполнен")) mode="done";
    allTasks.forEach(t=>{
      const dueEl=t.querySelector(".t-due"); const isDone=t.classList.contains("done"); const isLate=dueEl && dueEl.classList.contains("late");
      let show=true;
      if(mode==="active") show=!isDone && !isLate;
      else if(mode==="overdue") show=!isDone && isLate;
      else if(mode==="done") show=isDone;
      else show=true;
      t.style.display=show? "":"none";
      if(show) t.style.animation="tabIn .22s cubic-bezier(.22,1,.36,1)";
    });
    const anyVisible=allTasks.some(t=> t.style.display!=="none");
    let globalEmpty=document.getElementById("hw-empty");
    if(!anyVisible){
      if(!globalEmpty){ globalEmpty=document.createElement("div"); globalEmpty.id="hw-empty"; globalEmpty.className="empty"; document.querySelector("#tab-homework .task-list:last-of-type").after(globalEmpty); }
      globalEmpty.innerHTML="<b>Ничего не найдено</b><div style=\"margin-top:4px\">Попробуй другой фильтр</div><button onclick=\"filterBtns[0].click()\">Показать все</button>";
      globalEmpty.style.display="";
    } else if(globalEmpty) globalEmpty.style.display="none";
    const lists=document.querySelectorAll("#tab-homework .task-list");
    lists.forEach(list=>{
      const visible=Array.from(list.children).some(c=> c.style.display!=="none");
      const label=list.previousElementSibling;
      if(label && label.classList.contains("section-label")) label.style.display=visible? "":"none";
    });
  }
  filterBtns.forEach(f=>{
    f.addEventListener("click", ()=>{
      filterBtns.forEach(x=> x.classList.remove("active")); f.classList.add("active");
      let raw=(f.textContent||"").replace(/\d/g,"").trim();
      applyFilter(raw);
    });
  });
  updateFilterCounts();
  // Чек-боксы ДЗ — сохранение
  const STORAGE_KEY="diary_tasks_done";
  let doneIds=new Set();
  try{ const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); s.forEach(id=> doneIds.add(id)); }catch(e){}
  allTasks.forEach((t,i)=>{ if(!t.dataset.id) t.dataset.id="task-"+i; if(doneIds.has(t.dataset.id)){ t.classList.add("done"); const due=t.querySelector(".t-due"); if(due){ due.className="t-due ok"; due.textContent="выполнено"; } } });
  updateFilterCounts();
  document.querySelectorAll(".task .check").forEach(c=>{
    c.addEventListener("click", e=>{
      e.stopPropagation();
      const t=c.closest(".task"); const id=t.dataset.id; const due=t.querySelector(".t-due");
      t.classList.toggle("done");
      if(t.classList.contains("done")){
        doneIds.add(id); if(due){ due.dataset.prevClass=due.className; due.dataset.prevText=due.textContent; due.className="t-due ok"; due.textContent="выполнено"; }
        t.style.animation="doneFlash .4s ease"; showToast("Задание выполнено");
      } else {
        doneIds.delete(id); if(due && due.dataset.prevClass){ due.className=due.dataset.prevClass; due.textContent=due.dataset.prevText||"\u2014"; } else if(due){ due.className="t-due"; due.textContent="\u2014"; }
        showToast("Отмечено как невыполненное");
      }
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify([...doneIds])); }catch(e){}
      updateFilterCounts();
      const activeBtn=document.querySelector(".fbtn.active");
      if(activeBtn) applyFilter((activeBtn.textContent||"").replace(/\d/g,"").trim());
    });
  });
  document.querySelectorAll(".task").forEach(t=>{
    t.addEventListener("click", e=>{ if(e.target.closest(".check")) return; const ch=t.querySelector(".check"); if(ch) ch.click(); });
  });
  // Меню профиля — листы
  const menuSheets={ notify:"sheet-notify", group:"sheet-group", year:"sheet-year", settings:"sheet-notify" };
  document.querySelectorAll(".menu-item[data-menu]").forEach(item=>{
    const old=item.cloneNode(true); item.parentNode.replaceChild(old, item);
  });
  document.querySelectorAll(".menu-item[data-menu]").forEach(item=>{
    item.addEventListener("click", ()=>{
      const key=item.dataset.menu; const sid=menuSheets[key];
      if(sid) openSheet(sid);
    });
  });
  // Переключатели
  document.querySelectorAll(".toggle[data-store]").forEach(tog=>{
    const key=tog.dataset.store;
    try{ const v=localStorage.getItem(key); if(v==="1") tog.classList.add("on"); if(v==="0") tog.classList.remove("on"); }catch(e){}
    tog.addEventListener("click", ()=>{
      tog.classList.toggle("on"); try{ localStorage.setItem(key, tog.classList.contains("on")?"1":"0"); }catch(e){}
      showToast(tog.classList.contains("on")? "Включено":"Выключено"); if(navigator.vibrate) navigator.vibrate(10);
    });
  });
  // Показатели — кликабельны
  document.querySelectorAll(".sem-cell.clickable").forEach(cell=>{
    cell.addEventListener("click", ()=>{
      const lbl=cell.querySelector(".sem-lbl").textContent; const val=cell.querySelector(".sem-val").textContent;
      showToast(lbl+": "+val);
    });
  });
  document.querySelectorAll(".sheet-close, [data-close]").forEach(b=> b.addEventListener("click", closeAllSheets));
  document.addEventListener('click', e=>{
    const t=e.target.closest ? e.target.closest('.sheet-close, [data-close]') : null;
    const isOverlay = e.target.id==='overlay' || (e.target.classList && e.target.classList.contains('overlay'));
    if(t || isOverlay){
      closeAllSheets();
    }
  });
  const yearSheet=document.getElementById("sheet-year");
  if(yearSheet){
    const obs=new MutationObserver(()=>{
      if(yearSheet.classList.contains("show")){
        yearSheet.querySelectorAll(".grade-bar i").forEach(bar=>{
          const w=bar.dataset.w||"70%"; bar.style.width="0"; setTimeout(()=>{ bar.style.transition="width .6s cubic-bezier(.22,1,.36,1)"; },50); setTimeout(()=> bar.style.width=w,100);
        });
      }
    });
    obs.observe(yearSheet,{attributes:true, attributeFilter:["class"]});
  }
  window.clearDiaryData=function(){
    if(confirm("Очистить прогресс заданий и настройки?")){
      try{ localStorage.removeItem(STORAGE_KEY);}catch(e){}
      doneIds.clear();
      allTasks.forEach(t=>{ t.classList.remove("done"); const due=t.querySelector(".t-due"); if(due && due.dataset.prevText){ due.textContent=due.dataset.prevText; due.className=due.dataset.prevClass||"t-due"; }});
      filterBtns.forEach((b,i)=> b.classList.toggle("active", i===0));
      applyFilter("Все");
      updateFilterCounts(); showToast("Данные очищены"); closeAllSheets();
    }
  };
  window.exportDiary=function(){
    const data={tasks:[...doneIds], tab:localStorage.getItem("diary_tab"), week:localStorage.getItem("diary_week")};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="diary-export.json"; a.click(); URL.revokeObjectURL(url); showToast("Экспорт сохранён");
  };

}catch(e){console.error('wrapped',e);}