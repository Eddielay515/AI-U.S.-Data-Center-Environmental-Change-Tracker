# 🌡️ U.S. Data Center Environmental Change Tracker

A web application that monitors environmental conditions affecting data center operations by integrating real-time heat index data from NOAA and water quality information from the EPA.

## 📋 Overview

This tool helps data center operators and facilities managers assess environmental risks by tracking:
- **Heat Index**: Real-time temperature and weather forecasts from NOAA's Weather.gov API
- **Water Quality**: Information from EPA's water quality monitoring systems
- **Risk Assessment**: Automated evaluation of environmental impact on data center operations

## 🚀 Features

- **Real-time Weather Data**: Access to NOAA's latest heat index and temperature forecasts
- **EPA Water Quality Integration**: Links to detailed water quality data via EPA's How's My Waterway
- **Location-Based Search**: Search by coordinates or use your current location
- **Risk Assessment**: Automated environmental impact analysis for data center operations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive UI**: Clean, modern interface with visual risk indicators

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **APIs**:
  - NOAA Weather.gov API (api.weather.gov)
  - EPA ATTAINS Water Quality Services
- **No Backend Required**: Runs entirely in the browser

## 📦 Installation & Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API access

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

### Searching by Coordinates

1. Enter latitude and longitude values in the input fields
2. Click "Get Environmental Data" to fetch information
3. View heat index, water quality, and risk assessment results

### Using Current Location

1. Click "Use Current Location"
2. Allow browser location access when prompted
3. Data will be automatically fetched for your location

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

### Data Center Considerations
- Cooling system efficiency
- Power Usage Effectiveness (PUE)
- Water availability for cooling
- HVAC load management

## 🏗️ Project Structure

```
AI-U.S.-Data-Center-Environmental-Change-Tracker/
├── index.html          # Main HTML page
├── styles.css          # Styling and responsive design
├── app.js              # Application logic and API integration
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 🔧 Development

### Modifying the Application

1. **HTML (index.html)**: Update page structure and layout
2. **CSS (styles.css)**: Modify styling, colors, and responsive breakpoints
3. **JavaScript (app.js)**: Enhance functionality, add new APIs, or modify data processing

### Key JavaScript Classes

- `EnvironmentalTracker`: Main application class
  - `fetchHeatIndexData()`: Retrieves NOAA weather data
  - `fetchWaterQualityData()`: Accesses EPA water quality information
  - `displayResults()`: Renders data to the UI
  - `displayImpactAssessment()`: Calculates and shows risk levels

## 🌐 API Integration Details

### NOAA Weather.gov API Flow

1. Request grid point metadata: `GET /points/{lat},{lon}`
2. Extract forecast URL from response
3. Fetch forecast data from grid-specific endpoint
4. Parse temperature, heat index, and forecast periods

### EPA Water Quality Flow

1. Provides links to EPA's How's My Waterway
2. Direct API access is limited due to CORS and authentication
3. Users redirected to official EPA tools for detailed water data

## ⚠️ Limitations

- EPA water quality data requires visiting How's My Waterway website for detailed information
- NOAA data is limited to U.S. locations
- API rate limits may apply (NOAA Weather.gov is generally unlimited for reasonable use)
- Browser geolocation requires HTTPS in production environments

## 🔐 Privacy & Security

- No user data is stored or transmitted to third parties
- All API calls are made directly from the browser
- Location data is only used for API queries and not persisted
- No authentication or user accounts required

## 📊 Data Center Best Practices

### Recommended Monitoring

- **Temperature**: Maintain inlet temperatures between 64.4-80.6°F (18-27°C)
- **Humidity**: Keep relative humidity between 40-60%
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
