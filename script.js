/**
 * Adds a new row to the table.
 * @function addRow
 * @returns {undefined}
 */
function addRow() {
    const table = document.getElementById('activityTable');
    const newRow = table.insertRow();
    const tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    const newRowData = [...Array(table.rows[0].cells.length)].map(() => "");
    if (newRowData.some(cellData => cellData !== "")) {
        tableData.push(newRowData);
        localStorage.setItem('tableData', JSON.stringify(tableData));
    }
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        const newCell = newRow.insertCell(i);
        if (i === table.rows[0].cells.length - 1) {
            const button = document.createElement('a');
            button.textContent = 'Remove Row';
            button.onclick = function() {
                table.deleteRow(newRow.rowIndex);
                tableData.splice(newRow.rowIndex - 1, 1);
                localStorage.setItem('tableData', JSON.stringify(tableData));
            };
            newCell.appendChild(button);
        } else if (i <= 2) {
            const input = document.createElement('input');
            input.type = 'text';
            input.style.textAlign = 'center';
            input.style.border = 'none';
            input.style.color = 'inherit';
            input.style.backgroundColor = 'inherit';
            input.oninput = function() {
                tableData[newRow.rowIndex - 1][i] = input.value;
                localStorage.setItem('tableData', JSON.stringify(tableData));
            };
            newCell.appendChild(input);
        } else {
            const input = document.createElement('input');
            input.type = 'date';
            input.style.textAlign = 'center';
            input.style.border = 'none';
            input.style.color = 'inherit';
            input.style.backgroundColor = 'inherit';
            input.oninput = function() {
                tableData[newRow.rowIndex - 1][i] = input.value;
                localStorage.setItem('tableData', JSON.stringify(tableData));
            };
            newCell.appendChild(input);
        }
    }
}

// Load existing data into the table on page load
window.onload = function() {
    const table = document.getElementById('activityTable');
    const tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    tableData.forEach(rowData => {
        const newRow = table.insertRow();
        rowData.forEach((cellData, i) => {
            const newCell = newRow.insertCell(i);
            if (i === table.rows[0].cells.length - 1) {
                const button = document.createElement('a');
                button.textContent = 'Remove Row';
                button.onclick = function() {
                    table.deleteRow(newRow.rowIndex);
                    tableData.splice(newRow.rowIndex - 1, 1);
                    localStorage.setItem('tableData', JSON.stringify(tableData));
                };
                newCell.appendChild(button);
            } else if (i <= 2) {
                const input = document.createElement('input');
                input.type = 'text';
                input.style.textAlign = 'center';
                input.style.border = 'none';
                input.style.color = 'inherit';
                input.style.backgroundColor = 'inherit';
                input.value = cellData;
                input.oninput = function() {
                    tableData[newRow.rowIndex - 1][i] = input.value;
                    localStorage.setItem('tableData', JSON.stringify(tableData));
                };
                newCell.appendChild(input);
            } else {
                const input = document.createElement('input');
                input.type = 'date';
                input.style.textAlign = 'center';
                input.style.border = 'none';
                input.style.color = 'inherit';
                input.style.backgroundColor = 'inherit';
                input.value = cellData;
                input.oninput = function() {
                    tableData[newRow.rowIndex - 1][i] = input.value;
                    localStorage.setItem('tableData', JSON.stringify(tableData));
                };
                newCell.appendChild(input);
            }
        });
    });
};

