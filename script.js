// Coordinates: 55.0718472, 29.5065049
const LAT = 55.0718472;
const LON = 29.5065049;

// Fetch Historical Data (Last 2 Weeks)
async function fetchHistoricalData() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 14);
  
  const response = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&daily=temperature_2m_min,relative_humidity_2m_mean&timezone=auto`
  );
  return await response.json();
}

// Fetch Forecast Data (Next 2 Weeks)
async function fetchForecastData() {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_min,relative_humidity_2m_mean,windspeed_10m_max&forecast_days=14&timezone=auto`
  );
  return await response.json();
}

// Helper: Format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Render Charts
async function renderCharts() {
  const historicalData = await fetchHistoricalData();
  const forecastData = await fetchForecastData();

  // Extract data
  const pastDates = historicalData.daily.time;
  const pastMinTemps = historicalData.daily.temperature_2m_min;
  const pastHumidity = historicalData.daily.relative_humidity_2m_mean;

  const forecastDates = forecastData.daily.time.slice(0, 7); // Next week only
  const forecastMinTemps = forecastData.daily.temperature_2m_min.slice(0, 7);
  const forecastHumidity = forecastData.daily.relative_humidity_2m_mean.slice(0, 7);
  const forecastWind = forecastData.daily.windspeed_10m_max.slice(0, 7);

  // Avg Historical Temp (Next Week)
  const avgHistoricalTemp = pastMinTemps.slice(-7).reduce((a, b) => a + b, 0) / 7;

  // Charts
  new Chart(document.getElementById('minTempChart'), {
    type: 'line',
    data: {
      labels: pastDates,
      datasets: [{
        label: 'Min Temperature (°C)',
        data: pastMinTemps,
        borderColor: 'rgb(255, 99, 132)',
      }]
    }
  });

  new Chart(document.getElementById('forecastTempChart'), {
    type: 'line',
    data: {
      labels: forecastDates,
      datasets: [{
        label: 'Forecast Min Temp (°C)',
        data: forecastMinTemps,
        borderColor: 'rgb(54, 162, 235)',
      }]
    }
  });

  new Chart(document.getElementById('humidityPastChart'), {
    type: 'bar',
    data: {
      labels: pastDates,
      datasets: [{
        label: 'Humidity (%)',
        data: pastHumidity,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
    }
  });

  new Chart(document.getElementById('humidityForecastChart'), {
    type: 'bar',
    data: {
      labels: forecastDates,
      datasets: [{
        label: 'Humidity (%)',
        data: forecastHumidity,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }]
    }
  });

  new Chart(document.getElementById('windChart'), {
    type: 'bar',
    data: {
      labels: forecastDates,
      datasets: [{
        label: 'Wind Speed (km/h)',
        data: forecastWind,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      }]
    }
  });

  // Avg Historical Temp Chart
  new Chart(document.getElementById('avgTempChart'), {
    type: 'line',
    data: {
      labels: forecastDates,
      datasets: [{
        label: 'Avg Historical Temp (°C)',
        data: Array(7).fill(avgHistoricalTemp),
        borderColor: 'rgb(201, 203, 207)',
        borderDash: [5, 5],
      }]
    }
  });
}

// Initialize
renderCharts();