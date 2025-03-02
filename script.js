/**
 * Check due date for a row and display a notification if overdue or due soon.
 * Uses row.dataset.lastNotification to avoid repeating the same message.
 */
function checkDueDate(row, dueDate) {
  if (!dueDate) return;
  const today = new Date();
  const dueDateTime = new Date(dueDate);
  if (isNaN(dueDateTime)) return;
  
  const diffDays = Math.ceil((dueDateTime - today) / (1000 * 60 * 60 * 24));
  row.classList.remove("due-soon", "overdue");
  
  let message = "";
  const formattedDueDate = dueDateTime.toLocaleDateString();
  
  if (diffDays < 0) {
    row.classList.add("overdue");
    message = `Overdue: "${row.cells[0].querySelector("input").value}" (Due: ${formattedDueDate}) is past due!`;
  } else if (diffDays <= 7) {
    row.classList.add("due-soon");
    message = `Due soon: "${row.cells[0].querySelector("input").value}" (Due: ${formattedDueDate}) is due in ${diffDays} day(s).`;
  }
  
  // Only show a notification if this is a new message
  if (message && row.dataset.lastNotification !== message) {
    row.dataset.lastNotification = message;
    showNotification(message);
  }
}


/**
 * Saves table data from the table body into localStorage.
 */
function saveTableData() {
  const tbody = document.getElementById("tableBody");
  const data = [];
  tbody.querySelectorAll("tr").forEach(row => {
    const rowData = [];
    // Save the first 6 input values (skip the Actions cell)
    row.querySelectorAll("input").forEach(input => {
      rowData.push(input.value);
    });
    data.push(rowData);
  });
  localStorage.setItem("tableData", JSON.stringify(data));
  checkAllDueDates();
}

/**
 * Adds a new row to the table.
 */
function addRow() {
  const table = document.getElementById("activityTable");
  const tbody = document.getElementById("tableBody");
  const newRow = document.createElement("tr");
  let tableData = JSON.parse(localStorage.getItem("tableData")) || [];
  
  // Create an empty row of length = number of cells in header
  const newRowData = [...Array(table.rows[0].cells.length)].map(() => "");
  // Optionally push the empty row data
  tableData.push(newRowData);
  localStorage.setItem("tableData", JSON.stringify(tableData));
  
  // Define cell structure: 0-2 text, 3-5 date.
  const cellStructure = [
    { type: "text", placeholder: "Enter activity" },
    { type: "text", placeholder: "Enter frequency" },
    { type: "text", placeholder: "Enter worked by" },
    { type: "date", placeholder: "Last Maintenance" },
    { type: "date", placeholder: "Due Date" },
    { type: "date", placeholder: "Enter remarks date" }
  ];
  
  cellStructure.forEach((cell, index) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = cell.type;
    if (cell.placeholder) input.placeholder = cell.placeholder;
    input.style.textAlign = "center";
    
    if (index === 4) { // Due Date column
      input.addEventListener("change", () => {
        const parsedDate = new Date(input.value);
        if (!isNaN(parsedDate)) {
          input.value = parsedDate.toISOString().slice(0, 10);
        }
        checkDueDate(newRow, input.value);
        saveTableData();
      });
    } else {
      input.addEventListener("change", saveTableData);
    }
    
    td.appendChild(input);
    newRow.appendChild(td);
  });
  
  // Create Actions cell with Remove button
  const actionTd = document.createElement("td");
  const removeBtn = document.createElement("a");
  removeBtn.textContent = "❌";
  removeBtn.href = "#";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = function() {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.children);
    const index = rows.indexOf(newRow);
    if (index > -1) {
      tableData = JSON.parse(localStorage.getItem("tableData")) || [];
      tableData.splice(index, 1);
      localStorage.setItem("tableData", JSON.stringify(tableData));
      newRow.remove();
      saveTableData();
      showNotification("Row removed successfully");
      document.getElementById("activityTable").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  actionTd.appendChild(removeBtn);
  newRow.appendChild(actionTd);
  
  tbody.appendChild(newRow);
  saveTableData();
}

/**
 * Loads table data from localStorage and populates the table.
 */
function loadTableData() {
  const savedData = localStorage.getItem("tableData");
  if (savedData) {
    const data = JSON.parse(savedData);
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    data.forEach((rowData, rIndex) => {
      const newRow = document.createElement("tr");
      for (let i = 0; i < 6; i++) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.style.textAlign = "center";
        input.type = i < 3 ? "text" : "date";
        input.value = rowData[i] || "";
        if (i === 4) {
          input.addEventListener("change", () => {
            const parsedDate = new Date(input.value);
            if (!isNaN(parsedDate)) {
              input.value = parsedDate.toISOString().slice(0, 10);
            }
            checkDueDate(newRow, input.value);
            saveTableData();
          });
        } else {
          input.addEventListener("change", saveTableData);
        }
        td.appendChild(input);
        newRow.appendChild(td);
      }
      
      // Actions cell with Remove button
      const actionTd = document.createElement("td");
      const removeBtn = document.createElement("a");
      removeBtn.textContent = "❌";
      removeBtn.href = "#";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = function() {
        const tbody = document.getElementById("tableBody");
        const rows = Array.from(tbody.children);
        const index = rows.indexOf(newRow);
        if (index > -1) {
          tableData = JSON.parse(localStorage.getItem("tableData")) || [];
          tableData.splice(index, 1);
          localStorage.setItem("tableData", JSON.stringify(tableData));
          newRow.remove();
          saveTableData();
          showNotification("Row removed successfully");
        }
      };
      actionTd.appendChild(removeBtn);
      newRow.appendChild(actionTd);
      
      tbody.appendChild(newRow);
      checkDueDate(newRow, rowData[4]);
    });
  }
}

/**
 * Checks due dates for all rows in the table.
 */
function checkAllDueDates() {
  const tbody = document.getElementById("tableBody");
  tbody.querySelectorAll("tr").forEach(row => {
    const dueDateInput = row.cells[4].querySelector("input");
    if (dueDateInput && dueDateInput.value) {
      checkDueDate(row, dueDateInput.value);
    }
  });
}

// Check due dates every minute (60000ms)
setInterval(checkAllDueDates, 60000);

// --------------------------
// Initialization
// --------------------------
document.addEventListener("DOMContentLoaded", function() {
  loadTableData();
  checkAllDueDates();
  
  // Hamburger toggle functionality (if applicable)
  const hamburger = document.querySelector(".hamburger");
  const navContent = document.querySelector(".nav-content");
  if (hamburger && navContent) {
    hamburger.addEventListener("click", function() {
      navContent.classList.toggle("active");
    });
  }
  
  // Mobile dropdown toggle for Inventory (if applicable)
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach(function(dropdown) {
    const dropbtn = dropdown.querySelector(".dropbtn");
    if (dropbtn) {
      dropbtn.addEventListener("click", function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle("active");
        }
      });
    }
  });
  
  // Add Row button event listener (if element with id "addRowBtn" exists)
  const addRowBtn = document.getElementById("addRowBtn");
  if (addRowBtn) {
    addRowBtn.addEventListener("click", addRow);
  }
});
function clearTable() {
  // Remove table data from localStorage
  localStorage.removeItem("tableData");
  // Clear all rows from the table body
  const tbody = document.getElementById("tableBody");
  if (tbody) {
    tbody.innerHTML = "";
  }
}
