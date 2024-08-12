window.isProcessingPaused = false;
let count = 0;
let unreadCount = 0;
let emails = [];
let currentIndex = 0;
let spamEmails = [];
let spamIndex = 0;
let currentAccountIndex = 0; // Add this line
const openedLinks = new Set(); // Set to track opened links

const accountUrls = [
  "https://mail.google.com/mail/u/0/#inbox",
  "https://mail.google.com/mail/u/1/#inbox",
  "https://mail.google.com/mail/u/2/#inbox",
  "https://mail.google.com/mail/u/3/#inbox",
  "https://mail.google.com/mail/u/4/#inbox",
  "https://mail.google.com/mail/u/5/#inbox",
  "https://mail.google.com/mail/u/6/#inbox",
  "https://mail.google.com/mail/u/7/#inbox",
  "https://mail.google.com/mail/u/8/#inbox",
  "https://mail.google.com/mail/u/9/#inbox",
  "https://mail.google.com/mail/u/10/#inbox",
  "https://mail.google.com/mail/u/11/#inbox",
  "https://mail.google.com/mail/u/12/#inbox",
  "https://mail.google.com/mail/u/13/#inbox",
  "https://mail.google.com/mail/u/14/#inbox",
  "https://mail.google.com/mail/u/15/#inbox",
  "https://mail.google.com/mail/u/16/#inbox",
  "https://mail.google.com/mail/u/17/#inbox",
  "https://mail.google.com/mail/u/18/#inbox",
  "https://mail.google.com/mail/u/19/#inbox",
  "https://mail.google.com/mail/u/20/#inbox",
  "https://mail.google.com/mail/u/21/#inbox",
  "https://mail.google.com/mail/u/22/#inbox",
  "https://mail.google.com/mail/u/23/#inbox",
  "https://mail.google.com/mail/u/24/#inbox",
  "https://mail.google.com/mail/u/25/#inbox",
  "https://mail.google.com/mail/u/26/#inbox",
  "https://mail.google.com/mail/u/27/#inbox",
  "https://mail.google.com/mail/u/28/#inbox",
  "https://mail.google.com/mail/u/29/#inbox",
  "https://mail.google.com/mail/u/30/#inbox",
];

// Function to switch to the next account
function switchToNextAccount() {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting account switch.");
    return;
  }

  currentAccountIndex++;
  if (currentAccountIndex >= accountUrls.length) {
    currentAccountIndex = 0; // Cycle back to the first account if we've gone through all
  }

  const nextAccountUrl = accountUrls[currentAccountIndex];
  console.log(
    `Switching to account ${currentAccountIndex + 1}: ${nextAccountUrl}`
  );
  window.location.href = nextAccountUrl;

  // Optionally, reset other variables if needed
  count = 0;
  unreadCount = 0;
  emails = [];
  currentIndex = 0;
  spamEmails = [];
  spamIndex = 0;
  openedLinks.clear(); // Clear the set of opened links

  setTimeout(observeForSearchBox, 5000); // Restart search box observation after switching accounts
}

// Function to process unread emails
function processUnreadEmails() {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting unread email processing.");
    return;
  }

  emails = Array.from(
    new Set(Array.from(document.querySelectorAll("tr.zA.zE")))
  );
  unreadCount = emails.length; // Count total unread emails

  if (unreadCount === 0) {
    console.log("No unread emails found.");
    navigateToSpam(); // Navigate to Spam if no unread emails are found
    return;
  }

  console.log(`Found ${unreadCount} unread emails.`);
  emails = shuffleArray(emails);
  processNextEmail();
}

// Function to check if there are any visible links in the email content
function containsVisibleLinks() {
  const links = document.querySelectorAll('div[role="main"] a');
  return Array.from(links).some(link => link.offsetParent !== null);
}

// Function to process the next email
function processNextEmail() {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting next email processing.");
    return;
  }

  if (currentIndex >= emails.length) {
    console.log("All unread emails processed.");
    navigateToSpam(); // Navigate to Spam after processing all unread emails
    return;
  }

  const email = emails[currentIndex];
  console.log(`Processing email ${currentIndex + 1} of ${emails.length}...`);
  email.click();

  setTimeout(() => {
    // Get all links in the email content
    const links = document.querySelectorAll('div[role="main"] a');

    // Flag to check if a link has been opened
    let linkOpened = false;

    for (const link of links) {
      // Check if the link is visible and not already opened
      if (link.offsetParent !== null && !openedLinks.has(link.href)) {
        openedLinks.add(link.href); // Add link to the set of opened links
        const newTab = window.open(link.href, "_blank");

        if (newTab) {
          // Close the new tab after a delay and refocus on the current tab
          setTimeout(() => {
            newTab.close();
            window.focus(); // Refocus on the current tab
          }, 5000); // Adjust delay as needed
        }

        linkOpened = true; // Set flag to true indicating a link has been opened
        break; // Exit the loop after opening one link
      }
    }

    if (!linkOpened) {
      console.log("No new links to open.");
    }

    markAsImportant(() => {
      count++;
      updateCount(count, unreadCount);
      currentIndex++;
      processNextEmail(); // Process the next email
    });
  }, 5000); // Increase delay to ensure email content is fully loaded
}


// Function to mark an email as important
function markAsImportant(callback) {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting mark as important.");
    return;
  }

  setTimeout(() => {
    const moreButton =
      document.querySelector('div[aria-label="More options"]') ||
      document.querySelector('div[role="button"]');
    if (moreButton) {
      moreButton.click();
      setTimeout(() => {
        const starIcon =
          document.querySelector('div[aria-label="Not starred"]') ||
          document.querySelector('div[aria-label="Star"]');
        if (starIcon) {
          starIcon.click();
          setTimeout(callback, 1000); // Wait for marking to complete
        } else {
          console.error("Star icon not found.");
          callback();
        }
      }, 1000); // Delay to allow menu to open
    } else {
      console.error("More options button not found.");
      callback();
    }
  }, 2000); // Delay to ensure elements are visible
}

// Function to update the count in storage
function updateCount(count, unreadCount) {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(
      { emailCount: count, totalUnread: unreadCount },
      () => {
        console.log(
          `Email count updated: Opened ${count}, Total Unread: ${unreadCount}`
        );
      }
    );
  } else {
    console.error("chrome.storage.local is not available.");
  }
}

// Function to shuffle the array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to observe DOM changes
function observeForSearchBox() {
  const maxWaitTime = 10000; // Max wait time of 10 seconds
  let searchFound = false;

  const observer = new MutationObserver(() => {
    const searchBox = document.querySelector('input[name="q"]');
    if (searchBox) {
      searchFound = true;
      observer.disconnect(); // Stop observing once the search box is found

      // Set the search box value to "superstar"
      searchBox.value = "superstar";
      console.log("Search term 'superstar' set in search box.");

      // Trigger the email processing after a delay to ensure search results are loaded
      setTimeout(processUnreadEmails, 10000); // Adjust delay as needed
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback to process unread emails if search box is not found within the max wait time
  setTimeout(() => {
    if (!searchFound) {
      console.log(
        "Search box not found. Proceeding with unread email processing."
      );
      processUnreadEmails();
    }
  }, maxWaitTime);
}

// Function to navigate to Spam
function navigateToSpam() {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting navigation to Spam.");
    return;
  }

  if (window.location.hash !== "#spam") {
    window.location.hash = "#spam"; // Set hash to navigate to Spam folder
    console.log("Navigating to Spam folder...");
    setTimeout(() => {
      console.log("Navigated to Spam folder.");
      openVisibleSpamEmails(); // Start processing visible spam emails
    }, 5000); // Wait for the UI to settle and the emails to load
  } else {
    console.log("Already in Spam folder.");
    openVisibleSpamEmails(); // Start processing visible spam emails
  }
}

// Function to process all visible emails in Spam
function openVisibleSpamEmails() {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting spam email processing.");
    return;
  }

  setTimeout(() => {
    const emailRows = Array.from(
      new Set(Array.from(document.querySelectorAll("tr.zA.zE, tr.zA")))
    ); // Select all emails (read and unread) and filter out duplicates
    console.log(`Found ${emailRows.length} emails.`); // Debugging: Log the number of emails found

    // Filter visible emails
    spamEmails = emailRows.filter((email) => email.offsetParent !== null);
    console.log(`Found ${spamEmails.length} visible emails.`); // Debugging: Log the number of visible emails

    if (spamEmails.length > 0) {
      processNextSpamEmail(); // Start processing the first visible spam email
    } else {
      console.log("No visible emails found in Spam folder.");
      switchToNextAccount(); // Switch to the next account if no visible emails are found
    }
  }, 5000); // Wait for emails to be fully loaded
}

// Function to process the next spam email
function processNextSpamEmail() {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting next spam email processing.");
    return;
  }

  if (spamIndex >= spamEmails.length) {
    console.log("All spam emails processed.");
    switchToNextAccount(); // Switch to the next account after processing all spam emails
    return;
  }

  const email = spamEmails[spamIndex];
  console.log(`Opening spam email ${spamIndex + 1} of ${spamEmails.length}...`);

  email.click();

  setTimeout(() => {
    if (document.querySelector('div[role="main"]')) {
      markAsNotSpam(() => {
        spamIndex++;
        setTimeout(() => {
          refreshSpamEmailsList(() => {
            processNextSpamEmail(); // Process the next email after refreshing the list
          });
        }, 5000); // Added delay before processing the next email
      });
    } else {
      console.error("Failed to open the email. Retrying...");
      setTimeout(() => {
        processNextSpamEmail(); // Retry opening the email
      }, 5000); // Retry after a delay
    }
  }, 7000); // Increased delay to ensure email is fully loaded
}

// Function to mark an email as "Not Spam"
function markAsNotSpam(callback) {
  if (window.isProcessingPaused) {
    console.log("Processing paused. Aborting mark as not spam.");
    return;
  }

  setTimeout(() => {
    const notSpamButton =
      document.querySelector("div.aZhv8d button.bzq.bzr.IdsTHf") ||
      Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent.includes("Report not spam")
      );

    if (notSpamButton) {
      notSpamButton.click();
      console.log("Marked email as 'Report not spam'.");
    } else {
      console.error("Not spam button not found.");
    }
    setTimeout(callback, 5000); // Wait for Gmail to process the action and update the UI
  }, 5000); // Increased delay to ensure elements are visible
}

// Function to refresh the spam emails list and perform a search for is:spam
function refreshSpamEmailsList(callback) {
  if (spamIndex >= spamEmails.length) {
    console.log("All spam emails processed. Refreshing the entire window.");
    setTimeout(() => {
      window.location.reload(); // Refresh the entire window
    }, 5000); // Adjust delay as needed
    return;
  }

  window.location.hash = "#inbox"; // Navigate to Inbox
  setTimeout(() => {
    window.location.hash = "#spam"; // Navigate back to Spam
    console.log("Refreshed Spam folder.");
    setTimeout(() => {
      performSpamSearch(() => {
        setTimeout(() => {
          // Re-fetch the list of spam emails after the search
          const emailRows = Array.from(
            new Set(Array.from(document.querySelectorAll("tr.zA.zE, tr.zA")))
          ); // Filter out duplicates
          spamEmails = emailRows.filter((email) => email.offsetParent !== null);
          console.log(
            `After refresh and search, found ${spamEmails.length} visible emails.`
          );
          callback();
        }, 5000); // Wait for the spam emails to load after the search
      });
    }, 5000); // Wait for the spam emails to load after navigating back
  }, 5000); // Wait for the inbox to load before switching back
}

// Function to perform a search for 'is:spam'
function performSpamSearch(callback) {
  const searchBox = document.querySelector('input[name="q"]');
  if (searchBox) {
    searchBox.value = "is:spam";
    const searchButton = document.querySelector(
      'button[aria-label="Search Mail"]'
    );
    if (searchButton) {
      searchButton.click();
      console.log("Performed search for 'is:spam'.");
      setTimeout(callback, 5000); // Wait for search results to load
    } else {
      console.error("Search button not found.");
      callback();
    }
  } else {
    console.error("Search box not found.");
    callback();
  }
}

// Start observing for the search box
observeForSearchBox();
