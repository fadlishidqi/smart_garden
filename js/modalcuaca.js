document.addEventListener('DOMContentLoaded', function() {
    let db;
    const dbName = "SmartGarden";
    const request = indexedDB.open(dbName, 1);

    request.onerror = function(event) {
        console.error("Database error: " + event.target.error);
        showNotification("Database error: " + event.target.error, 'error');
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains('watering_schedules')) {
            const objectStore = db.createObjectStore('watering_schedules', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('zone', 'zone', { unique: false });
            objectStore.createIndex('start_time', 'start_time', { unique: false });
            objectStore.createIndex('created_at', 'created_at', { unique: false });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadSchedules();
    };

    const modal = document.getElementById('scheduleModal');
    const addButton = document.getElementById('addScheduleBtn');
    const closeButton = document.getElementById('closeModal');
    const cancelButton = document.getElementById('cancelSchedule');
    const scheduleForm = document.getElementById('scheduleForm');

    addButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    function closeModal() {
        modal.classList.add('hidden');
        scheduleForm.reset();
        scheduleForm.onsubmit = handleFormSubmit;
    }

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function loadSchedules() {
        const scheduleList = document.querySelector('.schedule-list');
        if (!scheduleList) return;

        scheduleList.innerHTML = '';

        const transaction = db.transaction(['watering_schedules'], 'readonly');
        const objectStore = transaction.objectStore('watering_schedules');
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            const schedules = event.target.result;
            schedules.sort((a, b) => a.start_time.localeCompare(b.start_time));
            schedules.forEach(schedule => addScheduleToList(schedule));
        };

        request.onerror = function(event) {
            console.error("Error loading schedules:", event.target.error);
            showNotification("Error loading schedules", 'error');
        };
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            zone: document.getElementById('zone').value,
            startTime: document.getElementById('startTime').value,
            duration: document.getElementById('duration').value,
            repeat: document.getElementById('repeat').checked,
            created_at: new Date().toISOString()
        };

        if (!formData.startTime || !formData.duration) {
            showNotification('Semua field harus diisi', 'error');
            return;
        }

        const transaction = db.transaction(['watering_schedules'], 'readwrite');
        const objectStore = transaction.objectStore('watering_schedules');
        const request = objectStore.add(formData);

        request.onsuccess = function(event) {
            formData.id = event.target.result;
            addScheduleToList(formData);
            showNotification('Jadwal berhasil ditambahkan');
            closeModal();
        };

        request.onerror = function(event) {
            console.error('Error saving schedule:', event.target.error);
            showNotification('Gagal menambahkan jadwal', 'error');
        };
    }

    scheduleForm.onsubmit = handleFormSubmit;

    function addScheduleToList(data) {
        const scheduleList = document.querySelector('.schedule-list');
        if (!scheduleList) return;

        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'bg-white p-4 rounded-lg shadow-sm flex justify-between items-center schedule-card';
        
        scheduleItem.innerHTML = `
            <div>
                <h4 class="font-medium">Zona ${data.zone}</h4>
                <p class="text-sm text-gray-600">
                    ${data.startTime || data.start_time} (${data.duration} menit)
                    ${data.repeat ? '• Setiap Hari' : ''}
                </p>
            </div>
            <div class="flex space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-schedule" data-id="${data.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-schedule" data-id="${data.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        const deleteButton = scheduleItem.querySelector('.delete-schedule');
        deleteButton.addEventListener('click', () => {
            deleteSchedule(data.id, scheduleItem);
        });

        const editButton = scheduleItem.querySelector('.edit-schedule');
        editButton.addEventListener('click', () => {
            editSchedule(data);
        });

        scheduleList.appendChild(scheduleItem);
    }

    function deleteSchedule(id, element) {
        if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
            const transaction = db.transaction(['watering_schedules'], 'readwrite');
            const objectStore = transaction.objectStore('watering_schedules');
            const request = objectStore.delete(id);

            request.onsuccess = function() {
                element.remove();
                showNotification('Jadwal berhasil dihapus');
            };

            request.onerror = function(event) {
                console.error('Error deleting schedule:', event.target.error);
                showNotification('Gagal menghapus jadwal', 'error');
            };
        }
    }

    function editSchedule(data) {
        document.getElementById('zone').value = data.zone;
        document.getElementById('startTime').value = data.startTime || data.start_time;
        document.getElementById('duration').value = data.duration;
        document.getElementById('repeat').checked = data.repeat;

        scheduleForm.onsubmit = function(e) {
            e.preventDefault();
            
            const updatedData = {
                id: data.id,
                zone: document.getElementById('zone').value,
                startTime: document.getElementById('startTime').value,
                duration: document.getElementById('duration').value,
                repeat: document.getElementById('repeat').checked,
                created_at: data.created_at
            };

            const transaction = db.transaction(['watering_schedules'], 'readwrite');
            const objectStore = transaction.objectStore('watering_schedules');
            const request = objectStore.put(updatedData);

            request.onsuccess = function() {
                loadSchedules();
                showNotification('Jadwal berhasil diperbarui');
                closeModal();
            };

            request.onerror = function(event) {
                console.error('Error updating schedule:', event.target.error);
                showNotification('Gagal memperbarui jadwal', 'error');
            };
        };

        modal.classList.remove('hidden');
    }

    function showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50 transition-opacity duration-300`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function validateTimeInput(input) {
        const timeValue = input.value;
        if (!timeValue) return true;

        const [hours, minutes] = timeValue.split(':');
        
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            showNotification('Waktu tidak valid', 'error');
            input.value = '';
            return false;
        }
        return true;
    }

    const timeInput = document.getElementById('startTime');
    if (timeInput) {
        timeInput.addEventListener('change', function() {
            validateTimeInput(this);
        });
    }

    const durationInput = document.getElementById('duration');
    if (durationInput) {
        durationInput.addEventListener('input', function() {
            const duration = parseInt(this.value);
            if (duration < 1) {
                this.value = 1;
            } else if (duration > 60) {
                this.value = 60;
            }
        });
    }
});
