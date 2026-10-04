/* =========================================
   SMART CITY MANAGEMENT SYSTEM
   JavaScript
========================================= */


/* DATA */

let citizens = JSON.parse(localStorage.getItem("citizens")) || [];

let emergencies =
    JSON.parse(localStorage.getItem("emergencies")) || [];

let stack =
    JSON.parse(localStorage.getItem("stack")) || [];

let roads =
    JSON.parse(localStorage.getItem("roads")) || [];


/* PAGE NAVIGATION */

function showPage(pageId, button = null) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const titles = {
        dashboard: "Dashboard",
        citizens: "Citizen Management",
        emergency: "Emergency Queue",
        undo: "Undo Stack",
        roads: "Road Network",
        "city-tree": "City Structure"
    };

    document.getElementById("pageTitle").textContent =
        titles[pageId];

    if (pageId === "citizens") {
        displayCitizens();
    }

    if (pageId === "emergency") {
        displayEmergencies();
    }

    if (pageId === "undo") {
        displayStack();
    }

    if (pageId === "roads") {
        displayRoads();
    }
}


/* DATE & TIME */

function updateDateTime() {

    const now = new Date();

    const date = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });

    document.getElementById("dateTime").textContent =
        date + " | " + time;
}

setInterval(updateDateTime, 1000);
updateDateTime();


/* CITIZENS - LINKED LIST */

function addCitizen() {

    const id = document.getElementById("citizenId").value.trim();
    const name = document.getElementById("citizenName").value.trim();

    if (id === "" || name === "") {
        showToast("⚠️ Please enter ID and name");
        return;
    }

    if (citizens.some(c => c.id == id)) {
        showToast("❌ Citizen ID already exists");
        return;
    }

    citizens.push({
        id: id,
        name: name
    });

    saveData();

    document.getElementById("citizenId").value = "";
    document.getElementById("citizenName").value = "";

    displayCitizens();

    showToast("✅ Citizen added successfully");
}


function displayCitizens() {

    const list = document.getElementById("citizenList");

    const search =
        document.getElementById("searchCitizen")?.value
        .toLowerCase() || "";

    list.innerHTML = "";

    const filtered = citizens.filter(c =>
        c.name.toLowerCase().includes(search) ||
        String(c.id).includes(search)
    );

    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty">
                👥 No citizens found
            </div>
        `;

        updateDashboard();
        return;
    }

    filtered.forEach(citizen => {

        list.innerHTML += `
            <div class="citizen-card">

                <div class="citizen-info">

                    <div class="citizen-avatar">
                        👤
                    </div>

                    <div>
                        <h3>${escapeHTML(citizen.name)}</h3>
                        <p>Citizen ID: ${citizen.id}</p>
                    </div>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteCitizen('${citizen.id}')">
                    🗑️ Delete
                </button>

            </div>
        `;
    });

    updateDashboard();
}


function deleteCitizen(id) {

    citizens = citizens.filter(c => c.id != id);

    saveData();
    displayCitizens();

    showToast("🗑️ Citizen removed");
}


/* EMERGENCY QUEUE */

function addEmergency() {

    const name =
        document.getElementById("emergencyName").value.trim();

    const priority =
        document.getElementById("priority").value;

    if (name === "") {
        showToast("⚠️ Enter emergency details");
        return;
    }

    emergencies.push({
        name: name,
        priority: priority,
        time: new Date().toLocaleTimeString()
    });

    saveData();

    document.getElementById("emergencyName").value = "";

    displayEmergencies();

    showToast("🚨 Emergency added to queue");
}


function displayEmergencies() {

    const list =
        document.getElementById("emergencyList");

    list.innerHTML = "";

    if (emergencies.length === 0) {

        list.innerHTML = `
            <div class="empty">
                🚨 No emergency cases
            </div>
        `;

    } else {

        emergencies.forEach((emergency, index) => {

            list.innerHTML += `
                <div class="emergency-card">

                    <div>
                        <strong>
                            ${index === 0 ? "👑 " : ""}
                            ${escapeHTML(emergency.name)}
                        </strong>

                        <small style="display:block;color:#888;margin-top:5px;">
                            Added: ${emergency.time}
                        </small>
                    </div>

                    <span class="priority ${emergency.priority}">
                        ${emergency.priority}
                    </span>

                </div>
            `;
        });
    }

    document.getElementById("queueStatus").textContent =
        emergencies.length === 0
            ? "Empty"
            : emergencies.length + " waiting";

    updateDashboard();
}


function handleEmergency() {

    if (emergencies.length === 0) {
        showToast("ℹ️ Queue is empty");
        return;
    }

    const handled = emergencies.shift();

    saveData();
    displayEmergencies();

    showToast(
        "✅ Handled: " + handled.name
    );
}


/* STACK */

function addAction() {

    const action =
        document.getElementById("actionInput").value.trim();

    if (action === "") {
        showToast("⚠️ Enter an action");
        return;
    }

    stack.push({
        action: action,
        time: new Date().toLocaleTimeString()
    });

    saveData();

    document.getElementById("actionInput").value = "";

    displayStack();

    showToast("📥 Action pushed to stack");
}


function displayStack() {

    const list =
        document.getElementById("stackList");

    list.innerHTML = "";

    if (stack.length === 0) {

        list.innerHTML = `
            <div class="empty">
                📚 Stack is empty
            </div>
        `;

    } else {

        [...stack].reverse().forEach((item, index) => {

            list.innerHTML += `
                <div class="stack-item">

                    ${index === 0 ? "🔝 " : "📌 "}

                    ${escapeHTML(item.action)}

                    <small style="float:right;">
                        ${item.time}
                    </small>

                </div>
            `;
        });
    }

    updateDashboard();
}


function undoAction() {

    if (stack.length === 0) {
        showToast("ℹ️ Nothing to undo");
        return;
    }

    const removed = stack.pop();

    saveData();
    displayStack();

    showToast(
        "↩️ Undone: " + removed.action
    );
}


/* GRAPH - ROADS */

function addRoad() {

    const area1 =
        document.getElementById("area1").value;

    const area2 =
        document.getElementById("area2").value;

    if (area1 === area2) {
        showToast("⚠️ Select two different areas");
        return;
    }

    const exists = roads.some(road =>
        (road.a === area1 && road.b === area2) ||
        (road.a === area2 && road.b === area1)
    );

    if (exists) {
        showToast("🛣️ Road already exists");
        return;
    }

    roads.push({
        a: area1,
        b: area2
    });

    saveData();

    displayRoads();

    showToast("🛣️ Road connection created");
}


function displayRoads() {

    const list =
        document.getElementById("roadList");

    list.innerHTML = "";

    if (roads.length === 0) {

        list.innerHTML = `
            <div class="empty">
                🛣️ No road connections yet
            </div>
        `;

    } else {

        roads.forEach((road, index) => {

            list.innerHTML += `
                <div class="road-card">
                    🏙️
                    <strong>${escapeHTML(road.a)}</strong>
                    <span> ━━━ 🛣️ ━━━ </span>
                    <strong>${escapeHTML(road.b)}</strong>
                </div>
            `;
        });
    }

    updateDashboard();
}


/* DASHBOARD */

function updateDashboard() {

    document.getElementById("citizenCount").textContent =
        citizens.length;

    document.getElementById("emergencyCount").textContent =
        emergencies.length;

    document.getElementById("stackCount").textContent =
        stack.length;

    document.getElementById("roadCount").textContent =
        roads.length;
}


/* LOCAL STORAGE */

function saveData() {

    localStorage.setItem(
        "citizens",
        JSON.stringify(citizens)
    );

    localStorage.setItem(
        "emergencies",
        JSON.stringify(emergencies)
    );

    localStorage.setItem(
        "stack",
        JSON.stringify(stack)
    );

    localStorage.setItem(
        "roads",
        JSON.stringify(roads)
    );

    updateDashboard();
}


/* DARK MODE */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "darkMode",
        dark
    );

    showToast(
        dark
            ? "🌙 Dark mode enabled"
            : "☀️ Light mode enabled"
    );
}


if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}


/* TOAST */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const text =
        document.getElementById("toastMessage");

    text.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* SECURITY */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* INITIAL LOAD */

displayCitizens();
displayEmergencies();
displayStack();
displayRoads();
updateDashboard();
