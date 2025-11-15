/**
 * 聊天应用主脚本
 * 实现了角色切换、消息发送和显示功能
 */
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素引用
    const messageInput = document.getElementById('messageInput'); // 消息输入框
    const sendButton = document.getElementById('sendButton');     // 发送按钮
    const messageArea = document.getElementById('messageArea');   // 消息显示区域
    const roleToggle = document.getElementById('roleToggle');     // 通过ID 'roleToggle' 获取角色切换按钮的DOM元素引用
    const chatContainer = document.querySelector('.chat-container'); // 聊天容器
    const themeToggle = document.getElementById('themeToggle');      // 主题切换按钮
    const timeSpan = document.querySelector('.status-bar .time');    // 状态栏时间显示

    // 角色状态标志，false表示角色A，true表示角色B
    let isRoleB = false;
    let isDark = false; // 主题状态标志，false表示白天（浅色），true表示黑夜（深色）

    /**
     * 角色切换按钮点击事件处理
     * 切换角色状态、更新按钮样式和文本，并将焦点设置到输入框
     */
    /**
     * 更新角色切换按钮的UI状态
     * 根据当前角色状态更新按钮样式、文本与无障碍属性
     */
    function updateRoleUI() {
        roleToggle.classList.toggle('active', isRoleB);
        roleToggle.textContent = isRoleB ? '角色B' : '角色A';
        roleToggle.setAttribute('aria-pressed', String(isRoleB));
    }

    /**
     * 角色切换按钮点击事件处理
     * 切换角色状态、更新按钮样式和文本，并将焦点设置到输入框
     */
    function onRoleToggle() {
        isRoleB = !isRoleB;
        updateRoleUI();
        messageInput.focus();
    }

    // 绑定角色切换事件
    roleToggle.addEventListener('click', onRoleToggle);

    /**
     * 更新主题UI状态
     * 根据 isDark 切换容器的主题类，并同步按钮文本与无障碍属性
     */
    function updateThemeUI() {
        chatContainer.classList.toggle('theme-dark', isDark);
        document.body.classList.toggle('theme-dark', isDark);
        themeToggle.textContent = isDark ? '🌙' : '🌞';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (_) { /* ignore storage errors */ }
    }

    /**
     * 主题切换按钮点击事件处理
     * 切换深浅主题并更新UI与本地存储
     */
    function onThemeToggle() {
        isDark = !isDark;
        updateThemeUI();
    }

    // 绑定主题切换事件
    themeToggle.addEventListener('click', onThemeToggle);

    /**
     * 添加消息到聊天区域
     * @param {string} text - 消息文本内容
     * @param {boolean} isRoleB - 是否为角色B发送的消息
     */
    /**
     * 添加消息到聊天区域
     * @param {string} text - 消息文本内容
     * @param {boolean} isRoleB - 是否为角色B发送的消息
     */
    function addMessage(text, isRoleB) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isRoleB ? 'role-b' : 'role-a'}`;
        messageDiv.textContent = text;
        messageArea.appendChild(messageDiv);

        // 消息上限控制，超出则移除最早消息
        const MAX_MESSAGES = 500;
        if (messageArea.childElementCount > MAX_MESSAGES) {
            messageArea.firstElementChild.remove();
        }

        // 滚动到最新消息（平滑）
        messageArea.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * 处理发送消息的逻辑
     * 获取输入框内容，添加到聊天区域，并清空输入框
     */
    /**
     * 处理发送消息的逻辑
     * 获取输入框内容，添加到聊天区域，并清空输入框
     */
    function handleSend() {
        const text = messageInput.value.trim();
        if (text) {
            addMessage(text, isRoleB);
            messageInput.value = '';
            messageInput.focus();
        }
    }

    // 为发送按钮添加点击事件监听器
    // 绑定发送按钮事件
    sendButton.addEventListener('click', handleSend);
    
    // 为输入框添加按键事件监听器，支持按Enter键发送消息
    /**
     * 输入框键盘事件处理
     * 使用 keydown，忽略输入法合成阶段，Enter 发送
     */
    function onInputKeyDown(e) {
        if (e.isComposing) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    }

    // 绑定输入框键盘事件
    messageInput.addEventListener('keydown', onInputKeyDown);

    // 初始化按钮UI状态
    updateRoleUI();

    /**
     * 初始化主题状态
     * 读取本地存储或系统偏好，设置初始 isDark 并更新UI
     */
    function initTheme() {
        let saved = null;
        try {
            saved = localStorage.getItem('theme');
        } catch (_) { /* ignore storage errors */ }
        if (saved === 'dark') isDark = true;
        else if (saved === 'light') isDark = false;
        else isDark = true;
        updateThemeUI();
    }

    // 初始化主题
    initTheme();

    /**
     * 更新时间到状态栏
     * 使用 24 小时制并补零显示，例如 09:41
     */
    function updateTime() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        if (timeSpan) timeSpan.textContent = `${hh}:${mm}`;
    }

    // 初始化与定时更新时间（每分钟）
    updateTime();
    setInterval(updateTime, 60 * 1000);
});