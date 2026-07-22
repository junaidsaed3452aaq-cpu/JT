// Cursor
const cursor = document.querySelector(".cursor");
document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});

// Check Authentication / Session on Load
window.addEventListener("DOMContentLoaded", () => {
    const activeUser = localStorage.getItem("junaid_active_user");
    if (activeUser) {
        document.getElementById("auth-modal").style.display = "none";
        loadUserData(activeUser);
        loadUserMessages(activeUser);
    } else {
        document.getElementById("auth-modal").style.display = "flex";
    }
});

// Switch between Create ID and Login tabs inside Modal
function switchTab(tabName) {
    const createSec = document.getElementById("create-section");
    const loginSec = document.getElementById("login-section");
    const createSecUr = document.getElementById("create-section-ur");
    const loginSecUr = document.getElementById("login-section-ur");

    if (tabName === 'create') {
        createSec.classList.add("active");
        loginSec.classList.remove("active");
        createSecUr.classList.add("active");
        loginSecUr.classList.remove("active");
    } else {
        createSec.classList.remove("active");
        loginSec.classList.add("active");
        createSecUr.classList.remove("active");
        loginSecUr.classList.add("active");
    }
}

// Generate 6-digit alphanumeric mixed ID
function generateUniqueId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Create New ID Handler
function createUserId() {
    const nameEn = document.getElementById("user-name-input").value.trim();
    const nameUr = document.getElementById("user-name-input-ur").value.trim();
    const userName = nameEn || nameUr;

    if (!userName) {
        alert("Please enter your name!");
        return;
    }

    const uniqueId = generateUniqueId();
    
    const userData = {
        name: userName,
        messages: [],
        createdAt: new Date().toISOString()
    };
    localStorage.setItem("user_" + uniqueId, JSON.stringify(userData));
    localStorage.setItem("junaid_temp_session", uniqueId);

    document.getElementById("create-section").style.display = "none";
    document.getElementById("create-section-ur").style.display = "none";
    document.getElementById("login-section").style.display = "none";
    document.getElementById("login-section-ur").style.display = "none";
    document.querySelector(".modal-tabs").style.display = "none";
    
    document.getElementById("generated-id-text").innerText = uniqueId;
    document.getElementById("result-box").style.display = "block";
}

// Login with Existing ID Handler
function loginWithId() {
    const idEn = document.getElementById("login-id-input").value.trim();
    const idUr = document.getElementById("login-id-input-ur").value.trim();
    const enteredId = idEn || idUr;

    if (!enteredId) {
        alert("Please enter your ID!");
        return;
    }

    const savedData = localStorage.getItem("user_" + enteredId);
    if (savedData) {
        localStorage.setItem("junaid_active_user", enteredId);
        document.getElementById("auth-modal").style.display = "none";
        loadUserData(enteredId);
        loadUserMessages(enteredId);
    } else {
        alert("Invalid ID! Please check your ID or create a new one.");
    }
}

// Copy Generated ID to Clipboard
function copyGeneratedId() {
    const idText = document.getElementById("generated-id-text").innerText;
    navigator.clipboard.writeText(idText).then(() => {
        alert("ID copied to clipboard successfully!");
    });
}

// Enter Website after noting down ID
function enterWebsite() {
    const tempId = localStorage.getItem("junaid_temp_session");
    if (tempId) {
        localStorage.setItem("junaid_active_user", tempId);
        localStorage.removeItem("junaid_temp_session");
    }
    document.getElementById("auth-modal").style.display = "none";
    const activeId = localStorage.getItem("junaid_active_user");
    loadUserData(activeId);
    loadUserMessages(activeId);
}

// Load personalized data for user
function loadUserData(userId) {
    const data = JSON.parse(localStorage.getItem("user_" + userId));
    if (data && data.name) {
        document.getElementById("welcome-heading").innerText = "Welcome, " + data.name;
    }
}

// ==========================================
// CREATE YOUR APP MODAL & MESSAGE FUNCTIONS
// ==========================================

function openAppModal() {
    const activeUser = localStorage.getItem("junaid_active_user");
    if (!activeUser) {
        alert("Please login or create your ID first!");
        document.getElementById("auth-modal").style.display = "flex";
        return;
    }
    document.getElementById("app-modal").style.display = "flex";
}

function closeAppModal() {
    document.getElementById("app-modal").style.display = "none";
}

// Send App Message & Display on User's Page
function sendAppMessage() {
    const msgInput = document.getElementById("app-message-input");
    const messageText = msgInput.value.trim();

    if (!messageText) {
        alert("Please enter your app message!");
        return;
    }

    const activeUser = localStorage.getItem("junaid_active_user");
    if (!activeUser) return;

    let userData = JSON.parse(localStorage.getItem("user_" + activeUser));
    if (!userData.messages) {
        userData.messages = [];
    }

    const newMessage = {
        text: messageText,
        time: new Date().toLocaleString()
    };

    userData.messages.push(newMessage);
    localStorage.setItem("user_" + activeUser, JSON.stringify(userData));

    msgInput.value = "";
    closeAppModal();
    loadUserMessages(activeUser);
}

// Load User Messages onto the Page
function loadUserMessages(userId) {
    const container = document.getElementById("messages-list-container");
    const userData = JSON.parse(localStorage.getItem("user_" + userId));

    if (!userData || !userData.messages || userData.messages.length === 0) {
        container.innerHTML = `<p class="no-msg-text">No app messages sent yet. Click "Create Your App" above to send one!</p>`;
        return;
    }

    container.innerHTML = "";
    userData.messages.forEach((msg) => {
        const card = document.createElement("div");
        card.className = "msg-card";
        card.innerHTML = `
            <div>
                <p class="msg-content-text">${escapeHtml(msg.text)}</p>
                <span class="msg-time"><i class="fa-regular fa-clock"></i> ${msg.time}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Security helper to avoid HTML injection
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Modal Language Translation Toggle (English <-> Urdu)
let isModalUrdu = false;
function toggleModalLanguage() {
    const contentEn = document.getElementById("modal-content-en");
    const contentUr = document.getElementById("modal-content-ur");
    const msgEn = document.getElementById("result-msg-en");
    const msgUr = document.getElementById("result-msg-ur");
    const transBtn = document.getElementById("modal-trans-btn");

    if (!isModalUrdu) {
        contentEn.style.display = "none";
        contentUr.style.display = "block";
        msgEn.style.display = "none";
        msgUr.style.display = "block";
        transBtn.innerText = "English";
        isModalUrdu = true;
    } else {
        contentEn.style.display = "block";
        contentUr.style.display = "none";
        msgEn.style.display = "block";
        msgUr.style.display = "none";
        transBtn.innerText = "اردو";
        isModalUrdu = false;
    }
}

// Scroll Bar
window.addEventListener("scroll", () => {
    let scroll = document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let percent = (scroll / height) * 100;
    document.getElementById("progress-bar").style.width = percent + "%";
});

// Typing Effect
const words = [
    "Flutter Developer",
    "Python Developer",
    "HTML CSS Developer",
    "Desktop Software",
    "Android Apps",
    "AI Developer"
];
let i = 0;
let j = 0;
let current = "";
let erase = false;

function type() {
    const typingElement = document.getElementById("typing");
    if (!typingElement) return;

    if (!erase) {
        current = words[i].substring(0, j++);
        typingElement.innerHTML = current;
        if (j > words[i].length) {
            erase = true;
            setTimeout(type, 2000);
            return;
        }
        setTimeout(type, 90);
    } else {
        current = words[i].substring(0, j--);
        typingElement.innerHTML = current;
        if (j < 0) {
            erase = false;
            i = (i + 1) % words.length;
            j = 0;
            setTimeout(type, 400);
            return;
        }
        setTimeout(type, 45);
    }
}
type();

// 3D Hero Card Effect
const heroCard = document.querySelector(".hero-card");
if (heroCard) {
    document.addEventListener("mousemove", (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 35;
        const y = (window.innerHeight / 2 - e.clientY) / 35;
        heroCard.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    });
}

// Toggle Translate Function for About Section
let isUrdu = false;
function toggleTranslate() {
    const aboutText = document.getElementById("about-text");
    const translateBtn = document.getElementById("translate-btn");

    if (!isUrdu) {
        aboutText.innerHTML = "السلام علیکم! جنید ٹیک میں خوش آمدید۔ آپ یہاں اپنے ونڈوز پی سی، اینڈرائیڈ، اور آئی او ایس (آئی فون) کے لیے ایپس بنوا سکتے ہیں اور ویب سائٹس بھی تیار کروا سکتے ہیں۔ ان تمام خدمات کے لیے آپ ہمارے اس واٹس ایپ نمبر پر رابطہ کریں: <i class='fa-brands fa-whatsapp' style='color: #25d366; margin-left: 3px; margin-right: 2px;'></i>+92 328 8773691";
        translateBtn.innerHTML = "English";
        isUrdu = true;
    } else {
        aboutText.innerHTML = "Assalam-o-Alaikum! Welcome to Junaid Tech. Here you can get custom applications built for Windows PC, Android, and iOS (iPhone), as well as professional websites. For all these services, feel free to contact us on WhatsApp at <i class='fa-brands fa-whatsapp' style='color: #25d366; margin-left: 3px; margin-right: 2px;'></i>+92 328 8773691.";
        translateBtn.innerHTML = "اردو";
        isUrdu = false;
    }
}

// Font Size Controller
let currentFontSize = 18;
function changeFontSize(direction) {
    const aboutText = document.getElementById("about-text");
    currentFontSize += direction * 2;
    if (currentFontSize < 14) currentFontSize = 14;
    if (currentFontSize > 28) currentFontSize = 28;
    aboutText.style.fontSize = currentFontSize + "px";
}