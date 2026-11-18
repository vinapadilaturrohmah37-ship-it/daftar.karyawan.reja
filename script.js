
/* =====================================
   EMPLOYEE PRO
   SISTEM ABSENSI KARYAWAN
===================================== */

// DATABASE LOCAL
let employees = JSON.parse(localStorage.getItem("employees")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

// SIMPAN DATABASE
function saveData() {
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

// TANGGAL HARI INI
function today() {
    const d = new Date();

    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

// JAM SEKARANG
function currentTime() {
    return new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

// FORMAT TEKS AMAN
function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

// =====================================
// JAM DIGITAL
// =====================================

function updateClock() {
    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString("id-ID");

    document.getElementById("todayDate").textContent =
        now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

updateClock();
setInterval(updateClock, 1000);

// =====================================
// NAVIGASI
// =====================================

function showPage(page, button) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active-page");
    });

    document.getElementById(page).classList.add("active-page");

    document.querySelectorAll(".nav").forEach(b => {
        b.classList.remove("active");
    });

    button.classList.add("active");

    const titles = {
        dashboard: "Dashboard",
        employees: "Data Karyawan",
        attendance: "Absensi Karyawan",
        reports: "Laporan Kehadiran"
    };

    document.getElementById("pageTitle").textContent = titles[page];

    refreshAll();
}

// =====================================
// TAMBAH KARYAWAN
// =====================================

document.getElementById("employeeForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("editId").value;
    const number = document.getElementById("empNumber").value.trim();

    if (employees.some(emp =>
        emp.number.toLowerCase() === number.toLowerCase() &&
        emp.id !== id
    )) {
        alert("ID karyawan sudah digunakan!");
        return;
    }

    const data = {
        id: id || Date.now().toString(),
        number: number,
        name: document.getElementById("empName").value.trim(),
        position: document.getElementById("empPosition").value.trim(),
        department: document.getElementById("empDepartment").value.trim(),
        phone: document.getElementById("empPhone").value.trim()
    };

    if (id) {
        employees = employees.map(emp =>
            emp.id === id ? data : emp
        );

        alert("Data karyawan berhasil diperbarui!");
    } else {
        employees.push(data);
        alert("Karyawan berhasil ditambahkan!");
    }

    saveData();
    resetEmployeeForm();
    refreshAll();
});

// RESET FORM
function resetEmployeeForm() {
    document.getElementById("employeeForm").reset();
    document.getElementById("editId").value = "";
    document.getElementById("saveEmployee").textContent = "Simpan Karyawan";
}

// =====================================
// EDIT KARYAWAN
// =====================================

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    document.getElementById("editId").value = emp.id;
    document.getElementById("empNumber").value = emp.number;
    document.getElementById("empName").value = emp.name;
    document.getElementById("empPosition").value = emp.position;
    document.getElementById("empDepartment").value = emp.department;
    document.getElementById("empPhone").value = emp.phone;

    document.getElementById("saveEmployee").textContent = "Update Karyawan";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// =====================================
// HAPUS KARYAWAN
// =====================================

function deleteEmployee(id) {
    if (!confirm("Yakin ingin menghapus karyawan ini?")) return;

    employees = employees.filter(emp => emp.id !== id);

    attendance = attendance.filter(a => a.employeeId !== id);

    saveData();
    refreshAll();
}

// =====================================
// TABEL KARYAWAN
// =====================================

function renderEmployees() {
    const search = document.getElementById("employeeSearch").value.toLowerCase();

    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(search) ||
        emp.number.toLowerCase().includes(search)
    );

    document.getElementById("employeeTable").innerHTML =
        filtered.map(emp => `
        <tr>
            <td>${safe(emp.number)}</td>
            <td>${safe(emp.name)}</td>
            <td>${safe(emp.position)}</td>
            <td>${safe(emp.department)}</td>
            <td>${safe(emp.phone)}</td>
            <td>
                <button class="primary"
                    onclick="editEmployee('${emp.id}')">Edit</button>

                <button class="danger"
                    onclick="deleteEmployee('${emp.id}')">Hapus</button>
            </td>
        </tr>
    `).join("") || `
        <tr>
            <td colspan="6">Belum ada data karyawan.</td>
        </tr>
    `;
}

document.getElementById("employeeSearch").addEventListener("input", renderEmployees);

// =====================================
// PILIH KARYAWAN
// =====================================

function renderEmployeeOptions() {
    const select = document.getElementById("attendanceEmployee");

    const oldValue = select.value;

    select.innerHTML = `
        <option value="">Pilih Karyawan</option>
    ` + employees.map(emp => `
        <option value="${emp.id}">
            ${safe(emp.number)} - ${safe(emp.name)}
        </option>
    `).join("");

    if (employees.some(emp => emp.id === oldValue)) {
        select.value = oldValue;
    }
}

// =====================================
// CARI DATA ABSENSI
// =====================================

function getRecord(employeeId) {
    return attendance.find(a =>
        a.employeeId === employeeId &&
        a.date === today()
    );
}

// =====================================
// ABSEN MASUK
// =====================================

function checkIn() {
    const id = document.getElementById("attendanceEmployee").value;

    const status = document.getElementById("attendanceStatus").value;

    const note = document.getElementById("attendanceNote").value;

    if (!id) {
        alert("Silakan pilih karyawan!");
        return;
    }

    if (status !== "Hadir") {
        alert("Pilih status Hadir untuk absen masuk.");
        return;
    }

    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    let record = getRecord(id);

    if (record && record.checkIn !== "-") {
        alert("Karyawan sudah absen masuk!");
        return;
    }

    if (!record) {
        record = {
            id: Date.now().toString(),
            employeeId: id,
            employeeName: emp.name,
            date: today(),
            checkIn: "-",
            checkOut: "-",
            status: "Hadir",
            note: note
        };

        attendance.push(record);
    }

    record.checkIn = currentTime();
    record.status = "Hadir";
    record.note = note;

    saveData();
    refreshAll();

    alert("Absen masuk berhasil!");
}

// =====================================
// ABSEN PULANG
// =====================================

function checkOut() {
    const id = document.getElementById("attendanceEmployee").value;

    if (!id) {
        alert("Pilih karyawan terlebih dahulu!");
        return;
    }

    const record = getRecord(id);

    if (!record || record.checkIn === "-") {
        alert("Karyawan belum melakukan absen masuk!");
        return;
    }

    if (record.checkOut !== "-") {
        alert("Karyawan sudah absen pulang!");
        return;
    }

    record.checkOut = currentTime();

    saveData();
    refreshAll();

    alert("Absen pulang berhasil!");
}

// =====================================
// IZIN, SAKIT, ALPA
// =====================================

document.getElementById("attendanceForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("attendanceEmployee").value;

    const status = document.getElementById("attendanceStatus").value;

    const note = document.getElementById("attendanceNote").value;

    if (!id) {
        alert("Pilih karyawan terlebih dahulu!");
        return;
    }

    if (status === "Hadir") {
        alert("Gunakan tombol Absen Masuk untuk status Hadir.");
        return;
    }

    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    let record = getRecord(id);

    if (!record) {
        record = {
            id: Date.now().toString(),
            employeeId: id,
            employeeName: emp.name,
            date: today(),
            checkIn: "-",
            checkOut: "-",
            status: status,
            note: note
        };

        attendance.push(record);
    } else {
        record.status = status;
        record.note = note;
    }

    saveData();
    refreshAll();

    alert("Status kehadiran berhasil disimpan!");
});

// =====================================
// RIWAYAT ABSENSI
// =====================================

function renderAttendance() {
    const records = attendance.filter(a => a.date === today());

    document.getElementById("attendanceTable").innerHTML =
        records.map(a => `
        <tr>
            <td>${safe(a.employeeName)}</td>
            <td>${safe(a.checkIn)}</td>
            <td>${safe(a.checkOut)}</td>
            <td><span class="badge ${safe(a.status)}">${safe(a.status)}</span></td>
            <td>${safe(a.note)}</td>
        </tr>
    `).join("") || `
        <tr>
            <td colspan="5">Belum ada absensi hari ini.</td>
        </tr>
    `;
}

// =====================================
// DASHBOARD
// =====================================

function renderDashboard() {
    const records = attendance.filter(a => a.date === today());

    const hadir = records.filter(a => a.status === "Hadir").length;

    const leave = records.filter(a =>
        a.status === "Izin" || a.status === "Sakit"
    ).length;

    const absent = Math.max(0, employees.length - records.length);

    document.getElementById("totalEmployees").textContent = employees.length;

    document.getElementById("totalPresent").textContent = hadir;

    document.getElementById("totalLeave").textContent = leave;

    document.getElementById("totalAbsent").textContent = absent;
}

// =====================================
// LAPORAN ABSENSI
// =====================================

function renderReports() {
    const date = document.getElementById("reportDate").value || today();

    const records = attendance.filter(a => a.date === date);

    document.getElementById("reportTable").innerHTML =
        records.map((a, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${safe(a.employeeName)}</td>
            <td>${safe(a.date)}</td>
            <td>${safe(a.checkIn)}</td>
            <td>${safe(a.checkOut)}</td>
            <td>${safe(a.status)}</td>
        </tr>
    `).join("") || `
        <tr>
            <td colspan="6">Tidak ada data pada tanggal tersebut.</td>
        </tr>
    `;
}

// =====================================
// EXPORT CSV
// =====================================

function exportCSV() {
    const date = document.getElementById("reportDate").value || today();

    const records = attendance.filter(a => a.date === date);

    if (records.length === 0) {
        alert("Tidak ada laporan untuk diunduh!");
        return;
    }

    const rows = [
        ["Nama", "Tanggal", "Jam Masuk", "Jam Pulang", "Status", "Keterangan"],
        ...records.map(a => [
            a.employeeName,
            a.date,
            a.checkIn,
            a.checkOut,
            a.status,
            a.note
        ])
    ];

    const csv = rows.map(row =>
        row.map(value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Laporan-Absensi-" + date + ".csv";

    link.click();

    URL.revokeObjectURL(url);
}

// =====================================
// REFRESH SEMUA DATA
// =====================================

function refreshAll() {
    renderEmployees();
    renderEmployeeOptions();
    renderAttendance();
    renderDashboard();
    renderReports();

    document.getElementById("attendanceDate").textContent =
        "Tanggal: " + today();
}

// =====================================
// MULAI APLIKASI
// =====================================

document.getElementById("reportDate").value = today();

refreshAll();

console.log("EMPLOYEE PRO berhasil dijalankan!");
/* =========================================================
   TAMBAHAN LOGIKA LOGIN, REGISTER, PEMISAHAN ROLE & CEK AKUN
========================================================= */
(function () {
  const KEY_USERS = "ep_registered_users";
  const KEY_SESSION = "ep_active_session";

  // Akun admin bawaan agar bisa langsung dicoba
  if (!localStorage.getItem(KEY_USERS)) {
    localStorage.setItem(KEY_USERS, JSON.stringify([
      {
        name: "Admin Utama",
        email: "admin@employeepro.com",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toLocaleDateString("id-ID")
      }
    ]));
  }

  window.epSwitchAuth = function (tab) {
    document.getElementById("ep-auth-msg").style.display = "none";
    document.getElementById("ep-tab-login").classList.toggle("active", tab === "login");
    document.getElementById("ep-tab-register").classList.toggle("active", tab === "register");
    document.getElementById("ep-login-form").style.display = tab === "login" ? "block" : "none";
    document.getElementById("ep-reg-form").style.display = tab === "register" ? "block" : "none";
  };

  window.epHandleRegister = function (e) {
    e.preventDefault();
    const name = document.getElementById("ep-reg-name").value.trim();
    const email = document.getElementById("ep-reg-email").value.trim().toLowerCase();
    const role = document.getElementById("ep-reg-role").value;
    const password = document.getElementById("ep-reg-pass").value;

    const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    if (users.some((u) => u.email === email)) {
      return showEpMsg("Email sudah terdaftar! Silakan langsung Login.");
    }

    users.push({
      name,
      email,
      password,
      role,
      createdAt: new Date().toLocaleString("id-ID")
    });
    localStorage.setItem(KEY_USERS, JSON.stringify(users));

    e.target.reset();
    epSwitchAuth("login");
    document.getElementById("ep-login-email").value = email;
    showEpMsg("Akun berhasil dibuat! Silakan masuk.", true);
  };

  window.epHandleLogin = function (e) {
    e.preventDefault();
    const email = document.getElementById("ep-login-email").value.trim().toLowerCase();
    const password = document.getElementById("ep-login-pass").value;

    const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    const user = users.find((u) => u.email === email);

    if (!user) {
      return showEpMsg("Akun belum ada. Silakan pilih 'Buat Akun' terlebih dahulu.");
    }
    if (user.password !== password) {
      return showEpMsg("Password salah!");
    }

    localStorage.setItem(KEY_SESSION, JSON.stringify(user));
    applyUserSession(user);
  };

  window.epLogout = function () {
    localStorage.removeItem(KEY_SESSION);
    location.reload();
  };

  window.epOpenUsersModal = function () {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    const tbody = document.getElementById("ep-users-tbody");
    tbody.innerHTML = users.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><b>${u.role === "admin" ? "ADMIN" : "Pengguna Biasa"}</b></td>
        <td>${u.createdAt}</td>
        <td>
          ${u.email !== "admin@employeepro.com"
            ? `<button class="ep-btn-mini" onclick="epDeleteUser('${u.email}')">Hapus</button>`
            : "-"}
        </td>
      </tr>
    `).join("");
    document.getElementById("ep-users-modal").style.display = "flex";
  };

  window.epDeleteUser = function (email) {
    let users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    users = users.filter((u) => u.email !== email);
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    epOpenUsersModal();
  };

  function showEpMsg(text, isSuccess = false) {
    const el = document.getElementById("ep-auth-msg");
    el.textContent = text;
    el.style.display = "block";
    el.style.background = isSuccess ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)";
    el.style.color = isSuccess ? "#86efac" : "#fca5a5";
  }

  function applyUserSession(user) {
    document.getElementById("ep-auth-overlay").style.display = "none";

    // Hapus bar lama jika ada
    const oldBar = document.getElementById("ep-top-controls");
    if (oldBar) oldBar.remove();

    // Buat bar kontrol role + cek akun (khusus admin) + logout
    const bar = document.createElement("div");
    bar.id = "ep-top-controls";
    bar.className = "ep-floating-bar";
    bar.innerHTML = `
      <span class="ep-pill-role">${user.role === "admin" ? "ADMIN" : "PENGGUNA"}: ${user.name}</span>
      ${user.role === "admin" ? `<button type="button" class="ep-btn-mini" onclick="epOpenUsersModal()">Cek Semua Pengguna</button>` : ""}
      <button type="button" class="ep-btn-mini" onclick="epLogout()">Logout</button>
    `;
    document.body.appendChild(bar);

    // Pemisahan menu sidebar antara Admin dan Pengguna Biasa
    // Menu "Data Karyawan" & "Laporan" disembunyikan otomatis jika login sebagai Pengguna Biasa
    if (user.role !== "admin") {
      document.querySelectorAll("aside a, aside button, .nav-item, nav a").forEach((menu) => {
        const text = menu.textContent.toLowerCase();
        if (text.includes("data karyawan") || text.includes("laporan")) {
          menu.style.display = "none";
        }
      });
    }
  }

  // Cek sesi saat halaman dibuka/refresh
  const activeSession = localStorage.getItem(KEY_SESSION);
  if (activeSession) {
    applyUserSession(JSON.parse(activeSession));
  }
})();