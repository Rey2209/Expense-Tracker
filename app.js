// ------------------ Storage Keys ------------------
const STORAGE_KEYS = {
  USER: "expenseUser",
  ENTRIES: "expenseEntries",
  SESSION: "expenseSession"
};

// ------------------ DOM Elements ------------------
const registrationPage = document.getElementById("registrationPage");
const app = document.getElementById("app");
const pinPromptModal = document.getElementById("pinPromptModal");
const pinInput = document.getElementById("pinInput");
const pinSubmit = document.getElementById("pinSubmit");
const pinError = document.getElementById("pinError");

const navProfilePic = document.getElementById("navProfilePic");
const navDashboard = document.getElementById("navDashboard");
const navMakeEntry = document.getElementById("navMakeEntry");
const navHistory = document.getElementById("navHistory");
const navReport = document.getElementById("navReport");
const navLogout = document.getElementById("navLogout");

const dashboardSection = document.getElementById("dashboardSection");
const entrySection = document.getElementById("entrySection");
const historySection = document.getElementById("historySection");
const reportSection = document.getElementById("reportSection");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const netBalance = document.getElementById("netBalance");

const entryForm = document.getElementById("entryForm");
const entryType = document.getElementById("entryType");
const entryDate = document.getElementById("entryDate");
const entryDescription = document.getElementById("entryDescription");
const entryCategory = document.getElementById("entryCategory");
const entryAmount = document.getElementById("entryAmount");
const entrySubmit = document.getElementById("entrySubmit");

const historyList = document.getElementById("historyList");

const registrationForm = document.getElementById("registrationForm");
const profilePicInput = document.getElementById("profilePic");
const profilePreview = document.getElementById("profilePreview");
const fileNameLabel = document.getElementById("fileName");

const reportForm = document.getElementById("reportForm");
const reportFrom = document.getElementById("reportFrom");
const reportTo = document.getElementById("reportTo");
const reportType = document.getElementById("reportType");
const pdfModal = document.getElementById("pdfModal");
const closePdfModal = document.getElementById("closePdfModal");
const downloadPdf = document.getElementById("downloadPdf");
const pdfContent = document.getElementById("pdfContent");

const toast = document.getElementById("toast");
const splash = document.getElementById("splashScreen");
const logoutConfirmModal = document.getElementById("logoutConfirmModal");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

// ------------------ Utilities ------------------
const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || null;
const saveSession = () => sessionStorage.setItem(STORAGE_KEYS.SESSION, "active");
const clearSession = () => sessionStorage.removeItem(STORAGE_KEYS.SESSION);
const isLoggedIn = () => sessionStorage.getItem(STORAGE_KEYS.SESSION) === "active";

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2000);
}

function showSection(section) {
  dashboardSection.classList.add("hidden");
  entrySection.classList.add("hidden");
  historySection.classList.add("hidden");
  reportSection.classList.add("hidden");

  section.classList.remove("hidden");
  section.classList.add("fade-slide-in");
  setTimeout(() => section.classList.remove("fade-slide-in"), 500);
}

function loadUserProfile() {
  const user = getFromStorage(STORAGE_KEYS.USER);
  if (user?.photo) {
    navProfilePic.src = user.photo;
  }
}

function updateDashboard() {
  const entries = getFromStorage(STORAGE_KEYS.ENTRIES) || [];
  const income = entries.filter(e => e.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const expense = entries.filter(e => e.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  totalIncome.textContent = `₹${income}`;
  totalExpense.textContent = `₹${expense}`;
  netBalance.textContent = `₹${income - expense}`;
}

function renderHistory() {
  const entries = getFromStorage(STORAGE_KEYS.ENTRIES) || [];
  historyList.innerHTML = "";

  if (entries.length === 0) {
    historyList.innerHTML = "<p>No entries found.</p>";
    return;
  }

  entries.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "history-entry glass";
    div.innerHTML = `
      <div class="entry-info">
        <strong>${entry.type.toUpperCase()}</strong>
        <span>${entry.date}</span>
        <span>${entry.description} (${entry.category})</span>
        <span>₹${entry.amount}</span>
      </div>
      <div class="entry-actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
    historyList.appendChild(div);
  });
}

function resetEntryForm() {
  entryForm.reset();
  entrySubmit.textContent = "Add Entry";
  entrySubmit.dataset.index = "";
}

// ------------------ File Input Preview ------------------
profilePicInput.addEventListener("change", function () {
  const file = this.files[0];
  fileNameLabel.textContent = file ? file.name : "No file chosen";

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profilePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    profilePreview.src = "assets/default-profile.png";
  }
});

// ------------------ Registration ------------------
registrationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const email = document.getElementById("email").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const profilePic = profilePicInput.files[0];

  if (pin.length !== 4 || isNaN(pin)) {
    alert("PIN must be a 4-digit number.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const user = {
      name: fullName,
      phone,
      email,
      pin,
      photo: profilePic ? reader.result : "assets/default-profile.png"
    };
    saveToStorage(STORAGE_KEYS.USER, user);
    saveToStorage(STORAGE_KEYS.ENTRIES, []);
    saveSession();

    registrationPage.classList.add("hidden");
    app.classList.remove("hidden");
    loadUserProfile();
    updateDashboard();
    showSection(dashboardSection);
  };

  if (profilePic) {
    reader.readAsDataURL(profilePic);
  } else {
    reader.onload();
  }
});

// ------------------ PIN Login ------------------
pinSubmit.addEventListener("click", () => {
  const inputPin = pinInput.value.trim();
  const user = getFromStorage(STORAGE_KEYS.USER);
  if (user && inputPin === user.pin) {
    pinPromptModal.classList.add("hidden");
    app.classList.remove("hidden");
    loadUserProfile();
    updateDashboard();
    showSection(dashboardSection);
    saveSession();
  } else {
    pinError.textContent = "Incorrect PIN. Try again.";
    pinInput.value = "";
  }
});

// ------------------ Entry Form ------------------
entryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = entryType.value;
  const date = entryDate.value;
  const description = entryDescription.value.trim();
  const category = entryCategory.value.trim();
  const amount = parseFloat(entryAmount.value);

  const entries = getFromStorage(STORAGE_KEYS.ENTRIES) || [];
  const index = entrySubmit.dataset.index;

  const newEntry = { type, date, description, category, amount };

  if (index) {
    entries[parseInt(index)] = newEntry;
  } else {
    entries.push(newEntry);
  }

  saveToStorage(STORAGE_KEYS.ENTRIES, entries);
  resetEntryForm();
  updateDashboard();
  renderHistory();
  showSection(historySection);
});

// ------------------ History Actions ------------------
historyList.addEventListener("click", (e) => {
  const index = e.target.dataset.index;
  if (e.target.classList.contains("edit-btn")) {
    const entries = getFromStorage(STORAGE_KEYS.ENTRIES);
    const entry = entries[index];
    entryType.value = entry.type;
    entryDate.value = entry.date;
    entryDescription.value = entry.description;
    entryCategory.value = entry.category;
    entryAmount.value = entry.amount;
    entrySubmit.textContent = "Update Entry";
    entrySubmit.dataset.index = index;
    showSection(entrySection);
  }

  if (e.target.classList.contains("delete-btn")) {
    const entries = getFromStorage(STORAGE_KEYS.ENTRIES);
    entries.splice(index, 1);
    saveToStorage(STORAGE_KEYS.ENTRIES, entries);
    updateDashboard();
    renderHistory();
  }
});

// ------------------ Navigation ------------------
navDashboard.addEventListener("click", () => showSection(dashboardSection));
navMakeEntry.addEventListener("click", () => {
  resetEntryForm();
  showSection(entrySection);
});
navHistory.addEventListener("click", () => {
  renderHistory();
  showSection(historySection);
});
navReport.addEventListener("click", () => showSection(reportSection));

// ------------------ Logout with Confirm ------------------
navLogout.addEventListener("click", () => {
  logoutConfirmModal.classList.remove("hidden");
});

confirmLogoutBtn.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  showToast("Logout successful. All data cleared.");
  logoutConfirmModal.classList.add("hidden");
  setTimeout(() => location.reload(), 1500);
});

cancelLogoutBtn.addEventListener("click", () => {
  logoutConfirmModal.classList.add("hidden");
});

// ------------------ Profile Picture Update ------------------
navProfilePic.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        const user = getFromStorage(STORAGE_KEYS.USER);
        user.photo = reader.result;
        saveToStorage(STORAGE_KEYS.USER, user);
        navProfilePic.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

// ------------------ Report Generator ------------------
reportForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const from = reportFrom.value;
  const to = reportTo.value;
  const type = reportType.value;
  const entries = getFromStorage(STORAGE_KEYS.ENTRIES) || [];
  const user = getFromStorage(STORAGE_KEYS.USER);

  const filtered = entries.filter(entry => {
    const inRange = entry.date >= from && entry.date <= to;
    const matchType = type === "all" || entry.type === type;
    return inRange && matchType;
  });

 let html = `
  <div style="text-align: center; color: black; font-family: sans-serif;">
    <img src="${user.photo}" style="height: 60px; width: 60px; border-radius: 50%; margin-bottom: 8px;" />
    <h3 style="margin: 5px 0;">${user.name}</h3>
    <p style="margin: 0;">📞 ${user.phone}</p>
    <p style="margin: 0 0 10px 0;">✉️ ${user.email}</p>
    <p><strong>Report Type:</strong> ${type.toUpperCase()}</p>
    <p><strong>Date Range:</strong> ${from} – ${to}</p>
  </div>
  <hr/>
  <table style="width: 100%; color: black; font-size: 14px; font-family: sans-serif;">
    <thead>
      <tr>
        <th>Type</th><th>Date</th><th>Description</th><th>Category</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>
`;


  let income = 0, expense = 0;

  filtered.forEach(entry => {
    html += `<tr>
      <td>${entry.type}</td>
      <td>${entry.date}</td>
      <td>${entry.description}</td>
      <td>${entry.category}</td>
      <td>₹${entry.amount}</td>
    </tr>`;
    if (entry.type === "income") income += entry.amount;
    if (entry.type === "expense") expense += entry.amount;
  });

  html += `</tbody></table><hr/>
    <p><strong>Total Income:</strong> ₹${income}</p>
    <p><strong>Total Expense:</strong> ₹${expense}</p>
    <p><strong>Net Balance:</strong> ₹${income - expense}</p>
  `;

  pdfContent.innerHTML = html;
  pdfModal.classList.remove("hidden");
});

closePdfModal.addEventListener("click", () => {
  pdfModal.classList.add("hidden");
});

downloadPdf.addEventListener("click", () => {
  const opt = {
    margin: 0.5,
    filename: "expense-report.pdf",
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  };
  html2pdf().from(pdfContent).set(opt).save();
});

// ------------------ App Startup ------------------
window.addEventListener("load", () => {
  const user = getFromStorage(STORAGE_KEYS.USER);
  const sessionActive = isLoggedIn();

  registrationPage.classList.add("hidden");
  app.classList.add("hidden");
  pinPromptModal.classList.add("hidden");

  if (!user) {
    registrationPage.classList.remove("hidden");
  } else if (!sessionActive) {
    pinPromptModal.classList.remove("hidden");
  } else {
    app.classList.remove("hidden");
    loadUserProfile();
    updateDashboard();
    showSection(dashboardSection);
  }

  setTimeout(() => {
    splash.style.display = "none";
  }, 3500);
});

// ------------------ PWA Service Worker Registration ------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then(
    (reg) => {
      console.log("✅ Service Worker Registered:", reg.scope);
    },
    (err) => {
      console.error("❌ Service Worker Registration Failed:", err);
    }
  );
}

