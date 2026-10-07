// ====================================================================
// 🧠 銀河多核心 AI 控制引擎 (5款大腦完全融合版)
// ====================================================================
let chatSessions = {}; 
let currentChatId = "";
let webLlmEngine = null; // 本機 WebLLM 專用緩存器

window.addEventListener("DOMContentLoaded", () => { initMultiChatSystem(); });
function handleKeyPress(e) { if (e.key === 'Enter') { sendMessage(); } }

// 初始化多對話與本機快取
function initMultiChatSystem() {
    const savedSessions = localStorage.getItem("銀河多核心_對話紀錄");
    if (savedSessions) {
        chatSessions = JSON.parse(savedSessions);
        currentChatId = localStorage.getItem("銀河多核心_當前對話ID") || Object.keys(chatSessions)[0];
    }
    
    if (Object.keys(chatSessions).length === 0 || !chatSessions[currentChatId]) {
        const defaultId = "chat_" + Date.now();
        chatSessions[defaultId] = {
            title: "💬 新對話視窗 1",
            model: "llama3", // 預設使用 Llama 3
            htmlContent: `<div class="bubble-row"><div class="bubble ai-bubble">🌌 <b>對話視窗 1 建立成功！</b><br>當前分配大腦：<b>Llama 3 (全能對話)</b>。<br><br>請直接在下方打字進行對話；您可以隨時在左側選單將此視窗隨時更換為繪圖大腦或本機大腦喔！</div></div>`
        };
        currentChatId = defaultId;
    }
    
    renderSidebar();
    switchChat(currentChatId);
}

// 刷新側邊欄
function renderSidebar() {
    const container = document.getElementById("chat-list-container");
    if (!container) return;
    container.innerHTML = "";

    const modelNames = { llama3: "Llama 3", gemma2: "Gemma 2", webllm: "本機Gemma2", flux: "Flux.1 繪圖", sdxl: "SDXL 繪圖" };

    Object.keys(chatSessions).forEach(id => {
        const item = document.createElement("div");
        item.className = `chat-item ${id === currentChatId ? 'active' : ''}`;
        item.setAttribute("onclick", `switchChat('${id}')`);
        
        const mKey = chatSessions[id].model || "llama3";
        item.innerHTML = `
            <div class="chat-item-header">
                <span class="chat-title-text">${chatSessions[id].title}</span>
                <button class="delete-chat-btn" onclick="deleteChat(event, '${id}')">✕</button>
            </div>
            <div class="model-badge">🧠 ${modelNames[mKey]}</div>
        `;
        container.appendChild(item);
    });
}

// 變更當前聊天室的 AI 大腦種類
function updateCurrentChatModel(modelValue) {
    if (!chatSessions[currentChatId]) return;
    chatSessions[currentChatId].model = modelValue;
    saveData();
    renderSidebar();
    
    const modelNames = { llama3: "Llama 3 (全能對話)", gemma2: "Gemma 2 (創意寫作)", webllm: "Gemma 2 WebLLM (本機純斷網)", flux: "Flux.1 (宇宙級高清繪圖)", sdxl: "Stable Diffusion XL (經典藝術繪圖)" };
    appendSystemMessage(`🔄 系統已將當前視窗的大腦核心成功切換為：${modelNames[modelValue]}`);
}

// 新增聊天室
function createNewChat() {
    const newId = "chat_" + Date.now();
    const count = Object.keys(chatSessions).length + 1;
    chatSessions[newId] = {
        title: `💬 新對話視窗 ${count}`,
        model: "llama3",
        htmlContent: `<div class="bubble-row"><div class="bubble ai-bubble">🌌 <b>對話視窗 ${count} 建立成功！</b><br>預設大腦：Llama 3。您可以在左側下拉選單為這個新空間指定完全不同的 AI 模式核心。</div></div>`
    };
    currentChatId = newId;
    saveData();
    switchChat(newId);
}

// 切換聊天室
function switchChat(id) {
    if (!chatSessions[id]) return;
    currentChatId = id;
    localStorage.setItem("銀河多核心_當前對話ID", id);
    document.getElementById("chat-box").innerHTML = chatSessions[id].htmlContent;
    
    // 同步下拉選單的選擇狀態
    document.getElementById("global-model-selector").value = chatSessions[id].model || "llama3";
    
    renderSidebar();
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
}

// 刪除聊天室
function deleteChat(event, id) {
    event.stopPropagation();
    if (Object.keys(chatSessions).length <= 1) {
        alert("⚠️ 請至少保留一個對話視窗！");
        return;
    }
    if (confirm("確定要永遠刪除這個對話視窗嗎？")) {
        delete chatSessions[id];
        if (currentChatId === id) { currentChatId = Object.keys(chatSessions)[0]; }
        saveData();
        switchChat(currentChatId);
    }
}

function saveData() { localStorage.setItem("銀河多核心_對話紀錄", JSON.stringify(chatSessions)); }
function clearAllData() { if (confirm("確定要重設全站，清除所有快取紀錄嗎？")) { localStorage.clear(); chatSessions = {}; initMultiChatSystem(); } }

function appendSystemMessage(text) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    msg.className = "text-center text-xs my-2 italic";
    msg.style.color = "#c084fc";
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    chatSessions[currentChatId].htmlContent = chatBox.innerHTML;
    saveData();
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const row = document.createElement("div");
    row.className = sender === 'user' ? "bubble-row justify-end" : "bubble-row";
    const bubble = document.createElement("div");
    bubble.className = sender === 'user' ? "bubble user-bubble" : "bubble ai-bubble";
    bubble.innerHTML = text;
    row.appendChild(bubble);
    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
    chatSessions[currentChatId].htmlContent = chatBox.innerHTML;
    saveData();
    return bubble;
}

// ====================================================================
// 💡 多核心 AI 發送大腦 (5大模型完全整合發送邏輯)
// ====================================================================
async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const text = userInput.value.trim();
    if (!text) return;

    const currentModel = chatSessions[currentChatId].model || "llama3";

    // 1. 顯示使用者文字
    appendMessage(text, 'user');
    userInput.value = "";

    // 2. 根據所選的模型，調度不同的雲端通道
    if (currentModel === "flux" || currentModel === "sdxl") {
        // 🎨 繪圖核心
        const aiBubble = appendMessage("銀河助理正在調配星軌光波，現場繪圖中...", 'ai');
        setTimeout(() => {
            const encodedText = encodeURIComponent(text);
            // 區分 Flux.1 與 SDXL 公共端點
            const provider = currentModel === "flux" ? "flux" : "prodia";
            const imageUrl = `https://pollinations.ai{encodedText}?width=512&height=512&nologo=true&enhance=true&model=${provider}`;
            
            aiBubble.innerHTML = `🌌 <b>AI 繪圖核心作品完成：</b><br><img src="${imageUrl}" class="ai-img" alt="AI生成圖片" onload="document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;">`;
            chatSessions[currentChatId].htmlContent = chatBox.innerHTML;
            saveData();
        }, 500);
        
    } else if (currentModel === "webllm") {
        // 💻 本機純斷網核心 (WebLLM - Gemma-2-2B 壓縮版)
        const aiBubble = appendMessage("正在啟動瀏覽器本機 GPU 運算核心，請稍候...", 'ai');
        const statusText = document.getElementById("status-text");
        try {
            if (!webLlmEngine) {
                webLlmEngine = await window.webllm.CreateEngineLoopback();
                webLlmEngine.setInitProgressCallback((report) => {
                    statusText.innerText = report.text.replace("Fetching", "核心下載中").replace("Loading", "核心載入中");
                });
                await webLlmEngine.reload("Gemma-2-2b-it-q4f16_1-MLC");
            }
            statusText.innerText = "● 本機運算核心就緒";
            
            const messages = [
                { role: "system", content: "請一律使用繁體中文(台灣)進行簡短、親切的回答。" },
                { role: "user", content: text }
            ];
            const reply = await webLlmEngine.chat.completions.create({ messages });
            aiBubble.innerHTML = reply.choices[0].message.content.replace(/\n/g, "<br>");
            chatSessions[currentChatId].htmlContent = chatBox.innerHTML;
            saveData();
        } catch (e) {
            aiBubble.innerText = "本機運算失敗（您的硬體或瀏覽器可能不支援 WebGPU 加速）：" + e.message;
            statusText.innerText = "● 本機核心載入失敗";
        }
        
    } else {
        // 💬 雲端文字核心 (Llama 3 / Gemma 2 免金鑰通道)
        const modelNames = { llama3: "Llama 3 思考中...", gemma2: "Gemma 2 思考中..." };
        const aiBubble = appendMessage(modelNames[currentModel], 'ai');

        try {
            const systemPrompt = "你是一個實用的AI助理，請一律使用繁體中文(台灣)進行親切專業的回覆。";
            // 對應公共 API 的模型代號
            const apiModelCode = currentModel === "llama3" ? "llama" : "gemma";
            
            const response = await fetch("https://pollinations.ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: apiModelCode,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text }
                    ]
                })
            });

            if (!response.ok) throw new Error("雲端通道回應異常");
            const replyText = await response.text();
            aiBubble.innerHTML = replyText.replace(/\n/g, "<br>");
            chatSessions[currentChatId].htmlContent = chatBox.innerHTML;
            saveData();
        } catch (error) {
            aiBubble.innerText = "連線失敗，請稍後再試：" + error.message;
            aiBubble.style.color = "red";
        }
    }
}

// 綁定全域按鈕
window.createNewChat = createNewChat;
window.switchChat = switchChat;
window.deleteChat = deleteChat;
window.sendMessage = sendMessage;
window.clearAllData = clearAllData;
window.updateCurrentChatModel = updateCurrentChatModel;
