document.addEventListener('DOMContentLoaded', () => {
  // Function to get the current date in YYYY-MM-DD format
  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Function to display current month and year in the table
  function displayCurrentMonthYear() {
    const today = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();

    // Set the month and year in the table
    document.getElementById('current-month').textContent = month;
    document.getElementById('current-year').textContent = year;
  }

  // List of item IDs where the current date should be auto-filled
  const autoFillItems = [1, 3, 4, 5, 6, 7, 9, 10, 11];

  // Fill the current date for specified rows on page load
  autoFillItems.forEach(itemId => {
    const dateInput = document.querySelector(`.date-input[data-item-id="${itemId}"]`);
    if (dateInput) {
      dateInput.value = getCurrentDate();
      dateInput.disabled = true; // Disable date input to prevent manual changes
    }
  });

  // Auto-fill date for "Man-Power Allotment"
  const manpowerDateInput = document.querySelector('.date-input[data-item-id="manpower"]');
  if (manpowerDateInput) {
    manpowerDateInput.value = getCurrentDate(); // Set current date
    manpowerDateInput.disabled = true; // Disable input to prevent changes
  }

  // Function to handle marking tasks as complete
  function markComplete(itemId) {
    const statusElement = document.querySelector(`#item-${itemId} .status-text`);
    if (statusElement) {
      statusElement.textContent = 'Completed';
      statusElement.style.color = 'green'; // Change color to green to indicate completion
    }

    // Automatically fill the date for rows where it's required
    const dateInput = document.querySelector(`.date-input[data-item-id="${itemId}"]`);
    if (dateInput) {
      dateInput.value = getCurrentDate(); // Ensure current date is set
      dateInput.disabled = true; // Keep date input disabled
    }
  }

  // Add event listeners to "Mark Complete" buttons
  const completeButtons = document.querySelectorAll('.complete-button');
  completeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const itemId = event.target.getAttribute('data-item-id');
      markComplete(itemId);
    });
  });

  // Add event listener for the Man-Power Allotment Mark Complete button
  const manpowerButton = document.querySelector('.mark-complete-button[data-item-id="manpower"]');
  if (manpowerButton) {
    manpowerButton.addEventListener('click', () => {
      markComplete('manpower'); // Update status to 'Completed'
    });
  }

  // Add event listeners to "Upload" buttons
  const uploadButtons = document.querySelectorAll('.upload-button');
  uploadButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const itemId = event.target.getAttribute('data-item-id');
      const fileInput = document.querySelector(`.file-input[data-item-id="${itemId}"]`);
      if (fileInput && fileInput.files.length > 0) {
        markComplete(itemId);
      } else {
        alert('Please upload a document before marking the task as complete.');
      }
    });
  });

  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCMNhLGHmzvOl6CuY5XSmDunnBIZ5J2Ukw",
    authDomain: "checklist-926f3.firebaseapp.com",
    databaseURL: "https://checklist-926f3-default-rtdb.firebaseio.com",
    projectId: "checklist-926f3",
    storageBucket: "checklist-926f3.appspot.com",
    messagingSenderId: "418000419530",
    appId: "1:418000419530:web:f7e350857e7bef40c75233",
    measurementId: "G-5CG377GCCW"
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // Handle "Submit All" button click
  const submitButton = document.getElementById('submit-button');
  submitButton.addEventListener('click', () => {
    const table = document.getElementById('checklist-table');
    const rows = table.querySelectorAll('tbody tr');
    const entries = [];

    // Gather data from the checklist
    rows.forEach(row => {
      const itemId = row.id.split('-')[1];
      const itemName = row.cells[0].innerText;
      const documentStatus = row.cells[1].querySelector('input[type="file"]') ? 'File Attached' : 'NA';
      const status = row.querySelector('.status-text').innerText;
      const dateUploaded = row.querySelector('.date-input').value;
      const frequency = row.cells[5].innerText;

      entries.push({
        itemId,
        itemName,
        documentStatus,
        status,
        dateUploaded,
        frequency
      });
    });

    // Log the entries array to check if data is being gathered correctly
    console.log('Entries to be submitted:', entries);

    // Submit all the data to Firebase Realtime Database
    let submissionsCompleted = 0; // Count successful submissions
    const totalSubmissions = entries.length; // Total submissions to track

    entries.forEach(entry => {
      const newEntryKey = database.ref('checklistEntries').push().key; // Generate a new key
      database.ref('checklistEntries/' + newEntryKey).set(entry)
        .then(() => {
          submissionsCompleted++; // Increment successful submissions
          console.log("Data successfully written!", entry);

          // Check if all submissions are completed
          if (submissionsCompleted === totalSubmissions) {
            alert('Successfully submitted all entries!'); // Show success message
          }
        })
        .catch((error) => {
          console.error("Error writing data: ", error);
        });
    });

    if (totalSubmissions === 0) {
      alert('No entries to submit.'); // Alert if there are no entries
    }
  });

  // Call the function to display the month and year in the table
  displayCurrentMonthYear();
});
