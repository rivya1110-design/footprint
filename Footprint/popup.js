document.addEventListener("DOMContentLoaded", async () => {

    const scanBtn = document.getElementById("scanBTN");
    const resultDiv = document.getElementById("result");

    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    scanBtn.addEventListener("click", () => {

        resultDiv.innerHTML = "<p>Scanning...</p>";

        chrome.tabs.sendMessage(tab.id, { type: "SCAN_PAGE" }, (response) => {

            if (!response || !response.flags) {
                resultDiv.innerHTML = "<p>Error scanning</p>";
                return;
            }

            let flags = response.flags;

            // Risk Level
            let risk = "SAFE";
            let color = "#50f366";

            if (flags.length >= 3) {
                risk = "DANGER";
                color = "#d62020";
            } else if (flags.length >= 1) {
                risk = "WARNING";
                color = "#ff9328";
            }

            // Display Results
            resultDiv.innerHTML = `
                <h2 style="color:${color}">${risk}</h2>
                <ul>
                    ${flags.map(f => `<li>${f}</li>`).join("")}
                </ul>
            `;
        });

    });

});