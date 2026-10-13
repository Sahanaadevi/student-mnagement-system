const API_URL = '/students';

const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const idInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const ageInput = document.getElementById('age');
const courseInput = document.getElementById('course');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.getElementById('student-table-body');
const emptyState = document.getElementById('empty-state');
const messageEl = document.getElementById('message');

let messageTimer;

// ---------- Helpers ----------
function showMessage(text, type = 'success') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = 'message';
  }, 3500);
}

function resetForm() {
  form.reset();
  idInput.value = '';
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelBtn.classList.add('hidden');
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // response had no JSON body
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---------- READ ----------
async function loadStudents() {
  try {
    const data = await request(API_URL);
    const students = Array.isArray(data) ? data : data.rows || data.students || [];
    renderStudents(students);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

function renderStudents(students) {
  tableBody.innerHTML = '';

  if (students.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  students.forEach((student) => {
    const tr = document.createElement('tr');

    [student.id, student.name, student.email, student.age, student.course].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });

    const actionsTd = document.createElement('td');
    actionsTd.className = 'row-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(student));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteStudent(student.id, student.name));

    actionsTd.append(editBtn, deleteBtn);
    tr.appendChild(actionsTd);
    tableBody.appendChild(tr);
  });
}

// ---------- CREATE / UPDATE ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: Number(ageInput.value),
    course: courseInput.value.trim(),
  };

  const id = idInput.value;

  try {
    if (id) {
      await request(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showMessage('Student updated successfully.');
    } else {
      await request(API_URL, { method: 'POST', body: JSON.stringify(payload) });
      showMessage('Student added successfully.');
    }
    resetForm();
    loadStudents();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

// ---------- EDIT ----------
function startEdit(student) {
  idInput.value = student.id;
  nameInput.value = student.name;
  emailInput.value = student.email;
  ageInput.value = student.age;
  courseInput.value = student.course;

  formTitle.textContent = 'Edit Student';
  submitBtn.textContent = 'Update Student';
  cancelBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  nameInput.focus();
}

cancelBtn.addEventListener('click', resetForm);

// ---------- DELETE ----------
async function deleteStudent(id, name) {
  if (!confirm(`Delete student "${name}"?`)) return;

  try {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
    showMessage('Student deleted.');
    if (idInput.value === String(id)) resetForm();
    loadStudents();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ---------- Init ----------
loadStudents();