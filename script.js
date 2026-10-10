(() => {
  "use strict";

  const events = [
    { id: "soundwave", title: "Soundwave Live", category: "Music", symbol: "♫", date: "Fest Day 1", time: "5:00 PM", description: "Feel the beat, sing your heart out, and make the crowd move.", venue: "Main Stage" },
    { id: "battle-of-bands", title: "Battle of the Bands", category: "Music", symbol: "🎸", date: "Fest Day 1", time: "2:00 PM", description: "Campus bands go head-to-head for the ultimate bragging rights.", venue: "Open-Air Arena" },
    { id: "canvas-carnival", title: "Canvas Carnival", category: "Arts", symbol: "✿", date: "Fest Day 2", time: "11:00 AM", description: "A creative playground for artists, doodlers, and big imaginations.", venue: "Art Studio" },
    { id: "pixel-arena", title: "Pixel Arena", category: "Gaming", symbol: "⌘", date: "Fest Day 2", time: "1:00 PM", description: "Bring your strategy and reflexes to the campus gaming showdown.", venue: "Digital Lab" },
    { id: "queen-of-culture", title: "Queen of Culture", category: "Culture", symbol: "✺", date: "Fest Day 2", time: "4:00 PM", description: "Celebrate traditions, talent, fashion, and stories from every corner.", venue: "Grand Hall" },
    { id: "spotlight", title: "Spotlight Showdown", category: "Arts", symbol: "✧", date: "Fest Day 3", time: "6:00 PM", description: "Dance, drama, poetry, and performances that deserve the spotlight.", venue: "Main Stage" }
  ];

  const $ = (selector) => document.querySelector(selector);
  const eventGrid = $("#eventGrid");
  const searchInput = $("#search");
  const filters = $("#filters");
  const eventCount = $("#eventCount");
  const emptyMessage = $("#emptyMessage");
  const registerDialog = $("#registerDialog");
  const successDialog = $("#successDialog");
  const registrationForm = $("#registrationForm");
  const myEventList = $("#myEventList");
  let activeCategory = "All";
  let selectedEvent = null;

  function renderEvents() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = events.filter((event) => {
      const matchesCategory = activeCategory === "All" || event.category === activeCategory;
      const matchesQuery = `${event.title} ${event.category} ${event.description} ${event.venue}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    eventGrid.innerHTML = filtered.map((event) => `
      <article class="event-card">
        <div class="event-art ${event.category.toLowerCase()}" data-symbol="${event.symbol}">
          <span class="category-pill">${event.category}</span>
        </div>
        <div class="event-card-body">
          <h3>${escapeHTML(event.title)}</h3>
          <p>${escapeHTML(event.description)}</p>
          <div class="event-meta">
            <span>◷ ${escapeHTML(event.date)} · ${escapeHTML(event.time)}</span>
            <span>⌖ ${escapeHTML(event.venue)}</span>
          </div>
          <button class="button register-button" type="button" data-event-id="${event.id}">Register now ↗</button>
        </div>
      </article>
    `).join("");

    eventCount.textContent = `${filtered.length} ${filtered.length === 1 ? "EVENT" : "EVENTS"}`;
    emptyMessage.hidden = filtered.length !== 0;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }

  function getRegistrations() {
    try {
      const saved = JSON.parse(localStorage.getItem("herizonRegistrations") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveRegistrations(registrations) {
    try {
      localStorage.setItem("herizonRegistrations", JSON.stringify(registrations));
      return true;
    } catch {
      return false;
    }
  }

  function renderMyEvents() {
    const registrations = getRegistrations();
    if (!registrations.length) {
      myEventList.textContent = "You haven't registered for any events yet.";
      return;
    }
    myEventList.innerHTML = registrations.map((registration) => `
      <div class="registered-event">
        <div>
          <strong>${escapeHTML(registration.eventTitle)}</strong>
          <small>${escapeHTML(registration.name)} · ${escapeHTML(registration.date)}</small>
        </div>
        <button type="button" data-remove-id="${escapeHTML(registration.registrationId)}" aria-label="Remove registration for ${escapeHTML(registration.eventTitle)}">Remove</button>
      </div>
    `).join("");
  }

  function openRegistration(eventId) {
    selectedEvent = events.find((event) => event.id === eventId);
    if (!selectedEvent) return;
    $("#eventId").value = selectedEvent.id;
    $("#selectedEvent").textContent = `${selectedEvent.title} · ${selectedEvent.date}, ${selectedEvent.time} · ${selectedEvent.venue}`;
    clearErrors();
    registrationForm.reset();
    $("#eventId").value = selectedEvent.id;
    if (typeof registerDialog.showModal === "function") registerDialog.showModal();
    else alert("Your browser does not support the registration popup. Please update your browser.");
  }

  function clearErrors() {
    ["nameError", "emailError", "phoneError"].forEach((id) => { $("#" + id).textContent = ""; });
  }

  function validateForm() {
    clearErrors();
    let valid = true;
    const name = $("#studentName").value.trim();
    const email = $("#studentEmail").value.trim();
    const phone = $("#studentPhone").value.trim();

    if (name.length < 2) {
      $("#nameError").textContent = "Please enter your full name.";
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#emailError").textContent = "Please enter a valid email address.";
      valid = false;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      $("#phoneError").textContent = "Please enter a valid phone number.";
      valid = false;
    }
    return valid;
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    renderEvents();
  });

  searchInput.addEventListener("input", renderEvents);

  eventGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-event-id]");
    if (button) openRegistration(button.dataset.eventId);
  });

  $("#closeForm").addEventListener("click", () => registerDialog.close());
  registerDialog.addEventListener("click", (event) => {
    if (event.target === registerDialog) registerDialog.close();
  });

  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedEvent || !validateForm()) return;

    const registration = {
      registrationId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      date: selectedEvent.date,
      name: $("#studentName").value.trim(),
      email: $("#studentEmail").value.trim(),
      phone: $("#studentPhone").value.trim()
    };

    const registrations = getRegistrations();
    if (registrations.some((item) => item.eventId === registration.eventId && item.email.toLowerCase() === registration.email.toLowerCase())) {
      $("#emailError").textContent = "This email is already registered for this event.";
      return;
    }

    registrations.push(registration);
    saveRegistrations(registrations);
    registerDialog.close();
    renderMyEvents();
    $("#successMessage").textContent = `You're registered for ${selectedEvent.title}, ${registration.name}! Your registration is saved in this browser.`;
    if (typeof successDialog.showModal === "function") successDialog.showModal();
    else alert("Registration saved in this browser!");
  });

  $("#closeSuccess").addEventListener("click", () => successDialog.close());
  $("#doneBtn").addEventListener("click", () => {
    successDialog.close();
    $("#Events").scrollIntoView({ behavior: "smooth" });
  });
  successDialog.addEventListener("click", (event) => {
    if (event.target === successDialog) successDialog.close();
  });

  myEventList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;
    const updated = getRegistrations().filter((item) => item.registrationId !== button.dataset.removeId);
    saveRegistrations(updated);
    renderMyEvents();
  });

  $("#themeBtn").addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    $("#themeBtn").textContent = isDark ? "☀️" : "🌙";
    $("#themeBtn").setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem("herizonTheme", isDark ? "dark" : "light"); } catch {}
  });

  try {
    if (localStorage.getItem("herizonTheme") === "dark") {
      document.body.classList.add("dark");
      $("#themeBtn").textContent = "☀️";
    }
  } catch {}

  // Set the date below to your actual fest start date and time.
  // Example: "2026-12-15T09:00:00+05:30"
  const festStartDate = new Date("2026-12-15T09:00:00+05:30");

  function updateCountdown() {
    const timer = $("#timer");
    const remaining = festStartDate.getTime() - Date.now();
    if (Number.isNaN(festStartDate.getTime())) {
      timer.textContent = "Date to be announced";
      return;
    }
    if (remaining <= 0) {
      timer.textContent = "The fest is here! 🎉";
      return;
    }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timer.innerHTML = [
      [days, "Days"], [hours, "Hours"], [minutes, "Mins"], [seconds, "Secs"]
    ].map(([value, label]) => `<div class="time-unit"><strong>${String(value).padStart(2, "0")}</strong><span>${label}</span></div>`).join("");
  }

  renderEvents();
  renderMyEvents();
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
