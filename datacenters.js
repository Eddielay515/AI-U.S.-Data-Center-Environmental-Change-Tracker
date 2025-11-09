// Major AI and Hyperscale Data Center Locations in the United States
// Data compiled from industry sources, company announcements, and federal sites

const DATA_CENTERS = [
    // Northern Virginia - "Data Center Alley"
    {
        id: 1,
        name: "Ashburn Data Center Cluster",
        operator: "Multiple (AWS, Microsoft, Google, Meta)",
        city: "Ashburn",
        state: "VA",
        region: "Northern Virginia",
        lat: 39.0438,
        lon: -77.4874,
        type: "Hyperscale Cluster",
        capacity: "6000+ MW",
        significance: "Data Center Capital of the World"
    },
    {
        id: 2,
        name: "Loudoun County Data Centers",
        operator: "Multiple Providers",
        city: "Loudoun County",
        state: "VA",
        region: "Northern Virginia",
        lat: 39.0833,
        lon: -77.6472,
        type: "Hyperscale Cluster",
        capacity: "6000+ MW",
        significance: "Largest concentration in US"
    },

    // Google Data Centers
    {
        id: 3,
        name: "Google Council Bluffs",
        operator: "Google",
        city: "Council Bluffs",
        state: "IA",
        region: "Midwest",
        lat: 41.2619,
        lon: -95.8608,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 4,
        name: "Google Moncks Corner",
        operator: "Google",
        city: "Moncks Corner",
        state: "SC",
        region: "Southeast",
        lat: 33.1960,
        lon: -80.0131,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 5,
        name: "Google Dallas",
        operator: "Google",
        city: "Dallas",
        state: "TX",
        region: "South Central",
        lat: 32.7767,
        lon: -96.7970,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 6,
        name: "Google The Dalles",
        operator: "Google",
        city: "The Dalles",
        state: "OR",
        region: "Pacific Northwest",
        lat: 45.5946,
        lon: -121.1787,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 7,
        name: "Google Los Angeles",
        operator: "Google",
        city: "Los Angeles",
        state: "CA",
        region: "West Coast",
        lat: 34.0522,
        lon: -118.2437,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 8,
        name: "Google Lenoir",
        operator: "Google",
        city: "Lenoir",
        state: "NC",
        region: "Southeast",
        lat: 35.9140,
        lon: -81.5390,
        type: "Hyperscale",
        capacity: "Large"
    },

    // Microsoft Data Centers
    {
        id: 9,
        name: "Microsoft West Des Moines",
        operator: "Microsoft Azure",
        city: "West Des Moines",
        state: "IA",
        region: "Midwest",
        lat: 41.5772,
        lon: -93.7114,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 10,
        name: "Microsoft Quincy",
        operator: "Microsoft Azure",
        city: "Quincy",
        state: "WA",
        region: "Pacific Northwest",
        lat: 47.2340,
        lon: -119.8528,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 11,
        name: "Microsoft Boydton",
        operator: "Microsoft Azure",
        city: "Boydton",
        state: "VA",
        region: "Mid-Atlantic",
        lat: 36.6665,
        lon: -78.3878,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 12,
        name: "Microsoft San Antonio",
        operator: "Microsoft Azure",
        city: "San Antonio",
        state: "TX",
        region: "South Central",
        lat: 29.4241,
        lon: -98.4936,
        type: "Hyperscale",
        capacity: "Large"
    },

    // Amazon AWS Data Centers
    {
        id: 13,
        name: "AWS Boardman",
        operator: "Amazon AWS",
        city: "Boardman",
        state: "OR",
        region: "Pacific Northwest",
        lat: 45.8398,
        lon: -119.7006,
        type: "Hyperscale",
        capacity: "Large"
    },

    // Meta (Facebook) Data Centers
    {
        id: 14,
        name: "Meta Los Lunas",
        operator: "Meta (Facebook)",
        city: "Los Lunas",
        state: "NM",
        region: "Southwest",
        lat: 34.8064,
        lon: -106.7333,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 15,
        name: "Meta Prineville",
        operator: "Meta (Facebook)",
        city: "Prineville",
        state: "OR",
        region: "Pacific Northwest",
        lat: 44.2999,
        lon: -120.8342,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 16,
        name: "Meta Forest City",
        operator: "Meta (Facebook)",
        city: "Forest City",
        state: "NC",
        region: "Southeast",
        lat: 35.3343,
        lon: -81.8651,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 17,
        name: "Meta New Albany",
        operator: "Meta (Facebook)",
        city: "New Albany",
        state: "OH",
        region: "Midwest",
        lat: 40.0809,
        lon: -82.8088,
        type: "Hyperscale",
        capacity: "Large"
    },
    {
        id: 18,
        name: "Meta Mesa",
        operator: "Meta (Facebook)",
        city: "Mesa",
        state: "AZ",
        region: "Southwest",
        lat: 33.4152,
        lon: -111.8315,
        type: "Hyperscale",
        capacity: "Large"
    },

    // Major Metro Markets
    {
        id: 19,
        name: "Phoenix Data Center Market",
        operator: "Multiple Providers",
        city: "Phoenix",
        state: "AZ",
        region: "Southwest",
        lat: 33.4484,
        lon: -112.0740,
        type: "Major Market",
        capacity: "130+ facilities",
        significance: "Fast-growing market"
    },
    {
        id: 20,
        name: "Atlanta Data Center Market",
        operator: "Multiple Providers",
        city: "Atlanta",
        state: "GA",
        region: "Southeast",
        lat: 33.7490,
        lon: -84.3880,
        type: "Major Market",
        capacity: "148+ facilities",
        significance: "Major connectivity hub"
    },
    {
        id: 21,
        name: "Chicago Data Center Market",
        operator: "Multiple Providers",
        city: "Chicago",
        state: "IL",
        region: "Midwest",
        lat: 41.8781,
        lon: -87.6298,
        type: "Major Market",
        capacity: "Large",
        significance: "Central US hub"
    },
    {
        id: 22,
        name: "Silicon Valley Data Centers",
        operator: "Multiple Providers",
        city: "Santa Clara",
        state: "CA",
        region: "West Coast",
        lat: 37.3541,
        lon: -121.9552,
        type: "Major Market",
        capacity: "Large",
        significance: "Tech industry center"
    },
    {
        id: 23,
        name: "Seattle Data Center Market",
        operator: "Multiple Providers",
        city: "Seattle",
        state: "WA",
        region: "Pacific Northwest",
        lat: 47.6062,
        lon: -122.3321,
        type: "Major Market",
        capacity: "Large",
        significance: "Cloud infrastructure hub"
    },

    // Federal AI Sites
    {
        id: 24,
        name: "Argonne National Laboratory",
        operator: "Department of Energy",
        city: "Lemont",
        state: "IL",
        region: "Midwest",
        lat: 41.7089,
        lon: -87.9806,
        type: "Federal AI Site",
        capacity: "1000 MW planned",
        significance: "AI data park site"
    },
    {
        id: 25,
        name: "Pacific Northwest National Laboratory",
        operator: "Department of Energy",
        city: "Richland",
        state: "WA",
        region: "Pacific Northwest",
        lat: 46.3458,
        lon: -119.2781,
        type: "Federal AI Site",
        capacity: "Federal"
    },
    {
        id: 26,
        name: "Brookhaven National Laboratory",
        operator: "Department of Energy",
        city: "Upton",
        state: "NY",
        region: "Northeast",
        lat: 40.8689,
        lon: -72.8858,
        type: "Federal AI Site",
        capacity: "Federal"
    },
    {
        id: 27,
        name: "National Energy Tech Lab - Morgantown",
        operator: "Department of Energy",
        city: "Morgantown",
        state: "WV",
        region: "Mid-Atlantic",
        lat: 39.6295,
        lon: -79.9559,
        type: "Federal AI Site",
        capacity: "Federal"
    },
    {
        id: 28,
        name: "National Energy Tech Lab - Pittsburgh",
        operator: "Department of Energy",
        city: "Pittsburgh",
        state: "PA",
        region: "Mid-Atlantic",
        lat: 40.4406,
        lon: -79.9959,
        type: "Federal AI Site",
        capacity: "Federal"
    },

    // Additional Major Sites
    {
        id: 29,
        name: "Denver Data Center Market",
        operator: "Multiple Providers",
        city: "Denver",
        state: "CO",
        region: "Mountain West",
        lat: 39.7392,
        lon: -104.9903,
        type: "Major Market",
        capacity: "55+ facilities",
        significance: "Mountain region hub"
    },
    {
        id: 30,
        name: "Houston Data Center Market",
        operator: "Multiple Providers",
        city: "Houston",
        state: "TX",
        region: "South Central",
        lat: 29.7604,
        lon: -95.3698,
        type: "Major Market",
        capacity: "32+ facilities",
        significance: "Energy sector hub"
    }
];

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATA_CENTERS;
}
