let count = 0;
let unreadCount = 0;
let emails = [];
let currentIndex = 0;

// Function to perform the search
function performSearch() {
    const searchBox = document.querySelector('input[name="q"]');
    if (searchBox) {
        searchBox.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
        setTimeout(() => {
            searchBox.form.submit(); // Submit the form after the input event
        }, 500); // Adjust the delay as needed
    } else {
        console.error('Search box not found');
    }
}

// Function to process unread emails
function processUnreadEmails() {
    emails = Array.from(document.querySelectorAll('tr.zA.zE')); // Select unread emails
    unreadCount = emails.length; // Count total unread emails

    if (unreadCount === 0) {
        console.log("No unread emails found.");
        return;
    }

    emails = shuffleArray(emails);
    processNextEmail();
}

// Function to process the next email
function processNextEmail() {
    if (currentIndex >= emails.length) {
        console.log("All unread emails processed.");
        return;
    }

    const email = emails[currentIndex];
    email.click();

    setTimeout(() => {
        markAsImportant(() => {
            count++;
            updateCount(count, unreadCount);
            currentIndex++;
            processNextEmail();
        });
    }, 3000); // Increase delay to ensure email content is fully loaded
}

// Function to mark an email as important
function markAsImportant(callback) {
    setTimeout(() => {
        const moreButton = document.querySelector('div[aria-label="More options"]') 
                            || document.querySelector('div[role="button"]');
        if (moreButton) {
            moreButton.click();
            setTimeout(() => {
                const starIcon = document.querySelector('div[aria-label="Not starred"]')
                                || document.querySelector('div[aria-label="Star"]');
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
        chrome.storage.local.set({ emailCount: count, totalUnread: unreadCount }, () => {
            console.log(`Email count updated: Opened ${count}, Total Unread: ${unreadCount}`);
        });
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
    const observer = new MutationObserver(() => {
        const searchBox = document.querySelector('input[name="q"]');
        if (searchBox) {
            observer.disconnect(); // Stop observing once the search box is found
            // Wait for the user to enter search query and press Enter
            const interval = setInterval(() => {
                if (searchBox.value) {
                    clearInterval(interval);
                    performSearch(); // Perform the search with the entered query
                    setTimeout(processUnreadEmails, 10000); // Delay to ensure search results are loaded
                }
            }, 1000); // Check every second
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Start observing for the search box
observeForSearchBox();
