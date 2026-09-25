// =========================
// DOM
// =========================

const calendarDays = document.getElementById("calendar-days");
const currentMonthElement = document.getElementById("current-month");

const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const openTutorialButton = document.getElementById("open-tutorial");

const modal = document.getElementById("modal");
const closeModalButton = document.getElementById("close-modal");

const selectedDateElement = document.getElementById("selected-date");

const eventForm = document.getElementById("event-form");
const eventTitleInput = document.getElementById("event-title");
const eventTimeInput = document.getElementById("event-time");
const eventSubmitButton = document.getElementById("event-submit");

const tutorial = document.getElementById("tutorial");
const tutorialCard = tutorial.querySelector(".tutorial-card");
const tutorialTitle = document.getElementById("tutorial-title");
const tutorialDescription = document.getElementById("tutorial-description");
const tutorialStepCount = document.getElementById("tutorial-step-count");
const tutorialDots = document.getElementById("tutorial-dots");
const tutorialSkipButton = document.getElementById("tutorial-skip");
const tutorialBackButton = document.getElementById("tutorial-back");
const tutorialNextButton = document.getElementById("tutorial-next");


// =========================
// 現在の日付
// =========================

let currentDate = new Date();


// 選択された日付
let selectedDate = null;

let tutorialStep = 0;
let tutorialTarget = null;

const tutorialSteps = [
    {
        title: "月を切り替える",
        description: "左右の矢印で、前後の月の予定を確認できます。",
        target: () => prevMonthButton
    },
    {
        title: "日付を選ぶ",
        description: "予定を入れたい日付をクリックすると、入力画面が開きます。",
        target: () => calendarDays.querySelector(".day:not(.other-month)")
    },
    {
        title: "内容を追加する",
        description: "予定の名前を入力してください。入力が完了すると次へ進みます。",
        target: () => eventTitleInput
    },
    {
        title: "予定を追加ボタンを押す",
        description: "入力した内容をカレンダーに登録するため、「追加」ボタンを押してください。",
        target: () => eventSubmitButton
    },
    {
        title: "予定を削除する",
        description: "登録された予定をクリックし、確認画面で削除してください。",
        target: () => calendarDays.querySelector(".event")
    }
];


// =========================
// localStorageから予定を取得
// =========================

let events = JSON.parse(
    localStorage.getItem("calendarEvents")
) || {};


// =========================
// カレンダーを表示
// =========================

function renderCalendar() {

    calendarDays.innerHTML = "";


    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();


    // 月の最初の日
    const firstDay = new Date(year, month, 1);


    // 月の最後の日
    const lastDay = new Date(year, month + 1, 0);


    // 前月の最後の日
    const previousLastDay = new Date(year, month, 0);


    // 月の1日が何曜日か
    const startDay = firstDay.getDay();


    // 今月の日数
    const daysInMonth = lastDay.getDate();


    // 前月の日数
    const previousDays = previousLastDay.getDate();


    // ヘッダー表示

    currentMonthElement.textContent =
        `${year}年 ${month + 1}月`;


    // =========================
    // 前月の日付
    // =========================

    for (let i = startDay - 1; i >= 0; i--) {

        const dayNumber = previousDays - i;

        const date = new Date(
            year,
            month - 1,
            dayNumber
        );

        createDayElement(
            dayNumber,
            date,
            true
        );
    }


    // =========================
    // 今月の日付
    // =========================

    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(
            year,
            month,
            day
        );

        createDayElement(
            day,
            date,
            false
        );
    }


    // =========================
    // 次月の日付
    // =========================

    const totalCells =
        startDay + daysInMonth;

    const remainingCells =
        Math.ceil(totalCells / 7) * 7 - totalCells;


    for (let day = 1; day <= remainingCells; day++) {

        const date = new Date(
            year,
            month + 1,
            day
        );

        createDayElement(
            day,
            date,
            true
        );
    }
}


// =========================
// 日付要素を作成
// =========================

function createDayElement(
    dayNumber,
    date,
    isOtherMonth
) {

    const dayElement = document.createElement("div");

    dayElement.classList.add("day");


    if (isOtherMonth) {
        dayElement.classList.add("other-month");
    }


    // 今日か判定

    const today = new Date();

    if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    ) {

        dayElement.classList.add("today");
    }


    // 日付番号

    const numberElement =
        document.createElement("span");

    numberElement.classList.add("day-number");

    numberElement.textContent = dayNumber;


    dayElement.appendChild(numberElement);


    // =========================
    // 予定を表示
    // =========================

    const dateKey = getDateKey(date);


    if (events[dateKey]) {

        events[dateKey].forEach(
            (event, index) => {

                const eventElement =
                    document.createElement("div");

                eventElement.classList.add("event");


                if (event.time) {

                    eventElement.textContent =
                        `${event.time} ${event.title}`;

                } else {

                    eventElement.textContent =
                        event.title;
                }


                // 予定クリック

                eventElement.addEventListener(
                    "click",
                    (e) => {

                        e.stopPropagation();

                        deleteEvent(
                            dateKey,
                            index
                        );
                    }
                );


                dayElement.appendChild(
                    eventElement
                );
            }
        );
    }


    // =========================
    // 日付クリック
    // =========================

    dayElement.addEventListener(
        "click",
        () => {

            openModal(date);

            if (tutorial.classList.contains("show") && tutorialStep === 1) {
                tutorialStep = 2;
                renderTutorial();
            }
        }
    );


    calendarDays.appendChild(
        dayElement
    );
}


// =========================
// 日付をキーに変換
// =========================

function getDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// =========================
// モーダルを開く
// =========================

function openModal(date) {

    selectedDate = date;


    const year =
        date.getFullYear();

    const month =
        date.getMonth() + 1;

    const day =
        date.getDate();


    selectedDateElement.textContent =
        `${year}年${month}月${day}日`;


    eventTitleInput.value = "";
    eventTimeInput.value = "";


    modal.classList.add("show");


    eventTitleInput.focus();
}


// =========================
// モーダルを閉じる
// =========================

function closeModal() {

    modal.classList.remove("show");

    selectedDate = null;
}


closeModalButton.addEventListener(
    "click",
    closeModal
);


// モーダル外をクリック

modal.addEventListener(
    "click",
    (e) => {

        if (e.target === modal) {
            closeModal();
        }
    }
);


// =========================
// 予定を追加
// =========================

eventForm.addEventListener(
    "submit",
    (e) => {

        e.preventDefault();


        if (!selectedDate) {
            return;
        }


        const title =
            eventTitleInput.value.trim();

        const time =
            eventTimeInput.value;


        if (!title) {
            return;
        }


        const dateKey =
            getDateKey(selectedDate);


        // その日の予定がなければ作る

        if (!events[dateKey]) {
            events[dateKey] = [];
        }


        // 予定追加

        events[dateKey].push({

            title: title,

            time: time
        });


        // localStorageに保存

        localStorage.setItem(
            "calendarEvents",
            JSON.stringify(events)
        );


        // カレンダー更新

        renderCalendar();


        // モーダル閉じる

        closeModal();

        if (tutorial.classList.contains("show") && tutorialStep === 3) {
            tutorialStep = 4;
            renderTutorial();
        }
    }
);


eventTitleInput.addEventListener(
    "input",
    () => {

        if (
            tutorial.classList.contains("show") &&
            tutorialStep === 2 &&
            eventTitleInput.value.trim()
        ) {
            tutorialStep = 3;
            renderTutorial();
        }
    }
);


// =========================
// 予定を削除
// =========================

function deleteEvent(
    dateKey,
    eventIndex
) {

    const event =
        events[dateKey][eventIndex];


    const result =
        confirm(
            `「${event.title}」を削除しますか？`
        );


    if (!result) {
        return;
    }


    events[dateKey].splice(
        eventIndex,
        1
    );


    // その日の予定が0件なら削除

    if (events[dateKey].length === 0) {

        delete events[dateKey];
    }


    localStorage.setItem(
        "calendarEvents",
        JSON.stringify(events)
    );


    renderCalendar();

    if (tutorial.classList.contains("show") && tutorialStep === 4) {
        closeTutorial();
    }
}


// =========================
// インタラクティブチュートリアル
// =========================

function renderTutorial() {

    const step = tutorialSteps[tutorialStep];

    tutorialTitle.textContent = step.title;
    tutorialDescription.textContent = step.description;
    tutorialStepCount.textContent = `${tutorialStep + 1} / ${tutorialSteps.length}`;
    tutorialNextButton.textContent =
        tutorialStep === tutorialSteps.length - 1 ? "完了" : "次へ";
    tutorialBackButton.hidden = tutorialStep === 0;

    tutorial.classList.toggle(
        "input-step",
        tutorialStep === 2 || tutorialStep === 3
    );

    tutorialDots.innerHTML = "";

    tutorialSteps.forEach((_, index) => {

        const dot = document.createElement("span");
        dot.classList.add("tutorial-dot");

        if (index === tutorialStep) {
            dot.classList.add("active");
        }

        tutorialDots.appendChild(dot);
    });

    if (tutorialTarget) {
        tutorialTarget.classList.remove("tutorial-target");
    }

    tutorialTarget = step.target();

    if (tutorialTarget) {
        tutorialTarget.classList.add("tutorial-target");
        positionTutorialCard(tutorialTarget);
    } else {
        centerTutorialCard();
    }
}


function positionTutorialCard(target) {

    const targetRect = target.getBoundingClientRect();
    const cardWidth = tutorialCard.offsetWidth;
    const margin = 16;
    const gap = 22;

    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    let top = targetRect.bottom + gap;

    left = Math.max(margin, Math.min(left, window.innerWidth - cardWidth - margin));

    if (top + tutorialCard.offsetHeight > window.innerHeight - margin) {
        top = targetRect.top - tutorialCard.offsetHeight - gap;
    }

    if (top < margin) {
        top = margin;
    }

    tutorialCard.style.left = `${left}px`;
    tutorialCard.style.top = `${top}px`;
    tutorialCard.style.bottom = "auto";
    tutorialCard.style.transform = "none";
}


function centerTutorialCard() {

    tutorialCard.style.left = "50%";
    tutorialCard.style.top = "50%";
    tutorialCard.style.bottom = "auto";
    tutorialCard.style.transform = "translate(-50%, -50%)";
}


function openTutorial() {

    tutorialStep = 0;
    tutorial.classList.add("show");
    tutorial.setAttribute("aria-hidden", "false");
    renderTutorial();
}


function closeTutorial() {

    tutorial.classList.remove("show");
    tutorial.setAttribute("aria-hidden", "true");

    if (tutorialTarget) {
        tutorialTarget.classList.remove("tutorial-target");
        tutorialTarget = null;
    }

    localStorage.setItem("calendarTutorialSeen", "true");
}


function moveTutorial(stepChange) {

    tutorialStep += stepChange;

    if (tutorialStep >= tutorialSteps.length) {
        closeTutorial();
        return;
    }

    tutorialStep = Math.max(0, tutorialStep);
    renderTutorial();
}


openTutorialButton.addEventListener("click", openTutorial);
tutorialSkipButton.addEventListener("click", closeTutorial);
tutorialBackButton.addEventListener("click", () => moveTutorial(-1));

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && tutorial.classList.contains("show")) {
        closeTutorial();
    }
});

window.addEventListener("resize", () => {

    if (tutorial.classList.contains("show")) {
        renderTutorial();
    }
});


// =========================
// 前月
// =========================

prevMonthButton.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();

        if (tutorial.classList.contains("show") && tutorialStep === 0) {
            tutorialStep = 1;
            renderTutorial();
        }
    }
);


// =========================
// 次月
// =========================

nextMonthButton.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();

        if (tutorial.classList.contains("show") && tutorialStep === 0) {
            tutorialStep = 1;
            renderTutorial();
        }
    }
);


// =========================
// 初期表示
// =========================

renderCalendar();

if (!localStorage.getItem("calendarTutorialSeen")) {
    openTutorial();
}

