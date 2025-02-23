let notifications = [];
let notificationCount = 0;

document.addEventListener('DOMContentLoaded', function() {
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    loadTableData();
    loadNotifications();
    checkAllDueDates();
});

function loadNotifications() {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
        updateNotificationCount();
        renderNotifications();
    }
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function addNotification(message) {
    const notification = {
        id: Date.now(),
        message: message,
        timestamp: new Date().toLocaleString()
    };
    notifications.unshift(notification);
    if (notifications.length > 50) {
        notifications.pop();
    }
    saveNotifications();
    updateNotificationCount();
    renderNotifications();
}

function updateNotificationCount() {
    const countElement = document.getElementById('notification-count');
    notificationCount = notifications.length;
    countElement.textContent = notificationCount;
    countElement.style.display = notificationCount > 0 ? 'flex' : 'none';
}

function renderNotifications() {
    const notificationList = document.getElementById('notification-list');
    notificationList.innerHTML = '';
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
            <div>${notification.message}</div>
            <small>${notification.timestamp}</small>
        `;
        notificationList.appendChild(notificationItem);
    });
}

function showNotification(message) {
    addNotification(message);

    if (Notification.permission === 'granted') {
        new Notification('Table Update', { body: message });
    }

    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function addRow() {
    const tbody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');

    // Define the cell structure for 6 input columns; the 7th column is for Actions.
    // Columns:
    // 0: Activity (text)
    // 1: Frequency (text)
    // 2: Worked by (text)
    // 3: Last Maintenance (date)
    // 4: Due Date (date)
    // 5: Remarks (date) – now a date input
    const cellStructure = [
        { type: 'text', placeholder: 'Enter activity' },
        { type: 'text', placeholder: 'Enter frequency' },
        { type: 'text', placeholder: 'Enter worked by' },
        { type: 'date', placeholder: 'Last Maintenance' },
        { type: 'date', placeholder: 'Due Date' },
        { type: 'date', placeholder: 'Enter remarks date' }
    ];

    cellStructure.forEach((cell, index) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = cell.type;
        if (cell.placeholder) input.placeholder = cell.placeholder;

        // For the Due Date column (index 4), add a listener to convert to ISO format, check due dates, and save.
        if (index === 4) {
            input.addEventListener('change', () => {
                const parsedDate = new Date(input.value);
                if (!isNaN(parsedDate)) {
                    // Force the value to ISO format (YYYY-MM-DD)
                    const isoDate = parsedDate.toISOString().slice(0, 10);
                    input.value = isoDate;
                }
                checkDueDate(newRow, input.value);
                saveTableData();
            });
        } else {
            input.addEventListener('change', saveTableData);
        }

        td.appendChild(input);
        newRow.appendChild(td);
    });

    // Add the Actions cell for the remove button.
    const actionTd = document.createElement('td');
    const removeBtn = document.createElement('a');
    removeBtn.textContent = '❌ Remove';
    removeBtn.href = '#';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = function () {
        newRow.remove();
        saveTableData();
        showNotification('Row removed successfully');
    };
    actionTd.appendChild(removeBtn);
    newRow.appendChild(actionTd);

    tbody.appendChild(newRow);
    showNotification('New row added successfully');
    saveTableData();
}


function clearTable() {
    localStorage.removeItem('tableData');
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; // Clears all rows
    console.log('Table cleared successfully');
}

function checkDueDate(row, dueDate) {
    if (!dueDate) {
        console.log("No due date provided for row:", row);
        return;
    }
    const today = new Date();
    const dueDateTime = new Date(dueDate);
    if (isNaN(dueDateTime)) {
        console.log("Invalid due date format:", dueDate);
        return;
    }
    
    // Calculate difference in days
    const diffDays = Math.ceil((dueDateTime - today) / (1000 * 60 * 60 * 24));
    console.log("Due Date:", dueDate, "Diff Days:", diffDays);
    
    // Remove any existing classes for fresh check
    row.classList.remove('due-soon', 'overdue');

    // Check conditions and show notifications accordingly
    if (diffDays < 0) {
        row.classList.add('overdue');
        showNotification(`Overdue task: ${row.cells[0].querySelector('input').value} is past due!`);
    } else if (diffDays <= 7) {
        row.classList.add('due-soon');
        showNotification(`Due soon: ${row.cells[0].querySelector('input').value} is due in ${diffDays} days`);
    }
}


function saveTableData() {
    const tbody = document.getElementById('tableBody');
    const data = [];

    tbody.querySelectorAll('tr').forEach(row => {
        const rowData = [];
        // Only save the values from the first 6 cells (exclude the Actions cell)
        row.querySelectorAll('input').forEach(input => {
            rowData.push(input.value);
        });
        data.push(rowData);
    });

    localStorage.setItem('tableData', JSON.stringify(data));
    checkAllDueDates();
}

function loadTableData() {
    const savedData = localStorage.getItem('tableData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = ''; // Prevent duplicate table entries

        data.forEach(rowData => {
            const newRow = document.createElement('tr');

            // Create 6 input cells based on saved row data.
            rowData.forEach((cellData, index) => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                // For columns 3 (Last Maintenance), 4 (Due Date) and 5 (Remarks), use date inputs.
                if (index >= 3 && index <= 5) {
                    input.type = 'date';
                } else {
                    input.type = 'text';
                }
                input.value = cellData;

                // For the Due Date column (index 4), add the change listener to convert to ISO format, check due dates, and save.
                if (index === 4) {
                    input.addEventListener('change', () => {
                        const parsedDate = new Date(input.value);
                        if (!isNaN(parsedDate)) {
                            const isoDate = parsedDate.toISOString().slice(0, 10);
                            input.value = isoDate;
                        }
                        checkDueDate(newRow, input.value);
                        saveTableData();
                    });
                } else {
                    input.addEventListener('change', saveTableData);
                }

                td.appendChild(input);
                newRow.appendChild(td);
            });

            // Add the Actions cell for the remove button.
            const actionTd = document.createElement('td');
            const removeBtn = document.createElement('a');
            removeBtn.textContent = '❌ Remove';
            removeBtn.href = '#';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = function () {
                newRow.remove();
                saveTableData();
                showNotification('Row removed successfully');
            };
            actionTd.appendChild(removeBtn);
            newRow.appendChild(actionTd);

            tbody.appendChild(newRow);
            // Check the due date using the value from the Due Date column (index 4)
            checkDueDate(newRow, rowData[4]);
        });
    }
}


function checkAllDueDates() {
    const tbody = document.getElementById('tableBody');
    tbody.querySelectorAll('tr').forEach(row => {
        // Due Date is in column index 4.
        const dueDateInput = row.cells[4].querySelector('input');
        if (dueDateInput && dueDateInput.value) {
            checkDueDate(row, dueDateInput.value);
        }
    });
}

function addNotification(message) {
    const notificationContainer = document.getElementById("notification-container");

    // Create notification div
    const notification = document.createElement("div");
    notification.classList.add("notification-item");
    notification.innerHTML = `
        <span>${message}</span>
        <button class="dismiss-btn">✖</button>
    `;

    // Add click event to remove notification
    notification.querySelector(".dismiss-btn").addEventListener("click", function () {
        notification.remove();
    });

    // Append to container
    notificationContainer.appendChild(notification);

    // Limit total notifications
    limitNotifications(10);
}
let shownNotifications = new Set();

function addNotificationOnce(message) {
    if (!shownNotifications.has(message)) {
        shownNotifications.add(message);
        addNotification(message);
    }
}
function limitNotifications(max) {
    const notifications = document.querySelectorAll(".notification-item");
    if (notifications.length > max) {
        notifications[0].remove(); // Remove the oldest notification
    }
}


setInterval(checkAllDueDates, 1000);

document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    // (e.g., loadTableData(), loadNotifications(), checkAllDueDates(), etc.)
  
    // Hamburger toggle functionality
    const hamburger = document.querySelector('.hamburger');
    const navContent = document.querySelector('.nav-content');
    
    if (hamburger && navContent) {
      hamburger.addEventListener('click', function() {
        navContent.classList.toggle('active');
      });
    }
  });
  
    // Your existing code such as loadTableData(), loadNotifications(), etc.
    
    // Hamburger toggle functionality
    const hamburger = document.querySelector('.hamburger');
  const navContent = document.querySelector('.nav-content');
  
  if (hamburger && navContent) {
    hamburger.addEventListener('click', function() {
      console.log("Hamburger clicked"); // Debug: Check if click event fires
      navContent.classList.toggle('active');
    });
  }
  
  // Mobile dropdown toggle functionality (for Inventory dropdown)
  const dropbtns = document.querySelectorAll('.dropdown > .dropbtn');
  dropbtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault(); // Prevent default link behavior on mobile
        this.parentElement.classList.toggle('active');
      }
    });
  });
});