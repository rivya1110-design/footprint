// For scaning URLs and suspicious keywords 
// Auto scan and send results to popup.js 
// Check for sus sites in db -> URL pattern checking -> login keyword checking

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCAN_PAGE") {

        let text = document.body.innerText.toLowerCase();
        let url = window.location.href;
        let flags = [];

        // ✅ Step 1: URL pattern check (instant)
        let susURLPatterns = [/http:\/\//, /login/i, /verify/i, /secure/i, /\d+\.\d+\.\d+\.\d+/];
        susURLPatterns.forEach(pattern => {
            if (url.match(pattern)) flags.push("Suspicious URL pattern detected");
        });

        // ✅ Step 2: Keyword check (instant)
        let keywords = ["login", "password", "verify", "account"];
        keywords.forEach(word => {
            if (text.includes(word)) flags.push("Keyword found: " + word);
        });

        // ✅ Step 3: Ask background.js to check VirusTotal
        chrome.runtime.sendMessage({ type: "CHECK_URL", url: url }, (apiResponse) => {

            // Add API result to flags if malicious
            if (apiResponse && apiResponse.result === "malicious") {
                flags.push("⚠️ VirusTotal: Malicious URL detected");
            }

            // Now send EVERYTHING back to popup — after all 3 checks done
            sendResponse({ flags: flags });
        });

        return true; // keeps channel open while waiting for VirusTotal
    }
});

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



