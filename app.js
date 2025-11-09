// Main Application Logic
class EnvironmentalTracker {
    constructor() {
        this.heatIndexData = null;
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
            // Fetch both data sources in parallel
            await Promise.all([
                this.fetchHeatIndexData(lat, lon),
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

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EnvironmentalTracker();

    // Set default location (Washington, DC)
    document.getElementById('latitude').value = '38.9072';
    document.getElementById('longitude').value = '-77.0369';
});
