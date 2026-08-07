export interface CreateRecommendationTypes {
    cropId: string
    districts: string[];
    plantingMonths: number[];
    season: "kharif-1" | "kharif-2" | "rabi" | "all";
    reason?: string;
    tips?: string[];
}

export interface UpdateRecommendationTypes {
    cropRecommendationId: string
    districts?: string[];
    plantingMonths?: number[];
    season?: "kharif-1" | "kharif-2" | "rabi" | "all";
    reason?: string;
    tips?: string[];
}


// ===============================
// Common Types
// ===============================

export type CropCategory =
    | "cereal"
    | "vegetable"
    | "fruit"
    | "pulse"
    | "oilseed"
    | "spice"
    | "cash-crop"
    | "other"

export type CropSeason =
    | "kharif-1"
    | "kharif-2"
    | "rabi"
    | "all"


// ===============================
// Crop Types
// ===============================

export interface WeatherRequirement {
    minTemperature?: number
    maxTemperature?: number
    minHumidity?: number
    maxHumidity?: number
    maxRainProbability?: number
    maxRainfall?: number
}

export interface CropImage {
    url: string
}

export interface Crop {
    _id: string
    name: string
    banglaName: string
    category: CropCategory
    description?: string

    image: CropImage

    weatherRequirement?: WeatherRequirement

    waterRequirement?: "low" | "medium" | "high"

    suitableSoil?: string[]

    cultivationDuration?: number

    cultivationTips?: string[]

    createdAt: string
    updatedAt?: string
}


// ===============================
// Crop Recommendation Types
// ===============================

export interface CropRecommendation {
    _id: string
    cropId: string

    districts: string[]

    plantingMonths: number[]

    season: CropSeason

    reason?: string

    tips?: string[]

    createdAt: string
    updatedAt?: string
}


// ===============================
// Get Crop Details Response
// GET /crop/:cropId
// ===============================

export interface CropDetails {
    crop: Crop | null
    recommendation: CropRecommendation | null
}


// ===============================
// Pagination
// ===============================

export interface CropPagination {
    currentPage: number
    limit: number
    totalCrops: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}


// ===============================
// Get All Crop Response
// GET /crop
// ===============================

export interface GetAllCropData {
    crops: Crop[]
    pagination: CropPagination
}


// ===============================
// Create Crop Request
// POST /crop
// ===============================

export interface CreateCropRequest {
    _id: string
    name: string
    banglaName: string
    category: CropCategory
    description?: string

    weatherRequirement: WeatherRequirement

    waterRequirement?: "low" | "medium" | "high"

    suitableSoil?: string[]

    cultivationDuration?: number

    cultivationTips?: string[]

    image: CropImage

    createdAt: string
    updatedAt?: string
}

export interface CropSuggestionResponse {
    location: {
        districts: string;
    };
    currentMonth: number;
    season: "kharif-1" | "kharif-2" | "rabi";
    weather: Weather;
    count: number;
    data: CropSuggestion[];
}

export interface Weather {
    location: {
        name: string;
        region: string;
        country: string;
        lat: number;
        lon: number;
        tz_id: string;
        localtime_epoch: number;
        localtime: string;
    };
    temperature: number;
    humidity: number;
    rainProbability: number;
    rainfall: number;
    condition: string;
}

export interface CropSuggestion {
    crop: {
        _id: string;
        name: string;
        banglaName: string;
        category: string;
        image: string | null;
        waterRequirement?: "low" | "medium" | "high"

        suitableSoil?: string[]
    }
}