// ==================== 粒子星空背景 ====================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 粒子类
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = `rgba(176, 132, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 添加发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(176, 132, 255, ${this.opacity})`;
    }
}

// 创建粒子
const particles = [];
const particleCount = 100;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// 动画循环
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ==================== 主题切换 ====================
const themeToggle = document.getElementById('theme-toggle');
let isDarkMode = true;

// 加载保存的主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    isDarkMode = false;
    document.body.classList.add('light-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
        document.body.classList.remove('light-mode');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
});

// ==================== 全局状态 ====================
const state = {
    // 秒表
    stopwatch: {
        time: 0,           // 已过秒数
        running: false,
        interval: null,
        laps: []
    },
    // 倒计时
    countdown: {
        target: 0,         // 目标时间（秒）
        time: 0,           // 已过秒数
        running: false,
        interval: null,
        laps: [],
        voiceEnabled: true,
        spokenAlerts: new Set()  // 记录已播报的提示
    },
    // 番茄钟
    pomodoro: {
        time: 25 * 60,     // 剩余秒数
        totalTime: 25 * 60,
        running: false,
        interval: null,
        isBreak: false,
        count: 0,
        focusDuration: 25 * 60,
        breakDuration: 5 * 60
    }
};

// ==================== DOM 元素 ====================
const elements = {
    // 标签页
    tabBtns: document.querySelectorAll('.tab-btn'),
    panels: document.querySelectorAll('.panel'),

    // 秒表
    stopwatchTime: document.getElementById('stopwatch-time'),
    stopwatchStart: document.getElementById('stopwatch-start'),
    stopwatchLap: document.getElementById('stopwatch-lap'),
    stopwatchReset: document.getElementById('stopwatch-reset'),
    lapList: document.getElementById('lap-list'),

    // 倒计时
    inputHours: document.getElementById('input-hours'),
    inputMinutes: document.getElementById('input-minutes'),
    inputSeconds: document.getElementById('input-seconds'),
    voiceEnabled: document.getElementById('voice-enabled'),
    countdownSet: document.getElementById('countdown-set'),
    countdownSetup: document.getElementById('countdown-setup'),
    countdownRunning: document.getElementById('countdown-running'),
    countdownTarget: document.getElementById('countdown-target'),
    countdownTime: document.getElementById('countdown-time'),
    countdownRemaining: document.getElementById('countdown-remaining'),
    countdownStart: document.getElementById('countdown-start'),
    countdownLap: document.getElementById('countdown-lap'),
    countdownReset: document.getElementById('countdown-reset'),
    countdownLapList: document.getElementById('countdown-lap-list'),

    // 番茄钟
    pomodoroMode: document.getElementById('pomodoro-mode'),
    pomodoroTime: document.getElementById('pomodoro-time'),
    progressFill: document.getElementById('progress-fill'),
    pomodoroStart: document.getElementById('pomodoro-start'),
    pomodoroSkip: document.getElementById('pomodoro-skip'),
    pomodoroReset: document.getElementById('pomodoro-reset'),
    pomodoroCount: document.getElementById('pomodoro-count')
};

// ==================== 工具函数 ====================
function formatTime(seconds, showHours = true) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (showHours) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function speak(text) {
    if ('speechSynthesis' in window) {
        // 取消之前的语音
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.1;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }
}

function playBeep() {
    // 使用 Web Audio API 播放提示音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ==================== 标签页切换 ====================
elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // 更新标签样式
        elements.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 显示对应面板
        elements.panels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === tabId) {
                panel.classList.add('active');
            }
        });
    });
});

// ==================== 秒表功能 ====================
function updateStopwatchDisplay() {
    elements.stopwatchTime.textContent = formatTime(state.stopwatch.time);
}

function startStopwatch() {
    if (state.stopwatch.running) {
        // 暂停
        clearInterval(state.stopwatch.interval);
        state.stopwatch.running = false;
        elements.stopwatchStart.textContent = '继续';
        elements.stopwatchStart.classList.remove('running');
    } else {
        // 开始
        state.stopwatch.running = true;
        elements.stopwatchStart.textContent = '暂停';
        elements.stopwatchStart.classList.add('running');
        elements.stopwatchLap.disabled = false;
        elements.stopwatchReset.disabled = false;

        state.stopwatch.interval = setInterval(() => {
            state.stopwatch.time++;
            updateStopwatchDisplay();
        }, 1000);
    }
}

function lapStopwatch() {
    const lapTime = state.stopwatch.time;
    const lapNumber = state.stopwatch.laps.length + 1;
    const lastLapTime = state.stopwatch.laps.length > 0
        ? state.stopwatch.laps[state.stopwatch.laps.length - 1].total
        : 0;
    const splitTime = lapTime - lastLapTime;

    state.stopwatch.laps.push({ total: lapTime, split: splitTime });

    const li = document.createElement('li');
    li.innerHTML = `
        <span class="lap-number">第 ${lapNumber} 次</span>
        <span class="lap-split">+${formatTime(splitTime)}</span>
        <span class="lap-time">${formatTime(lapTime)}</span>
    `;
    elements.lapList.insertBefore(li, elements.lapList.firstChild);
}

function resetStopwatch() {
    clearInterval(state.stopwatch.interval);
    state.stopwatch.time = 0;
    state.stopwatch.running = false;
    state.stopwatch.laps = [];

    updateStopwatchDisplay();
    elements.stopwatchStart.textContent = '开始';
    elements.stopwatchStart.classList.remove('running');
    elements.stopwatchLap.disabled = true;
    elements.stopwatchReset.disabled = true;
    elements.lapList.innerHTML = '';
}

elements.stopwatchStart.addEventListener('click', startStopwatch);
elements.stopwatchLap.addEventListener('click', lapStopwatch);
elements.stopwatchReset.addEventListener('click', resetStopwatch);

// ==================== 倒计时功能 ====================
// 自定义播报时间点管理
let customAlertTimes = []; // 存储用户添加的时间点（秒数）

// 从 localStorage 加载保存的时间点
function loadAlertTimes() {
    const saved = localStorage.getItem('customAlertTimes');
    if (saved) {
        try {
            customAlertTimes = JSON.parse(saved);
            renderAlertList();
        } catch (e) {
            console.error('加载语音播报设置失败:', e);
        }
    }
}

// 保存时间点到 localStorage
function saveAlertTimes() {
    localStorage.setItem('customAlertTimes', JSON.stringify(customAlertTimes));
}

function addAlertTime() {
    const minutes = parseInt(document.getElementById('alert-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('alert-seconds').value) || 0;

    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
        alert('请输入有效的时间！');
        return;
    }

    // 避免重复
    if (customAlertTimes.includes(totalSeconds)) {
        alert('该时间点已存在！');
        return;
    }

    customAlertTimes.push(totalSeconds);
    customAlertTimes.sort((a, b) => b - a); // 降序排列

    renderAlertList();
    saveAlertTimes(); // 保存到 localStorage

    // 清空输入
    document.getElementById('alert-minutes').value = 0;
    document.getElementById('alert-seconds').value = 10;
}

function removeAlertTime(timeInSeconds) {
    customAlertTimes = customAlertTimes.filter(t => t !== timeInSeconds);
    renderAlertList();
    saveAlertTimes(); // 保存到 localStorage
}

function renderAlertList() {
    const alertList = document.getElementById('alert-list');
    alertList.innerHTML = '';

    customAlertTimes.forEach(time => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        const item = document.createElement('div');
        item.className = 'alert-item';

        let timeText = '';
        if (minutes > 0 && seconds > 0) {
            timeText = `${minutes}分${seconds}秒`;
        } else if (minutes > 0) {
            timeText = `${minutes}分钟`;
        } else {
            timeText = `${seconds}秒`;
        }

        item.innerHTML = `
            <span>${timeText}</span>
            <button class="remove-btn" onclick="removeAlertTime(${time})">✕</button>
        `;

        alertList.appendChild(item);
    });
}

// 添加按钮事件监听
document.getElementById('add-alert').addEventListener('click', addAlertTime);

// 回车添加
document.getElementById('alert-minutes').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAlertTime();
});
document.getElementById('alert-seconds').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAlertTime();
});

function updateCountdownDisplay() {
    const elapsed = state.countdown.time;
    const target = state.countdown.target;
    const remaining = target - elapsed;

    elements.countdownTime.textContent = formatTime(elapsed);

    if (remaining >= 0) {
        elements.countdownRemaining.textContent = formatTime(remaining);
        elements.countdownRemaining.classList.remove('overtime');
    } else {
        // 超时了，显示红色
        elements.countdownRemaining.textContent = '+' + formatTime(Math.abs(remaining));
        elements.countdownRemaining.classList.add('overtime');
    }
}

function checkVoiceAlerts() {
    if (!state.countdown.voiceEnabled) return;

    const remaining = state.countdown.target - state.countdown.time;
    const countdownEnabled = document.getElementById('alert-countdown')?.checked;

    const alerts = [];

    // 添加用户自定义的时间点
    customAlertTimes.forEach(time => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        let text = '';
        if (minutes > 0 && seconds > 0) {
            text = `还剩${minutes}分${seconds}秒`;
        } else if (minutes > 0) {
            text = `还剩${minutes}分钟`;
        } else {
            text = `还剩${seconds}秒`;
        }

        alerts.push({ time, text });
    });



    // 时间到总是播报
    alerts.push({ time: 0, text: '时间到' });

    alerts.forEach(alert => {
        if (remaining === alert.time && !state.countdown.spokenAlerts.has(alert.time)) {
            speak(alert.text);
            state.countdown.spokenAlerts.add(alert.time);

            if (alert.time === 0) {
                playBeep();
            }
        }
    });
}

function setCountdown() {
    const hours = parseInt(elements.inputHours.value) || 0;
    const minutes = parseInt(elements.inputMinutes.value) || 0;
    const seconds = parseInt(elements.inputSeconds.value) || 0;

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) {
        alert('请设置一个有效的时间！');
        return;
    }

    state.countdown.target = totalSeconds;
    state.countdown.time = 0;
    state.countdown.voiceEnabled = elements.voiceEnabled.checked;
    state.countdown.spokenAlerts.clear();

    elements.countdownTarget.textContent = formatTime(totalSeconds);
    updateCountdownDisplay();

    // 切换到运行界面
    elements.countdownSetup.style.display = 'none';
    elements.countdownRunning.classList.remove('hidden');
}

function startCountdown() {
    if (state.countdown.running) {
        // 暂停
        clearInterval(state.countdown.interval);
        state.countdown.running = false;
        elements.countdownStart.textContent = '继续';
        elements.countdownStart.classList.remove('running');
    } else {
        // 开始
        state.countdown.running = true;
        elements.countdownStart.textContent = '暂停';
        elements.countdownStart.classList.add('running');
        elements.countdownLap.disabled = false;
        elements.countdownReset.disabled = false;

        state.countdown.interval = setInterval(() => {
            state.countdown.time++;
            updateCountdownDisplay();
            checkVoiceAlerts();
        }, 1000);
    }
}

function lapCountdown() {
    const lapTime = state.countdown.time;
    const lapNumber = state.countdown.laps.length + 1;
    const lastLapTime = state.countdown.laps.length > 0
        ? state.countdown.laps[state.countdown.laps.length - 1].total
        : 0;
    const splitTime = lapTime - lastLapTime;

    state.countdown.laps.push({ total: lapTime, split: splitTime });

    const li = document.createElement('li');
    li.innerHTML = `
        <span class="lap-number">标记 ${lapNumber}</span>
        <span class="lap-split">+${formatTime(splitTime)}</span>
        <span class="lap-time">${formatTime(lapTime)}</span>
    `;
    elements.countdownLapList.insertBefore(li, elements.countdownLapList.firstChild);
}

function resetCountdown() {
    clearInterval(state.countdown.interval);
    state.countdown.time = 0;
    state.countdown.running = false;
    state.countdown.laps = [];
    state.countdown.spokenAlerts.clear();

    elements.countdownStart.textContent = '开始';
    elements.countdownStart.classList.remove('running');
    elements.countdownLap.disabled = true;
    elements.countdownReset.disabled = true;
    elements.countdownLapList.innerHTML = '';

    // 返回设置界面
    elements.countdownSetup.style.display = 'block';
    elements.countdownRunning.classList.add('hidden');
}

elements.countdownSet.addEventListener('click', setCountdown);
elements.countdownStart.addEventListener('click', startCountdown);
elements.countdownLap.addEventListener('click', lapCountdown);
elements.countdownReset.addEventListener('click', resetCountdown);

// ==================== 番茄钟功能 ====================
function updatePomodoroDisplay() {
    elements.pomodoroTime.textContent = formatTime(state.pomodoro.time, false);

    // 更新进度条
    const progress = (state.pomodoro.time / state.pomodoro.totalTime) * 100;
    elements.progressFill.style.width = `${progress}%`;
}

function startPomodoro() {
    if (state.pomodoro.running) {
        // 暂停
        clearInterval(state.pomodoro.interval);
        state.pomodoro.running = false;
        elements.pomodoroStart.textContent = state.pomodoro.isBreak ? '继续休息' : '继续专注';
        elements.pomodoroStart.classList.remove('running');
    } else {
        // 开始
        state.pomodoro.running = true;
        elements.pomodoroStart.textContent = '暂停';
        elements.pomodoroStart.classList.add('running');

        state.pomodoro.interval = setInterval(() => {
            state.pomodoro.time--;
            updatePomodoroDisplay();

            if (state.pomodoro.time <= 0) {
                clearInterval(state.pomodoro.interval);
                state.pomodoro.running = false;
                playBeep();

                if (!state.pomodoro.isBreak) {
                    // 专注结束，进入休息
                    state.pomodoro.count++;
                    elements.pomodoroCount.textContent = state.pomodoro.count;
                    speak('专注时间结束，休息一下吧');
                    switchPomodoroMode(true);
                } else {
                    // 休息结束，进入专注
                    speak('休息结束，开始专注');
                    switchPomodoroMode(false);
                }
            }
        }, 1000);
    }
}

function switchPomodoroMode(isBreak) {
    state.pomodoro.isBreak = isBreak;

    if (isBreak) {
        state.pomodoro.time = state.pomodoro.breakDuration;
        state.pomodoro.totalTime = state.pomodoro.breakDuration;
        elements.pomodoroMode.textContent = '休息时间';
        elements.pomodoroMode.classList.add('break');
        elements.pomodoroStart.textContent = '开始休息';
    } else {
        state.pomodoro.time = state.pomodoro.focusDuration;
        state.pomodoro.totalTime = state.pomodoro.focusDuration;
        elements.pomodoroMode.textContent = '专注时间';
        elements.pomodoroMode.classList.remove('break');
        elements.pomodoroStart.textContent = '开始专注';
    }

    elements.pomodoroStart.classList.remove('running');
    updatePomodoroDisplay();
}

function skipPomodoro() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.running = false;
    switchPomodoroMode(!state.pomodoro.isBreak);
}

function resetPomodoro() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.running = false;
    state.pomodoro.isBreak = false;
    state.pomodoro.count = 0;
    state.pomodoro.time = state.pomodoro.focusDuration;
    state.pomodoro.totalTime = state.pomodoro.focusDuration;

    elements.pomodoroMode.textContent = '专注时间';
    elements.pomodoroMode.classList.remove('break');
    elements.pomodoroStart.textContent = '开始专注';
    elements.pomodoroStart.classList.remove('running');
    elements.pomodoroCount.textContent = '0';
    updatePomodoroDisplay();
}

elements.pomodoroStart.addEventListener('click', startPomodoro);
elements.pomodoroSkip.addEventListener('click', skipPomodoro);
elements.pomodoroReset.addEventListener('click', resetPomodoro);

// ==================== 滚动导航按钮 ====================
const scrollNav = document.querySelector('.scroll-nav');
const scrollUpBtn = document.getElementById('scroll-up');
const scrollDownBtn = document.getElementById('scroll-down');

// 监听页面滚动,控制按钮显示
// 始终显示滚动按钮
scrollNav.classList.add('show');

// 向上滚动 - 回到顶部
scrollUpBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 向下滚动 - 滚动一个视口高度
scrollDownBtn.addEventListener('click', () => {
    window.scrollTo({
        top: window.scrollY + window.innerHeight * 0.8,
        behavior: 'smooth'
    });
});

// ==================== 初始化 ====================
updateStopwatchDisplay();
updatePomodoroDisplay();
loadAlertTimes(); // 加载保存的语音播报时间点
