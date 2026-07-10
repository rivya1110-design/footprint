const FOOTPRINT_ORIGIN =
    "https://rivya1110-design.github.io";

window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.origin !== FOOTPRINT_ORIGIN) return;

    const message = event.data;

    if (!message || message.source !== "FOOTPRINT_WEBSITE") {
        return;
    }

    if (message.type === "GET_SCAN_HISTORY") {
        chrome.storage.local.get({ scanHistory: [] }, (data) => {
            window.postMessage(
                {
                    source: "FOOTPRINT_EXTENSION",
                    type: "SCAN_HISTORY_RESPONSE",
                    scanHistory: data.scanHistory
                },
                FOOTPRINT_ORIGIN
            );
        });
    }

    if (message.type === "CLEAR_SCAN_HISTORY") {
        chrome.storage.local.set({ scanHistory: [] }, () => {
            window.postMessage(
                {
                    source: "FOOTPRINT_EXTENSION",
                    type: "SCAN_HISTORY_RESPONSE",
                    scanHistory: []
                },
                FOOTPRINT_ORIGIN
            );
        });
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes.scanHistory) {
        return;
    }

    window.postMessage(
        {
            source: "FOOTPRINT_EXTENSION",
            type: "SCAN_HISTORY_RESPONSE",
            scanHistory: changes.scanHistory.newValue || []
        },
        FOOTPRINT_ORIGIN
    );
});