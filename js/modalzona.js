document.addEventListener('DOMContentLoaded', function() {
    const zoneModal = document.getElementById('zoneModal');
    const addZoneBtn = document.getElementById('addZoneBtn');
    const closeZoneBtn = document.getElementById('closeZoneModal');
    const cancelZoneBtn = document.getElementById('cancelZone');
    const zoneForm = document.getElementById('zoneForm');
    let zones = JSON.parse(localStorage.getItem('smartGardenZones')) || [];

    // Create container for zones list
    const statsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    const zonesListContainer = document.createElement('div');
    zonesListContainer.className = 'bg-white p-6 rounded-xl shadow-sm mb-8 mt-8';
    zonesListContainer.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Daftar Zona</h3>
        <div id="zonesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
    statsGrid.parentNode.insertBefore(zonesListContainer, statsGrid.nextSibling);

    // Display zones
    function displayZones() {
        const zonesListElement = document.getElementById('zonesList');
        zonesListElement.innerHTML = '';

        zones.forEach((zone, index) => {
            const zoneCard = document.createElement('div');
            zoneCard.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow';
            zoneCard.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-lg font-semibold text-gray-800">${zone.name}</h4>
                    <div class="flex space-x-2">
                        <button type="button" onclick="editZone(${index})" class="text-blue-500 hover:text-blue-600">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" onclick="deleteZone(${index})" class="text-red-500 hover:text-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-2">
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-vector-square mr-2"></i>Luas: ${zone.area} m²
                    </p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-seedling mr-2"></i>Jenis: ${zone.plantType}
                    </p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-2"></i>${zone.description || 'Tidak ada deskripsi'}
                    </p>
                </div>
            `;
            zonesListElement.appendChild(zoneCard);
        });
    }

    // Modal functions
    function showModal() {
        zoneModal.style.display = 'block';
        zoneModal.classList.remove('hidden');
    }

    function hideModal() {
        zoneModal.style.display = 'none';
        zoneModal.classList.add('hidden');
        zoneForm.reset();
        zoneForm.dataset.editIndex = '';
    }

    // Add Zone button click
    addZoneBtn.onclick = function() {
        showModal();
        return false;
    };

    // Close modal buttons
    closeZoneBtn.onclick = function() {
        hideModal();
        return false;
    };

    cancelZoneBtn.onclick = function() {
        hideModal();
        return false;
    };

    // Handle form submission
    zoneForm.onsubmit = function(e) {
        e.preventDefault();
        
        const zoneData = {
            name: document.getElementById('zoneName').value,
            area: document.getElementById('zoneArea').value,
            plantType: document.getElementById('plantType').value,
            description: document.getElementById('zoneDescription').value
        };

        if (this.dataset.editIndex) {
            zones[parseInt(this.dataset.editIndex)] = zoneData;
        } else {
            zones.push(zoneData);
        }

        localStorage.setItem('smartGardenZones', JSON.stringify(zones));
        displayZones();
        hideModal();

        // Show notification and refresh page
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg bg-green-500 text-white z-50';
        notification.textContent = this.dataset.editIndex ? 'Zona berhasil diperbarui' : 'Zona berhasil ditambahkan';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
            location.reload();
        }, 3000);
    };

    // Edit and Delete functions
    window.editZone = function(index) {
        const zone = zones[index];
        document.getElementById('zoneName').value = zone.name;
        document.getElementById('zoneArea').value = zone.area;
        document.getElementById('plantType').value = zone.plantType;
        document.getElementById('zoneDescription').value = zone.description;
        zoneForm.dataset.editIndex = index;
        showModal();
    };

    window.deleteZone = function(index) {
        if (confirm('Apakah Anda yakin ingin menghapus zona ini?')) {
            zones.splice(index, 1);
            localStorage.setItem('smartGardenZones', JSON.stringify(zones));
            displayZones();
            
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg bg-green-500 text-white z-50';
            notification.textContent = 'Zona berhasil dihapus';
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
                location.reload();
            }, 30);
        }
    };

    // Initial display
    displayZones();
});