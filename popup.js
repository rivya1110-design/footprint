document.addEventListener("DOMContentLoaded", () => {
    const scanBTN = document.getElementById("scanBTN");
    const resultContent = document.getElementById("resultContent");
    const moreFeaturesBtn = document.getElementById("moreFeaturesBtn");

    moreFeaturesBtn.addEventListener("click", () => {
        chrome.tabs.create({
            url: `${chrome.runtime.getURL("index.html")}#features`
        });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        scanBTN.addEventListener("click", () => {
            const pageUrl = tab?.url || "";
            const restrictedPage = /^(chrome|edge|about|chrome-extension):/i.test(pageUrl);

            if (!tab?.id || restrictedPage) {
                resultContent.innerHTML =
                    "<p>This browser page cannot be scanned. Open a normal website first.</p>";
                return;
            }

            resultContent.innerHTML = "<p>Scanning...</p>";

            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    files: ["content.js"]
                },
                () => {
                    if (chrome.runtime.lastError) {
                        resultContent.innerHTML =
                            "<p>Unable to scan this page. Open a normal website and try again.</p>";
                        return;
                    }

                    chrome.tabs.sendMessage(
                        tab.id,
                        { type: "SCAN_PAGE" },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                resultContent.innerHTML = "<p>Unable to scan this page.</p>";
                                return;
                            }

                            if (!response || !Array.isArray(response.flags)) {
                                resultContent.innerHTML = "<p>Error scanning page.</p>";
                                return;
                            }

                            const flags = response.flags;
                            let risk = "SAFE";
                            let color = "#50f366";

                            if (flags.length >= 3) {
                                risk = "DANGER";
                                color = "#d62020";
                            } else if (flags.length >= 1) {
                                risk = "WARNING";
                                color = "#ff9328";
                            }

                            const newScan = {
                                url: tab.url,
                                risk,
                                flags,
                                time: new Date().toLocaleString()
                            };

                            chrome.storage.local.get({ scanHistory: [] }, (data) => {
                                const history = Array.isArray(data.scanHistory)
                                    ? data.scanHistory
                                    : [];

                                history.unshift(newScan);

                                if (history.length > 50) {
                                    history.length = 50;
                                }

                                chrome.storage.local.set({ scanHistory: history });
                            });

                            resultContent.innerHTML =
                                flags.length === 0
                                    ? `<h2 style="color:${color}">${risk}</h2><p>No suspicious indicators found.</p>`
                                    : `<h2 style="color:${color}">${risk}</h2><ul>${flags
                                          .map((flag) => `<li>${flag}</li>`)
                                          .join("")}</ul>`;
                        }
                    );
                }
            );
        });
    });
});
