import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OpenWeather API key" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const data = await response.json();

    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const condition = data.weather[0].main;

    // 🌾 Smart Spray Logic
    let recommendation = "Safe to spray today";

    if (
      humidity > 80 ||        // Too humid
      wind > 4 ||             // Too windy
      condition.includes("Rain") ||
      condition.includes("Storm")
    ) {
      recommendation = "Do NOT spray today";
    }

    return NextResponse.json({
      city: data.name,
      temperature: temp,
      humidity,
      windSpeed: wind,
      condition,
      recommendation,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}