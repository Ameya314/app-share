// =========================
// DOM
// =========================

const calendarDays = document.getElementById("calendar-days");
const currentMonthElement = document.getElementById("current-month");

const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");

const modal = document.getElementById("modal");
const closeModalButton = document.getElementById("close-modal");

const selectedDateElement = document.getElementById("selected-date");

const eventForm = document.getElementById("event-form");
const eventTitleInput = document.getElementById("event-title");
const eventTimeInput = document.getElementById("event-time");


// =========================
// 現在の日付
// =========================

let currentDate = new Date();


// 選択された日付
let selectedDate = null;


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
}


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
    }
);


// =========================
// 初期表示
// =========================

renderCalendar();

