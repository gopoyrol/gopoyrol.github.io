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
    const fields = ['Activity', 'Item', 'Quantity', 'Unit', 'Due Date', 'Remarks'];
    
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