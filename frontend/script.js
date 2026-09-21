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
                barEyebrow.textContent =
                    "Колледж · Группа ИС-21";
            }

            else if (name === "grades") {
                barEyebrow.textContent =
                    "1 семестр · 2026";
            }

            else if (name === "homework") {

                const count =
                    document.querySelectorAll(
                        ".task:not(.done)"
                    ).length;

                barEyebrow.textContent =
                    `${count} активных заданий`;
            }

            else {
                barEyebrow.textContent =
                    "Личный кабинет";
            }
        }

        try {
            localStorage.setItem(
                "diary_tab",
                name
            );
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

        if (e.key === "Escape") {
            window.closeAllSheets();
        }

    });


    // Восстановление вкладки
    try {

        const savedTab =
            localStorage.getItem("diary_tab");

        if (savedTab) {
            goToTab(savedTab, {
                noScroll: true
            });
        }

    } catch (error) {
        console.warn(error);
    }


    // =================================================
    // АВАТАР
    // =================================================

    const avatarButton =
        document.getElementById("avatarBtn");

    if (avatarButton) {

        avatarButton.addEventListener("click", () => {

            const profileTab =
                document.getElementById("tab-profile");

            if (
                profileTab &&
                profileTab.classList.contains("active")
            ) {

                showToast("Вы уже в профиле");

            } else {

                goToTab("profile");

            }

        });

    }


    // =================================================
    // РАСПИСАНИЕ
    // =================================================

    const weekTitle =
        document.getElementById("weekTitle");

    const weekSub =
        document.getElementById("weekSub");

    const weekPrev =
        document.getElementById("weekPrev");

    const weekNext =
        document.getElementById("weekNext");

    const wdButtons =
        Array.from(document.querySelectorAll(".wd"));

    const lessonsWrap =
        document.querySelector(".lessons");

    const sectionLabelSmall =
        document.querySelector(
            "#tab-schedule .section-label small"
        );


    const scheduleByDay = {

        "13": [
            {
                time: "09:00",
                end: "10:30",
                subj: "Математика",
                meta: "каб. 305 · Петрова А.В.",
                status: "done",
                statusText: "прошло"
            },
            {
                time: "10:45",
                end: "12:15",
                subj: "История",
                meta: "каб. 112 · Сидоров К.М.",
                status: "",
                statusText: "лекция"
            },
            {
                time: "13:00",
                end: "14:30",
                subj: "Физкультура",
                meta: "спортзал · Орлов Д.С.",
                status: "",
                statusText: "практика"
            }
        ],

        "14": [
            {
                time: "09:00",
                end: "10:30",
                subj: "Программирование",
                meta: "каб. 214 · Иванов И.И.",
                status: "live",
                statusText: "идёт"
            },
            {
                time: "10:45",
                end: "12:15",
                subj: "Базы данных",
                meta: "каб. 210 · Кузнецов П.С.",
                status: "",
                statusText: "лекция"
            },
            {
                time: "12:45",
                end: "14:15",
                subj: "Веб-разработка",
                meta: "каб. 301 · Морозов А.В.",
                status: "",
                statusText: "практика"
            }
        ],

        "15": [
            {
                time: "09:00",
                end: "10:30",
                subj: "Английский язык",
                meta: "каб. 204 · Смирнова Е.Ю.",
                status: "",
                statusText: "практика"
            }
        ],

        "16": [
            {
                time: "10:15",
                end: "11:45",
                subj: "Компьютерные сети",
                meta: "каб. 210 · Лебедев Р.К.",
                status: "",
                statusText: "лекция"
            },
            {
                time: "12:00",
                end: "13:30",
                subj: "Программирование",
                meta: "каб. 214 · Иванов И.И.",
                status: "",
                statusText: "практика"
            },
            {
                time: "13:45",
                end: "15:15",
                subj: "Базы данных",
                meta: "каб. 210 · Кузнецов П.С.",
                status: "",
                statusText: "лаб"
            }
        ],

        "17": [
            {
                time: "09:00",
                end: "10:30",
                subj: "Веб-разработка",
                meta: "каб. 301 · Морозов А.В.",
                status: "",
                statusText: "практика"
            },
            {
                time: "12:45",
                end: "14:15",
                subj: "Математика",
                meta: "каб. 305 · Петрова А.В.",
                status: "",
                statusText: "практика"
            }
        ],

        "18": [
            {
                time: "10:00",
                end: "11:30",
                subj: "Физкультура",
                meta: "спортзал · Орлов Д.С.",
                status: "",
                statusText: "зачёт"
            }
        ],

        "19": []

    };


    const dayNames = [
        "Пн",
        "Вт",
        "Ср",
        "Чт",
        "Пт",
        "Сб",
        "Вс"
    ];


    const monthNames = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря"
    ];


    let currentWeek = 3;

    let weekStartDate =
        new Date(2026, 8, 13);

    let selectedDayNum = "14";


    function formatWeekTitle() {

        if (!weekTitle) return;

        const month =
            monthNames[
                weekStartDate.getMonth()
            ];

        weekTitle.textContent =
            `Неделя ${currentWeek} · ${month}`;
    }


    function renderWeekGrid() {

        wdButtons.forEach((button, index) => {

            const date =
                new Date(weekStartDate);

            date.setDate(
                weekStartDate.getDate() + index
            );

            const number =
                date.getDate();

            const numberString =
                String(number);

            const hasLessons =
                scheduleByDay[numberString] &&
                scheduleByDay[numberString].length > 0;

            const span =
                button.querySelector("span");

            const bold =
                button.querySelector("b");

            if (span) {
                span.textContent =
                    dayNames[index];
            }

            if (bold) {
                bold.textContent =
                    number;
            }

            button.classList.toggle(
                "has-dot",
                hasLessons
            );

            button.classList.toggle(
                "active",
                numberString === selectedDayNum
            );

        });

    }


    function renderLessonsForDay(dayNum) {

        selectedDayNum = dayNum;

        const list =
            scheduleByDay[dayNum] || [];

        const index =
            wdButtons.findIndex(
                (button) =>
                    button.querySelector("b")?.textContent === dayNum
            );

        const dayName =
            index >= 0
                ? dayNames[index]
                : "";

        const date =
            new Date(weekStartDate);

        date.setDate(
            weekStartDate.getDate() +
            (index >= 0 ? index : 0)
        );


        const lessonCount =
            list.length;

        let labelText;

        if (lessonCount === 0) {

            labelText = "Нет пар";

        } else if (lessonCount === 1) {

            labelText = "1 пара сегодня";

        } else if (lessonCount < 5) {

            labelText =
                `${lessonCount} пары сегодня`;

        } else {

            labelText =
                `${lessonCount} пар сегодня`;

        }


        if (weekSub) {
            weekSub.textContent =
                labelText;
        }


        if (sectionLabelSmall) {

            sectionLabelSmall.textContent =
                `${dayName} · ${date.getDate()} ${monthNames[date.getMonth()]}`;

        }


        if (!lessonsWrap) return;


        lessonsWrap.style.opacity = "0";
        lessonsWrap.style.transform =
            "translateY(6px)";

        lessonsWrap.style.transition =
            "opacity .18s ease, transform .18s ease";


        setTimeout(() => {

            if (list.length === 0) {

                lessonsWrap.innerHTML = `
                    <div class="empty">
                        <b>Пар нет</b>
                        <div style="margin-top:6px">
                            Отдохни — заданий на завтра нет
                        </div>
                        <button onclick="goToTab('homework')">
                            Перейти к ДЗ
                        </button>
                    </div>
                `;

            } else {

                lessonsWrap.innerHTML =
                    list.map((item) => {

                        let className = "";

                        if (item.status === "live") {
                            className = "live";
                        }

                        if (item.status === "done") {
                            className = "done";
                        }


                        return `
                            <article
                                class="lesson"
                                data-subj="${item.subj}"
                                data-meta="${item.meta}"
                                data-time="${item.time}–${item.end}"
                            >

                                <div class="l-time">
                                    <b>${item.time}</b>
                                    <span>${item.end}</span>
                                </div>

                                <div class="l-body">
                                    <div class="l-subject">
                                        ${item.subj}
                                    </div>

                                    <div class="l-meta">
                                        ${item.meta}
                                    </div>
                                </div>

                                <span class="l-status ${className}">
                                    ${item.statusText}
                                </span>

                            </article>
                        `;

                    }).join("");


                lessonsWrap
                    .querySelectorAll(".lesson")
                    .forEach((lesson) => {

                        lesson.addEventListener(
                            "click",
                            () => openLessonDetail(lesson)
                        );

                    });

            }


            lessonsWrap.style.opacity = "1";

            lessonsWrap.style.transform =
                "translateY(0)";

        }, 160);


        wdButtons.forEach((button) => {

            button.classList.toggle(
                "active",
                button.querySelector("b")?.textContent === dayNum
            );

        });


        try {

            localStorage.setItem(
                "diary_day",
                dayNum
            );

        } catch (error) {
            console.warn(error);
        }

    }


    function updateWeek(delta) {

        currentWeek += delta;

        if (currentWeek < 1) {
            currentWeek = 1;
        }

        if (currentWeek > 52) {
            currentWeek = 52;
        }


        weekStartDate.setDate(
            weekStartDate.getDate() +
            delta * 7
        );


        formatWeekTitle();

        renderWeekGrid();


        const firstDay =
            wdButtons[0]?.querySelector("b")?.textContent;

        if (firstDay) {
            renderLessonsForDay(firstDay);
        }


        const card =
            weekTitle?.closest(".card");

        if (card) {

            card.style.transition =
                "opacity .18s ease";

            card.style.opacity = "0.55";

            setTimeout(() => {
                card.style.opacity = "1";
            }, 180);

        }


        showToast(
            delta > 0
                ? "Следующая неделя"
                : "Предыдущая неделя"
        );


        try {

            localStorage.setItem(
                "diary_week",
                String(currentWeek)
            );

            localStorage.setItem(
                "diary_weekStart",
                weekStartDate.toISOString()
            );

        } catch (error) {
            console.warn(error);
        }

    }


    if (weekPrev) {
        weekPrev.addEventListener(
            "click",
            () => updateWeek(-1)
        );
    }


    if (weekNext) {
        weekNext.addEventListener(
            "click",
            () => updateWeek(1)
        );
    }


    wdButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const number =
                    button.querySelector("b")?.textContent;

                if (!number) return;

                renderLessonsForDay(number);

                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }

            }
        );

    });


    // Восстановление недели
    try {

        const savedDay =
            localStorage.getItem("diary_day");

        if (
            savedDay &&
            scheduleByDay[savedDay] !== undefined
        ) {
            selectedDayNum = savedDay;
        }


        const savedWeek =
            localStorage.getItem("diary_week");

        const savedStart =
            localStorage.getItem("diary_weekStart");


        if (savedWeek) {
            currentWeek =
                parseInt(savedWeek, 10);
        }


        if (savedStart) {

            const savedDate =
                new Date(savedStart);

            if (!Number.isNaN(savedDate.getTime())) {
                weekStartDate = savedDate;
            }

        }

    } catch (error) {
        console.warn(error);
    }


    formatWeekTitle();

    renderWeekGrid();

    renderLessonsForDay(selectedDayNum);


    // =================================================
    // ДЕТАЛИ ПАРЫ
    // =================================================

    const overlay =
        document.getElementById("overlay");


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


        const status =
            element.querySelector(".l-status")?.textContent ||
            "";


        const title =
            document.getElementById(
                "lessonDetailTitle"
            );


        const body =
            document.getElementById(
                "lessonDetailBody"
            );


        if (title) {
            title.textContent =
                subject.trim();
        }


        if (body) {

            const parts =
                meta.split(" · ");

            const cabinet =
                parts[0] || meta;

            const teacher =
                parts[1] || "—";


            body.innerHTML = `

                <div class="l-detail-grid">

                    <div class="l-detail-card">
                        <b>Время</b>
                        <span>${time}</span>
                    </div>

                    <div class="l-detail-card">
                        <b>Кабинет</b>
                        <span>${cabinet}</span>
                    </div>

                    <div class="l-detail-card">
                        <b>Преподаватель</b>
                        <span>${teacher}</span>
                    </div>

                    <div class="l-detail-card">
                        <b>Статус</b>
                        <span>
                            <span class="s-status ${
                                status.trim() === "идёт"
                                    ? "live"
                                    : ""
                            }">
                                ${status.trim()}
                            </span>
                        </span>
                    </div>

                    <div style="
                        display:flex;
                        gap:8px;
                        margin-top:4px;
                    ">

                        <button
                            class="chip"
                            onclick="
                                showToast('ДЗ скопировано');
                                closeAllSheets();
                            "
                        >
                            Скопировать ДЗ
                        </button>

                        <button
                            class="chip"
                            onclick="
                                showToast('Напоминание поставлено');
                                closeAllSheets();
                            "
                        >
                            Напомнить
                        </button>

                    </div>

                </div>

            `;

        }


        window.openSheet("sheet-lesson");

    }


    window.openLessonDetail =
        openLessonDetail;


    document
        .querySelectorAll(".lesson")
        .forEach((lesson) => {

            lesson.addEventListener(
                "click",
                () => openLessonDetail(lesson)
            );

        });


    // =================================================
    // ПРЕДМЕТЫ
    // =================================================

    document
        .querySelectorAll(".subject")
        .forEach((subject) => {

            subject.setAttribute(
                "role",
                "button"
            );

            subject.setAttribute(
                "tabindex",
                "0"
            );


            subject.addEventListener(
                "click",
                () => {

                    const wasOpen =
                        subject.classList.contains("open");


                    document
                        .querySelectorAll(".subject")
                        .forEach((item) => {
                            item.classList.remove("open");
                        });


                    if (!wasOpen) {
                        subject.classList.add("open");
                    }

                }
            );


            subject.addEventListener(
                "keydown",
                (e) => {

                    if (
                        e.key === "Enter" ||
                        e.key === " "
                    ) {

                        e.preventDefault();

                        subject.click();

                    }

                }
            );

        });


    // =================================================
    // ДОМАШНИЕ ЗАДАНИЯ
    // =================================================

    const filterButtons =
        Array.from(
            document.querySelectorAll(".fbtn")
        );


    const allTasks =
        Array.from(
            document.querySelectorAll(
                ".task-list .task"
            )
        );


    const homeworkBadge =
        document.querySelector(".nav-badge");


    function updateFilterCounts() {

        const total =
            allTasks.length;


        const active =
            allTasks.filter(
                (task) =>
                    !task.classList.contains("done") &&
                    !task.querySelector(".t-due")
                        ?.classList.contains("late")
            ).length;


        const overdue =
            allTasks.filter(
                (task) =>
                    task.querySelector(".t-due")
                        ?.classList.contains("late") &&
                    !task.classList.contains("done")
            ).length;


        const done =
            allTasks.filter(
                (task) =>
                    task.classList.contains("done")
            ).length;


        const counts = [
            total,
            active,
            overdue,
            done
        ];


        filterButtons.forEach(
            (button, index) => {

                let count =
                    button.querySelector(
                        ".f-count"
                    );


                if (!count) {

                    count =
                        document.createElement(
                            "span"
                        );

                    count.className =
                        "f-count";

                    button.appendChild(count);

                }


                count.textContent =
                    counts[index];

            }
        );


        const badgeCount =
            active + overdue;


        if (homeworkBadge) {

            homeworkBadge.textContent =
                badgeCount;

            homeworkBadge.style.display =
                badgeCount > 0
                    ? "grid"
                    : "none";

        }


        const labels =
            document.querySelectorAll(
                "#tab-homework .section-label small"
            );


        if (labels[0]) {
            labels[0].textContent =
                `${active + overdue} заданий`;
        }


        if (labels[1]) {
            labels[1].textContent =
                `${done} заданий`;
        }


        if (
            document
                .getElementById("tab-homework")
                ?.classList.contains("active")
        ) {

            barEyebrow.textContent =
                `${active + overdue} активных заданий`;

        }

    }


    function applyFilter(filter) {

        const normalized =
            String(filter || "")
                .trim()
                .toLowerCase();


        let mode = "all";


        if (
            normalized.includes("актив")
        ) {

            mode = "active";

        } else if (
            normalized.includes("просроч")
        ) {

            mode = "overdue";

        } else if (
            normalized.includes("выполн")
        ) {

            mode = "done";

        }


        allTasks.forEach((task) => {

            const due =
                task.querySelector(".t-due");

            const isDone =
                task.classList.contains("done");

            const isLate =
                due &&
                due.classList.contains("late");


            let show = true;


            if (mode === "active") {
                show = !isDone && !isLate;
            }

            else if (mode === "overdue") {
                show = !isDone && isLate;
            }

            else if (mode === "done") {
                show = isDone;
            }


            task.style.display =
                show ? "" : "none";


            if (show) {
                task.style.animation =
                    "tabIn .22s cubic-bezier(.22,1,.36,1)";
            }

        });


        const anyVisible =
            allTasks.some(
                (task) =>
                    task.style.display !== "none"
            );


        let empty =
            document.getElementById("hw-empty");


        if (!anyVisible) {

            if (!empty) {

                empty =
                    document.createElement(
                        "div"
                    );

                empty.id = "hw-empty";
                empty.className = "empty";


                const lists =
                    document.querySelectorAll(
                        "#tab-homework .task-list"
                    );


                const lastList =
                    lists[lists.length - 1];


                if (lastList) {
                    lastList.after(empty);
                }

            }


            empty.innerHTML = `
                <b>Ничего не найдено</b>
                <div style="margin-top:4px">
                    Попробуй другой фильтр
                </div>
                <button onclick="
                    document.querySelector('.fbtn').click()
                ">
                    Показать все
                </button>
            `;

            empty.style.display = "";

        }

        else if (empty) {

            empty.style.display = "none";

        }


        document
            .querySelectorAll(
                "#tab-homework .task-list"
            )
            .forEach((list) => {

                const visible =
                    Array.from(list.children)
                        .some(
                            (child) =>
                                child.style.display !== "none"
                        );


                const label =
                    list.previousElementSibling;


                if (
                    label &&
                    label.classList.contains(
                        "section-label"
                    )
                ) {

                    label.style.display =
                        visible ? "" : "none";

                }

            });

    }


    filterButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    (item) =>
                        item.classList.remove("active")
                );


                button.classList.add("active");


                const raw =
                    (button.textContent || "")
                        .replace(/\d/g, "")
                        .trim();


                applyFilter(raw);

            }
        );

    });


    updateFilterCounts();


    // =================================================
    // СОХРАНЕНИЕ ВЫПОЛНЕННЫХ ЗАДАНИЙ
    // =================================================

    const STORAGE_KEY =
        "diary_tasks_done";


    const doneIds =
        new Set();


    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );


        saved.forEach(
            (id) => doneIds.add(id)
        );

    } catch (error) {
        console.warn(error);
    }


    allTasks.forEach((task, index) => {

        if (!task.dataset.id) {
            task.dataset.id =
                `task-${index}`;
        }


        if (
            doneIds.has(
                task.dataset.id
            )
        ) {

            task.classList.add("done");


            const due =
                task.querySelector(".t-due");


            if (due) {

                due.className =
                    "t-due ok";

                due.textContent =
                    "выполнено";

            }

        }

    });


    updateFilterCounts();


    document
        .querySelectorAll(".task .check")
        .forEach((check) => {

            check.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    const task =
                        check.closest(".task");


                    if (!task) return;


                    const id =
                        task.dataset.id;


                    const due =
                        task.querySelector(".t-due");


                    task.classList.toggle(
                        "done"
                    );


                    if (
                        task.classList.contains("done")
                    ) {

                        doneIds.add(id);


                        if (due) {

                            due.dataset.prevClass =
                                due.className;

                            due.dataset.prevText =
                                due.textContent;

                            due.className =
                                "t-due ok";

                            due.textContent =
                                "выполнено";

                        }


                        task.style.animation =
                            "doneFlash .4s ease";


                        showToast(
                            "Задание выполнено"
                        );

                    } else {

                        doneIds.delete(id);


                        if (
                            due &&
                            due.dataset.prevClass
                        ) {

                            due.className =
                                due.dataset.prevClass;

                            due.textContent =
                                due.dataset.prevText ||
                                "—";

                        } else if (due) {

                            due.className =
                                "t-due";

                            due.textContent =
                                "—";

                        }


                        showToast(
                            "Отмечено как невыполненное"
                        );

                    }


                    try {

                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify(
                                [...doneIds]
                            )
                        );

                    } catch (error) {
                        console.warn(error);
                    }


                    updateFilterCounts();


                    const activeButton =
                        document.querySelector(
                            ".fbtn.active"
                        );


                    if (activeButton) {

                        applyFilter(
                            activeButton.textContent
                                .replace(/\d/g, "")
                                .trim()
                        );

                    }

                }
            );

        });


    document
        .querySelectorAll(".task")
        .forEach((task) => {

            task.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.closest(".check")
                    ) {
                        return;
                    }


                    const check =
                        task.querySelector(".check");


                    if (check) {
                        check.click();
                    }

                }
            );

        });


    // =================================================
    // ПРОФИЛЬ — SHEETS
    // =================================================

    const menuSheets = {

        notify: "sheet-notify",

        group: "sheet-group",

        year: "sheet-year",

        settings: "sheet-notify"

    };


    document
        .querySelectorAll(".menu-item[data-menu]")
        .forEach((item) => {

            item.addEventListener(
                "click",
                () => {

                    const key =
                        item.dataset.menu;

                    const sheetId =
                        menuSheets[key];


                    if (sheetId) {
                        window.openSheet(sheetId);
                    }

                }
            );

        });


    // =================================================
    // ПЕРЕКЛЮЧАТЕЛИ
    // =================================================

    document
        .querySelectorAll(
            ".toggle[data-store]"
        )
        .forEach((toggle) => {

            const key =
                toggle.dataset.store;


            try {

                const value =
                    localStorage.getItem(key);


                if (value === "1") {
                    toggle.classList.add("on");
                }

                if (value === "0") {
                    toggle.classList.remove("on");
                }

            } catch (error) {
                console.warn(error);
            }


            toggle.addEventListener(
                "click",
                () => {

                    toggle.classList.toggle("on");


                    try {

                        localStorage.setItem(
                            key,
                            toggle.classList.contains("on")
                                ? "1"
                                : "0"
                        );

                    } catch (error) {
                        console.warn(error);
                    }


                    showToast(
                        toggle.classList.contains("on")
                            ? "Включено"
                            : "Выключено"
                    );


                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }

                }
            );

        });


    // =================================================
    // ПОКАЗАТЕЛИ
    // =================================================

    document
        .querySelectorAll(
            ".sem-cell.clickable"
        )
        .forEach((cell) => {

            cell.addEventListener(
                "click",
                () => {

                    const label =
                        cell.querySelector(
                            ".sem-lbl"
                        )?.textContent || "";


                    const value =
                        cell.querySelector(
                            ".sem-val"
                        )?.textContent || "";


                    showToast(
                        `${label}: ${value}`
                    );

                }
            );

        });


    // =================================================
    // ЗАКРЫТИЕ SHEETS
    // =================================================

    document
        .querySelectorAll(
            ".sheet-close, [data-close]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                window.closeAllSheets
            );

        });


    // =================================================
    // ГРАФИК УСПЕВАЕМОСТИ
    // =================================================

    const yearSheet =
        document.getElementById(
            "sheet-year"
        );


    if (yearSheet) {

        const observer =
            new MutationObserver(() => {

                if (
                    yearSheet.classList.contains(
                        "show"
                    )
                ) {

                    yearSheet
                        .querySelectorAll(
                            ".grade-bar i"
                        )
                        .forEach((bar) => {

                            const width =
                                bar.dataset.w ||
                                "70%";


                            bar.style.width =
                                "0";


                            setTimeout(() => {

                                bar.style.transition =
                                    "width .6s cubic-bezier(.22,1,.36,1)";

                            }, 50);


                            setTimeout(() => {

                                bar.style.width =
                                    width;

                            }, 100);

                        });

                }

            });


        observer.observe(
            yearSheet,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    // =================================================
    // ОЧИСТКА ДАННЫХ
    // =================================================

    window.clearDiaryData =
        function () {

            if (
                !confirm(
                    "Очистить прогресс заданий и настройки?"
                )
            ) {
                return;
            }


            try {

                localStorage.removeItem(
                    STORAGE_KEY
                );

            } catch (error) {
                console.warn(error);
            }


            doneIds.clear();


            allTasks.forEach((task) => {

                task.classList.remove(
                    "done"
                );


                const due =
                    task.querySelector(".t-due");


                if (
                    due &&
                    due.dataset.prevText
                ) {

                    due.textContent =
                        due.dataset.prevText;

                    due.className =
                        due.dataset.prevClass ||
                        "t-due";

                }

            });


            filterButtons.forEach(
                (button, index) => {

                    button.classList.toggle(
                        "active",
                        index === 0
                    );

                }
            );


            applyFilter("Все");

            updateFilterCounts();

            showToast(
                "Данные очищены"
            );

            window.closeAllSheets();

        };


    // =================================================
    // ЭКСПОРТ
    // =================================================

    window.exportDiary =
        function () {

            const data = {

                tasks: [
                    ...doneIds
                ],

                tab:
                    localStorage.getItem(
                        "diary_tab"
                    ),

                week:
                    localStorage.getItem(
                        "diary_week"
                    )

            };


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "diary-export.json";


            link.click();


            URL.revokeObjectURL(url);


            showToast(
                "Экспорт сохранён"
            );

        };

} catch (error) {

    console.error(
        "Ошибка основного JS:",
        error
    );

}


// =====================================================
// API — БЕЗ await ВНЕ async
// =====================================================

async function apiFetch(
    endpoint,
    options = {}
) {

    try {

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})
                    }
                }
            );


        const contentType =
            response.headers.get(
                "content-type"
            );


        let data;


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            data =
                await response.text();

        }


        if (!response.ok) {

            const message =
                typeof data === "object"
                    ? data.error
                    : data;


            throw new Error(
                message ||
                `Ошибка HTTP: ${response.status}`
            );

        }


        return data;

    } catch (error) {

        console.error(
            `Ошибка API ${endpoint}:`,
            error
        );

        throw error;

    }

}


// =====================================================
// API: ПРОФИЛИ
// =====================================================

async function getProfiles() {

    const profiles =
        await apiFetch("/profiles");

    console.log(
        "Профили:",
        profiles
    );

    return profiles;
}


// =====================================================
// API: ГРУППЫ
// =====================================================

async function getGroups() {

    const groups =
        await apiFetch("/groups");

    console.log(
        "Группы:",
        groups
    );

    return groups;
}


// =====================================================
// API: ЗАНЯТИЯ
// =====================================================

async function getLessons() {

    const lessons =
        await apiFetch("/lessons");

    console.log(
        "Занятия:",
        lessons
    );

    return lessons;
}


// =====================================================
// API: ОЦЕНКИ
// =====================================================

async function getGrades() {

    const grades =
        await apiFetch("/grades");

    console.log(
        "Оценки:",
        grades
    );

    return grades;
}


// =====================================================
// API: ПОСЕЩАЕМОСТЬ
// =====================================================

async function getAttendance() {

    const attendance =
        await apiFetch("/attendance");

    console.log(
        "Посещаемость:",
        attendance
    );

    return attendance;
}


// =====================================================
// API: ДОМАШНИЕ ЗАДАНИЯ
// =====================================================

async function getHomework() {

    const homework =
        await apiFetch("/homework");

    console.log(
        "Домашние задания:",
        homework
    );

    return homework;
}


// =====================================================
// ТЕСТ BACKEND
// =====================================================

async function testBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/test`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const text =
            await response.text();


        console.log(
            "BACKEND:",
            text
        );


        return text;

    } catch (error) {

        console.error(
            "Backend недоступен:",
            error
        );

    }

}


// =====================================================
// ЗАПУСК API
// =====================================================

// Проверяем backend
testBackend();


// Загружаем данные из Supabase
// Ошибка одного запроса не сломает весь сайт.

(async function loadApiData() {

    try {

        const profiles =
            await getProfiles();

        console.log(
            "Profiles loaded:",
            profiles
        );

    } catch (error) {

        console.error(
            "Не удалось загрузить profiles"
        );

    }


    try {

        const groups =
            await getGroups();

        console.log(
            "Groups loaded:",
            groups
        );

    } catch (error) {

        console.error(
            "Не удалось загрузить groups"
        );

    }


    try {

        const lessons =
            await getLessons();

        console.log(
            "Lessons loaded:",
            lessons
        );

    } catch (error) {

        console.error(
            "Не удалось загрузить lessons"
        );

    }


    try {

        const grades =
            await getGrades();

        console.log(
            "Grades loaded:",
            grades
        );

    } catch (error) {

        console.error(
            "Не удалось загрузить grades"
        );

    }


    try {

        const attendance =
            await getAttendance();

        console.log(
            "Attendance loaded:",
            attendance
        );

    } catch (error) {

        console.error(
            "Не удалось загрузить attendance"
        );

    }


    try {

        const homework =
            await getHomework();

        console.log(
            "Homework loaded:",
            homework
        );

    } catch (error) {

        console.error(
            "Не удалось загрузить homework"
        );

    }

})();