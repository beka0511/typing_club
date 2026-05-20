// Данные для тренировки
const trainingTexts = {
    easy: [
        "кот дом мир лес сад мак рак сок ток лук",
        "нос рот усы глаза уши рука нога голова тело",
        "стол стул дверь окно полка книга ручка бумага",
        "вода огонь земля воздух дерево камень металл",
        "солнце луна звезда небо облако дождь снег ветер"
    ],
    medium: [
        "программирование клавиатура упражнение скорость точность",
        "компьютер интернет приложение разработка алгоритм",
        "сложность предложение тренировка результат улучшение",
        "технология информация образование современный прогресс",
        "эффективность производительность автоматизация оптимизация"
    ],
    hard: [
        "Сложные тексты содержат пунктуацию, заглавные буквы и более длинные предложения.",
        "Тренировка набора текста помогает улучшить скорость и точность печати на клавиатуре.",
        "Регулярные упражнения развивают мышечную память и повышают продуктивность работы.",
        "Современные технологии позволяют создавать интерактивные тренажёры для обучения.",
        "Программирование - это искусство создания инструкций для компьютеров и алгоритмов."
    ]
};

// Состояние приложения
const state = {
    currentPage: 'home',
    difficulty: 'easy',
    timerDuration: 60,
    isTraining: false,
    startTime: null,
    timer: null,
    currentText: '',
    userInput: '',
    correctChars: 0,
    totalChars: 0,
    errors: 0,
    currentCharIndex: 0,
    results: JSON.parse(localStorage.getItem('keyboardTrainerResults')) || []
};

// Элементы DOM
const elements = {
    // Навигация
    navLinks: document.querySelectorAll('.nav-link'),
    pages: document.querySelectorAll('.page'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Главная страница
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    timerBtns: document.querySelectorAll('.timer-btn'),
    startTrainingBtn: document.getElementById('startTraining'),
    
    // Страница тренировки
    textDisplay: document.getElementById('textDisplay'),
    textInput: document.getElementById('textInput'),
    wpmDisplay: document.getElementById('wpm'),
    accuracyDisplay: document.getElementById('accuracy'),
    errorsDisplay: document.getElementById('errors'),
    timerDisplay: document.getElementById('timer'),
    virtualKeyboard: document.getElementById('virtualKeyboard'),
    restartTrainingBtn: document.getElementById('restartTraining'),
    backToHomeBtn: document.getElementById('backToHome'),
    
    // Страница рекордов
    recordsBody: document.getElementById('recordsBody'),
    noResults: document.getElementById('noResults'),
    clearRecordsBtn: document.getElementById('clearRecords'),
    backToHomeFromRecordsBtn: document.getElementById('backToHomeFromRecords'),
    
    // Модальное окно результатов
    resultsModal: document.getElementById('resultsModal'),
    resultWpm: document.getElementById('resultWpm'),
    resultAccuracy: document.getElementById('resultAccuracy'),
    resultErrors: document.getElementById('resultErrors'),
    closeResultsBtn: document.getElementById('closeResults')
};

// Инициализация приложения
function init() {
    // Настройка навигации
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Настройка переключения темы
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Настройка выбора сложности
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.difficulty = btn.getAttribute('data-difficulty');
        });
    });
    
    // Настройка выбора времени
    elements.timerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.timerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.timerDuration = parseInt(btn.getAttribute('data-time'));
            elements.timerDisplay.textContent = state.timerDuration;
        });
    });
    
    // Настройка кнопки начала тренировки
    elements.startTrainingBtn.addEventListener('click', startTraining);
    
    // Настройка поля ввода
    elements.textInput.addEventListener('input', handleInput);
    elements.textInput.addEventListener('keydown', handleKeyDown);
    
    // Настройка кнопок тренировки
    elements.restartTrainingBtn.addEventListener('click', startTraining);
    elements.backToHomeBtn.addEventListener('click', () => switchPage('home'));
    
    // Настройка страницы рекордов
    elements.clearRecordsBtn.addEventListener('click', clearRecords);
    elements.backToHomeFromRecordsBtn.addEventListener('click', () => switchPage('home'));
    
    // Настройка модального окна результатов
    elements.closeResultsBtn.addEventListener('click', () => {
        elements.resultsModal.style.display = 'none';
        switchPage('records');
    });
    
    // Инициализация виртуальной клавиатуры
    initVirtualKeyboard();
    
    // Загрузка сохранённых результатов
    loadRecords();
    
    // Установка начального времени таймера
    elements.timerDisplay.textContent = state.timerDuration;
}

// Переключение между страницами
function switchPage(page) {
    // Обновление навигации
    elements.navLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Переключение страниц
    elements.pages.forEach(p => {
        if (p.id === page) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });
    
    state.currentPage = page;
    
    // Особые действия для страниц
    if (page === 'training' && !state.isTraining) {
        resetTraining();
    } else if (page === 'records') {
        loadRecords();
    }
}

// Переключение темы
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    elements.themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

// Инициализация виртуальной клавиатуры
function initVirtualKeyboard() {
    const keyboardLayout = [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']
    ];
    
    let keyboardHTML = '';
    
    keyboardLayout.forEach(row => {
        keyboardHTML += '<div class="keyboard-row">';
        row.forEach(key => {
            keyboardHTML += `<div class="key" data-key="${key}">${key}</div>`;
        });
        keyboardHTML += '</div>';
    });
    
    elements.virtualKeyboard.innerHTML = keyboardHTML;
}

// Начало тренировки
function startTraining() {
    switchPage('training');
    resetTraining();
    generateText();
    elements.textInput.focus();
    state.isTraining = true;
    state.startTime = Date.now();
    
    // Запуск таймера
    let timeLeft = state.timerDuration;
    elements.timerDisplay.textContent = timeLeft;
    
    state.timer = setInterval(() => {
        timeLeft--;
        elements.timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            finishTraining();
        }
    }, 1000);
}

// Сброс тренировки
function resetTraining() {
    clearInterval(state.timer);
    state.isTraining = false;
    state.userInput = '';
    state.correctChars = 0;
    state.totalChars = 0;
    state.errors = 0;
    state.currentCharIndex = 0;
    elements.textInput.value = '';
    elements.textInput.disabled = false;
    elements.wpmDisplay.textContent = '0';
    elements.accuracyDisplay.textContent = '100%';
    elements.errorsDisplay.textContent = '0';
    elements.timerDisplay.textContent = state.timerDuration;
}

// Генерация текста для тренировки
function generateText() {
    const texts = trainingTexts[state.difficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);
    state.currentText = texts[randomIndex];
    
    // Отображение текста
    elements.textDisplay.innerHTML = '';
    for (let i = 0; i < state.currentText.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.textContent = state.currentText[i];
        elements.textDisplay.appendChild(charSpan);
    }
    
    // Подсветка первого символа
    if (state.currentText.length > 0) {
        elements.textDisplay.children[0].classList.add('current');
    }
}

// Обработка ввода пользователя
function handleInput(e) {
    if (!state.isTraining) return;
    
    state.userInput = e.target.value;
    state.totalChars = state.userInput.length;
    
    // Подсветка символов
    highlightText();
    
    // Обновление статистики
    updateStats();
    
    // Проверка завершения текста
    if (state.userInput.length >= state.currentText.length) {
        finishTraining();
    }
}

// Обработка нажатия клавиш
function handleKeyDown(e) {
    if (!state.isTraining) return;
    
    // Подсветка клавиш на виртуальной клавиатуре
    const key = e.key.toLowerCase();
    const keyElement = document.querySelector(`.key[data-key="${key}"]`);
    
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 200);
    }
}

// Подсветка текста
function highlightText() {
    const textSpans = elements.textDisplay.children;
    
    for (let i = 0; i < textSpans.length; i++) {
        textSpans[i].classList.remove('correct', 'incorrect', 'current');
        
        if (i < state.userInput.length) {
            if (state.userInput[i] === state.currentText[i]) {
                textSpans[i].classList.add('correct');
                if (i === state.userInput.length - 1) {
                    state.correctChars++;
                }
            } else {
                textSpans[i].classList.add('incorrect');
                if (i === state.userInput.length - 1) {
                    state.errors++;
                }
            }
        }
        
        if (i === state.userInput.length) {
            textSpans[i].classList.add('current');
        }
    }
}

// Обновление статистики
function updateStats() {
    // Расчет скорости (слов в минуту)
    const elapsedTime = (Date.now() - state.startTime) / 1000 / 60; // в минутах
    const words = state.userInput.length / 5; // приблизительное количество слов
    const wpm = elapsedTime > 0 ? Math.round(words / elapsedTime) : 0;
    elements.wpmDisplay.textContent = wpm;
    
    // Расчет точности
    const accuracy = state.totalChars > 0 ? 
        Math.round((state.correctChars / state.totalChars) * 100) : 100;
    elements.accuracyDisplay.textContent = `${accuracy}%`;
    
    // Отображение ошибок
    elements.errorsDisplay.textContent = state.errors;
}

// Завершение тренировки
function finishTraining() {
    clearInterval(state.timer);
    state.isTraining = false;
    elements.textInput.disabled = true;
    
    // Расчет финальной статистики
    const elapsedTime = (Date.now() - state.startTime) / 1000 / 60;
    const words = state.userInput.length / 5;
    const wpm = elapsedTime > 0 ? Math.round(words / elapsedTime) : 0;
    
    const accuracy = state.totalChars > 0 ? 
        Math.round((state.correctChars / state.totalChars) * 100) : 100;
    
    // Сохранение результата
    saveResult(wpm, accuracy, state.errors);
    
    // Показ результатов
    showResults(wpm, accuracy, state.errors);
}

// Показ результатов тренировки
function showResults(wpm, accuracy, errors) {
    elements.resultWpm.textContent = wpm;
    elements.resultAccuracy.textContent = `${accuracy}%`;
    elements.resultErrors.textContent = errors;
    elements.resultsModal.style.display = 'flex';
}

// Сохранение результата
function saveResult(wpm, accuracy, errors) {
    const result = {
        date: new Date().toLocaleString(),
        wpm: wpm,
        accuracy: accuracy,
        errors: errors,
        difficulty: state.difficulty
    };
    
    state.results.unshift(result);
    
    // Сохранение только последних 10 результатов
    if (state.results.length > 10) {
        state.results = state.results.slice(0, 10);
    }
    
    localStorage.setItem('keyboardTrainerResults', JSON.stringify(state.results));
}

// Загрузка рекордов
function loadRecords() {
    const recordsBody = elements.recordsBody;
    recordsBody.innerHTML = '';
    
    if (state.results.length === 0) {
        elements.noResults.style.display = 'block';
        return;
    }
    
    elements.noResults.style.display = 'none';
    
    state.results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.date}</td>
            <td>${result.wpm}</td>
            <td>${result.accuracy}%</td>
            <td>${result.errors}</td>
            <td>${getDifficultyName(result.difficulty)}</td>
        `;
        recordsBody.appendChild(row);
    });
}

// Получение названия уровня сложности
function getDifficultyName(difficulty) {
    const names = {
        easy: 'Лёгкий',
        medium: 'Средний',
        hard: 'Сложный'
    };
    return names[difficulty] || difficulty;
}

// Очистка рекордов
function clearRecords() {
    if (confirm('Вы уверены, что хотите очистить все рекорды?')) {
        state.results = [];
        localStorage.removeItem('keyboardTrainerResults');
        loadRecords();
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', init);