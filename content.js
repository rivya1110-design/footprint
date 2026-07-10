// For scaning URLs and suspicious keywords 
// Auto scan and send results to popup.js 
// Check for sus sites w VirusTotal API,  URL pattern checking, login keyword checking

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCAN_PAGE") {

        let text = document.body.innerText.toLowerCase();
        let url = window.location.href;
        let flags = [];

        // CHECK 1 - VirusTotal API first
        chrome.runtime.sendMessage({ type: "CHECK_URL", url: url }, (apiResponse) => {

            if (apiResponse && apiResponse.result === "malicious") {
                flags.push("⚠️ VirusTotal: Malicious URL detected");
            }

            // CHECK 2 - HTTP only (not HTTPS) - exclude localhost
            if (url.startsWith("http://") && !url.includes("localhost")) {
                flags.push("⚠️ Site is not using HTTPS (insecure connection)");
            }

            // CHECK 3 - Suspicious URL patterns (scammy looking URLs only)
            let susURLPatterns = [
                { pattern: /\d+\.\d+\.\d+\.\d+/, label: "URL uses raw IP address (suspicious)" },
                { pattern: /login.*-.*\.(xyz|top|click|tk|ml|ga)$/i, label: "Suspicious login domain" },
                { pattern: /paypal|amazon|apple|microsoft|google(?!\.com)/i, label: "Brand name in suspicious domain" },
            ];
            susURLPatterns.forEach(({ pattern, label }) => {
                if (pattern.test(url)) flags.push(label);
            });

            // CHECK 4 - Keywords ONLY if already flagged by API or URL
            if (flags.length > 0) {
                let phishingKeywords = [
                    "verify your account",
                    "confirm your identity", 
                    "your account has been suspended",
                    "enter your credit card",
                    "urgent action required",
                    "you have won",
                    "click here to claim",
                    "limited time offer"
                ];
                phishingKeywords.forEach(phrase => {
                    if (text.includes(phrase)) flags.push("Phishing phrase: \"" + phrase + "\"");
                });
            }

            sendResponse({ flags: flags });
        });

        return true;
    }
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === "SCAN_PAGE") {

//         let text = document.body.innerText.toLowerCase();
//         let url = window.location.href;
//         let flags = [];

//         // checking for sus URL patterns
//         let susURLPatterns = [/http:\/\//, /login/i, /verify/i, /secure/i, /\d+\.\d+\.\d+\.\d+/];
//         susURLPatterns.forEach(pattern => {
//             if (url.match(pattern)) flags.push("Suspicious URL pattern detected");
//         });

//         // checking keywords 
//         // let keywords = ["login", "password", "verify", "account"];
//         let loginKeywords = ["login", "sign in", "username", "password", "email", "verify", "identification", "credentials", 
//              "account", "authentication", "security question", "2fa", "two-factor authentication", "otp", 
//              "one-time password", "mfa", "multi-factor authentication"];

//         loginKeywords.forEach(word => {
//             if (text.includes(word)) flags.push("Keyword found: " + word);
//         });

//         // check w Virus Total API using background.js
//         chrome.runtime.sendMessage({ type: "CHECK_URL", url: url }, (apiResponse) => {

//             // use API result to add to flags
//             if (apiResponse && apiResponse.result === "malicious") {
//                 flags.push("⚠️ VirusTotal: Malicious URL detected");
//             }

//             // send results back to popup.js after checking and display 
//             sendResponse({ flags: flags });
//         });

//         return true; // keeps channel open while waiting for VirusTotal
//     }
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

//     if (message.type === "SCAN_PAGE") {

//         let text = document.body.innerText.toLowerCase();
//         let url = window.location.href;
//         let flags = [];

//         // 🔥 CALL API (background.js)
//         chrome.runtime.sendMessage(
//             {
//                 type: "CHECK_URL",
//                 url: url
//             },
//             (response) => {

//                 // API RESULT
//                 if (response && response.result === "malicious") {
//                     flags.push("⚠️ API: Malicious URL detected");
//                 }

//                 // URL patterns
//                 let susURLPatterns = [
//                     /http:\/\//,
//                     /login/i,
//                     /verify/i,
//                     /secure/i,
//                     /\d+\.\d+\.\d+\.\d+/
//                 ];

//                 susURLPatterns.forEach(pattern => {
//                     if (url.match(pattern)) {
//                         flags.push("Suspicious URL pattern");
//                     }
//                 });

//                 // Keywords
//                 let keywords = ["login", "password", "verify", "account"];

//                 keywords.forEach(word => {
//                     if (text.includes(word)) {
//                         flags.push("Keyword: " + word);
//                     }
//                 });

//                 console.log("Final Flags:", flags);

//                 // 🔥 THIS IS THE KEY LINE
//                 sendResponse({ flags: flags });
//             }
//         );

//         return true; // VERY IMPORTANT (async)
//     }
// });

// console.log("Footprint is running!")

// let text = document.body.innerText.toLowerCase();
// let url = window.location.href;
// let domain = window.location.hostname;
// let flags = [];

// console.log("Before", text);
// console.log("After", text);

// // Looking w API
// chrome.runtime.sendMessage(
//     {
//         type: "CHECK_URL",
//         url: url
//     },
//     (response) => {
//         if (response && response.result === "malicious") {
//             flags.push("Malicious URL Detected!");

//             console.log("Final Flags:", flags);
//         }
        
//         // Checking for URLs
//         let susURLPatterns = [
//             /http:\/\//,              
//             /login/i,
//             /verify/i,
//             /secure/i,
//             /\d+\.\d+\.\d+\.\d+/     
//         ];

//         susURLPatterns.forEach(pattern => {
//             let matches = url.match(pattern);
//             if (matches) {
//                 flags.push(`Suspicious URL pattern: ${pattern}`);
//             }
//         });

//         // Checking for login keywords
//         let loginKeywords = ["login", "sign in", "username", "password", "email", "verify", "identification", "credentials", 
//             "account", "authentication", "security question", "2fa", "two-factor authentication", "otp", 
//             "one-time password", "mfa", "multi-factor authentication"];


//         loginKeywords.forEach(word => {
//             if (text.includes(word)) {
//                 flags.push("Keyword: " + word);
//             }
//         });

//         console.log("Final Flags:", flags);
//         // sendResponse({ flags: flags });
        
//     }
// );



