"use client";

import { useState, useEffect } from "react";
import { IconCloud, IconSearch } from "@tabler/icons-react";

export default function WeatherAgent() {
  const [city, setCity] = useState("Wellington");
  const [inputCity, setInputCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (selectedCity: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather-agent?city=${selectedCity}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
console.log(weather);
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity);
    }
  };

  return (
    <div className="bg-zinc-950 text-white p-8 rounded-2xl border border-zinc-800 max-w-2xl shadow-2xl">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <IconCloud className="text-blue-400" />
        Weather-Aware Spray Agent
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          placeholder="Search city (e.g. London)"
          className="flex-1 p-3 rounded-lg bg-zinc-900 border border-zinc-700"
        />
        <button className="bg-green-600 px-5 py-3 rounded-lg flex items-center gap-2">
          <IconSearch size={18} />
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-zinc-400">Consulting meteorological satellites...</p>
      ) : weather && !weather.error ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card title="Location" value={weather.city} />
            <Card title="Condition" value={weather.condition} />
            <Card title="Temp" value={`${weather.temperature}°C`} highlight />
            <Card title="Wind" value={`${weather.windSpeed} m/s`} />
          </div>

          <div
            className={`mt-6 p-5 rounded-xl border-l-4 ${
              weather?.recommendation?.includes("NOT")
                ? "bg-red-950/30 border-red-600 text-red-200"
                : "bg-green-950/30 border-green-600 text-green-200"
            }`}
          >
            <p className="text-xs font-bold uppercase mb-2">
              🤖 AI Recommendation
            </p>
            <p className="italic">{weather.recommendation}</p>
          </div>
        </div>
      ) : (
        <p className="text-red-400">Failed to retrieve weather data.</p>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
      <p className="text-xs text-zinc-500 uppercase font-bold">{title}</p>
      <p className={`text-lg ${highlight ? "text-orange-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}
