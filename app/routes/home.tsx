'use client';
import { useLoaderData, Form, redirect } from '@remix-run/react';
import { json } from '@remix-run/node';
import { db } from 'server/db';
import { citiesTable, userFavoriteCitiesTable } from 'server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from './_index';
import { Heart, XCircle, MapPin } from 'lucide-react'; 
import { Card, CardContent, CardDescription, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import WelcomeCard from '~/components/ui/wlecomeCard';

export const fetchWeatherData = async (cityName: string) => {
  const res = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=4f3681c757a34e4c968195639242411&q=${cityName}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch weather data for ${cityName}`);
  }
  const data = await res.json();
  return data.current;
};

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  const username = session.get('username');

  if (!userId) {
    return redirect('/login');
  }

  const favoriteCities = await db
    .select({
      cityId: userFavoriteCitiesTable.cityId,
      name: citiesTable.name,
    })
    .from(userFavoriteCitiesTable)
    .leftJoin(citiesTable, eq(userFavoriteCitiesTable.cityId, citiesTable.id))
    .where(eq(userFavoriteCitiesTable.userId, userId));

  const allCities = await db.select({ id: citiesTable.id, name: citiesTable.name }).from(citiesTable);

  const citiesWeather = await Promise.all(
    favoriteCities.map(async (city) => {
      const weatherData = await fetchWeatherData(city.name);
      return { ...city, weather: weatherData };
    })
  );

  return json({ username, citiesWeather, allCities });
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  const cityName = formData.get('cityName') as string;
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return redirect('/login');
  }

  if (actionType === 'addCityToDB') {
    if (!cityName || cityName.trim() === '') {
      throw new Error('City name cannot be empty.');
    }

    const existingCity = await db
      .select()
      .from(citiesTable)
      .where(eq(citiesTable.name, cityName));

    if (existingCity.length === 0) {
      await db.insert(citiesTable).values({
        name: cityName,
        user_id: userId,
      });
    } else {
      console.error(`City ${cityName} already exists in the database.`);
    }
  } else if (actionType === 'add') {
    const [city] = await db
      .select()
      .from(citiesTable)
      .where(eq(citiesTable.name, cityName));
    const cityId = city?.id;

    if (cityId) {
      await db.insert(userFavoriteCitiesTable).values({
        userId,
        cityId,
      });
    }
  } else if (actionType === 'remove') {
    const cityId = parseInt(formData.get('cityId') as string);
    await db
      .delete(userFavoriteCitiesTable)
      .where(and(eq(userFavoriteCitiesTable.userId, userId), eq(userFavoriteCitiesTable.cityId, cityId)));
  }

  return redirect('/home');
}

export default function WeatherHomePage() {
  const { username, citiesWeather, allCities } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 mb-[200px]">
   
      <div className="mb-10">
        <div className="flex flex-col gap-5">
          <div className="w-full mt-28">
            <WelcomeCard
              title={`Welcome to the Weather App, ${username}!`}
              role="Weather Enthusiast"
              description="Explore your favorite cities and check out their weather updates."
              imageUrl="./public/weather.jpg"
              cardLink="/home"
            />
          </div>

       
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Your Favorite Cities Weather</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {citiesWeather.map((city) => (
                <Card key={city.cityId} className="w-full transition ease-in-out delay-150 bg-white cursor-pointer hover:shadow-lg hover:-translate-y-1">
                  <CardContent>
                    <div className="relative">
                      <img
                        className="w-full h-40 object-contain"
                        src={`https://${city.weather.condition.icon}`}
                        alt={city.weather.condition.text}
                      />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      <MapPin size={20} className="mr-2 inline" />
                      {city.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">{city.weather.condition.text}</CardDescription>
                    <p className="text-sm">
                      Temp: {city.weather.temp_c}°C | Humidity: {city.weather.humidity}% | Precip: {city.weather.precip_mm}mm
                    </p>
                    <Form method="post" className="mt-2">
                      <input type="hidden" name="cityId" value={city.cityId} />
                      <Button
  type="submit"
  name="actionType"
  value="remove"
  className="px-4 py-2 text-white rounded-md bg-red-600 hover:bg-red-700 focus:outline-none"
>
  <XCircle size={20} className="mr-2 inline" /> Remove from Favorites
</Button>

                    </Form>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>


          <div className="flex mb-5">
            <Form method="post" className="flex w-full">
              <input
                type="text"
                name="cityName"
                placeholder="Add a new city to the database"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button type="submit" name="actionType" value="addCityToDB" className="ml-2">
                Add City
              </Button>
            </Form>
          </div>

       
<h2 className="text-2xl font-semibold mt-8">Explore All Cities</h2>
<div className="grid grid-cols-2 gap-4 mt-4">
  {allCities.map((city) => (
    <Card
      key={city.id}
      className="w-full transition ease-in-out delay-150 bg-white cursor-pointer hover:shadow-lg hover:-translate-y-1"
    >
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold">
          <MapPin size={20} className="mr-2 inline" />
          {city.name}
        </CardTitle>
        <Form method="post" className="mt-2">
          <input type="hidden" name="cityName" value={city.name} />
          <Button
            type="submit"
            name="actionType"
            value="add"
            className="px-4 py-2 text-white rounded-md hover:bg-green-700 focus:outline-none"
          >
            <Heart size={20} className="mr-2 inline" /> Add to Favorites
          </Button>
        </Form>
      </CardContent>
    </Card>
  ))}
</div>

        </div>
      </div>
    </div>
  );
}
