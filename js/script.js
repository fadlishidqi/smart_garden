document.addEventListener('DOMContentLoaded', function() {
    const chartConfig = {
        moisture: {
            ctx: document.getElementById('moistureChart').getContext('2d'),
            data: {
                labels: Array(12).fill(''),
                datasets: [{
                    label: 'Kelembaban (%)',
                    data: Array(12).fill(70),
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                animation: {
                    duration: 0
                }
            }
        },
        temperature: {
            ctx: document.getElementById('temperatureChart').getContext('2d'),
            data: {
                labels: Array(12).fill(''),
                datasets: [{
                    label: 'Suhu (°C)', 
                    data: Array(12).fill(25),
                    borderColor: 'rgb(239, 68, 68)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 20,
                        max: 35
                    }
                },
                animation: {
                    duration: 0
                }
            }
        }
    };
 
    const moistureChart = new Chart(chartConfig.moisture.ctx, {
        type: 'line',
        data: chartConfig.moisture.data,
        options: chartConfig.moisture.options
    });
 
    const temperatureChart = new Chart(chartConfig.temperature.ctx, {
        type: 'line',
        data: chartConfig.temperature.data,
        options: chartConfig.temperature.options
    });
 
    let currentMoisture = 70;
    let currentTemperature = 25;
    let isWatering = false;
    
    function updateData() {
        let moistureChange = (Math.random() * 6) - 3;
        let temperatureChange = (Math.random() * 2) - 1;
        
        if(isWatering && currentMoisture < 95) {
            currentMoisture += 2;
        } else {
            currentMoisture += moistureChange;
        }
        
        if(Math.random() > 0.7) {
            moistureChange *= 2;
            temperatureChange *= 1.5;
        }
        
        currentMoisture = Math.min(Math.max(currentMoisture, 50), 100);
        currentTemperature = Math.min(Math.max(currentTemperature + temperatureChange, 28), 35);
        
        const moistureValue = document.querySelector('.text-3xl.font-bold');
        const moistureBar = document.querySelector('.bg-blue-500');
        const tempValue = document.querySelectorAll('.text-3xl.font-bold')[1];
        const tempTrend = document.querySelector('.text-green-500.text-sm');
        
        moistureValue.textContent = `${Math.round(currentMoisture)}%`;
        moistureBar.style.width = `${currentMoisture}%`;
        tempValue.textContent = `${currentTemperature.toFixed(1)}°C`;
        
        const tempDiff = temperatureChange.toFixed(1);
        tempTrend.innerHTML = `
            <i class="fas fa-arrow-${temperatureChange >= 0 ? 'up' : 'down'}"></i>
            ${Math.abs(tempDiff)}°C dari sebelumnya
        `;
        
        const currentTime = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        moistureChart.data.datasets[0].data.push(currentMoisture);
        moistureChart.data.datasets[0].data.shift();
        moistureChart.data.labels.push(currentTime);
        moistureChart.data.labels.shift();
        
        temperatureChart.data.datasets[0].data.push(currentTemperature);
        temperatureChart.data.datasets[0].data.shift();
        temperatureChart.data.labels.push(currentTime);
        temperatureChart.data.labels.shift();
        
        moistureChart.update('none');
        temperatureChart.update('none');
    }
 
    const startButton = document.querySelector('.bg-green-500.text-white');
    const stopButton = document.querySelector('.bg-red-500.text-white');
    const statusText = document.querySelector('.text-xl.font-semibold');
    const statusDetail = document.querySelector('.text-sm.text-gray-500');
 
    startButton.addEventListener('click', () => {
        isWatering = true;
        statusText.textContent = 'Aktif';
        statusDetail.textContent = 'Zona 1 sedang disiram';
        startButton.disabled = true;
        startButton.classList.add('opacity-50');
        stopButton.disabled = false;
        stopButton.classList.remove('opacity-50');
    });
 
    stopButton.addEventListener('click', () => {
        isWatering = false;
        statusText.textContent = 'Tidak Aktif';
        statusDetail.textContent = 'Sistem siap';
        startButton.disabled = false;
        startButton.classList.remove('opacity-50');
        stopButton.disabled = true;
        stopButton.classList.add('opacity-50');
    });
 
    const morningTime = document.querySelector('input[type="time"]:first-of-type');
    const eveningTime = document.querySelector('input[type="time"]:last-of-type');
 
    function validateSchedule() {
        const morning = new Date(`2024-01-01T${morningTime.value}`);
        const evening = new Date(`2024-01-01T${eveningTime.value}`);
        
        if (morning >= evening) {
            alert('Jadwal pagi harus lebih awal dari jadwal sore!');
            return false;
        }
        return true;
    }
 
    [morningTime, eveningTime].forEach(input => {
        input.addEventListener('change', validateSchedule);
    });
 
    setInterval(updateData, 2000);
 });