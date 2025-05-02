// Safely get the problem name from breadcrumb
let problem_name = "";
try {
  problem_name = document.querySelectorAll(".breadcrumb a")[2]?.innerText || "";
} catch (e) {
  console.error("Problem name not found", e);
}

// Safely get the problem ID from the run details section
let problem_id = "";
try {
  const runDetails = document.getElementsByClassName("run-details-info")[0];
  problem_id = runDetails?.children[1]?.children[1]?.children[0]?.innerHTML || "";
} catch (e) {
  console.error("Problem ID not found", e);
}

const problem = {
  name: problem_name,
  id: problem_id
};

// Add event listener on submit button (with a safety check)
const submitButton = document.querySelector(".submit-run .ns-button");
if (submitButton) {
  submitButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "problem", data: problem });
  });
} else {
  console.warn("Submit button not found");
}
