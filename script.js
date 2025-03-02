/**
 * Checks the due date for a row and shows a notification if overdue or due soon.
 * Uses row.dataset.lastNotification to avoid repeating the same message.
 */
function checkDueDate(row, dueDate) {
  if (!dueDate) return;
  const today = new Date();
  const dueDateTime = new Date(dueDate);
  if (isNaN(dueDateTime)) return;

  const diffDays = Math.ceil((dueDateTime - today) / (1000 * 60 * 60 * 24));
  const formattedDueDate = dueDateTime.toLocaleDateString();
  row.classList.remove("due-soon", "overdue");
  
  let message = "";
  if (diffDays < 0) {
    row.classList.add("overdue");
    message = `Overdue: "${row.cells[0].querySelector("input").value}" is past due (Due: ${formattedDueDate})!`;
  } else if (diffDays <= 7) {
    row.classList.add("due-soon");
    message = `Due soon: "${row.cells[0].querySelector("input").value}" is due in ${diffDays} day(s) (Due: ${formattedDueDate}).`;
  }
  
  // Debug log
  console.log("checkDueDate:", message);
  
  // Only notify if this message hasn't been shown before for this row
  if (message && row.dataset.lastNotification !== message) {
    row.dataset.lastNotification = message;
    showNotification("message");
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
    // Save the first 6 input values (skip Actions cell)
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

  // Create an empty row for the first 6 cells
  const newRowData = [...Array(table.rows[0].cells.length)].map(() => "");
  tableData.push(newRowData);
  localStorage.setItem("tableData", JSON.stringify(tableData));

  // Define structure: first 3 cells text, next 3 cells date
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

  // Actions cell with Remove button
  const actionTd = document.createElement("td");
  const removeBtn = document.createElement("a");
  removeBtn.textContent = "❌ Remove Row";
  removeBtn.href = "#";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = function () {
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
      document.getElementById("activityTable").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
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
      removeBtn.textContent = "❌ Remove Row";
      removeBtn.href = "#";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = function () {
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
 * Checks due dates for all rows.
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
// Debug version of showNotification function
function showNotification(message) {
  console.log("showNotification called with message:", message);
  
  // In-page popup notification
  const popup = document.getElementById("notification");
  if (popup) {
    popup.textContent = message;
    popup.style.display = "block";
    setTimeout(() => {
      popup.style.display = "none";
    }, 3000);
  }
  
  // Append notification to the notification list
  const notifList = document.getElementById("notification-list");
  if (notifList) {
    const div = document.createElement("div");
    div.className = "notification-item";
    div.textContent = message;
    // Optionally, add a dismiss button:
    const dismissBtn = document.createElement("button");
    dismissBtn.textContent = "✖";
    dismissBtn.onclick = function () {
      div.remove();
    };
    div.appendChild(dismissBtn);
    
    notifList.appendChild(div);
  }
}

// Updated checkDueDate function
function checkDueDate(row, dueDate) {
  if (!dueDate) return;
  const today = new Date();
  const dueDateTime = new Date(dueDate);
  if (isNaN(dueDateTime)) return;
  
  const diffDays = Math.ceil((dueDateTime - today) / (1000 * 60 * 60 * 24));
  const formattedDueDate = dueDateTime.toLocaleDateString();
  
  row.classList.remove("due-soon", "overdue");
  let message = "";
  if (diffDays < 0) {
    row.classList.add("overdue");
    message = `Overdue: "${row.cells[0].querySelector("input").value}" is past due (Due: ${formattedDueDate})!`;
  } else if (diffDays <= 7) {
    row.classList.add("due-soon");
    message = `Due soon: "${row.cells[0].querySelector("input").value}" is due in ${diffDays} day(s) (Due: ${formattedDueDate}).`;
  }
  console.log("checkDueDate:", message);
  if (message && row.dataset.lastNotification !== message) {
    row.dataset.lastNotification = message;
    showNotification(message);
  }
}

