// background.js

const API_KEY = "xIFZvOVosfhZry58AkS4aTR4TWHiIWrhYnp5tnP4xNPl1Cl30Y90sO0766Rw"; // Your API key

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchEmailData") {
    fetch("https://sendcrux.com/api/v1/warmup_profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`, // Include the API key here
      },
      body: JSON.stringify({
        email: request.email, // Use the email from the request
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((errorMessage) => {
            throw new Error(
              `HTTP error! Status: ${response.status}. Message: ${errorMessage}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        sendResponse({ success: true, data: data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Keep the message channel open for async response
    return true;
  }
    if (request.action === "navigateToGoogle") {
      chrome.tabs.create({ url: "https://mail.google.com/mail/" });
    }
});
