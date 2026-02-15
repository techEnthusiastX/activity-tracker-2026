import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* -------------------- FIREBASE SETUP -------------------- */

const firebaseConfig = {
  apiKey: "AIzaSyBEGArn2uVbe8FZjipHrpQjJTWehv6B5tE",
  authDomain: "activity-tracker-2026.firebaseapp.com",
  projectId: "activity-tracker-2026",
  storageBucket: "activity-tracker-2026.firebasestorage.app",
  messagingSenderId: "968304006452",
  appId: "1:968304006452:web:cc10693058c269eee60161"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userId = "harsh_2026_tracker";

/* -------------------- GLOBAL STORAGE -------------------- */

let allData = {}; // stores entire 2026 data
let selectedDate = "";

const monthsContainer = document.getElementById("months-container");
const popup = document.getElementById("popup");
const selectedDateText = document.getElementById("selected-date");

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* -------------------- FIREBASE FUNCTIONS -------------------- */

async function loadFromFirebase() {
  const docRef = doc(db, "activityData", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    allData = docSnap.data().activities || {};
  } else {
    allData = {};
  }

  generateYear(2026);
}

async function saveToFirebase() {
  await setDoc(doc(db, "activityData", userId), {
    activities: allData
  });
}

/* -------------------- GENERATE YEAR -------------------- */

function generateYear(year) {

  monthsContainer.innerHTML = "";

  for (let month = 0; month < 12; month++) {

    const monthCard = document.createElement("div");
    monthCard.classList.add("month-card");

    const monthTitle = document.createElement("div");
    monthTitle.classList.add("month-title");
    monthTitle.innerText = monthNames[month] + " " + year;
    monthCard.appendChild(monthTitle);

    const daysGrid = document.createElement("div");
    daysGrid.classList.add("days-grid");

    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {

      const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

      const dayBox = document.createElement("div");
      dayBox.classList.add("day");
      dayBox.innerText = day;
      dayBox.dataset.date = dateStr;

      if (allData[dateStr]) {
        updateColor(dayBox, allData[dateStr]);
      }

      dayBox.onclick = () => openPopup(dateStr);

      daysGrid.appendChild(dayBox);
    }

    monthCard.appendChild(daysGrid);

    const summary = document.createElement("div");
    summary.classList.add("summary");
    summary.id = `summary-${month}`;
    monthCard.appendChild(summary);

    monthsContainer.appendChild(monthCard);

    updateMonthlySummary(year, month);
  }
}

/* -------------------- POPUP -------------------- */

function openPopup(date) {
  selectedDate = date;
  selectedDateText.innerText = date;

  const data = allData[date] || {};

  document.getElementById("learning").checked = data.learning || false;
  document.getElementById("gym").checked = data.gym || false;
  document.getElementById("business").checked = data.business || false;

  popup.classList.remove("hidden");
}

function closePopup() {
  popup.classList.add("hidden");
}

/* -------------------- SAVE DATA -------------------- */

async function saveData() {

  const data = {
    learning: document.getElementById("learning").checked,
    gym: document.getElementById("gym").checked,
    business: document.getElementById("business").checked,
  };

  allData[selectedDate] = data;

  await saveToFirebase();

  const day = document.querySelector(`[data-date='${selectedDate}']`);
  updateColor(day, data);

  const dateObj = new Date(selectedDate);
  updateMonthlySummary(dateObj.getFullYear(), dateObj.getMonth());

  closePopup();
}

/* -------------------- COLOR LOGIC -------------------- */

function updateColor(day, data) {
  day.classList.remove("l1", "l2", "l3");

  const count = [data.learning, data.gym, data.business].filter(Boolean).length;

  if (count > 0) day.classList.add("l" + count);
}

/* -------------------- MONTHLY SUMMARY -------------------- */

function updateMonthlySummary(year, month) {

  let learningCount = 0;
  let gymCount = 0;
  let businessCount = 0;

  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= totalDays; day++) {

    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    const data = allData[dateStr];

    if (data) {
      if (data.learning) learningCount++;
      if (data.gym) gymCount++;
      if (data.business) businessCount++;
    }
  }

  const summary = document.getElementById(`summary-${month}`);
  summary.innerHTML = `
    📚 Learning: ${learningCount} days<br>
    💪 Gym: ${gymCount} days<br>
    💼 Business: ${businessCount} days
  `;
}

/* -------------------- START APP -------------------- */

window.saveData = saveData;
window.closePopup = closePopup;

window.addEventListener("DOMContentLoaded", loadFromFirebase);
