/**
 * API service for the Yoga Webinar Landing Page.
 * Handles fetching banners, videos, classes, and testimonials.
 * Includes graceful local fallback data in case of CORS or network failures.
 */

const API_BASE = "https://ht-admin-api-stg.bienapp.in/api/home/webinar";

// Mock Fallbacks matching the user's API descriptions exactly
const FALLBACK_DATA = {
    banners: [
        {
            "id": "3",
            "image": "https://health-techdata.s3.ap-south-1.amazonaws.com/1782479951862.png",
            "status": 1,
            "created_on": "2026-06-26 13:19:12.000 +00:00",
            "updated_on": "2026-06-26 13:19:12.000 +00:00"
        }
    ],
    testimonials: [
        {
            "id": "6",
            "name": "Aswani Kumar",
            "comment": "I always leave the session feeling far better than when I arrived. It is the perfect balance of an energising yet totally calming practice that melts away my work stress.",
            "image": "https://health-techdata.s3.ap-south-1.amazonaws.com/1782479599094.png",
            "status": 1,
            "created_on": "2026-06-26 13:13:19.000 +00:00",
            "updated_on": "2026-06-26 13:13:29.000 +00:00"
        },
        {
            "id": "7",
            "name": "Riya Sharma",
            "comment": "Perfect guidance for beginners. The instructors break down every pose and explain the breathing alignment clearly. I feel stronger and more flexible in just a few sessions.",
            "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
            "status": 1,
            "created_on": "2026-06-26 13:15:00.000 +00:00",
            "updated_on": "2026-06-26 13:15:00.000 +00:00"
        },
        {
            "id": "8",
            "name": "David Miller",
            "comment": "This webinar changed how I view yoga. It's not just stretches; it's a mental release. The online live setting feels like a real studio with amazing energy.",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
            "status": 1,
            "created_on": "2026-06-26 13:16:00.000 +00:00",
            "updated_on": "2026-06-26 13:16:00.000 +00:00"
        }
    ],
    videos: [
        {
            "id": "1",
            "link": "https://www.youtube.com/watch?v=XETSKUSfhxc",
            "status": 1,
            "created_on": "2026-06-25T09:55:32.000Z",
            "updated_on": "2026-06-25T09:56:03.000Z"
        }
    ],
    classes: [
        {
            "id": "5",
            "title": "Yoga Fundamentals: Beginner's Basics",
            "subtitle": "Learn the core building blocks of a safe yoga practice.",
            "description": "Designed specifically for those new to the mat or seasoned practitioners wanting to refine their alignment. We will break down fundamental poses, breathing techniques, and how to utilize yoga props safely. Build confidence and body awareness in a welcoming environment.",
            "type": "Online",
            "amount": 100,
            "date": "2026-7-7",
            "start_time": "06:00 AM",
            "end_time": "09:00 AM",
            "place": "NULL",
            "status": 1,
            "created_on": "2026-06-26 13:25:50.000 +00:00",
            "updated_on": "2026-06-26 13:25:50.000 +00:00"
        },
        {
            "id": "6",
            "title": "Vinyasa Flow & Breathwork",
            "subtitle": "Synchronize movement and breath to expand your vital energy.",
            "description": "A dynamic flowing sequence that links breath with movement. Build heat, increase flexibility, and develop deep core strength. This session concludes with guided pranayama (breathwork) and deep relaxation to soothe your nervous system.",
            "type": "Online",
            "amount": 150,
            "date": "2026-7-10",
            "start_time": "07:30 AM",
            "end_time": "09:30 AM",
            "place": "NULL",
            "status": 1,
            "created_on": "2026-06-26 13:30:00.000 +00:00",
            "updated_on": "2026-06-26 13:30:00.000 +00:00"
        },
        {
            "id": "7",
            "title": "Mindfulness & Yin Yoga for Stress Relief",
            "subtitle": "Surrender to long-held restorative postures for deep release.",
            "description": "A slow-paced practice targeting the deep connective tissues. Poses are held for 3-5 minutes with props to encourage physical release and mental stillness. Perfect for resetting after a stressful week and improving sleep quality.",
            "type": "Online",
            "amount": 120,
            "date": "2026-7-12",
            "start_time": "05:00 PM",
            "end_time": "07:00 PM",
            "place": "NULL",
            "status": 1,
            "created_on": "2026-06-26 13:35:00.000 +00:00",
            "updated_on": "2026-06-26 13:35:00.000 +00:00"
        }
    ]
};

/**
 * Helper function to handle fetch operations with timeouts and fallback checks.
 */
async function fetchWithFallback(endpoint, fallbackKey) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const response = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure success status is true and response data is valid
        if (data && data.success_status && data.info && Array.isArray(data.info) && data.info.length > 0) {
            console.log(`Successfully fetched live data for ${fallbackKey}`, data.info);
            return data.info;
        } else {
            throw new Error("Invalid API response format or empty list.");
        }

    } catch (error) {
        console.warn(`Fetch failed for ${endpoint}: "${error.message}". Using fallback data instead.`);
        return FALLBACK_DATA[fallbackKey];
    }
}

// Exportable functions (loaded globally via window namespace in simple scripts)
window.YogaAPI = {
    async getBanners() {
        return fetchWithFallback("banner-list", "banners");
    },

    async getTestimonials() {
        return fetchWithFallback("testimonial-list", "testimonials");
    },

    async getVideos() {
        return fetchWithFallback("video-list", "videos");
    },

    async getClasses() {
        return fetchWithFallback("class-list", "classes");
    }
};
