chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CHECK_URL") {

        let url = message.url;

        fetch("https://www.virustotal.com/api/v3/urls", {
            method: "POST",
            headers: {
                "x-apikey": "YOUR_NEW_API_KEY_HERE",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `url=${encodeURIComponent(url)}`
        })
        .then(res => res.json())
        .then(data => {
            let id = data.data.id;

            // ✅ Wait 3 seconds before fetching result
            // VirusTotal needs time to actually analyse the URL
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
                        headers: { "x-apikey": "YOUR_NEW_API_KEY_HERE" }
                    }));
                }, 3000);
            });
        })
        .then(res => res.json())
        .then(result => {
            let malicious = result.data.attributes.stats.malicious;
            sendResponse({ result: malicious > 0 ? "malicious" : "clean" });
        })
        .catch(err => {
            console.log("API Error:", err);
            sendResponse({ result: "error" });
        });

        return true;
    }
});



// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

//     if (message.type === "CHECK_URL") {

//         let url = message.url;

//         fetch("https://www.virustotal.com/api/v3/urls", {
//             method: "POST",
//             headers: {
//                 "x-apikey": "8bc4693ffae798c52ac1cb2fb2082c95bb4f7b27ea7fe1d27b2ff6715a682a4f", // from virus total API Key
//                 "Content-Type": "application/x-www-form-urlencoded"
//             },
//             body: `url=${encodeURIComponent(url)}`
//         })
//         .then(res => res.json())
//         .then(data => {

//             let id = data.data.id;

//             return fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
//                 headers: {
//                     "x-apikey": "8bc4693ffae798c52ac1cb2fb2082c95bb4f7b27ea7fe1d27b2ff6715a682a4f"
//                 }
//             });

//         })
//         .then(res => res.json())
//         .then(result => {

//             let malicious = result.data.attributes.stats.malicious;

//             if (malicious > 0) {
//                 sendResponse({ result: "malicious" });
//             } else {
//                 sendResponse({ result: "clean" });
//             }

//         })
//         .catch(err => {
//             console.log("API Error:", err);
//             sendResponse({ result: "error" });
//         });
//     }

//     return true;
// });