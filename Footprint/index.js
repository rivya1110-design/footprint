document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("recentScans");
    const label = document.getElementById("demoLabel");

    function displayRecentScans() {
        chrome.storage.local.get({ scanHistory: [] }, (data) => {
            const history = data.scanHistory;

            label.textContent = "Recent scans";
            container.innerHTML = "";

            if (history.length === 0) {
                container.innerHTML = `
                    <div class="demo-row">
                        <div class="demo-url">
                            No scans yet. Scan a website using the extension.
                        </div>
                    </div>
                `;
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

                let displayUrl = scan.url;

                try {
                    displayUrl = new URL(scan.url).hostname;
                } catch (error) {
                    console.error("Invalid scan URL:", scan.url);
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

                row.appendChild(dot);
                row.appendChild(url);
                row.appendChild(badge);
                container.appendChild(row);
            });
        });
    }

    // Display saved scans when index.html opens
    displayRecentScans();

    // Update the section if a new scan is saved while the page is open
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.scanHistory) {
            displayRecentScans();
        }
    });
});
