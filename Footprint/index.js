document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("recentScans");
    const label = document.getElementById("demoLabel");

    if (!container || !label) {
        console.error("Recent scans elements were not found in index.html.");
        return;
    }

    if (typeof chrome === "undefined" || !chrome.storage?.local) {
        console.warn("Extension storage is unavailable on this page.");
        return;
    }

    function displayRecentScans() {
        chrome.storage.local.get({ scanHistory: [] }, (data) => {
            if (chrome.runtime.lastError) {
                console.error("Could not load scan history:", chrome.runtime.lastError.message);
                return;
            }

            const history = Array.isArray(data.scanHistory) ? data.scanHistory : [];
            label.textContent = "Recent scans";
            container.innerHTML = "";

            if (history.length === 0) {
                const row = document.createElement("div");
                row.className = "demo-row";

                const message = document.createElement("div");
                message.className = "demo-url";
                message.textContent = "No scans yet. Scan a website using the extension.";

                row.appendChild(message);
                container.appendChild(row);
                return;
            }

            history.slice(0, 4).forEach((scan) => {
                let dotClass = "safe";
                let badgeClass = "badge-safe";
                let badgeText = "Safe";

                if (scan.risk === "DANGER") {
                    dotClass = "danger";
                    badgeClass = "badge-danger";
                    badgeText = "Dangerous";
                } else if (scan.risk === "WARNING") {
                    dotClass = "warn";
                    badgeClass = "badge-warn";
                    badgeText = "Suspicious";
                }

                let displayUrl = scan.url || "Unknown website";
                try {
                    displayUrl = new URL(displayUrl).hostname;
                } catch (error) {
                    console.warn("Invalid scan URL:", displayUrl);
                }

                const row = document.createElement("div");
                row.className = "demo-row";

                const dot = document.createElement("div");
                dot.className = `dot ${dotClass}`;

                const url = document.createElement("div");
                url.className = "demo-url";
                url.textContent = displayUrl;

                const badge = document.createElement("span");
                badge.className = `demo-badge ${badgeClass}`;
                badge.textContent = badgeText;

                row.append(dot, url, badge);
                container.appendChild(row);
            });
        });
    }

    displayRecentScans();

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.scanHistory) {
            displayRecentScans();
        }
    });
});
