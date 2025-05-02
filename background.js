let problem_details = {};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "problem") {
    problem_details = msg.data;
    console.log("Received problem details:", problem_details);
  }
});

// Function to repeatedly check for verdict
function checkResult(url, id, xcsrf, problem_details, problem_url) {
  fetch(url, {
    method: "GET",
    headers: {
      "x-csrf-token": xcsrf
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log("Verdict:", data.result_code);

      if (data.result_code === "wait") {
        setTimeout(() => {
          checkResult(url, id, xcsrf, problem_details, problem_url);
        }, 3000); // check every 3s
      } else {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "logo.png",
          title: `Problem: ${problem_details.name}`,
          message: `Verdict: ${data.result_code}\nID: ${problem_details.id}\nTime: ${data.time}`,
          priority: 1
        });
      }
    })
    .catch(error => {
      console.error("Error while checking result:", error);
    });
}

// Listen for CodeChef submission requests
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const url = new URL(details.url);

    if (url.search.length > 0) {
      const id = url.searchParams.get("solution_id");

      let xcsrf = "";
      for (const header of details.requestHeaders) {
        if (header.name.toLowerCase() === "x-csrf-token") {
          xcsrf = header.value;
          break;
        }
      }

      const store = {};
      store[id] = id;

      chrome.storage.sync.get(id, function (key_values) {
        if (Object.keys(key_values).length !== 0) {
          // Already tracked this submission ID
          return;
        } else {
          // New submission, store and check
          chrome.storage.sync.set(store, function () {
            checkResult(url, id, xcsrf, problem_details, url.href);
          });
        }
      });
    }
  },
  {
    urls: ["https://www.codechef.com/api/ide/submit*"],
    types: ["xmlhttprequest"]
  },
  ["requestHeaders"]
);
