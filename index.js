const dentists = [
  { id: 1, name: "Dr. Jane Smith", specialty: "General Dentistry" },
  { id: 2, name: "Dr. John Doe", specialty: "Orthodontics" },
  { id: 3, name: "Dr. Emily Brown", specialty: "Periodontics" }
];

const mockResults = {
  1: {
      image: "https://images.unsplash.com/photo-1617701598721-4e9a1b9e7353",
      notes: "Healthy teeth, minor plaque buildup. Recommend regular cleaning."
  },
  2: {
      image: "https://images.unsplash.com/photo-1629909613654-28aa34f5f7d6",
      notes: "Braces adjustment needed. No cavities detected."
  },
  3: {
      image: "https://images.unsplash.com/photo-1617701598721-4e9a1b9e7353",
      notes: "Gum health stable. Continue daily flossing."
  }
};

const dentistSelect = document.getElementById('dentistSelect');
dentists.forEach(dentist => {
  const option = document.createElement('option');
  option.value = dentist.id;
  option.textContent = `${dentist.name} (${dentist.specialty})`;
  dentistSelect.appendChild(option);
});

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

const defaultUser = {
  name: "Sai Reddy",
  email: "saireddy6258@gmail.com",
  password: "sai@123"
};

if (!users.find(user => user.email === defaultUser.email)) {
  users.push(defaultUser);
  localStorage.setItem('users', JSON.stringify(users));
}

const loginPage = document.getElementById('loginPage');
const appointmentPage = document.getElementById('appointmentPage');

function showLoginPage() {
  loginPage.classList.remove('hidden');
  appointmentPage.classList.add('hidden');
}

function showAppointmentPage() {
  loginPage.classList.add('hidden');
  appointmentPage.classList.remove('hidden');
  updateUserStatus();
  renderAppointments();
  displayNextAppointment();
}

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
      alert('Invalid email or password!');
      return;
  }

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  showAppointmentPage();
}

function showRegister() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const name = prompt('Enter your name:');

  if (!name || !email || !password) {
      alert('Please fill in all fields!');
      return;
  }

  if (users.find(user => user.email === email)) {
      alert('Email already registered!');
      return;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  alert('Registration successful!');
  showAppointmentPage();
}

function loginAsGuest() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showAppointmentPage();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginPage();
}

function updateUserStatus() {
  const userStatus = document.getElementById('userStatus');
  userStatus.textContent = currentUser ? `Welcome, ${currentUser.name}` : 'Guest User';
}

function bookAppointment() {
  const dentistId = document.getElementById('dentistSelect').value;
  const appointmentDate = document.getElementById('appointmentDate').value;
  const appointmentTime = document.getElementById('appointmentTime').value;

  if (!dentistId || !appointmentDate || !appointmentTime) {
      alert('Please fill in all fields!');
      return;
  }

  const dentist = dentists.find(d => d.id == dentistId);
  const newTime = new Date(`${appointmentDate}T${appointmentTime}:00`);

  const hasConflict = appointments.some(a => {
      if (a.dentistName !== dentist.name || a.date !== appointmentDate) return false;
      const existingTime = new Date(`${a.date}T${a.time}:00`);
      const timeDiff = Math.abs(newTime - existingTime) / (1000 * 60);
      return timeDiff < 10;
  });

  if (hasConflict) {
      alert(`This time slot is too close to another appointment with ${dentist.name}. Please choose a time at least 10 minutes apart.`);
      return;
  }

  const appointment = {
      id: Date.now(),
      userEmail: currentUser ? currentUser.email : 'guest',
      dentistName: dentist.name,
      date: appointmentDate,
      time: appointmentTime,
      completed: false
  };

  appointments.push(appointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  renderAppointments();
  displayNextAppointment();

  document.getElementById('dentistSelect').value = '';
  document.getElementById('appointmentDate').value = '';
  document.getElementById('appointmentTime').value = '';
}

function renderAppointments() {
  const appointmentList = document.getElementById('appointmentList');
  appointmentList.innerHTML = '';
  const userAppointments = appointments.filter(a => a.userEmail === (currentUser ? currentUser.email : 'guest'));

  userAppointments.forEach(appointment => {
      const li = document.createElement('li');
      li.className = appointment.completed ? 'completed' : '';
      li.innerHTML = `
          <div class="appointment-details">
              <strong>${appointment.dentistName}</strong> - ${appointment.date} at ${appointment.time}
          </div>
          <div>
              <button onclick="toggleComplete(${appointment.id})">Completed</button>
              <button class="delete-btn" onclick="deleteAppointment(${appointment.id})">Delete</button>
              <button onclick="viewResults(${appointment.id})">View Results</button>
              <button onclick="exportToPDF(${appointment.id})">Export to PDF</button>
          </div>
      `;
      appointmentList.appendChild(li);
  });
}

function displayNextAppointment() {
  const nextAppointmentDetails = document.getElementById('nextAppointmentDetails');
  const userAppointments = appointments
      .filter(a => a.userEmail === (currentUser ? currentUser.email : 'guest') && !a.completed)
      .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

  if (userAppointments.length === 0) {
      nextAppointmentDetails.textContent = 'No upcoming appointments.';
      return;
  }

  const next = userAppointments[0];
  nextAppointmentDetails.textContent = `With ${next.dentistName} on ${next.date} at ${next.time}`;
}

function toggleComplete(appointmentId) {
  appointments = appointments.map(a => a.id === appointmentId ? { ...a, completed: !a.completed } : a);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  renderAppointments();
  displayNextAppointment();
}

function deleteAppointment(appointmentId) {
  appointments = appointments.filter(a => a.id !== appointmentId);
  localStorage.setItem('appointments', JSON.stringify(appointments));
  renderAppointments();
  document.getElementById('resultsSection').style.display = 'none';
  displayNextAppointment();
}

function viewResults(appointmentId) {
  const appointment = appointments.find(a => a.id === appointmentId);
  const dentistId = dentists.find(d => d.name === appointment.dentistName).id;
  const results = mockResults[dentistId] || {
      image: "https://images.unsplash.com/photo-1617701598721-4e9a1b9e7353",
      notes: "No results available."
  };

  const resultsContent = document.getElementById('resultsContent');
  resultsContent.innerHTML = `
      <img src="${results.image}" alt="Checkup Image" />
      <p><strong>Dentist Notes:</strong> ${results.notes}</p>
  `;
  document.getElementById('resultsSection').style.display = 'block';
}

async function exportToPDF(appointmentId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const appointment = appointments.find(a => a.id === appointmentId);
  const dentistId = dentists.find(d => d.name === appointment.dentistName).id;
  const results = mockResults[dentistId] || {
      image: "https://images.unsplash.com/photo-1617701598721-4e9a1b9e7353",
      notes: "No results available."
  };

  doc.setFontSize(16);
  doc.text("OralVis Healthcare - Checkup Report", 20, 20);
  doc.setFontSize(12);
  doc.text(`Dentist: ${appointment.dentistName}`, 20, 30);
  doc.text(`Date: ${appointment.date}`, 20, 40);
  doc.text(`Time: ${appointment.time}`, 20, 50);
  doc.text(`Notes: ${results.notes}`, 20, 60);

  try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = results.image;
      await new Promise(resolve => img.onload = resolve);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const imgData = canvas.toDataURL('image/jpeg');
      doc.addImage(imgData, 'JPEG', 20, 70, 100, 60);
  } catch (e) {
      doc.text("Image not available", 20, 70);
  }

  doc.save(`checkup_${appointmentId}.pdf`);
}

document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
      if (loginPage.classList.contains('hidden')) {
          bookAppointment();
      } else {
          login();
      }
  }
});

if (currentUser) {
  showAppointmentPage();
} else {
  showLoginPage();
}
