document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("recentScans");
    const label = document.getElementById("demoLabel");

    function displayRecentScans(history) {
        label.textContent = "Recent scans";
        container.innerHTML = "";

        if (!Array.isArray(history) || history.length === 0) {
            container.innerHTML = `
                <div class="demo-row">
                    <div class="demo-url">
                        No scans yet. Scan a website using Footprint.
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
                console.error("Invalid URL:", scan.url);
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
    }

    window.addEventListener("message", (event) => {
        if (
            event.origin !== "https://rivya1110-design.github.io" ||
            event.data?.source !== "FOOTPRINT_EXTENSION" ||
            event.data?.type !== "SCAN_HISTORY_RESPONSE"
        ) {
            return;
        }

        displayRecentScans(event.data.scanHistory);
    });

    window.postMessage(
        {
            source: "FOOTPRINT_WEBSITE",
            type: "GET_SCAN_HISTORY"
        },
        "https://rivya1110-design.github.io"
    );
});