chrome.storage.local.get({ scanHistory: [] }, (data) => {

    let history = data.scanHistory;
    let container = document.getElementById("historyList");
    let countEl = document.getElementById("scanCount");

    // update count text
    countEl.textContent = history.length + " site(s) scanned";

    // empty state
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <span>🔍</span>
                No scans yet! Go scan some sites using the extension.
            </div>
        `;
        return;
    }

    // build a card for each scan
    history.forEach((scan) => {

        // pick styles based on risk level
        let barClass = "bar-safe";
        let badgeClass = "badge-safe";
        if (scan.risk === "DANGER")  { barClass = "bar-danger";  badgeClass = "badge-danger"; }
        if (scan.risk === "WARNING") { barClass = "bar-warning"; badgeClass = "badge-warning"; }

        // build flags list or "no issues" message
        let flagsHTML = scan.flags.length === 0
            ? `<p class="no-flags">✅ No issues detected</p>`
            : `<ul class="flags-list">
                ${scan.flags.map(f => `<li>${f}</li>`).join("")}
               </ul>`;

        let card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-bar ${barClass}"></div>
            <div class="card-body">
                <div class="card-top">
                    <span class="risk-badge ${badgeClass}">${scan.risk}</span>
                    <span class="card-time">${scan.time}</span>
                </div>
                <div class="card-url">${scan.url}</div>
                ${flagsHTML}
            </div>
        `;

        container.appendChild(card);
    });
});

// clear history
document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.storage.local.remove("scanHistory", () => {
        document.getElementById("historyList").innerHTML = `
            <div class="empty">
                <span>🗑️</span>
                History cleared!
            </div>
        `;
        document.getElementById("scanCount").textContent = "0 sites scanned";
    });
});