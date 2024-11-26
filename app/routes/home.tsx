import { useEffect, useState } from "react";

const fetchWeatherData = async (cityName: string) => {
    const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=4f3681c757a34e4c968195639242411&q=${cityName}`
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch weather data for ${cityName}`);
    }
    const data = await res.json();
    return data.current;
};

export default function WeatherHome() {
    const [weatherData, setWeatherData] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState(["New York", "London", "Tokyo", "Mumbai", "Sydney"]);
    const [newCity, setNewCity] = useState("");

    const fetchAllWeatherData = async () => {
        setLoading(true);
        try {
            const data = await Promise.all(
                cities.map(async (city) => ({
                    name: city,
                    data: await fetchWeatherData(city),
                }))
            );
            setWeatherData(data);
        } catch (err) {
            setError(err.message || "Failed to fetch weather data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllWeatherData();
    }, [cities]);

    const addCity = () => {
        if (newCity && !cities.includes(newCity)) {
            setCities((prevCities) => [...prevCities, newCity]);
            setNewCity("");
        }
    };

    const removeCity = (cityToRemove: string) => {
        setCities((prevCities) => prevCities.filter((city) => city !== cityToRemove));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-t-4 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-600">Loading weather data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-100 text-red-800 p-6 rounded-lg shadow-lg max-w-md text-center">
                    <h2 className="text-xl font-bold mb-4">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">Weather Dashboard</h1>
            <div className="mb-6 flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Add a city"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                    onClick={addCity}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Add City
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {weatherData.map((city) => (
                    <div
                        key={city.name}
                        className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-2xl font-bold text-gray-800">{city.name}</h2>
                        <p className="mt-2 text-gray-600">
                            <span className="font-medium">Temperature:</span> {city.data.temp_c}°C
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Condition:</span> {city.data.condition.text}
                        </p>
                        <img
                            src={city.data.condition.icon}
                            alt={city.data.condition.text}
                            className="w-16 h-16 mx-auto mt-4"
                        />
                        <p className="text-gray-600">
                            <span className="font-medium">Wind Speed:</span> {city.data.wind_kph} kph
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Humidity:</span> {city.data.humidity}%
                        </p>
                        <button
                            onClick={() => removeCity(city.name)}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                            Remove City
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
