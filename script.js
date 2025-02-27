// Request notification permission if not granted
if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  
  // Global variables for table data and notifications
  let tableData = JSON.parse(localStorage.getItem("tableData")) || [];
  let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  let notificationCount = notifications.length;
  
  // --------------------------
  // Notification Functions
  // --------------------------
  function saveNotifications() {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }
  
  function updateNotificationCount() {
    const countElement = document.getElementById("notification-count");
    notificationCount = notifications.length;
    if (countElement) {
      countElement.textContent = notificationCount;
      countElement.style.display = notificationCount > 0 ? "flex" : "none";
    }
  }
  
  function renderNotifications() {
    const notificationList = document.getElementById("notification-list");
    if (notificationList) {
      notificationList.innerHTML = "";
      notifications.forEach(notification => {
        const notificationItem = document.createElement("div");
        notificationItem.className = "notification-item";
        notificationItem.innerHTML = `
          <span>${notification.message}</span>
          <button class="dismiss-btn">✖</button>
        `;
        notificationItem.querySelector(".dismiss-btn").addEventListener("click", () => {
          notificationItem.remove();
        });
        notificationList.appendChild(notificationItem);
      });
    }
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
    
    // Desktop notification
    if (Notification.permission === "granted") {
      new Notification("Table Alert", { body: message });
    }
    
    // In-page popup (if element with id "notification" exists)
    const popup = document.getElementById("notification");
    if (popup) {
      popup.textContent = message;
      popup.style.display = "block";
      setTimeout(() => {
        popup.style.display = "none";
      }, 3000);
    }
  }
  
  function showNotification(message) {
    addNotification(message);
  }
  
  // --------------------------
  // Table Functions
  // --------------------------
  function saveTableData() {
    const tbody = document.getElementById("tableBody");
    const data = [];
    tbody.querySelectorAll("tr").forEach(row => {
      const rowData = [];
      // Save first 6 input values (skip Actions cell)
      row.querySelectorAll("input").forEach(input => {
        rowData.push(input.value);
      });
      data.push(rowData);
    });
    localStorage.setItem("tableData", JSON.stringify(data));
    checkAllDueDates();
  }
  
  function addRow() {
    const tbody = document.getElementById("tableBody");
    const newRow = document.createElement("tr");
  
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
    removeBtn.textContent = "❌ Remove";
    removeBtn.href = "#";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = function () {
      newRow.remove();
      saveTableData();
    };
    actionTd.appendChild(removeBtn);
    newRow.appendChild(actionTd);
  
    tbody.appendChild(newRow);
    saveTableData();
  }
  
  function loadTableData() {
    const savedData = localStorage.getItem("tableData");
    if (savedData) {
      const data = JSON.parse(savedData);
      const tbody = document.getElementById("tableBody");
      tbody.innerHTML = "";
      data.forEach((rowData, rIndex) => {
        const newRow = document.createElement("tr");
        // Create 6 input cells
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
        // Actions cell
        const actionTd = document.createElement("td");
        const removeBtn = document.createElement("a");
        removeBtn.textContent = "❌ Remove";
        removeBtn.href = "#";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = function () {
          tableData.splice(rIndex, 1);
          localStorage.setItem("tableData", JSON.stringify(tableData));
          newRow.remove();
          saveTableData();
        };
        actionTd.appendChild(removeBtn);
        newRow.appendChild(actionTd);
        tbody.appendChild(newRow);
        checkDueDate(newRow, rowData[4]);
      });
    }
  }
  
  function checkDueDate(row, dueDate) {
    if (!dueDate) return;
    const today = new Date();
    const dueDateTime = new Date(dueDate);
    if (isNaN(dueDateTime)) return;
    
    const diffDays = Math.ceil((dueDateTime - today) / (1000 * 60 * 60 * 24));
    row.classList.remove("due-soon", "overdue");
    if (diffDays < 0) {
      row.classList.add("overdue");
      showNotification(`Overdue: "${row.cells[0].querySelector("input").value}" is past due!`);
    } else if (diffDays <= 7) {
      row.classList.add("due-soon");
      showNotification(`Due soon: "${row.cells[0].querySelector("input").value}" is due in ${diffDays} day(s).`);
    }
  }
  
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
  
    // Hamburger toggle functionality (if using mobile navbar)
    const hamburger = document.querySelector(".hamburger");
    const navContent = document.querySelector(".nav-content");
    if (hamburger && navContent) {
      hamburger.addEventListener("click", function() {
        navContent.classList.toggle("active");
      });
    }
    
    // Mobile dropdown toggle (for Inventory dropdown)
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
    
    // Add Row button event listener (if using a button with id "addRowBtn")
    const addRowBtn = document.getElementById("addRowBtn");
    if (addRowBtn) {
      addRowBtn.addEventListener("click", addRow);
    }
  });
  