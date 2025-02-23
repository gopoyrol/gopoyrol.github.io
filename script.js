let notifications = [];
        let notificationCount = 0;

        document.addEventListener('DOMContentLoaded', () => {
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
            loadTableData();
            loadNotifications();
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

        function toggleNotifications() {
            const dropdown = document.getElementById('notification-dropdown');
            dropdown.classList.toggle('show');
        }

        // Close dropdown when clicking outside
        window.onclick = function(event) {
            if (!event.target.matches('.notification-bell, .notification-bell *')) {
                const dropdowns = document.getElementsByClassName('notification-dropdown');
                for (let dropdown of dropdowns) {
                    if (dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                    }
                }
            }
        }

        function showNotification(message) {
            // Add to notifications list
            addNotification(message);

            // Browser notification
            if (Notification.permission === 'granted') {
                new Notification('Table Update', { body: message });
            }

            // In-page notification
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notification-message');
            notificationMessage.textContent = message;
            notification.style.display = 'flex';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }


// Request notification permission when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    loadTableData();
});

function showNotification(message) {
    // Browser notification
    if (Notification.permission === 'granted') {
        new Notification('Table Update', { body: message });
    }

    // In-page notification
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
    const fields = ['Activity', 'Frequency', 'Worked by', 'Last Maintenance', 'Due Date', 'Remarks'];
    
    fields.forEach(() => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.addEventListener('change', saveTableData);
        td.appendChild(input);
        newRow.appendChild(td);
    });

    // Add remove button
    const actionTd = document.createElement('td');
    const removeBtn = document.createElement('a');
    removeBtn.textContent = '❌ Remove';
    removeBtn.href = '#';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = function() {
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

function saveTableData() {
    const tbody = document.getElementById('tableBody');
    const data = [];
    
    tbody.querySelectorAll('tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('input').forEach(input => {
            rowData.push(input.value);
        });
        data.push(rowData);
    });

    localStorage.setItem('tableData', JSON.stringify(data));
}

function loadTableData() {
    const savedData = localStorage.getItem('tableData');
    if (savedData) {
        const data = JSON.parse(savedData);
        data.forEach(rowData => {
            const tbody = document.getElementById('tableBody');
            const newRow = document.createElement('tr');
            
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = cellData;
                input.addEventListener('change', saveTableData);
                td.appendChild(input);
                newRow.appendChild(td);
            });

            // Add remove button
            const actionTd = document.createElement('td');
            const removeBtn = document.createElement('a');
            removeBtn.textContent = '❌ Remove';
            removeBtn.href = '#';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = function() {
                newRow.remove();
                saveTableData();
                showNotification('Row removed successfully');
            };
            actionTd.appendChild(removeBtn);
            newRow.appendChild(actionTd);

            tbody.appendChild(newRow);
        });
    }
}

function insertTable() {
    const excelData = document.getElementById('excelData').value;
    const rows = excelData.split('\n');
    
    rows.forEach(row => {
        const cells = row.split('\t');
        if (cells.length > 1) {
            const tbody = document.getElementById('tableBody');
            const newRow = document.createElement('tr');
            
            cells.forEach(cellData => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = cellData.trim();
                input.addEventListener('change', saveTableData);
                td.appendChild(input);
                newRow.appendChild(td);
            });

            // Add remove button
            const actionTd = document.createElement('td');
            const removeBtn = document.createElement('a');
            removeBtn.textContent = '❌ Remove';
            removeBtn.href = '#';
            removeBtn.className = 'remove-btn';
            removeBtn.onclick = function() {
                newRow.remove();
                saveTableData();
                showNotification('Row removed successfully');
            };
            actionTd.appendChild(removeBtn);
            newRow.appendChild(actionTd);

            tbody.appendChild(newRow);
        }
    });
    
    saveTableData();
    showNotification('Table data inserted successfully');
    document.getElementById('excelData').value = '';
}

function notify() {
    showNotification('Notification test');
}