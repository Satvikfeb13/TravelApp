import { type ActionFunctionArgs, data } from "react-router";
import { appWriteConfig, database } from "~/appwrite/client";
import { ID } from "appwrite";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const {
            country,
            numberOfDays,
            travelStyle,
            interests,
            budget,
            groupType,
            userId,
        } = await request.json();

        // ================= PROMPT =================
  const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
    Budget: '${budget}'
    Interests: '${interests}'
    TravelStyle: '${travelStyle}'
    GroupType: '${groupType}'
    Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
    {
    "name": "A descriptive title for the trip",
    "description": "A brief description of the trip and its highlights not exceeding 100 words",
    "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
    "duration": ${numberOfDays},
    "budget": "${budget}",
    "travelStyle": "${travelStyle}",
    "country": "${country}",
    "interests": ${interests},
    "groupType": "${groupType}",
    "bestTimeToVisit": [
      '🌸 Season (from month to month): reason to visit',
      '☀️ Season (from month to month): reason to visit',
      '🍁 Season (from month to month): reason to visit',
      '❄️ Season (from month to month): reason to visit'
    ],
    "weatherInfo": [
      '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
      '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
    ],
    "location": {
      "city": "name of the city or region",
      "coordinates": [latitude, longitude],
      "openStreetMap": "link to open street map"
    },
    "itinerary": [
    {
      "day": 1,
      "location": "City/Region Name",
      "activities": [
        {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
        {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
        {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
      ]
    },
    ...
    ]
    }`;

// ================= GEMINI API =================
const aiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    }),
  }
);


const aiData = await aiResponse.json();

console.log("🔥 FULL AI RESPONSE:", aiData);

        const rawText =
            aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("🔥 AI RAW:", rawText);

        // ================= CLEAN + PARSE =================
        const cleaned = rawText
            ?.replace(/```json/g, "")
            ?.replace(/```/g, "")
            ?.trim();

        let tripData;

        try {
            tripData = JSON.parse(cleaned);
        } catch (err) {
            console.log("⚠️ Invalid JSON, using fallback");

            tripData = {
                name: `Trip to ${country}`,
                description: "Fallback trip",
                estimatedPrice: "$1000",
                duration: numberOfDays,
                travelStyle,
                budget,
                groupType,
                interests,
                country,
                bestTimeToVisit: [],
                weatherInfo: [],
                itinerary: [],
            };
        }
// ================= UNSPLASH =================
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

let imageUrl: string[] = [];

try {
    const formattedInterests = Array.isArray(interests)
        ? interests.join(" ")
        : interests;

    const imageQuery = `${country} ${formattedInterests} scenic travel`;

    console.log("🔍 IMAGE QUERY:", imageQuery);

    const imageRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageQuery)}&per_page=3&orientation=landscape&client_id=${unsplashKey}`
    );

    if (!imageRes.ok) {
        console.error("❌ Unsplash API failed:", imageRes.status);
    }

    const imageData = await imageRes.json();

    console.log("🖼️ UNSPLASH RAW:", imageData);

    imageUrl = imageData?.results?.map((img: any) => img.urls.regular) || [];

} catch (err) {
    console.error("❌ Unsplash Error:", err);
}

// ✅ fallback images
if (!imageUrl.length) {
    imageUrl = [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff"
    ];
}
        // ================= SAVE =================
        const result = await database.createDocument(
            appWriteConfig.dataBaseId,
            appWriteConfig.tripsCollectionId,
            ID.unique(),
            {
                tripDetails: JSON.stringify(tripData), 
                imageUrl,// ✅ IMPORTANT
                userId,
                createdAt: new Date().toISOString(),
            }
        );

        return data({
            success: true,
            id: result.$id,
        });

    } catch (e: any) {
        console.error("🔥 BACKEND ERROR:", e);

        return data(
            {
                success: false,
                error: e.message,
            },
            { status: 500 }
        );
    }
};