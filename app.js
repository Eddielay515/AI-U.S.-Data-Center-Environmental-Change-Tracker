// Main Application Logic
class EnvironmentalTracker {
    constructor() {
        this.heatIndexData = null;
        this.airQualityData = null;
        this.waterQualityData = null;
        this.carbonData = null;
        this.initializeEventListeners();
        this.initializeCarbonIntensityData();
    }

    // Carbon intensity data by state (pounds CO2 per MWh) - EPA eGRID 2023 estimates
    initializeCarbonIntensityData() {
        this.carbonIntensityByState = {
            'AL': { intensity: 882, rank: 'High', primarySource: 'Natural Gas & Coal' },
            'AK': { intensity: 1256, rank: 'Very High', primarySource: 'Natural Gas & Oil' },
            'AZ': { intensity: 891, rank: 'High', primarySource: 'Natural Gas & Nuclear' },
            'AR': { intensity: 1045, rank: 'High', primarySource: 'Natural Gas & Coal' },
            'CA': { intensity: 435, rank: 'Low', primarySource: 'Natural Gas & Renewables' },
            'CO': { intensity: 1547, rank: 'Very High', primarySource: 'Coal & Natural Gas' },
            'CT': { intensity: 589, rank: 'Moderate', primarySource: 'Natural Gas & Nuclear' },
            'DE': { intensity: 1178, rank: 'High', primarySource: 'Natural Gas' },
            'FL': { intensity: 893, rank: 'High', primarySource: 'Natural Gas' },
            'GA': { intensity: 985, rank: 'High', primarySource: 'Natural Gas & Coal' },
            'HI': { intensity: 1523, rank: 'Very High', primarySource: 'Oil & Coal' },
            'ID': { intensity: 178, rank: 'Very Low', primarySource: 'Hydroelectric' },
            'IL': { intensity: 768, rank: 'Moderate', primarySource: 'Nuclear & Coal' },
            'IN': { intensity: 1789, rank: 'Very High', primarySource: 'Coal' },
            'IA': { intensity: 1245, rank: 'High', primarySource: 'Wind & Coal' },
            'KS': { intensity: 1456, rank: 'Very High', primarySource: 'Coal & Wind' },
            'KY': { intensity: 1867, rank: 'Very High', primarySource: 'Coal' },
            'LA': { intensity: 998, rank: 'High', primarySource: 'Natural Gas' },
            'ME': { intensity: 445, rank: 'Low', primarySource: 'Renewables & Natural Gas' },
            'MD': { intensity: 1045, rank: 'High', primarySource: 'Natural Gas & Nuclear' },
            'MA': { intensity: 678, rank: 'Moderate', primarySource: 'Natural Gas' },
            'MI': { intensity: 1234, rank: 'High', primarySource: 'Coal & Natural Gas' },
            'MN': { intensity: 1089, rank: 'High', primarySource: 'Coal & Wind' },
            'MS': { intensity: 987, rank: 'High', primarySource: 'Natural Gas' },
            'MO': { intensity: 1678, rank: 'Very High', primarySource: 'Coal' },
            'MT': { intensity: 1345, rank: 'Very High', primarySource: 'Coal' },
            'NE': { intensity: 1567, rank: 'Very High', primarySource: 'Coal & Wind' },
            'NV': { intensity: 967, rank: 'High', primarySource: 'Natural Gas' },
            'NH': { intensity: 456, rank: 'Low', primarySource: 'Nuclear & Natural Gas' },
            'NJ': { intensity: 634, rank: 'Moderate', primarySource: 'Natural Gas & Nuclear' },
            'NM': { intensity: 1245, rank: 'High', primarySource: 'Coal & Natural Gas' },
            'NY': { intensity: 512, rank: 'Low', primarySource: 'Natural Gas & Nuclear' },
            'NC': { intensity: 845, rank: 'Moderate', primarySource: 'Natural Gas & Nuclear' },
            'ND': { intensity: 1789, rank: 'Very High', primarySource: 'Coal & Wind' },
            'OH': { intensity: 1456, rank: 'Very High', primarySource: 'Coal & Natural Gas' },
            'OK': { intensity: 1234, rank: 'High', primarySource: 'Natural Gas & Wind' },
            'OR': { intensity: 289, rank: 'Very Low', primarySource: 'Hydroelectric' },
            'PA': { intensity: 987, rank: 'High', primarySource: 'Natural Gas & Nuclear' },
            'RI': { intensity: 789, rank: 'Moderate', primarySource: 'Natural Gas' },
            'SC': { intensity: 756, rank: 'Moderate', primarySource: 'Nuclear & Natural Gas' },
            'SD': { intensity: 876, rank: 'Moderate', primarySource: 'Hydroelectric & Coal' },
            'TN': { intensity: 898, rank: 'Moderate', primarySource: 'Natural Gas & Nuclear' },
            'TX': { intensity: 1123, rank: 'High', primarySource: 'Natural Gas & Wind' },
            'UT': { intensity: 1678, rank: 'Very High', primarySource: 'Coal' },
            'VT': { intensity: 23, rank: 'Very Low', primarySource: 'Renewables & Nuclear' },
            'VA': { intensity: 867, rank: 'Moderate', primarySource: 'Natural Gas & Nuclear' },
            'WA': { intensity: 234, rank: 'Very Low', primarySource: 'Hydroelectric' },
            'WV': { intensity: 1945, rank: 'Very High', primarySource: 'Coal' },
            'WI': { intensity: 1234, rank: 'High', primarySource: 'Coal & Natural Gas' },
            'WY': { intensity: 1889, rank: 'Very High', primarySource: 'Coal' },
            'DC': { intensity: 512, rank: 'Low', primarySource: 'Natural Gas' }
        };
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

            // Fetch carbon data after location is determined from heat index
            this.fetchCarbonData();

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
            // Using Open-Meteo Air Quality API (no API key required)
            const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&hourly=us_aqi&timezone=America/New_York`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Unable to fetch air quality data');
            }

            const data = await response.json();

            // Extract current air quality data
            this.airQualityData = {
                aqi: data.current.us_aqi || 0,
                pm10: data.current.pm10 || 0,
                pm2_5: data.current.pm2_5 || 0,
                carbon_monoxide: data.current.carbon_monoxide || 0,
                nitrogen_dioxide: data.current.nitrogen_dioxide || 0,
                sulphur_dioxide: data.current.sulphur_dioxide || 0,
                ozone: data.current.ozone || 0,
                dust: data.current.dust || 0,
                units: data.current_units,
                timestamp: data.current.time,
                available: true
            };

            // Get AQI category
            this.airQualityData.category = this.getAQICategory(this.airQualityData.aqi);

        } catch (error) {
            console.error('Error fetching air quality data:', error);
            this.airQualityData = {
                error: error.message,
                available: false,
                message: 'Air quality data temporarily unavailable'
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

    fetchCarbonData() {
        try {
            // Extract state from heat index data
            if (this.heatIndexData && this.heatIndexData.location) {
                const locationParts = this.heatIndexData.location.split(', ');
                const state = locationParts[locationParts.length - 1];

                const stateData = this.carbonIntensityByState[state];

                if (stateData) {
                    this.carbonData = {
                        state: state,
                        intensity: stateData.intensity,
                        rank: stateData.rank,
                        primarySource: stateData.primarySource,
                        unit: 'lbs CO₂/MWh',
                        available: true,
                        note: 'Regional carbon intensity based on EPA eGRID 2023 data'
                    };

                    // Calculate estimated annual emissions for a typical data center
                    // Assuming 10 MW average power consumption
                    const annualMWh = 10 * 24 * 365; // 87,600 MWh/year
                    const annualCO2Tons = (stateData.intensity * annualMWh) / 2000; // Convert lbs to tons

                    this.carbonData.estimatedDataCenterEmissions = {
                        annual: Math.round(annualCO2Tons).toLocaleString(),
                        unit: 'tons CO₂/year',
                        assumption: '10 MW data center'
                    };
                } else {
                    this.carbonData = {
                        error: 'State data not available',
                        available: false
                    };
                }
            } else {
                this.carbonData = {
                    error: 'Location not determined',
                    available: false
                };
            }
        } catch (error) {
            console.error('Error fetching carbon data:', error);
            this.carbonData = {
                error: error.message,
                available: false
            };
        }
    }

    displayResults() {
        document.getElementById('results').classList.remove('hidden');

        this.displayHeatIndexData();
        this.displayAirQualityData();
        this.displayCarbonData();
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

        if (!this.airQualityData || !this.airQualityData.available) {
            const message = this.airQualityData?.message || 'No air quality data available';
            container.innerHTML = `
                <div class="warning">
                    <strong>Note:</strong> ${message}
                </div>
            `;
            return;
        }

        const aqi = Math.round(this.airQualityData.aqi);
        const category = this.airQualityData.category;

        let html = `
            <div class="data-item">
                <strong>Last Updated:</strong> ${new Date(this.airQualityData.timestamp).toLocaleString()}
            </div>

            <div class="aqi-display" style="background: ${category.color}; color: ${aqi <= 100 ? '#000' : '#fff'}; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <div style="font-size: 1.2em; font-weight: 600; margin-bottom: 10px;">Air Quality Index (AQI)</div>
                <div style="font-size: 3.5em; font-weight: 700; margin: 10px 0;">${aqi}</div>
                <div style="font-size: 1.5em; font-weight: 600; margin-bottom: 10px;">${category.name}</div>
                <div style="font-size: 0.95em; margin-top: 15px; line-height: 1.6;">${category.healthMessage}</div>
            </div>
        `;

        // Display all pollutant readings
        html += '<div class="data-item" style="margin-top: 20px;"><strong>Pollutant Measurements:</strong><div class="metric-grid" style="margin-top: 15px;">';

        const pollutants = [
            { name: 'PM2.5', value: this.airQualityData.pm2_5, unit: 'µg/m³', threshold: 35 },
            { name: 'PM10', value: this.airQualityData.pm10, unit: 'µg/m³', threshold: 154 },
            { name: 'Ozone (O₃)', value: this.airQualityData.ozone, unit: 'µg/m³', threshold: 140 },
            { name: 'NO₂', value: this.airQualityData.nitrogen_dioxide, unit: 'µg/m³', threshold: 100 },
            { name: 'SO₂', value: this.airQualityData.sulphur_dioxide, unit: 'µg/m³', threshold: 75 },
            { name: 'CO', value: this.airQualityData.carbon_monoxide, unit: 'µg/m³', threshold: 10000 }
        ];

        pollutants.forEach(pollutant => {
            const value = pollutant.value.toFixed(1);
            const status = pollutant.value > pollutant.threshold ? 'high' : pollutant.value > pollutant.threshold * 0.5 ? 'moderate' : 'good';
            const statusColor = status === 'high' ? '#dc3545' : status === 'moderate' ? '#ffc107' : '#28a745';

            html += `
                <div class="metric-card" style="border-left: 4px solid ${statusColor};">
                    <div class="metric-label">${pollutant.name}</div>
                    <div class="metric-value" style="color: ${statusColor};">${value}</div>
                    <div style="font-size: 0.85em; color: #666; margin-top: 5px;">${pollutant.unit}</div>
                </div>
            `;
        });

        html += '</div></div>';

        // Add data center impact warnings based on AQI
        if (aqi > 150) {
            html += `
                <div class="alert">
                    <strong>⚠️ Air Quality Alert for Data Centers:</strong>
                    Unhealthy air quality detected. Poor air quality may affect air filtration systems and increase the risk of
                    particulate contamination in cooling systems. Monitor air intake filters and
                    consider increasing filtration or switching to recirculated air if possible.
                </div>
            `;
        } else if (aqi > 100) {
            html += `
                <div class="warning">
                    <strong>⚡ Air Quality Notice:</strong>
                    Moderate to unhealthy air quality detected. Ensure air filtration systems are functioning
                    properly to prevent dust and particulate buildup in data center equipment.
                </div>
            `;
        } else if (aqi > 50) {
            html += `
                <div class="warning">
                    <strong>ℹ️ Air Quality Advisory:</strong>
                    Moderate air quality. Maintain standard air filtration monitoring procedures.
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

    displayCarbonData() {
        const container = document.getElementById('carbonData');

        if (!this.carbonData || !this.carbonData.available) {
            container.innerHTML = `
                <div class="warning">
                    <strong>Note:</strong> ${this.carbonData?.error || 'Carbon emissions data not available'}
                </div>
            `;
            return;
        }

        const rankColor = {
            'Very Low': '#28a745',
            'Low': '#5cb85c',
            'Moderate': '#ffc107',
            'High': '#ff8c00',
            'Very High': '#dc3545'
        }[this.carbonData.rank] || '#6c757d';

        let html = `
            <div class="data-item">
                <strong>Region:</strong> ${this.carbonData.state}
            </div>
            <div class="data-item">
                <strong>Data Source:</strong> ${this.carbonData.note}
            </div>

            <div style="background: linear-gradient(135deg, ${rankColor}15, ${rankColor}05); border-left: 4px solid ${rankColor}; padding: 25px; border-radius: 12px; margin: 20px 0;">
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Carbon Intensity</div>
                        <div class="metric-value" style="color: ${rankColor};">${this.carbonData.intensity}</div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 5px;">${this.carbonData.unit}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Regional Rank</div>
                        <div class="metric-value" style="color: ${rankColor}; font-size: 1.8em;">${this.carbonData.rank}</div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 5px;">Emissions Level</div>
                    </div>
                </div>
            </div>

            <div class="data-item">
                <strong>Primary Energy Sources:</strong> ${this.carbonData.primarySource}
            </div>
        `;

        // Display estimated data center emissions
        if (this.carbonData.estimatedDataCenterEmissions) {
            html += `
                <div class="data-item" style="margin-top: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <strong>Estimated Annual Data Center Emissions:</strong>
                    <div style="margin-top: 15px;">
                        <div style="font-size: 2em; font-weight: 700; color: ${rankColor}; margin: 10px 0;">
                            ${this.carbonData.estimatedDataCenterEmissions.annual} ${this.carbonData.estimatedDataCenterEmissions.unit}
                        </div>
                        <div style="font-size: 0.9em; color: #666;">
                            Based on ${this.carbonData.estimatedDataCenterEmissions.assumption}
                        </div>
                    </div>
                </div>
            `;
        }

        // Add carbon impact recommendations
        if (this.carbonData.rank === 'Very High' || this.carbonData.rank === 'High') {
            html += `
                <div class="alert">
                    <strong>⚠️ High Carbon Intensity Region:</strong>
                    This region has ${this.carbonData.rank.toLowerCase()} carbon intensity. Consider:
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>Implementing renewable energy procurement (PPAs or RECs)</li>
                        <li>Optimizing workload scheduling to off-peak hours</li>
                        <li>Improving power usage effectiveness (PUE)</li>
                        <li>Considering geographic load distribution to lower-carbon regions</li>
                    </ul>
                </div>
            `;
        } else if (this.carbonData.rank === 'Moderate') {
            html += `
                <div class="warning">
                    <strong>ℹ️ Moderate Carbon Intensity:</strong>
                    Continue monitoring carbon emissions and consider renewable energy options to reduce environmental impact.
                </div>
            `;
        } else {
            html += `
                <div class="good">
                    <strong>✓ Low Carbon Intensity Region:</strong>
                    This region benefits from cleaner energy sources. Maintain current operations and continue
                    optimizing for energy efficiency to maximize environmental benefits.
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
            const aqiClass = result.aqi > 150 ? 'high' : result.aqi > 100 ? 'moderate' : result.aqi > 50 ? 'moderate' : 'good';
            html += `<span class="status-badge ${aqiClass}">🌬️ AQI ${result.aqi}</span>`;
        }

        // PM2.5 status
        if (result.pm25 && result.pm25 !== 'N/A') {
            const pm25Value = parseFloat(result.pm25);
            const pm25Class = pm25Value > 35 ? 'high' : pm25Value > 12 ? 'moderate' : 'good';
            html += `<span class="status-badge ${pm25Class}">💨 PM2.5: ${result.pm25}</span>`;
        }

        // Carbon intensity status
        if (result.carbonIntensity !== undefined) {
            const carbonClass = result.carbonRank === 'Very High' || result.carbonRank === 'High' ? 'high' :
                               result.carbonRank === 'Moderate' ? 'moderate' : 'good';
            html += `<span class="status-badge ${carbonClass}">⚡ ${result.carbonIntensity} lbs CO₂/MWh</span>`;
        }

        // Overall risk
        if (result.risk) {
            const riskClass = result.risk === 'HIGH' ? 'high' : result.risk === 'MODERATE' ? 'moderate' : 'good';
            html += `<span class="status-badge ${riskClass}">📊 Risk: ${result.risk}</span>`;
        }

        return html || '<span class="status-badge loading">Loading...</span>';
    }

    async checkAllDataCenters() {
        if (this.filteredCenters.length === 0) {
            alert('Please select data centers using the filters');
            return;
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
            // Fetch weather and air quality data in parallel
            const [weatherData, airQualityData] = await Promise.all([
                // Weather data
                fetch(`https://api.weather.gov/points/${dc.lat.toFixed(4)},${dc.lon.toFixed(4)}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        if (data) {
                            return fetch(data.properties.forecast)
                                .then(r => r.ok ? r.json() : null);
                        }
                        return null;
                    })
                    .catch(() => null),
                // Air quality data
                fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${dc.lat.toFixed(4)}&longitude=${dc.lon.toFixed(4)}&current=us_aqi,pm10,pm2_5&timezone=America/New_York`)
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            ]);

            // Process results
            const result = {
                id: dc.id,
                name: dc.name,
                location: `${dc.city}, ${dc.state}`,
                state: dc.state
            };

            // Extract temperature
            if (weatherData && weatherData.properties && weatherData.properties.periods) {
                const temps = weatherData.properties.periods.slice(0, 5).map(p => p.temperature);
                result.temperature = Math.max(...temps);
            }

            // Extract air quality
            if (airQualityData && airQualityData.current) {
                result.aqi = Math.round(airQualityData.current.us_aqi || 0);
                result.pm25 = airQualityData.current.pm2_5 ? airQualityData.current.pm2_5.toFixed(1) : 'N/A';
                result.pm10 = airQualityData.current.pm10 ? airQualityData.current.pm10.toFixed(1) : 'N/A';
            }

            // Add carbon intensity data
            const carbonData = this.tracker.carbonIntensityByState[dc.state];
            if (carbonData) {
                result.carbonIntensity = carbonData.intensity;
                result.carbonRank = carbonData.rank;
            }

            // Calculate risk based on temperature and air quality
            let risk = 'LOW';
            if (result.temperature > 95 || (result.aqi && result.aqi > 150)) {
                risk = 'HIGH';
            } else if (result.temperature > 85 || (result.aqi && result.aqi > 100)) {
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
            'State': r.state || 'N/A',
            'Temperature (°F)': r.temperature || 'N/A',
            'AQI': r.aqi || 'N/A',
            'PM2.5 (µg/m³)': r.pm25 || 'N/A',
            'PM10 (µg/m³)': r.pm10 || 'N/A',
            'Carbon Intensity (lbs CO₂/MWh)': r.carbonIntensity || 'N/A',
            'Carbon Rank': r.carbonRank || 'N/A',
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
