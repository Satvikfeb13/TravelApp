export const getUnsplashImages = async (query: string): Promise<string[]> => {
  try {
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      console.error("❌ Missing Unsplash API Key");
      return [];
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=5&orientation=landscape&client_id=${accessKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error("❌ Unsplash API Error:", res.status);
      return [];
    }

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      console.warn("⚠️ No images found for:", query);
      return [];
    }

    // Extract image URLs
    return data.results.map((img: any) => img.urls.regular);

  } catch (error) {
    console.error("❌ Unsplash Fetch Failed:", error);
    return [];
  }
};