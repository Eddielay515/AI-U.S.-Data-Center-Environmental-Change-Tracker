// Main Application Logic
class EnvironmentalTracker {
    constructor() {
        this.heatIndexData = null;
        this.airQualityData = null;
        this.waterQualityData = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('currentLocationBtn').addEventListener('click', () => this.useCurrentLocation());

        // Allow Enter key to trigger search
        ['latitude', 'longitude'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        });
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('latitude').value = position.coords.latitude.toFixed(4);
                document.getElementById('longitude').value = position.coords.longitude.toFixed(4);
                this.handleSearch();
            },
            (error) => {
                this.hideLoading();
                this.showError(`Unable to get your location: ${error.message}`);
            }
        );
    }

    async handleSearch() {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lon = parseFloat(document.getElementById('longitude').value);

        if (isNaN(lat) || isNaN(lon)) {
            this.showError('Please enter valid latitude and longitude values');
            return;
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            this.showError('Latitude must be between -90 and 90, longitude between -180 and 180');
            return;
        }

        this.hideError();
        this.showLoading();

        try {
            // Fetch all data sources in parallel
            await Promise.all([
                this.fetchHeatIndexData(lat, lon),
                this.fetchAirQualityData(lat, lon),
                this.fetchWaterQualityData(lat, lon)
            ]);

            this.displayResults();
        } catch (error) {
            this.showError(`Error fetching data: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async fetchHeatIndexData(lat, lon) {
        try {
            // Step 1: Get the grid point metadata
            const pointsResponse = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);

            if (!pointsResponse.ok) {
                throw new Error('Unable to fetch weather data for this location');
            }

            const pointsData = await pointsResponse.json();

            // Step 2: Get the forecast from the grid endpoint
            const forecastUrl = pointsData.properties.forecast;
            const forecastResponse = await fetch(forecastUrl);

            if (!forecastResponse.ok) {
                throw new Error('Unable to fetch forecast data');
            }

            const forecastData = await forecastResponse.json();

            // Extract relevant heat index information
            this.heatIndexData = {
                location: pointsData.properties.relativeLocation.properties.city + ', ' +
                         pointsData.properties.relativeLocation.properties.state,
                gridId: pointsData.properties.gridId,
                forecast: forecastData.properties.periods.slice(0, 5) // Get next 5 periods
            };

            // Try to get gridpoint data for more detailed information
            try {
                const gridpointUrl = pointsData.properties.forecastGridData;
                const gridResponse = await fetch(gridpointUrl);

                if (gridResponse.ok) {
                    const gridData = await gridResponse.json();
                    this.heatIndexData.temperature = gridData.properties.temperature;
                    this.heatIndexData.relativeHumidity = gridData.properties.relativeHumidity;
                    this.heatIndexData.apparentTemperature = gridData.properties.apparentTemperature;
                }
            } catch (err) {
                console.warn('Could not fetch detailed gridpoint data:', err);
            }

        } catch (error) {
            console.error('Error fetching heat index data:', error);
            this.heatIndexData = { error: error.message };
        }
    }

    async fetchAirQualityData(lat, lon) {
        try {
            const apiKey = document.getElementById('airnowApiKey').value.trim();

            if (!apiKey) {
                this.airQualityData = {
                    error: 'API key required',
                    message: 'Please enter your AirNow API key to view air quality data. Get a free key at docs.airnowapi.org'
                };
                return;
            }

            // AirNow API endpoint for current observations by lat/lon
            const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=50&API_KEY=${apiKey}`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid API key. Please check your AirNow API key.');
                }
                throw new Error(`AirNow API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                this.airQualityData = {
                    error: 'No data available',
                    message: 'No air quality monitoring stations found within 50 miles of this location.'
                };
                return;
            }

            // Process the air quality data
            this.airQualityData = {
                observations: data,
                location: data[0]?.ReportingArea || 'Unknown',
                stateCode: data[0]?.StateCode || '',
                dateObserved: data[0]?.DateObserved || '',
                hourObserved: data[0]?.HourObserved || ''
            };

            // Find the highest AQI value (worst pollutant)
            let maxAQI = 0;
            let primaryPollutant = '';

            data.forEach(observation => {
                if (observation.AQI > maxAQI) {
                    maxAQI = observation.AQI;
                    primaryPollutant = observation.ParameterName;
                }
            });

            this.airQualityData.maxAQI = maxAQI;
            this.airQualityData.primaryPollutant = primaryPollutant;
            this.airQualityData.category = this.getAQICategory(maxAQI);

        } catch (error) {
            console.error('Error fetching air quality data:', error);
            this.airQualityData = {
                error: error.message,
                message: 'Unable to fetch air quality data. Please check your API key and try again.'
            };
        }
    }

    getAQICategory(aqi) {
        if (aqi <= 50) {
            return { name: 'Good', color: '#00e400', healthMessage: 'Air quality is satisfactory, and air pollution poses little or no risk.' };
        } else if (aqi <= 100) {
            return { name: 'Moderate', color: '#ffff00', healthMessage: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.' };
        } else if (aqi <= 150) {
            return { name: 'Unhealthy for Sensitive Groups', color: '#ff7e00', healthMessage: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.' };
        } else if (aqi <= 200) {
            return { name: 'Unhealthy', color: '#ff0000', healthMessage: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.' };
        } else if (aqi <= 300) {
            return { name: 'Very Unhealthy', color: '#8f3f97', healthMessage: 'Health alert: The risk of health effects is increased for everyone.' };
        } else {
            return { name: 'Hazardous', color: '#7e0023', healthMessage: 'Health warning of emergency conditions: everyone is more likely to be affected.' };
        }
    }

    async fetchWaterQualityData(lat, lon) {
        try {
            // Using EPA ATTAINS API to get water quality data near the coordinates
            // Note: ATTAINS API searches by state, not exact coordinates
            // We'll use a simplified approach here

            const attainsUrl = `https://attains.epa.gov/attains-public/api/huc12summary`;

            try {
                const response = await fetch(attainsUrl);

                if (response.ok) {
                    const data = await response.json();
                    this.waterQualityData = {
                        source: 'EPA ATTAINS',
                        note: 'Water quality data is aggregated at the watershed level',
                        available: true,
                        summary: data
                    };
                } else {
                    throw new Error('ATTAINS API unavailable');
                }
            } catch (err) {
                // Fallback: provide general information
                this.waterQualityData = {
                    source: 'EPA General Information',
                    note: 'For detailed water quality data in your area, visit How\'s My Waterway',
                    link: `https://mywaterway.epa.gov/community/${lat}/${lon}/overview`,
                    available: false,
                    message: 'Direct API access is limited. Please visit EPA\'s How\'s My Waterway website for detailed information.'
                };
            }

        } catch (error) {
            console.error('Error fetching water quality data:', error);
            this.waterQualityData = {
                error: error.message,
                fallback: `https://mywaterway.epa.gov/community/${lat}/${lon}/overview`
            };
        }
    }

    displayResults() {
        document.getElementById('results').classList.remove('hidden');

        this.displayHeatIndexData();
        this.displayAirQualityData();
        this.displayWaterQualityData();
        this.displayImpactAssessment();
    }

    displayHeatIndexData() {
        const container = document.getElementById('heatIndexData');

        if (!this.heatIndexData || this.heatIndexData.error) {
            container.innerHTML = `<p class="no-data">Unable to fetch heat index data: ${this.heatIndexData?.error || 'Unknown error'}</p>`;
            return;
        }

        let html = `
            <div class="data-item">
                <strong>Location:</strong> ${this.heatIndexData.location}
            </div>
        `;

        if (this.heatIndexData.forecast && this.heatIndexData.forecast.length > 0) {
            html += '<div class="metric-grid">';

            this.heatIndexData.forecast.forEach(period => {
                const tempColor = period.temperature > 95 ? '#dc3545' :
                                period.temperature > 85 ? '#ffc107' : '#28a745';

                html += `
                    <div class="metric-card">
                        <div class="metric-label">${period.name}</div>
                        <div class="metric-value" style="color: ${tempColor}">${period.temperature}°F</div>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">${period.shortForecast}</p>
                    </div>
                `;
            });

            html += '</div>';
        }

        // Display detailed temperature data if available
        if (this.heatIndexData.temperature && this.heatIndexData.temperature.values) {
            const recentTemps = this.heatIndexData.temperature.values.slice(0, 3);
            html += '<div class="data-item" style="margin-top: 20px;"><strong>Recent Temperature Readings:</strong><ul style="margin-left: 20px; margin-top: 10px;">';

            recentTemps.forEach(temp => {
                const tempF = (temp.value * 9/5) + 32;
                const date = new Date(temp.validTime.split('/')[0]).toLocaleString();
                html += `<li>${date}: ${tempF.toFixed(1)}°F</li>`;
            });

            html += '</ul></div>';
        }

        // Add heat index warnings
        const maxTemp = this.heatIndexData.forecast ?
            Math.max(...this.heatIndexData.forecast.map(p => p.temperature)) : 0;

        if (maxTemp > 95) {
            html += `
                <div class="alert">
                    <strong>⚠️ High Heat Warning:</strong> Temperatures exceeding 95°F detected.
                    Data center cooling systems should be monitored closely.
                    Increased power consumption expected for HVAC systems.
                </div>
            `;
        } else if (maxTemp > 85) {
            html += `
                <div class="warning">
                    <strong>⚡ Moderate Heat Advisory:</strong> Elevated temperatures may affect
                    data center efficiency. Monitor cooling system performance.
                </div>
            `;
        } else {
            html += `
                <div class="good">
                    <strong>✓ Normal Conditions:</strong> Temperature within acceptable range for
                    optimal data center operations.
                </div>
            `;
        }

        container.innerHTML = html;
    }

    displayAirQualityData() {
        const container = document.getElementById('airQualityData');

        if (!this.airQualityData || this.airQualityData.error) {
            const message = this.airQualityData?.message || 'No air quality data available';
            container.innerHTML = `
                <div class="warning">
                    <strong>Note:</strong> ${message}
                </div>
            `;
            return;
        }

        const aqi = this.airQualityData.maxAQI;
        const category = this.airQualityData.category;

        let html = `
            <div class="data-item">
                <strong>Location:</strong> ${this.airQualityData.location}, ${this.airQualityData.stateCode}
            </div>
            <div class="data-item">
                <strong>Last Updated:</strong> ${this.airQualityData.dateObserved} at ${this.airQualityData.hourObserved}:00
            </div>

            <div class="aqi-display" style="background: ${category.color}; color: ${aqi <= 100 ? '#000' : '#fff'}; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <div style="font-size: 1.2em; font-weight: 600; margin-bottom: 10px;">Air Quality Index (AQI)</div>
                <div style="font-size: 3.5em; font-weight: 700; margin: 10px 0;">${aqi}</div>
                <div style="font-size: 1.5em; font-weight: 600; margin-bottom: 10px;">${category.name}</div>
                <div style="font-size: 0.95em; margin-top: 15px; line-height: 1.6;">${category.healthMessage}</div>
            </div>

            <div class="data-item">
                <strong>Primary Pollutant:</strong> ${this.airQualityData.primaryPollutant}
            </div>
        `;

        // Display all pollutant readings
        if (this.airQualityData.observations && this.airQualityData.observations.length > 0) {
            html += '<div class="data-item" style="margin-top: 20px;"><strong>Pollutant Readings:</strong><div class="metric-grid" style="margin-top: 15px;">';

            this.airQualityData.observations.forEach(obs => {
                const obsCategory = this.getAQICategory(obs.AQI);
                html += `
                    <div class="metric-card" style="border-left: 4px solid ${obsCategory.color};">
                        <div class="metric-label">${obs.ParameterName}</div>
                        <div class="metric-value" style="color: ${obsCategory.color};">${obs.AQI}</div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 5px;">${obsCategory.name}</div>
                    </div>
                `;
            });

            html += '</div></div>';
        }

        // Add data center impact warnings based on AQI
        if (aqi > 100) {
            html += `
                <div class="alert">
                    <strong>⚠️ Air Quality Alert for Data Centers:</strong>
                    Poor air quality may affect air filtration systems and increase the risk of
                    particulate contamination in cooling systems. Monitor air intake filters and
                    consider increasing filtration or switching to recirculated air if possible.
                </div>
            `;
        } else if (aqi > 50) {
            html += `
                <div class="warning">
                    <strong>⚡ Air Quality Notice:</strong>
                    Moderate air quality detected. Ensure air filtration systems are functioning
                    properly to prevent dust and particulate buildup in data center equipment.
                </div>
            `;
        } else {
            html += `
                <div class="good">
                    <strong>✓ Good Air Quality:</strong>
                    Air quality is within optimal range for data center operations.
                    Standard filtration procedures are sufficient.
                </div>
            `;
        }

        container.innerHTML = html;
    }

    displayWaterQualityData() {
        const container = document.getElementById('waterQualityData');

        if (!this.waterQualityData) {
            container.innerHTML = '<p class="no-data">No water quality data available</p>';
            return;
        }

        let html = `
            <div class="data-item">
                <strong>Data Source:</strong> ${this.waterQualityData.source || 'EPA'}
            </div>
        `;

        if (this.waterQualityData.error) {
            html += `
                <div class="warning">
                    <strong>Note:</strong> ${this.waterQualityData.message || 'Unable to fetch detailed water quality data'}
                </div>
            `;
        }

        if (this.waterQualityData.note) {
            html += `
                <div class="data-item">
                    <strong>Note:</strong> ${this.waterQualityData.note}
                </div>
            `;
        }

        if (this.waterQualityData.link) {
            html += `
                <div class="data-item">
                    <strong>Detailed Information:</strong>
                    <a href="${this.waterQualityData.link}" target="_blank" style="color: #667eea; text-decoration: underline;">
                        View water quality data on EPA's How's My Waterway
                    </a>
                </div>
            `;
        }

        if (!this.waterQualityData.available) {
            html += `
                <div class="warning">
                    <p><strong>Water Quality Considerations for Data Centers:</strong></p>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>Water is critical for data center cooling systems</li>
                        <li>Poor water quality can lead to scaling and corrosion</li>
                        <li>Monitor local water sources for availability and quality</li>
                        <li>Consider water treatment systems for optimal performance</li>
                    </ul>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    displayImpactAssessment() {
        const container = document.getElementById('impactAssessment');

        let riskLevel = 'LOW';
        let riskColor = '#28a745';
        let recommendations = [];

        // Assess heat index impact
        if (this.heatIndexData && this.heatIndexData.forecast) {
            const maxTemp = Math.max(...this.heatIndexData.forecast.map(p => p.temperature));

            if (maxTemp > 95) {
                riskLevel = 'HIGH';
                riskColor = '#dc3545';
                recommendations.push('Increase cooling capacity and monitor HVAC systems continuously');
                recommendations.push('Prepare for potential power consumption spikes');
                recommendations.push('Consider load balancing to other facilities if available');
            } else if (maxTemp > 85) {
                riskLevel = 'MODERATE';
                riskColor = '#ffc107';
                recommendations.push('Monitor cooling system efficiency');
                recommendations.push('Review power usage effectiveness (PUE) metrics');
            } else {
                recommendations.push('Maintain standard operating procedures');
                recommendations.push('Continue routine monitoring of environmental systems');
            }
        }

        // Assess air quality impact
        if (this.airQualityData && this.airQualityData.maxAQI) {
            const aqi = this.airQualityData.maxAQI;

            if (aqi > 150) {
                // Unhealthy or worse - upgrade to HIGH risk
                if (riskLevel !== 'HIGH') {
                    riskLevel = 'HIGH';
                    riskColor = '#dc3545';
                }
                recommendations.push('Switch to recirculated air mode if possible to minimize outdoor air intake');
                recommendations.push('Increase air filter inspection frequency');
                recommendations.push('Monitor equipment for particulate contamination');
            } else if (aqi > 100) {
                // Unhealthy for sensitive groups - upgrade to at least MODERATE
                if (riskLevel === 'LOW') {
                    riskLevel = 'MODERATE';
                    riskColor = '#ffc107';
                }
                recommendations.push('Inspect and replace air filters as needed');
                recommendations.push('Monitor air intake systems for increased particulate levels');
            } else if (aqi > 50) {
                // Moderate air quality
                recommendations.push('Ensure air filtration systems are operating properly');
            }
        }

        // Add water-related recommendations
        recommendations.push('Ensure adequate water supply for cooling systems');
        recommendations.push('Monitor water quality to prevent equipment damage');
        recommendations.push('Maintain backup cooling systems');

        let html = `
            <div class="metric-card" style="background: ${riskColor}; color: white; margin-bottom: 20px;">
                <div class="metric-label" style="color: rgba(255,255,255,0.9);">Environmental Risk Level</div>
                <div class="metric-value" style="color: white; font-size: 2.5em;">${riskLevel}</div>
            </div>

            <div class="data-item">
                <strong>Recommendations:</strong>
                <ul style="margin-left: 20px; margin-top: 10px; line-height: 1.8;">
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="data-item" style="margin-top: 15px;">
                <strong>Key Metrics to Monitor:</strong>
                <ul style="margin-left: 20px; margin-top: 10px; line-height: 1.8;">
                    <li>Data center inlet temperature (recommended: 64.4-80.6°F / 18-27°C)</li>
                    <li>Humidity levels (recommended: 40-60% relative humidity)</li>
                    <li>Air Quality Index (AQI) - target < 50 for optimal conditions</li>
                    <li>Air filter differential pressure and replacement schedule</li>
                    <li>Power Usage Effectiveness (PUE) - target < 1.5</li>
                    <li>Water consumption rate and availability</li>
                    <li>Cooling system efficiency</li>
                </ul>
            </div>
        `;

        container.innerHTML = html;
    }

    showLoading() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
        this.hideError();
    }

    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        this.hideLoading();
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
}

// Data Center Manager Class
class DataCenterManager {
    constructor(environmentalTracker) {
        this.tracker = environmentalTracker;
        this.dataCenters = DATA_CENTERS || [];
        this.filteredCenters = this.dataCenters;
        this.results = new Map();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Filters
        document.getElementById('regionFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('operatorFilter').addEventListener('change', () => this.applyFilters());

        // Actions
        document.getElementById('checkAllDataCenters').addEventListener('click', () => this.checkAllDataCenters());
        document.getElementById('exportDataCenters').addEventListener('click', () => this.exportResults());
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = tabName === 'custom' ? 'customTab' : 'datacentersTab';
        document.getElementById(targetTab).classList.add('active');
    }

    applyFilters() {
        const regionFilter = document.getElementById('regionFilter').value;
        const operatorFilter = document.getElementById('operatorFilter').value;

        this.filteredCenters = this.dataCenters.filter(dc => {
            const matchesRegion = regionFilter === 'all' || dc.region === regionFilter;
            const matchesOperator = operatorFilter === 'all' || dc.operator.includes(operatorFilter);
            return matchesRegion && matchesOperator;
        });

        this.displayDataCenters();
    }

    displayDataCenters() {
        const container = document.getElementById('dataCenterList');

        if (this.filteredCenters.length === 0) {
            container.innerHTML = '<p class="no-data">No data centers match the selected filters</p>';
            return;
        }

        let html = `<p style="margin-bottom: 20px; color: #666;">${this.filteredCenters.length} data centers found</p>`;

        this.filteredCenters.forEach(dc => {
            const result = this.results.get(dc.id);

            html += `
                <div class="datacenter-card" data-id="${dc.id}">
                    <div class="datacenter-header">
                        <div class="datacenter-title">
                            <div class="datacenter-name">${dc.name}</div>
                            <div class="datacenter-location">${dc.city}, ${dc.state} - ${dc.region}</div>
                        </div>
                        <span class="datacenter-operator">${dc.operator}</span>
                    </div>

                    <div class="datacenter-info">
                        <div class="info-item"><strong>Type:</strong> ${dc.type}</div>
                        ${dc.capacity ? `<div class="info-item"><strong>Capacity:</strong> ${dc.capacity}</div>` : ''}
                        ${dc.significance ? `<div class="info-item"><strong>Note:</strong> ${dc.significance}</div>` : ''}
                        <div class="info-item"><strong>Coordinates:</strong> ${dc.lat.toFixed(4)}, ${dc.lon.toFixed(4)}</div>
                    </div>

                    <div class="datacenter-status" id="status-${dc.id}">
                        ${result ? this.renderStatus(result) : '<span class="status-badge loading">Not checked</span>'}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderStatus(result) {
        let html = '';

        // Temperature status
        if (result.temperature !== undefined) {
            const tempClass = result.temperature > 95 ? 'high' : result.temperature > 85 ? 'moderate' : 'good';
            html += `<span class="status-badge ${tempClass}">🌡️ ${result.temperature}°F</span>`;
        }

        // AQI status
        if (result.aqi !== undefined) {
            const aqiClass = result.aqi > 150 ? 'high' : result.aqi > 100 ? 'moderate' : 'good';
            html += `<span class="status-badge ${aqiClass}">🌬️ AQI ${result.aqi}</span>`;
        }

        // Overall risk
        if (result.risk) {
            const riskClass = result.risk === 'HIGH' ? 'high' : result.risk === 'MODERATE' ? 'moderate' : 'good';
            html += `<span class="status-badge ${riskClass}">Risk: ${result.risk}</span>`;
        }

        return html || '<span class="status-badge loading">Loading...</span>';
    }

    async checkAllDataCenters() {
        if (this.filteredCenters.length === 0) {
            alert('Please select data centers using the filters');
            return;
        }

        const apiKey = document.getElementById('airnowApiKey').value.trim();
        if (!apiKey) {
            if (!confirm('AirNow API key not provided. Air quality data will not be available. Continue?')) {
                return;
            }
        }

        // Clear previous results
        this.results.clear();

        // Show loading state
        this.displayDataCenters();

        const btn = document.getElementById('checkAllDataCenters');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Checking data centers...';

        try {
            // Check centers in batches to avoid overwhelming the APIs
            const batchSize = 5;
            for (let i = 0; i < this.filteredCenters.length; i += batchSize) {
                const batch = this.filteredCenters.slice(i, i + batchSize);
                await Promise.all(batch.map(dc => this.checkDataCenter(dc)));

                // Update progress
                btn.textContent = `Checking... ${Math.min(i + batchSize, this.filteredCenters.length)}/${this.filteredCenters.length}`;
            }

            btn.textContent = 'Check Complete!';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Error checking data centers:', error);
            alert('Error checking data centers. Please try again.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async checkDataCenter(dc) {
        try {
            // Fetch weather data
            const weatherPromise = fetch(`https://api.weather.gov/points/${dc.lat.toFixed(4)},${dc.lon.toFixed(4)}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data) {
                        return fetch(data.properties.forecast)
                            .then(r => r.ok ? r.json() : null);
                    }
                    return null;
                })
                .catch(() => null);

            // Fetch air quality data if API key provided
            const apiKey = document.getElementById('airnowApiKey').value.trim();
            const aqPromise = apiKey
                ? fetch(`https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${dc.lat}&longitude=${dc.lon}&distance=50&API_KEY=${apiKey}`)
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
                : Promise.resolve(null);

            const [weatherData, aqData] = await Promise.all([weatherPromise, aqPromise]);

            // Process results
            const result = {
                id: dc.id,
                name: dc.name,
                location: `${dc.city}, ${dc.state}`
            };

            if (weatherData && weatherData.properties && weatherData.properties.periods) {
                const temps = weatherData.properties.periods.slice(0, 5).map(p => p.temperature);
                result.temperature = Math.max(...temps);
            }

            if (aqData && Array.isArray(aqData) && aqData.length > 0) {
                result.aqi = Math.max(...aqData.map(obs => obs.AQI));
            }

            // Calculate risk
            let risk = 'LOW';
            if (result.temperature > 95 || result.aqi > 150) {
                risk = 'HIGH';
            } else if (result.temperature > 85 || result.aqi > 100) {
                risk = 'MODERATE';
            }
            result.risk = risk;

            // Store and update display
            this.results.set(dc.id, result);
            this.updateDataCenterStatus(dc.id, result);

        } catch (error) {
            console.error(`Error checking data center ${dc.name}:`, error);
        }
    }

    updateDataCenterStatus(id, result) {
        const statusContainer = document.getElementById(`status-${id}`);
        if (statusContainer) {
            statusContainer.innerHTML = this.renderStatus(result);
        }
    }

    exportResults() {
        if (this.results.size === 0) {
            alert('No data to export. Please check data centers first.');
            return;
        }

        const exportData = Array.from(this.results.values()).map(r => ({
            'Data Center': r.name,
            'Location': r.location,
            'Temperature (°F)': r.temperature || 'N/A',
            'AQI': r.aqi || 'N/A',
            'Risk Level': r.risk
        }));

        // Convert to CSV
        const headers = Object.keys(exportData[0]);
        const csv = [
            headers.join(','),
            ...exportData.map(row => headers.map(h => row[h]).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datacenter-environmental-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const envTracker = new EnvironmentalTracker();
    const dcManager = new DataCenterManager(envTracker);

    // Set default location (Washington, DC)
    document.getElementById('latitude').value = '38.9072';
    document.getElementById('longitude').value = '-77.0369';
});
