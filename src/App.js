import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Get coordinates
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) {
        setError("City not found. Try another name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Get weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`
      );
      const data = await weatherRes.json();

      const { temperature_2m, windspeed_10m, weathercode } = data.current;
      const temp = Math.round(temperature_2m);

      const getDescription = (code) => {
        if (code === 0) return "Clear sky";
        if (code <= 3) return "Partly cloudy";
        if (code <= 48) return "Foggy";
        if (code <= 67) return "Rainy";
        if (code <= 77) return "Snowy";
        if (code <= 82) return "Rain showers";
        if (code <= 86) return "Snow showers";
        return "Thunderstorms";
      };

      setWeather({
        city: `${name}, ${country}`,
        temp: `${temp}°C`,
        desc: getDescription(weathercode),
        wind: `${windspeed_10m} km/h`,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Weather Now</h1>

      <div className="weather-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="weather-info">
          {loading ? (
            <p className="loading-text">Loading weather data...</p>
          ) : weather ? (
            <div>
              <h3>{weather.city}</h3>
              <p>
                <strong>Temperature:</strong> {weather.temp}
              </p>
              <p>
                <strong>Weather:</strong> {weather.desc}
              </p>
              <p>
                <strong>Wind Speed:</strong> {weather.wind}
              </p>
            </div>
          ) : (
            <p>Enter a city name to get current weather information</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
