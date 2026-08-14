export const DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura",
  "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cox's Bazar",
  "Cumilla", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha",
  "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokati",
  "Jhenaidah", "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
  "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
  "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj",
  "Sunamganj", "Sylhet", "Tangail", "Thakurgaon",
];

export const CATEGORY_VALUES = [
  "Rice",
  "Wheat",
  "Vegetables",
  "Fruits",
  "Spices",
  "Pulses",
  "Jute",
  "Fish",
  "Poultry & Dairy",
  "Other",
]

export const UNITS = ["kg", "mon", "ton", "piece"]

export const CATEGORIES_MAP = [
  { en: "Rice", bn: "চাল" },
  { en: "Wheat", bn: "গম" },
  { en: "Vegetables", bn: "শাকসবজি" },
  { en: "Fruits", bn: "ফল" },
  { en: "Spices", bn: "মসলা" },
  { en: "Pulses", bn: "ডাল" },
  { en: "Jute", bn: "পাট" },
  { en: "Fish", bn: "মাছ" },
  { en: "Poultry & Dairy", bn: "পোল্ট্রি ও দুগ্ধজাত" },
  { en: "Other", bn: "অন্যান্য" },
] as const;

export const DISTRICTS_BN: Record<string, string> = {
  Bagerhat: "বাগেরহাট", Bandarban: "বান্দরবান", Barguna: "বরগুনা", Barishal: "বরিশাল", Bhola: "ভোলা",
  Bogura: "বগুড়া", Brahmanbaria: "ব্রাহ্মণবাড়িয়া", Chandpur: "চাঁদপুর", Chapainawabganj: "চাঁপাইনবাবগঞ্জ",
  Chattogram: "চট্টগ্রাম", Chuadanga: "চুয়াডাঙ্গা", "Cox's Bazar": "কক্সবাজার", Cumilla: "কুমিল্লা",
  Dhaka: "ঢাকা", Dinajpur: "দিনাজপুর", Faridpur: "ফরিদপুর", Feni: "ফেনী", Gaibandha: "গাইবান্ধা",
  Gazipur: "গাজীপুর", Gopalganj: "গোপালগঞ্জ", Habiganj: "হবিগঞ্জ", Jamalpur: "জামালপুর", Jashore: "যশোর",
  Jhalokati: "ঝালকাঠি", Jhenaidah: "ঝিনাইদহ", Joypurhat: "জয়পুরহাট", Khagrachari: "খাগড়াছড়ি",
  Khulna: "খুলনা", Kishoreganj: "কিশোরগঞ্জ", Kurigram: "কুড়িগ্রাম", Kushtia: "কুষ্টিয়া",
  Lakshmipur: "লক্ষ্মীপুর", Lalmonirhat: "লালমনিরহাট", Madaripur: "মাদারীপুর", Magura: "মাগুরা",
  Manikganj: "মানিকগঞ্জ", Meherpur: "মেহেরপুর", Moulvibazar: "মৌলভীবাজার", Munshiganj: "মুন্সীগঞ্জ",
  Mymensingh: "ময়মনসিংহ", Naogaon: "নওগাঁ", Narail: "নড়াইল", Narayanganj: "নারায়ণগঞ্জ",
  Narsingdi: "নরসিংদী", Natore: "নাটোর", Netrokona: "নেত্রকোণা", Nilphamari: "নীলফামারী",
  Noakhali: "নোয়াখালী", Pabna: "পাবনা", Panchagarh: "পঞ্চগড়", Patuakhali: "পটুয়াখালী",
  Pirojpur: "পিরোজপুর", Rajbari: "রাজবাড়ী", Rajshahi: "রাজশাহী", Rangamati: "রাঙ্গামাটি",
  Rangpur: "রংপুর", Satkhira: "সাতক্ষীরা", Shariatpur: "শরীয়তপুর", Sherpur: "শেরপুর",
  Sirajganj: "সিরাজগঞ্জ", Sunamganj: "সুনামগঞ্জ", Sylhet: "সিলেট", Tangail: "টাঙ্গাইল",
  Thakurgaon: "ঠাকুরগাঁও"
};

export const MONTHS = [
    { labelEn: "January", labelBn: "জানুয়ারী", value: 1 },
    { labelEn: "February", labelBn: "ফেব্রুয়ারী", value: 2 },
    { labelEn: "March", labelBn: "মার্চ", value: 3 },
    { labelEn: "April", labelBn: "এপ্রিল", value: 4 },
    { labelEn: "May", labelBn: "মে", value: 5 },
    { labelEn: "June", labelBn: "জুন", value: 6 },
    { labelEn: "July", labelBn: "জুলাই", value: 7 },
    { labelEn: "August", labelBn: "আগস্ট", value: 8 },
    { labelEn: "September", labelBn: "সেপ্টেম্বর", value: 9 },
    { labelEn: "October", labelBn: "অক্টোবর", value: 10 },
    { labelEn: "November", labelBn: "নভেম্বর", value: 11 },
    { labelEn: "December", labelBn: "ডিসেম্বর", value: 12 },
]