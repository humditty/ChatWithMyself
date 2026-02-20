/**
 * 思绪回声厅 - 核心逻辑
 * 核心功能：消息持久化、主题切换、多角色对话
 */

document.addEventListener('DOMContentLoaded', () => {
    // 元素引用
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messageArea = document.getElementById('messageArea');
    const roleToggle = document.getElementById('roleToggle');
    const themeToggle = document.getElementById('themeToggle');
    const clearButton = document.getElementById('clearButton');
    const timeSpan = document.querySelector('.status-bar .time');
    const root = document.documentElement;
    const MAX_MESSAGES = 300;

    // 状态管理
    let isRoleB = false;
    let isDark = false;
    let messages = [];
    let isClearConfirmOpen = false;
    let lastClearTriggerAt = 0;

    // --- 持久化逻辑 ---

    function saveMessages() {
        try {
            localStorage.setItem('chat_history', JSON.stringify(messages));
        } catch (_error) {
            // Quota exceeded or storage unavailable: keep app usable.
            messages = messages.slice(-Math.floor(MAX_MESSAGES / 2));
            try {
                localStorage.setItem('chat_history', JSON.stringify(messages));
            } catch (_retryError) {
                // Ignore storage failures; UI state still works in-memory.
            }
        }
    }

    function loadMessages() {
        let saved = null;
        try {
            saved = localStorage.getItem('chat_history');
        } catch (_error) {
            saved = null;
        }

        if (!saved) {
            return;
        }

        try {
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid history format');
            }
            messages = parsed
                .filter((msg) => msg && typeof msg.text === 'string')
                .map((msg) => ({ text: msg.text, roleB: Boolean(msg.roleB), time: Number(msg.time) || Date.now() }))
                .slice(-MAX_MESSAGES);
            renderAllMessages();
        } catch (_error) {
            messages = [];
            try {
                localStorage.removeItem('chat_history');
            } catch (_removeError) {
                // Ignore storage failures.
            }
        }
    }

    function renderAllMessages() {
        messageArea.innerHTML = '';
        messages.forEach(msg => {
            appendMessageToUI(msg.text, msg.roleB);
        });
        scrollToBottom();
    }

    // --- UI 更新逻辑 ---

    function appendMessageToUI(text, roleB) {
        const div = document.createElement('div');
        div.className = `message ${roleB ? 'role-b' : 'role-a'}`;
        div.textContent = text;
        messageArea.appendChild(div);
    }

    function scrollToBottom() {
        setTimeout(() => {
            messageArea.scrollTop = messageArea.scrollHeight;
        }, 50);
    }

    // --- 交互功能 ---

    function handleSend() {
        const text = messageInput.value.trim();
        if (!text) return;

        const newMessage = { text, roleB: isRoleB, time: new Date().getTime() };
        messages.push(newMessage);
        if (messages.length > MAX_MESSAGES) {
            messages = messages.slice(-MAX_MESSAGES);
        }

        appendMessageToUI(text, isRoleB);
        saveMessages();

        messageInput.value = '';
        messageInput.focus();
        scrollToBottom();
    }

    function toggleRole() {
        isRoleB = !isRoleB;
        roleToggle.textContent = isRoleB ? 'B' : 'A';
        roleToggle.setAttribute('aria-label', isRoleB ? '当前角色B，点击切换到角色A' : '当前角色A，点击切换到角色B');
        roleToggle.classList.toggle('active', isRoleB);
        messageInput.focus();
    }

    function applyTheme(darkMode) {
        isDark = darkMode;
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '夜' : '昼';
        themeToggle.setAttribute('aria-label', isDark ? '当前深色模式，点击切换到浅色模式' : '当前浅色模式，点击切换到深色模式');
        try {
            localStorage.setItem('chat_theme', isDark ? 'dark' : 'light');
        } catch (_error) {
            // Ignore storage failures.
        }
    }

    function toggleTheme() {
        applyTheme(!isDark);
    }

    function clearHistory() {
        const now = Date.now();
        if (isClearConfirmOpen || now - lastClearTriggerAt < 800) {
            return;
        }
        lastClearTriggerAt = now;
        isClearConfirmOpen = true;
        clearButton.disabled = true;

        try {
            if (!window.confirm('确定要清空所有聊天记录吗？')) {
                return;
            }
            // 先清空内存数据
            messages = [];
            try {
                localStorage.removeItem('chat_history');
            } catch (_error) {
                // Ignore storage failures.
            }
            // 一次性重置 DOM，避免多次渲染导致的“跳动”
            messageArea.innerHTML = '';
            messageArea.scrollTop = 0;
        } finally {
            // 延迟恢复按钮可避免触摸设备的重复点击事件排队。
            setTimeout(() => {
                clearButton.disabled = false;
            }, 150);
            isClearConfirmOpen = false;
        }
    }

    // --- 状态栏时间 ---
    function updateTime() {
        const now = new Date();
        timeSpan.textContent = now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');
    }

    // --- 事件绑定 ---
    sendButton.addEventListener('click', handleSend);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            e.preventDefault();
            handleSend();
        }
    });

    roleToggle.addEventListener('click', toggleRole);
    themeToggle.addEventListener('click', toggleTheme);
    clearButton.addEventListener('click', clearHistory);

    // --- 初始化 ---

    // 初始化主题
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('chat_theme');
    } catch (_error) {
        savedTheme = null;
    }
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(shouldUseDark);

    // 加载消息
    loadMessages();

    // 设置时间
    updateTime();
    const timeTimer = setInterval(updateTime, 60000);
    window.addEventListener('beforeunload', () => {
        clearInterval(timeTimer);
    }, { once: true });
});
