import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Home Route - Fetch Forecast Data
app.get("/", async (req, res) => {
    const city = req.query.city || "New York"; // Default city
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    try {
        // Get city coordinates
        const locationResponse = await axios.get(geoUrl);
        if (!locationResponse.data.results) {
            return res.render("index", { forecast: null, error: "City not found!" });
        }

        const { latitude, longitude, name } = locationResponse.data.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=auto`;

        // Get weather forecast data
        const weatherResponse = await axios.get(weatherUrl);
        const forecastData = {
            city: name,
            days: weatherResponse.data.daily.time.map((date, index) => ({
                date,
                maxTemp: weatherResponse.data.daily.temperature_2m_max[index],
                minTemp: weatherResponse.data.daily.temperature_2m_min[index],
                windspeed: weatherResponse.data.daily.windspeed_10m_max[index],
                weathercode: weatherResponse.data.daily.weathercode[index],
            })),
        };

        res.render("index", { forecast: forecastData, error: null });
    } catch (error) {
        res.render("index", { forecast: null, error: "Error fetching data!" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
