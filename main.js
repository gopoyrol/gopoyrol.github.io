function showSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.style.display = "flex"
}

function hideSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.style.display = "none"
}

function showMenu() {
  const menu = document.querySelector(".dropmenu")
  menu.style.display = "block"
}

function hideMenu() {
  const menu = document.querySelector(".dropmenu")
  menu.style.display = "none"
}

document.querySelector('button[onclick="addRow()"]').addEventListener('click', function() {
  const table = document.getElementById('activityTable');
  const newRow = table.insertRow(); // Insert a new row at the end of the table

  for (let i = 0; i < 7; i++) { // Assuming the table has 7 columns
    const newCell = newRow.insertCell();
    newCell.textContent = 'New Data'; // You can customize the default content
  }
});

