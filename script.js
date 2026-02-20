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
    const chatContainer = document.querySelector('.chat-container');

    // 状态管理
    let isRoleB = false;
    let isDark = false;
    let messages = [];

    // --- 持久化逻辑 ---

    function saveMessages() {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }

    function loadMessages() {
        const saved = localStorage.getItem('chat_history');
        if (saved) {
            messages = JSON.parse(saved);
            renderAllMessages();
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

        appendMessageToUI(text, isRoleB);
        saveMessages();

        messageInput.value = '';
        messageInput.focus();
        scrollToBottom();
    }

    function toggleRole() {
        isRoleB = !isRoleB;
        roleToggle.textContent = isRoleB ? '角色B' : '角色A';
        roleToggle.classList.toggle('active', isRoleB);
        messageInput.focus();
    }

    function toggleTheme() {
        isDark = !isDark;
        document.body.classList.toggle('theme-dark', isDark);
        chatContainer.classList.toggle('theme-dark', isDark);
        themeToggle.textContent = isDark ? '🌙' : '🌞';
        localStorage.setItem('chat_theme', isDark ? 'dark' : 'light');
    }

    function clearHistory() {
        if (window.confirm('确定要清空所有聊天记录吗？')) {
            // 先清空内存数据
            messages = [];
            localStorage.removeItem('chat_history');
            // 一次性重置 DOM，避免多次渲染导致的“跳动”
            messageArea.innerHTML = '';
            messageArea.scrollTop = 0;
            console.log('History cleared successfully.');
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
    const savedTheme = localStorage.getItem('chat_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark = false; // 初始为 false，通过 toggleTheme 变为 true
        toggleTheme();
    }

    // 加载消息
    loadMessages();

    // 设置时间
    updateTime();
    setInterval(updateTime, 60000);
});