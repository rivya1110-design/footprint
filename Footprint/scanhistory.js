const container = document.getElementById("historyList");
const countEl = document.getElementById("scanCount");
const clearBtn = document.getElementById("clearBtn");

let responseTimer = null;

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderHistory(history) {
    const safeHistory = Array.isArray(history) ? history : [];
    container.innerHTML = "";
    countEl.textContent = `${safeHistory.length} site(s) scanned`;

    if (safeHistory.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <span>🔍</span>
                No scans yet! Go scan some sites using the extension.
            </div>
        `;
        return;
    }

    safeHistory.forEach((scan) => {
        let barClass = "bar-safe";
        let badgeClass = "badge-safe";

        if (scan.risk === "DANGER") {
            barClass = "bar-danger";
            badgeClass = "badge-danger";
        } else if (scan.risk === "WARNING") {
            barClass = "bar-warning";
            badgeClass = "badge-warning";
        }

        const flags = Array.isArray(scan.flags) ? scan.flags : [];
        const flagsHTML = flags.length === 0
            ? `<p class="no-flags">✅ No issues detected</p>`
            : `<ul class="flags-list">
                ${flags.map((flag) => `<li>${escapeHTML(flag)}</li>`).join("")}
               </ul>`;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-bar ${barClass}"></div>
            <div class="card-body">
                <div class="card-top">
                    <span class="risk-badge ${badgeClass}">${escapeHTML(scan.risk || "SAFE")}</span>
                    <span class="card-time">${escapeHTML(scan.time || "")}</span>
                </div>
                <div class="card-url">${escapeHTML(scan.url || "Unknown URL")}</div>
                ${flagsHTML}
            </div>
        `;

        container.appendChild(card);
    });
}

function showConnectionError() {
    countEl.textContent = "Extension not connected";
    container.innerHTML = `
        <div class="empty">
            <span>🧩</span>
            Footprint could not read the extension history.<br>
            Make sure the updated extension is enabled, then refresh this page.
        </div>
    `;
}

function hasDirectExtensionStorage() {
    return typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local;
}

function requestHistoryFromExtension() {
    const requestId = `history-${Date.now()}-${Math.random()}`;

    window.postMessage(
        {
            source: "FOOTPRINT_DASHBOARD",
            type: "GET_SCAN_HISTORY",
            requestId
        },
        window.location.origin
    );

    clearTimeout(responseTimer);
    responseTimer = setTimeout(showConnectionError, 1800);
}

function loadHistory() {
    if (hasDirectExtensionStorage()) {
        chrome.storage.local.get({ scanHistory: [] }, (data) => {
            renderHistory(data.scanHistory);
        });
        return;
    }

    requestHistoryFromExtension();
}

window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;

    const message = event.data;
    if (!message || message.source !== "FOOTPRINT_EXTENSION") return;

    if (message.type === "SCAN_HISTORY_RESPONSE" || message.type === "SCAN_HISTORY_UPDATED") {
        clearTimeout(responseTimer);
        renderHistory(message.scanHistory);
    }

    if (message.type === "SCAN_HISTORY_CLEARED") {
        clearTimeout(responseTimer);
        renderHistory([]);
    }
});

clearBtn.addEventListener("click", () => {
    if (hasDirectExtensionStorage()) {
        chrome.storage.local.remove("scanHistory", () => renderHistory([]));
        return;
    }

    const requestId = `clear-${Date.now()}-${Math.random()}`;
    window.postMessage(
        {
            source: "FOOTPRINT_DASHBOARD",
            type: "CLEAR_SCAN_HISTORY",
            requestId
        },
        window.location.origin
    );
});

// Reload when the user returns to this tab, and update live on extension pages.
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) loadHistory();
});
window.addEventListener("focus", loadHistory);

if (hasDirectExtensionStorage()) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.scanHistory) {
            renderHistory(changes.scanHistory.newValue || []);
        }
    });
}

loadHistory();






// chrome.storage.local.get({ scanHistory: [] }, (data) => {

//     let history = data.scanHistory;
//     let container = document.getElementById("historyList");
//     let countEl = document.getElementById("scanCount");

//     // update count text
//     countEl.textContent = history.length + " site(s) scanned";

//     // empty state
//     if (history.length === 0) {
//         container.innerHTML = `
//             <div class="empty">
//                 <span>🔍</span>
//                 No scans yet! Go scan some sites using the extension.
//             </div>
//         `;
//         return;
//     }

//     // build a card for each scan
//     history.forEach((scan) => {

//         // pick styles based on risk level
//         let barClass = "bar-safe";
//         let badgeClass = "badge-safe";
//         if (scan.risk === "DANGER")  { barClass = "bar-danger";  badgeClass = "badge-danger"; }
//         if (scan.risk === "WARNING") { barClass = "bar-warning"; badgeClass = "badge-warning"; }

//         // build flags list or "no issues" message
//         let flagsHTML = scan.flags.length === 0
//             ? `<p class="no-flags">✅ No issues detected</p>`
//             : `<ul class="flags-list">
//                 ${scan.flags.map(f => `<li>${f}</li>`).join("")}
//                </ul>`;

//         let card = document.createElement("div");
//         card.className = "card";
//         card.innerHTML = `
//             <div class="card-bar ${barClass}"></div>
//             <div class="card-body">
//                 <div class="card-top">
//                     <span class="risk-badge ${badgeClass}">${scan.risk}</span>
//                     <span class="card-time">${scan.time}</span>
//                 </div>
//                 <div class="card-url">${scan.url}</div>
//                 ${flagsHTML}
//             </div>
//         `;

//         container.appendChild(card);
//     });
// });

// // clear history
// document.getElementById("clearBtn").addEventListener("click", () => {
//     chrome.storage.local.remove("scanHistory", () => {
//         document.getElementById("historyList").innerHTML = `
//             <div class="empty">
//                 <span>🗑️</span>
//                 History cleared!
//             </div>
//         `;
//         document.getElementById("scanCount").textContent = "0 sites scanned";
//     });
// });

// // Read scan history from storage and display it
// chrome.storage.local.get("scanHistory", (data) => {

//     let history = data.scanHistory || [];
//     let container = document.getElementById("historyList");

//     // if no scans yet
//     if (history.length === 0) {
//         container.innerHTML = "<p>No scans yet! Go scan some sites.</p>";
//         return;
//     }

//     // loop through each scan and create a card for it
//     history.forEach((scan) => {

//         // pick colour based on risk
//         let color = "#50f366";      // green = safe
//         if (scan.risk === "DANGER")  color = "#d62020";  // red
//         if (scan.risk === "WARNING") color = "#ff9328";  // orange

//         // build the card HTML
//         let card = document.createElement("div");
//         card.innerHTML = `
//             <h3 style="color:${color}">${scan.risk}</h3>
//             <p>${scan.url}</p>
//             <p>${scan.time}</p>
//             <ul>
//                 ${scan.flags.map(f => `<li>${f}</li>`).join("")}
//             </ul>
//             <hr>
//         `;

//         container.appendChild(card);
//     });
// });

// // clear history button
// document.getElementById("clearBtn").addEventListener("click", () => {
//     chrome.storage.local.remove("scanHistory", () => {
//         document.getElementById("historyList").innerHTML = "<p>History cleared!</p>";
//     });
// });
