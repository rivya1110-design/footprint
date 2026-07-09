// Read scan history from storage and display it
chrome.storage.local.get("scanHistory", (data) => {

    let history = data.scanHistory || [];
    let container = document.getElementById("historyList");

    // if no scans yet
    if (history.length === 0) {
        container.innerHTML = "<p>No scans yet! Go scan some sites.</p>";
        return;
    }

    // loop through each scan and create a card for it
    history.forEach((scan) => {

        // pick colour based on risk
        let color = "#50f366";      // green = safe
        if (scan.risk === "DANGER")  color = "#d62020";  // red
        if (scan.risk === "WARNING") color = "#ff9328";  // orange

        // build the card HTML
        let card = document.createElement("div");
        card.innerHTML = `
            <h3 style="color:${color}">${scan.risk}</h3>
            <p>${scan.url}</p>
            <p>${scan.time}</p>
            <ul>
                ${scan.flags.map(f => `<li>${f}</li>`).join("")}
            </ul>
            <hr>
        `;

        container.appendChild(card);
    });
});

// clear history button
document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.storage.local.remove("scanHistory", () => {
        document.getElementById("historyList").innerHTML = "<p>History cleared!</p>";
    });
});