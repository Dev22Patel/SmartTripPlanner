import { useState, useEffect } from 'react';

import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Snowflake, Wind, Loader2 } from 'lucide-react';
import { getWeatherForecast, getWeatherRecommendations } from '@/service/weatherService';

interface Forecast {
    condition: string;
    date: string;
    temp_c: number;
    min_temp_c: number;
    max_temp_c: number;
}
interface WeatherForecastProps {
    location: string;
    date: string;
    list: Forecast[];
}

export default function WeatherForecast({ location, date }: WeatherForecastProps) {
    interface WeatherData {
        condition: string;
        date: string;
        temp_c: number;
        min_temp_c: number;
        max_temp_c: number;
    }

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchWeather() {
            if (!location || !date) return;
            setLoading(true);
            try {
                console.log("inside funct weater");
                const data = await getWeatherForecast(location, date);
                setWeather(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchWeather();
    }, [location, date]);

    interface WeatherConditionIconProps {
        condition: string;
    }

    const getWeatherIcon = (condition: string | null): JSX.Element => {
        if (!condition) return <Cloud className="h-6 w-6" />;
        const lowerCondition = condition.toLowerCase();
        if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return <CloudRain className="h-6 w-6" />;
        if (lowerCondition.includes('snow')) return <Snowflake className="h-6 w-6" />;
        if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return <Sun className="h-6 w-6" />;
        if (lowerCondition.includes('wind')) return <Wind className="h-6 w-6" />;
        return <Cloud className="h-6 w-6" />;
    };

    const recommendations = weather ? getWeatherRecommendations(weather) : null;

    if (loading) {
        return (
            <Card className="bg-muted/40 border border-border/60">
                <CardContent className="p-4 flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <span className="text-sm text-muted-foreground">Loading forecast...</span>
                </CardContent>
            </Card>
        );
    }

    if (error || !weather) {
        return (
            <Card className="bg-muted/40 border border-border/60">
                <CardContent className="p-4">
                    <div className="flex items-center text-muted-foreground">
                        <Cloud className="h-5 w-5 mr-2" />
                        <span className="text-sm">Weather data unavailable</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-muted/40 border border-border/60">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        {getWeatherIcon(weather.condition)}
                        <div>
                            <h4 className="text-sm font-medium">{weather.condition}</h4>
                            <p className="text-xs text-muted-foreground">
                                {new Date(weather.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">{weather.temp_c}°C</p>
                        <p className="text-xs text-muted-foreground">
                            {weather.min_temp_c}° / {weather.max_temp_c}°
                        </p>
                    </div>
                </div>

                {recommendations && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                        <p className="text-xs font-medium mb-1">{recommendations.advice}</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            {recommendations.tips.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="mr-1">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
