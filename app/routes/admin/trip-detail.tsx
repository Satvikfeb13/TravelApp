import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect } from "react-router";
import { getAllTrips, getTripById, deleteTripById, updateTripById } from "~/appwrite/trips";
import type { Route } from './+types/trip-detail';
import { useNavigation } from "react-router";
import { cn, parseTripData } from "~/lib/utils";
import { Header, TripCard, InfoPill } from "../../../Components";
import { ButtonComponent, ChipDirective, ChipListComponent, ChipsDirective } from "@syncfusion/ej2-react-buttons";

// ================= LOADER =================
export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { tripId } = params;
    if (!tripId) throw new Error('Trip ID is required');

    const [trip, trips] = await Promise.all([
        getTripById(tripId),
        getAllTrips(4, 0)
    ]);

    return {
        trip,
        allTrips: trips?.allTrips?.map(({ $id, tripDetails, imageUrl }) => ({
            id: $id,
            ...parseTripData(tripDetails),
            imageUrls: imageUrl ?? []
        })) || []
    };
};

// ================= ACTION =================
export const action = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const actionType = formData.get("_action");

    if (actionType === "delete") {
        if (!params.tripId) throw new Error('Trip ID is required');
        await deleteTripById(params.tripId);
        return redirect("/dashboard");
    }

    if (actionType === "regenerate-day") {
        const dayNumber = formData.get("dayNumber") as string;
        const country = formData.get("country") as string;
        if (!params.tripId || !dayNumber) throw new Error("Missing parameters");

        const prompt = `Generate a fresh, strictly alternative itinerary for Day ${dayNumber} for a trip to ${country}. 
        Return strictly in this valid JSON format only, with no markdown formatting:
        {
          "day": ${dayNumber},
          "location": "A different region or city name that makes sense",
          "activities": [
            {"time": "Morning", "description": "New exciting morning activity"},
            {"time": "Afternoon", "description": "Different afternoon activity"},
            {"time": "Evening", "description": "New evening activity"}
          ]
        }`;

        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            }),
          }
        );

        const aiData = await aiResponse.json();
        const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        try {
            const newDay = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
            const existingTrip = await getTripById(params.tripId);
            const parsedDetails = JSON.parse(existingTrip.tripDetails);
            
            parsedDetails.itinerary = parsedDetails.itinerary.map((dayPlan: any) => 
                String(dayPlan.day) === String(dayNumber) ? newDay : dayPlan
            );
            
            await updateTripById(params.tripId, {
                tripDetails: JSON.stringify(parsedDetails)
            });

            return { success: true };
        } catch (err) {
            console.error("Day regeneration failed", err);
            return null;
        }
    }

    if (actionType === "regenerate-full") {
        if (!params.tripId) throw new Error("Trip ID is required");
        
        const existingTrip = await getTripById(params.tripId);
        const tripData = JSON.parse(existingTrip.tripDetails);
        const { country, duration, travelStyle, interests, budget, groupType } = tripData;

        const prompt = `Generate a fresh ${duration}-day travel itinerary for ${country} based on: Budget: '${budget}', Interests: '${interests}', Style: '${travelStyle}', Group: '${groupType}'. 
        Return strictly in this valid JSON format only, with no markdown formatting:
        {
          "name": "A descriptive title",
          "description": "Brief description",
          "estimatedPrice": "$Price",
          "duration": ${duration},
          "budget": "${budget}",
          "travelStyle": "${travelStyle}",
          "country": "${country}",
          "interests": "${interests}",
          "groupType": "${groupType}",
          "bestTimeToVisit": [],
          "weatherInfo": [],
          "itinerary": [
            {
              "day": 1,
              "location": "City Name",
              "activities": [
                {"time": "Morning", "description": "Activity description"}
              ]
            }
          ]
        }`;

        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
              }),
            }
        );

        const aiData = await aiResponse.json();
        const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        try {
            const newTripDetails = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
            await updateTripById(params.tripId, {
                tripDetails: JSON.stringify(newTripDetails)
            });
            return { success: true };
        } catch (err) {
            console.error("Full regeneration failed", err);
            return null;
        }
    }
    return null;
};

// ================= COMPONENT =================
const TripDetail = ({ loaderData }: Route.ComponentProps) => {

    const navigation = useNavigation();
    const imageUrls = loaderData?.trip?.imageUrl || [];

    // ✅ SAFE PARSE
    const tripData = loaderData?.trip?.tripDetails
        ? parseTripData(loaderData.trip.tripDetails)
        : null;

    if (!tripData) {
        return <div className="wrapper">No trip data found</div>;
    }

    const {
        name,
        duration,
        itinerary,
        travelStyle,
        groupType,
        budget,
        interests,
        estimatedPrice,
        description,
        bestTimeToVisit,
        weatherInfo,
        country
    } = tripData;

    const allTrips = loaderData.allTrips || [];

    const pillItems = [
        { text: travelStyle, bg: '!bg-pink-50 !text-pink-500' },
        { text: groupType, bg: '!bg-primary-50 !text-primary-500' },
        { text: budget, bg: '!bg-success-50 !text-success-700' },
        { text: interests, bg: '!bg-navy-50 !text-navy-500' },
    ];

    const visitTimeAndWeatherInfo = [
        { title: 'Best Time to Visit:', items: bestTimeToVisit || [] },
        { title: 'Weather:', items: weatherInfo || [] }
    ];

    return (
        <main className="travel-detail wrapper py-10 space-y-10">

            {/* HEADER */}
            <Header
                title="Trip Details"
                description="View and explore your AI-generated travel plan"
            />

            <section className="container wrapper-md space-y-8">

                {/* TITLE */}
                <header className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl lg:text-4xl font-bold text-dark-100 leading-tight">
                                {name || "Trip"}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-gray-500 mt-4">
                                <InfoPill
                                    text={`${duration || 0} day plan`}
                                    image="/assets/icons/calendar.svg"
                                />

                                <InfoPill
                                    text={
                                        Array.from(new Set(itinerary?.map((item: any) => item.location)))
                                            .slice(0, 3)
                                            .join(', ') || "Multiple locations"
                                    }
                                    image="/assets/icons/location-mark.svg"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 print:hidden shrink-0 mt-4 lg:mt-0 lg:ml-4">
                            {/* REGENERATE */}
                            <Form method="post" className="w-full">
                                <input type="hidden" name="_action" value="regenerate-full" />
                                <button 
                                    type="submit" 
                                    className="flex items-center justify-center gap-1.5 h-10 w-full lg:w-[140px] text-[11px] font-black uppercase tracking-wider text-white transition-all rounded-full bg-gradient-to-r from-primary-600 to-indigo-500 hover:shadow-lg hover:shadow-primary-200 disabled:opacity-50"
                                    disabled={navigation.state !== 'idle'}
                                >
                                    <img src="/assets/icons/magic-star.svg" className={cn("size-3 brightness-0 invert", { 'animate-spin': navigation.formData?.get("_action") === "regenerate-full" })} alt="magic" />
                                    {navigation.formData?.get("_action") === "regenerate-full" ? "Wait..." : "Regenerate"}
                                </button>
                            </Form>

                            {/* DELETE */}
                            <Form method="post" className="w-full" onSubmit={(e) => {
                                if(!window.confirm("Are you sure you want to completely delete this trip?")) {
                                    e.preventDefault();
                                }
                            }}>
                                <input type="hidden" name="_action" value="delete" />
                                <button 
                                    type="submit"
                                    className="h-10 w-full lg:w-[140px] text-[11px] font-black uppercase tracking-wider text-red-600 transition-all border border-red-200 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center"
                                >
                                    Delete
                                </button>
                            </Form>

                            {/* PRINT */}
                            <button 
                                className="h-10 w-full lg:w-[140px] text-[11px] font-black uppercase tracking-wider text-gray-600 transition-all border border-gray-200 rounded-full hover:bg-gray-50 flex items-center justify-center" 
                                onClick={() => window.print()}
                            >
                                Print
                            </button>

                            {/* SHARE */}
                            <button 
                                className="h-10 w-full lg:w-[140px] text-[11px] font-black uppercase tracking-wider text-white transition-all rounded-full bg-pink-600 hover:bg-pink-700 hover:shadow-lg shadow-pink-200 flex items-center justify-center" 
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </header>

                {/* IMAGES */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {imageUrls?.map((url: string, i: number) => (
                        <img
                            src={url || "/placeholder.png"}
                            key={i}
                            alt="trip"
                            className={cn(
                                "w-full rounded-xl object-cover transition hover:scale-[1.01]",
                                i === 0
                                    ? "md:col-span-2 md:row-span-2 h-[320px]"
                                    : "h-[150px]"
                            )}
                        />
                    ))}
                </section>

                {/* TAGS + RATING */}
                <section className="flex flex-wrap items-center gap-4">

                    <ChipListComponent>
                        <ChipsDirective>
                            {pillItems.map((pill, i) => (
                                <ChipDirective
                                    key={i}
                                    text={pill.text?.toString() || "Tag"}
                                    cssClass={`${pill.bg} !text-sm !px-4`}
                                />
                            ))}
                        </ChipsDirective>
                    </ChipListComponent>

                    <div className="flex items-center gap-1 ml-auto">
                        {Array(5).fill(null).map((_, i) => (
                            <img
                                key={i}
                                src="/assets/icons/star.svg"
                                className="size-4"
                            />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">4.9 / 5</span>
                    </div>
                </section>

                {/* TITLE + PRICE */}
                <section className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {duration || 0}-Day {country || "Trip"} {travelStyle || ""}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {budget}, {groupType}, {interests}
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-green-600">
                        {estimatedPrice || "$0"}
                    </h2>
                </section>

                {/* DESCRIPTION */}
                <p className="text-gray-600">
                    {description || "No description available"}
                </p>
                {/* ITINERARY JOURNEY */}
                <section className="relative mt-16 space-y-24">
                    {/* Background Decorative Line */}
                    <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-primary-500/50 via-primary-200 to-transparent hidden md:block" />

                    {itinerary?.length ? (
                        itinerary.map((dayPlan: any, index: number) => (
                            <div key={index} className="relative group">
                                {/* DAY FLOATING TAG */}
                                <div className="absolute -left-4 md:-left-12 top-0 flex items-center justify-center w-24 h-10 bg-dark-100 text-white rounded-full font-bold text-sm tracking-widest shadow-2xl z-10 border-4 border-white">
                                    DAY {dayPlan?.day}
                                </div>

                                <div className="pl-12 md:pl-24 space-y-10">
                                    {/* HEADER */}
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-100/80">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-bold text-dark-100 tracking-tighter">
                                                {dayPlan?.location || "Destination Unseen"}
                                            </h3>
                                            <p className="text-primary-500 font-medium text-sm flex items-center gap-2">
                                                <img src="/assets/icons/location-mark.svg" className="size-4 opacity-70" alt="loc" />
                                                Explore the heart of the region
                                            </p>
                                        </div>

                                        <Form method="post" className="print:hidden">
                                            <input type="hidden" name="_action" value="regenerate-day" />
                                            <input type="hidden" name="dayNumber" value={dayPlan?.day} />
                                            <input type="hidden" name="country" value={country} />
                                            <button 
                                                type="submit" 
                                                className="group flex items-center gap-2.5 px-6 py-2.5 text-xs font-bold transition-all duration-300 rounded-full text-white bg-gradient-to-r from-primary-600 to-primary-400 hover:shadow-lg hover:shadow-primary-200 disabled:opacity-50 active:scale-95"
                                                disabled={navigation.state !== 'idle'}
                                            >
                                                <img 
                                                    src="/assets/icons/magic-star.svg" 
                                                    className={cn("size-4 brightness-0 invert", { 'animate-spin': navigation.state !== 'idle' && navigation.formData?.get("dayNumber") === String(dayPlan?.day) })} 
                                                    alt="magic" 
                                                />
                                                {navigation.state !== 'idle' && navigation.formData?.get("dayNumber") === String(dayPlan?.day) 
                                                    ? 'Regenerating...' 
                                                    : 'Regenerate'}
                                            </button>
                                        </Form>
                                    </div>

                                    {/* ACTIVITIES LIST */}
                                    <div className="grid gap-12">
                                        {dayPlan?.activities?.length ? (
                                            dayPlan.activities.map((activity: any, i: number) => {
                                                const timeIcons: Record<string, string> = {
                                                    'Morning': '☀️',
                                                    'Afternoon': '🌤️',
                                                    'Evening': '🌙'
                                                };
                                                return (
                                                    <div key={i} className="flex gap-8 relative">
                                                        {/* Activity Marker */}
                                                        <div className="hidden md:flex absolute -left-16 top-1 size-8 rounded-full bg-white border border-gray-100 shadow-sm items-center justify-center text-lg">
                                                            {timeIcons[activity?.time] || '📍'}
                                                        </div>

                                                        <div className="space-y-3 max-w-4xl">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary-500 bg-primary-50 px-3 py-1 rounded-full">
                                                                    {activity?.time}
                                                                </span>
                                                            </div>
                                                            <p className="text-lg font-medium leading-relaxed text-dark-800/90 antialiased">
                                                                {activity?.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-center text-gray-400 font-medium">
                                                A hidden gem awaits your arrival...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center bg-gray-50 rounded-[40px] border border-gray-100">
                            <img src="/assets/icons/magic-star.svg" className="size-12 mx-auto mb-6 opacity-20" alt="none" />
                            <p className="text-xl text-dark-100/50 font-semibold tracking-tight">No journey maps found for this quest.</p>
                        </div>
                    )}
                </section>

                {/* BEST TIME + WEATHER */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {visitTimeAndWeatherInfo.map((section) => (
                        <section key={section.title} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 text-dark-100 flex items-center gap-2">
                                {section.title === 'Best Time to Visit:' ? '📅' : '🌤️'} {section.title}
                            </h3>

                            <ul className="space-y-3">
                                {section.items?.length ? (
                                    section.items.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-3 items-start text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                                            <span className="text-primary-500 font-bold mt-0.5">•</span>
                                            <p className="text-sm font-medium leading-relaxed">{item}</p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-400 italic">No data available</li>
                                )}
                            </ul>
                        </section>
                    ))}
                </div>

            </section>

            {/* RELATED TRIPS */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Popular Trips</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {allTrips?.map((trip) => (
                        <TripCard
                            key={trip.id}
                            id={trip.id}
                            name={trip.name}
                            imageUrl={trip.imageUrls?.[0]}
                            location={trip.itinerary?.[0]?.location ?? ""}
                            tags={[trip.interests, trip.travelStyle]}
                            price={trip.estimatedPrice}
                        />
                    ))}
                </div>
            </section>

        </main>
    );
};

export default TripDetail;