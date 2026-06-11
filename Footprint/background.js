chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "CHECK_URL") {

        let url = message.url;

        fetch("https://www.virustotal.com/api/v3/urls", {
            method: "POST",
            headers: {
                "x-apikey": "8bc4693ffae798c52ac1cb2fb2082c95bb4f7b27ea7fe1d27b2ff6715a682a4f", // from virus total API Key
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `url=${encodeURIComponent(url)}`
        })
        .then(res => res.json())
        .then(data => {

            let id = data.data.id;

            return fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
                headers: {
                    "x-apikey": "8bc4693ffae798c52ac1cb2fb2082c95bb4f7b27ea7fe1d27b2ff6715a682a4f"
                }
            });

        })
        .then(res => res.json())
        .then(result => {

            let malicious = result.data.attributes.stats.malicious;

            if (malicious > 0) {
                sendResponse({ result: "malicious" });
            } else {
                sendResponse({ result: "clean" });
            }

        })
        .catch(err => {
            console.log("API Error:", err);
            sendResponse({ result: "error" });
        });
    }

    return true;
});