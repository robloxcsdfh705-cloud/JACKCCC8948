// ====================================================================
// 🧠 純多聊天室控制大腦（已完全刪除所有 AI 對話程式碼）
// ====================================================================
const TARGET_USERNAME = "ADMIN";
const TARGET_PASSWORD = "admin123";

let chatSessions = {}; 
let currentChatId = "";

function handleLoginKeyPress(e) { if (e.key === 'Enter') { verifyAdminAccount(); } }
function logout() { location.reload(); }

// 驗證管理員帳密
function verifyAdminAccount() {
    const userField = document.getElementById("admin-username").value.trim();
    const passField = document.getElementById("admin-password").value.trim();
    const errorLabel = document.getElementById("login-error");

    if (userField === TARGET_USERNAME && passField === TARGET_PASSWORD) {
        document.getElementById("login-overlay").style.display = "none";
        document.getElementById("user-info").innerText = "● 管理員已登入: " + TARGET_USERNAME;
        errorLabel.style.display = "none";
        initMultiChatSystem(); // 啟動聊天室新增系統
    } else {
        errorLabel.innerText = "❌ 驗證失敗：帳號或密碼輸入錯誤，星際通聯拒絕！";
        errorLabel.style.display = "block";
    }
}

// 多聊天室初始化與本機快取讀取
function initMultiChatSystem() {
    const savedSessions = localStorage.getItem("銀河系統_多對話紀錄");
    if (savedSessions) {
        chatSessions = JSON.parse(savedSessions);
        currentChatId = localStorage.getItem("銀河系統_當前對話ID") || Object.keys(chatSessions);
    }
    
    // 如果快取完全是空的，自動建立第一個初始視窗
    if (Object.keys(chatSessions).length === 0 || !chatSessions[currentChatId]) {
        const defaultId = "chat_" + Date.now();
        chatSessions[defaultId] = {
            title: "💬 新對話視窗 1",
            htmlContent: `<div class="bubble-row"><div class="bubble ai-bubble">🌌 <b>對話視窗 1 建立成功！</b><br>這是一個完全獨立的空白展示空間。您可以點擊左側按鈕繼續增加更多聊天室。</div></div>`
        };
        currentChatId = defaultId;
    }
    
    renderSidebar();
    switchChat(currentChatId);
}

// 刷新左側列表
function renderSidebar() {
    const container = document.getElementById("chat-list-container");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(chatSessions).forEach(id => {
        const item = document.createElement("div");
        item.className = `chat-item ${id === currentChatId ? 'active' : ''}`;
        item.setAttribute("onclick", `switchChat('${id}')`);
        item.innerHTML = `
            <span>${chatSessions[id].title}</span>
            <button class="delete-chat-btn" onclick="deleteChat(event, '${id}')">✕</button>
        `;
        container.appendChild(item);
    });
}

// 核心功能：獨立「新增聊天室」
function createNewChat() {
    const newId = "chat_" + Date.now();
    const count = Object.keys(chatSessions).length + 1;
    chatSessions[newId] = {
        title: `💬 新對話視窗 ${count}`,
        htmlContent: `<div class="bubble-row"><div class="bubble ai-bubble">🌌 <b>對話視窗 ${count} 建立成功！</b><br>您已成功新增一個獨立的展示空間，點擊右邊的小叉✕按鈕即可隨時將它移除。</div></div>`
    };
    currentChatId = newId;
    saveAndRefresh();
    switchChat(newId);
}

// 核心功能：獨立「切換聊天室」
function switchChat(id) {
    if (!chatSessions[id]) return;
    currentChatId = id;
    localStorage.setItem("銀河系統_當前對話ID", id);
    document.getElementById("chat-box").innerHTML = chatSessions[id].htmlContent;
    renderSidebar();
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
}

// 核心功能：獨立「刪除聊天室」
function deleteChat(event, id) {
    event.stopPropagation(); // 防止點擊叉叉時誤觸切換
    if (Object.keys(chatSessions).length <= 1) {
        alert("⚠️ 請至少保留一個聊天視窗！");
        return;
    }
    if (confirm("確定要永遠刪除這個對話視窗嗎？")) {
        delete chatSessions[id];
        if (currentChatId === id) {
            currentChatId = Object.keys(chatSessions);
        }
        saveAndRefresh();
        switchChat(currentChatId);
    }
}

function saveAndRefresh() {
    localStorage.setItem("銀河系統_多對話紀錄", JSON.stringify(chatSessions));
    renderSidebar();
}

// 將所有核心控制功能綁定至全域，確保 HTML 排版按鈕能正常呼叫
window.verifyAdminAccount = verifyAdminAccount;
window.createNewChat = createNewChat;
window.switchChat = switchChat;
window.deleteChat = deleteChat;
window.handleLoginKeyPress = handleLoginKeyPress;
window.logout = logout;

