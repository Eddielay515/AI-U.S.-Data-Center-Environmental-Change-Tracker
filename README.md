# 🌡️ U.S. Data Center Environmental Change Tracker

A web application that monitors environmental conditions affecting data center operations by integrating real-time heat index data from NOAA, air quality data from AirNow.gov, and water quality information from the EPA.

## 📋 Overview

This tool helps data center operators and facilities managers assess environmental risks by tracking:
- **Heat Index**: Real-time temperature and weather forecasts from NOAA's Weather.gov API
- **Air Quality**: Current Air Quality Index (AQI) and pollutant levels from AirNow.gov
- **Water Quality**: Information from EPA's water quality monitoring systems
- **Data Center Tracking**: Monitor 30+ major AI and hyperscale data centers across the United States
- **Risk Assessment**: Automated evaluation of environmental impact on data center operations

## 🚀 Features

### Environmental Monitoring
- **Real-time Weather Data**: Access to NOAA's latest heat index and temperature forecasts
- **Air Quality Monitoring**: Live AQI data with color-coded categories (Good, Moderate, Unhealthy, etc.)
- **Pollutant Tracking**: Monitor specific pollutants including PM2.5, PM10, Ozone, and more
- **EPA Water Quality Integration**: Links to detailed water quality data via EPA's How's My Waterway
- **Location-Based Search**: Search by coordinates or use your current location
- **Risk Assessment**: Automated environmental impact analysis for data center operations

### Data Center Tracking
- **30+ Major Data Centers**: Pre-configured database of AI and hyperscale facilities
- **Company Coverage**: Google, Microsoft Azure, Amazon AWS, Meta, and DOE federal sites
- **Geographic Regions**: Coverage across all major U.S. data center markets
- **Batch Monitoring**: Check environmental conditions for multiple data centers simultaneously
- **Smart Filtering**: Filter by region (Northern Virginia, West Coast, etc.) or operator
- **Live Status Updates**: Real-time temperature, AQI, and risk level for each facility
- **CSV Export**: Download comprehensive environmental reports for all monitored sites

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive UI**: Clean, modern interface with visual risk indicators
- **Tabbed Interface**: Switch between custom location search and data center list view

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **APIs**:
  - NOAA Weather.gov API (api.weather.gov)
  - AirNow.gov API (airnowapi.org)
  - EPA ATTAINS Water Quality Services
- **No Backend Required**: Runs entirely in the browser

## 📦 Installation & Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API access
- AirNow API key (free) - Get yours at [docs.airnowapi.org](https://docs.airnowapi.org/)
  - Optional but recommended for air quality data

### Quick Start

1. **Clone or download this repository**

2. **Open the application**:
   - Simply open `index.html` in your web browser
   - Or use a local web server:
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js http-server
     npx http-server
     ```

3. **Access the application**:
   - If using a web server, navigate to `http://localhost:8000`
   - Otherwise, just double-click `index.html`

## 📖 Usage

### Setting Up Air Quality Data

1. Get a free API key from [docs.airnowapi.org](https://docs.airnowapi.org/)
2. Enter your API key in the "AirNow API Key" field (optional but recommended)
3. The API key will be used for this session only and is not stored

### Searching by Coordinates

1. Enter latitude and longitude values in the input fields
2. (Optional) Enter your AirNow API key to enable air quality data
3. Click "Get Environmental Data" to fetch information
4. View heat index, air quality, water quality, and risk assessment results

### Using Current Location

1. Click "Use Current Location"
2. Allow browser location access when prompted
3. Data will be automatically fetched for your location

### Monitoring Data Centers

1. Click the **"Data Center List"** tab at the top of the page
2. Use the filters to select data centers:
   - **Region Filter**: Choose from Northern Virginia, West Coast, Pacific Northwest, etc.
   - **Operator Filter**: Select Google, Microsoft, Amazon, Meta, or other operators
3. Click **"Check All Data Centers"** to begin monitoring
   - The system will check environmental conditions in batches of 5
   - Progress will be displayed during the check
   - Results update in real-time for each data center
4. View the results:
   - **Temperature**: Maximum forecasted temperature (next 5 periods)
   - **AQI**: Current Air Quality Index
   - **Risk Level**: Overall environmental risk (LOW/MODERATE/HIGH)
5. Click **"Export Results"** to download a CSV report

**Featured Data Centers Include:**
- **Ashburn, VA**: Data Center Capital of the World (AWS, Microsoft, Google, Meta)
- **Google Council Bluffs, IA**: Large hyperscale facility
- **Microsoft Quincy, WA**: Pacific Northwest hyperscale center
- **Meta Prineville, OR**: Major Facebook data center
- **DOE Argonne National Laboratory, IL**: Planned 1000 MW AI data park
- And 25+ more across the United States

### Example Locations

- **Washington, DC**: Latitude `38.9072`, Longitude `-77.0369`
- **Silicon Valley**: Latitude `37.3861`, Longitude `-122.0839`
- **Dallas, TX**: Latitude `32.7767`, Longitude `-96.7970`

## 🌊 Data Sources

### NOAA Weather.gov API

- Provides real-time weather forecasts and temperature data
- Includes heat index calculations and warnings
- API Documentation: https://www.weather.gov/documentation/services-web-api
- No API key required

### AirNow.gov API

- Real-time Air Quality Index (AQI) data from over 2,500 monitoring stations
- Tracks major pollutants: PM2.5, PM10, Ozone, CO, SO2, NO2
- Color-coded AQI categories from Good (0-50) to Hazardous (301+)
- API Documentation: https://docs.airnowapi.org/
- Free API key required (500 requests/hour limit)
- Updated hourly with current observations

### EPA Water Quality Data

- ATTAINS (Assessment, TMDL Tracking and Implementation System)
- How's My Waterway integration
- Documentation: https://www.epa.gov/waterdata/attains
- Note: Direct API access is limited; the app provides links to EPA's interactive tools

## 🎯 Environmental Risk Assessment

The application evaluates environmental conditions based on:

### Temperature Thresholds
- **HIGH RISK** (>95°F): Significant impact on cooling systems
- **MODERATE RISK** (85-95°F): Increased monitoring recommended
- **LOW RISK** (<85°F): Normal operating conditions

### Air Quality Thresholds
- **GOOD** (0-50 AQI): Optimal for data center operations
- **MODERATE** (51-100 AQI): Monitor air filtration systems
- **UNHEALTHY FOR SENSITIVE GROUPS** (101-150 AQI): Increase filter inspections
- **UNHEALTHY** (151-200 AQI): Upgrade to HIGH risk, consider recirculated air
- **VERY UNHEALTHY/HAZARDOUS** (201+ AQI): Critical air quality conditions

### Data Center Considerations
- Cooling system efficiency
- Air filtration and particulate contamination
- Power Usage Effectiveness (PUE)
- Water availability for cooling
- HVAC load management

## 🏗️ Project Structure

```
AI-U.S.-Data-Center-Environmental-Change-Tracker/
├── index.html          # Main HTML page with tabs and data center list
├── styles.css          # Styling, responsive design, and data center cards
├── app.js              # Application logic, API integration, and DataCenterManager
├── datacenters.js      # Database of 30+ major AI/hyperscale data centers
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 🔧 Development

### Modifying the Application

1. **HTML (index.html)**: Update page structure and layout
2. **CSS (styles.css)**: Modify styling, colors, and responsive breakpoints
3. **JavaScript (app.js)**: Enhance functionality, add new APIs, or modify data processing

### Key JavaScript Classes

- `EnvironmentalTracker`: Main application class for custom location monitoring
  - `fetchHeatIndexData()`: Retrieves NOAA weather data
  - `fetchAirQualityData()`: Fetches AirNow AQI and pollutant data
  - `fetchWaterQualityData()`: Accesses EPA water quality information
  - `displayResults()`: Renders data to the UI
  - `displayAirQualityData()`: Shows AQI with color-coded categories
  - `displayImpactAssessment()`: Calculates and shows risk levels
  - `getAQICategory()`: Determines AQI category and health message

- `DataCenterManager`: Data center monitoring and tracking class
  - `applyFilters()`: Filters data centers by region and operator
  - `displayDataCenters()`: Renders data center cards with status
  - `checkAllDataCenters()`: Batch checks environmental conditions
  - `checkDataCenter()`: Fetches weather and AQI for a single facility
  - `exportResults()`: Generates CSV report of monitoring results
  - `switchTab()`: Handles tab navigation between custom and data center views

## 🌐 API Integration Details

### NOAA Weather.gov API Flow

1. Request grid point metadata: `GET /points/{lat},{lon}`
2. Extract forecast URL from response
3. Fetch forecast data from grid-specific endpoint
4. Parse temperature, heat index, and forecast periods

### AirNow API Flow

1. User provides API key in the interface
2. Request current observations: `GET /aq/observation/latLong/current/`
3. Parameters: latitude, longitude, distance (50 miles), API key
4. Parse AQI values for all pollutants (PM2.5, PM10, O3, etc.)
5. Determine highest AQI (primary pollutant) and category
6. Display color-coded results with health messages

### EPA Water Quality Flow

1. Provides links to EPA's How's My Waterway
2. Direct API access is limited due to CORS and authentication
3. Users redirected to official EPA tools for detailed water data

## ⚠️ Limitations

- **AirNow API**: Requires free API key registration (500 requests/hour limit)
- **EPA water quality data**: Requires visiting How's My Waterway website for detailed information
- **Geographic coverage**: NOAA and AirNow data limited to U.S. locations
- **Data availability**: AirNow monitoring stations may not be available in all areas (50-mile search radius)
- **Browser requirements**: Geolocation requires HTTPS in production environments

## 🔐 Privacy & Security

- No user data is stored or transmitted to third parties
- All API calls are made directly from the browser
- AirNow API key is used in-session only and not stored permanently
- Location data is only used for API queries and not persisted
- No authentication or user accounts required

## 📊 Data Center Best Practices

### Recommended Monitoring

- **Temperature**: Maintain inlet temperatures between 64.4-80.6°F (18-27°C)
- **Humidity**: Keep relative humidity between 40-60%
- **Air Quality**: Target AQI below 50 for optimal conditions
- **Air Filtration**: Monitor filter differential pressure and replacement schedules
- **Particulate Levels**: Track dust and particulate contamination in cooling systems
- **PUE**: Target Power Usage Effectiveness below 1.5
- **Water Quality**: Monitor for scaling and corrosion indicators
- **Cooling Efficiency**: Track chiller performance and efficiency metrics

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available for educational and commercial use.

## 🙏 Acknowledgments

- **NOAA**: National Oceanic and Atmospheric Administration for weather data
- **EPA**: Environmental Protection Agency for water quality information
- Data center best practices based on ASHRAE guidelines

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Consult NOAA API documentation: https://www.weather.gov/documentation/services-web-api
- Visit EPA's How's My Waterway: https://mywaterway.epa.gov/

## 🔮 Future Enhancements

Potential features for future development:
- Historical data analysis and trends
- Integration with additional environmental APIs
- Alerts and notifications system
- Data export functionality (CSV, JSON)
- Multi-location comparison dashboard
- Integration with data center monitoring systems
- Power consumption predictions
- Carbon footprint calculations

---

**Disclaimer**: This tool is for informational purposes only. Data center operators should consult official sources and expert guidance for operational decisions.
