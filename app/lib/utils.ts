import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format("MMMM DD, YYYY");
};

export function parseMarkdownToJson(markdownText: string): unknown | null {
  const regex = /```json\n([\s\S]+?)\n```/;
  const match = markdownText.match(regex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  console.error("No valid JSON found in markdown text.");
  return null;
}

export const parseTripData = (tripDetails: string) => {
    try {
        return JSON.parse(tripDetails);
    } catch {
        console.log("⚠️ Invalid JSON, fallback used");

        return {
            name: "Sample Trip",
            description: "Fallback trip",
            estimatedPrice: "$1000",
            duration: 3,
            itinerary: [],
            bestTimeToVisit: [],
            weatherInfo: [],
            travelStyle: "Travel",
            groupType: "Group",
            budget: "Budget",
            interests: "General",
            country: "Unknown"
        };
    }
};

export const getFirstWord = (input: any) => {
  if (!input) return "";

  // ✅ if array → take first item
  if (Array.isArray(input)) {
    input = input[0];
  }

  // ✅ convert to string
  if (typeof input !== "string") {
    input = String(input);
  }

  return input.trim().split(" ")[0];
};

export const calculateTrendPercentage = (
  countOfThisMonth: number,
  countOfLastMonth: number
): TrendResult => {
  if (countOfLastMonth === 0) {
    return countOfThisMonth === 0
      ? { trend: "no change", percentage: 0 }
      : { trend: "increment", percentage: 100 };
  }

  const change = countOfThisMonth - countOfLastMonth;
  const percentage = Math.abs((change / countOfLastMonth) * 100);

  if (change > 0) {
    return { trend: "increment", percentage };
  } else if (change < 0) {
    return { trend: "decrement", percentage };
  } else {
    return { trend: "no change", percentage: 0 };
  }
};

export const formatKey = (key: keyof TripFormData) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};
