import type { Language } from "./translations";

export interface MockUser {
  name: string;
  phone: string;
  password: string;
  village: string;
  language: Language;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  author: string;
  thumbnail: string;
}

// Pre-seeded users for testing duplicate phone + login flows
export const INITIAL_USERS: MockUser[] = [
  {
    name: "Ramesh Patil",
    phone: "9876543210",
    password: "ramesh123",
    village: "Athani",
    language: "kn",
  },
  {
    name: "Suresh Kulkarni",
    phone: "9123456789",
    password: "suresh123",
    village: "Bagalkot",
    language: "en",
  },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Best Irrigation Timing During Monsoon Lull",
    excerpt: "When the monsoon pauses, timing your irrigation right can boost cane yield by up to 15%.",
    body: `The monsoon season in Northern Karnataka typically runs from June to September, but there are often dry spells lasting 10-15 days that can stress sugarcane crops at critical growth stages.\n\nDuring these lull periods, farmers need to make smart irrigation decisions. Research from KIAAR shows that irrigating within the first 3 days of a dry spell — rather than waiting for visible wilting — can improve yield by 12-15%.\n\n**Key recommendations:**\n\n1. **Monitor soil moisture** daily during monsoon breaks. If the top 6 inches of soil feel dry, irrigate immediately.\n2. **Time your irrigation** for early morning (before 8 AM) or late evening (after 5 PM) to minimize evaporation.\n3. **Use drip irrigation** where possible — it delivers water directly to the root zone and uses 40% less water than flood irrigation.\n4. **Check weather forecasts** before irrigating. If rain is expected within 24 hours, you may be able to delay.\n\nThe DesiCane AI advisory system can predict monsoon lull periods 3-5 days in advance, giving farmers time to prepare their irrigation schedule.\n\nFor more information, contact your nearest KIAAR extension office or speak with your GBL field coordinator.`,
    date: "2026-07-20",
    author: "Dr. Anand Sharma, KIAAR",
    thumbnail: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=250&fit=crop",
  },
  {
    id: "2",
    title: "Understanding Fertigation Basics for Sugarcane",
    excerpt: "Combining fertilizer with irrigation water can save costs and improve nutrient uptake efficiency.",
    body: `Fertigation — the practice of applying fertilizers through irrigation water — is gaining popularity among sugarcane farmers in Karnataka. This technique can improve nutrient use efficiency by 25-30% compared to conventional broadcasting.\n\n**What is fertigation?**\n\nFertigation dissolves water-soluble fertilizers into your irrigation system, delivering nutrients directly to the root zone. This means less waste, better absorption, and healthier cane.\n\n**Getting started:**\n\n1. **Equipment needed:** A venturi injector or fertilizer tank connected to your drip/sprinkler system.\n2. **Suitable fertilizers:** Use water-soluble grades — MAP (Mono Ammonium Phosphate), MOP (Muriate of Potash), or specialty blends.\n3. **Schedule:** Split your fertilizer application into 6-8 doses across the growing season instead of 2-3 bulk applications.\n\n**Benefits observed by farmers in Belgaum district:**\n\n- 20% reduction in fertilizer costs\n- 15% improvement in cane weight\n- More uniform crop growth\n- Reduced labor for manual fertilizer application\n\nGBL's extension team can help you set up a basic fertigation system. Contact your local coordinator for a site assessment.`,
    date: "2026-07-15",
    author: "Priya Desai, GBL Extension",
    thumbnail: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    title: "GBL Mill Season Update: 2026-27 Preparations",
    excerpt: "Godavari Biorefineries announces early crushing season dates and transport logistics.",
    body: `Godavari Biorefineries Ltd. (GBL) has announced preparations for the 2026-27 sugarcane crushing season. Here's what farmers in the Northern Karnataka region need to know.\n\n**Key dates:**\n\n- **Registration deadline:** August 15, 2026\n- **Crushing season start:** October 15, 2026 (tentative)\n- **Expected duration:** 150-170 days\n\n**Transport arrangements:**\n\nGBL will deploy 120 transport vehicles across the catchment area. Farmers within 25 km of the mill will receive priority scheduling. New this year — the transport booking system is now available via WhatsApp.\n\n**Pricing:**\n\nThe Fair and Remunerative Price (FRP) for the 2026-27 season is expected to be ₹340 per quintal for basic sugar recovery of 10.25%. Additional premium of ₹3.87 per quintal for every 0.1% increase in recovery above the basic rate.\n\n**Quality requirements:**\n\n- Harvest cane no more than 24 hours before delivery\n- Remove tops, trash, and dried leaves\n- Minimum stalk length: 2 feet\n- No water-soaked or stale cane accepted\n\nFor registration and queries, visit the GBL farmer helpdesk at the mill gate or call the toll-free number: 1800-XXX-XXXX.`,
    date: "2026-07-12",
    author: "GBL Communications",
    thumbnail: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&h=250&fit=crop",
  },
  {
    id: "4",
    title: "Soil Health Card: Why Every Farmer Needs One",
    excerpt: "Free government soil testing can tell you exactly what your field needs — stop guessing.",
    body: `The Government of India's Soil Health Card scheme provides free soil testing for every farmer. Yet many sugarcane growers in Northern Karnataka have never had their soil tested.\n\n**Why it matters:**\n\nWithout knowing your soil's nutrient profile, you're essentially guessing how much fertilizer to apply. Overapplication wastes money; underapplication hurts yield. A soil health card eliminates the guesswork.\n\n**What does the card tell you?**\n\n- Soil pH (acidity/alkalinity)\n- Organic carbon content\n- Available Nitrogen, Phosphorus, and Potassium (NPK)\n- Micronutrient levels (Zinc, Iron, Manganese, Copper, Boron)\n- Soil texture and water-holding capacity\n\n**How to get your card:**\n\n1. Visit your nearest Krishi Vigyan Kendra (KVK) or taluka agriculture office\n2. Provide a soil sample from your field (they'll guide you on how to collect it)\n3. Results usually come back in 2-3 weeks\n4. The card includes crop-specific fertilizer recommendations\n\n**Integration with DesiCane:**\n\nIf you share your Soil Health Card data with the DesiCane system, our AI can provide even more precise irrigation and fertigation advice tailored to your specific soil conditions.\n\nRemember: healthy soil = healthy cane = better income.`,
    date: "2026-07-08",
    author: "Dr. Meena Joshi, KIAAR",
    thumbnail: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    title: "Water-Saving Success: Ramdurg Farmers Cut Usage by 30%",
    excerpt: "A pilot group of 50 farmers in Ramdurg taluka achieved remarkable water savings using AI advice.",
    body: `A pilot project in Ramdurg taluka has demonstrated that AI-guided irrigation scheduling can help sugarcane farmers reduce water usage by up to 30% without any reduction in yield.\n\n**The pilot:**\n\nFifty farmers across 200 acres were provided with soil moisture sensors and the DesiCane advisory app. Over one growing season (October 2025 - July 2026), they followed the app's irrigation recommendations.\n\n**Results:**\n\n| Metric | Traditional | AI-Guided | Change |\n|--------|-----------|-----------|--------|\n| Water used per acre | 180 lakh litres | 126 lakh litres | -30% |\n| Yield per acre | 42 tonnes | 43.5 tonnes | +3.5% |\n| Irrigation events | 22 | 15 | -32% |\n| Electricity cost | ₹12,000 | ₹8,200 | -32% |\n\n**Farmer testimonial:**\n\n"I was skeptical at first. How can a phone tell me when to water my cane? But the results speak for themselves. I saved almost ₹4,000 on electricity and my yield was actually better." — Basavaraj Hiremath, Ramdurg.\n\nThe pilot is being expanded to 500 farmers across three talukas in the 2026-27 season. Interested farmers can register through their GBL field coordinator.`,
    date: "2026-07-05",
    author: "DesiCane Research Team",
    thumbnail: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=250&fit=crop",
  },
  {
    id: "6",
    title: "Pest Alert: Early Shoot Borer Season Approaching",
    excerpt: "Take preventive measures now to protect your young sugarcane crop from shoot borer damage.",
    body: `The Karnataka State Agriculture Department has issued an advisory about the upcoming early shoot borer season. Farmers with newly planted or ratoon cane (1-3 months old) should take immediate preventive action.\n\n**Identifying shoot borer damage:**\n\n- "Dead hearts" — the central shoot dries up and can be pulled out easily\n- Bore holes visible on young shoots near ground level\n- Reddish-brown frass (insect waste) around the bore hole\n\n**Prevention measures:**\n\n1. **Trash mulching:** Apply a 4-inch layer of dry sugarcane trash between rows. This reduces moth egg-laying.\n2. **Light traps:** Install light traps at 5-6 per acre during evening hours (6-9 PM) to attract and kill adult moths.\n3. **Biological control:** Release Trichogramma chilonis egg parasites at 50,000 per acre at 15-day intervals.\n4. **Chemical control (last resort):** If infestation exceeds 10%, apply Chlorantraniliprole 0.4G granules in the leaf whorl.\n\n**Monitoring tip:**\n\nCheck your field twice a week during July-August. If you spot more than 5% dead hearts, escalate to chemical control immediately.\n\nThe DesiCane app now includes a pest alert feature. Enable notifications to receive location-specific pest advisories.`,
    date: "2026-06-28",
    author: "KIAAR Entomology Division",
    thumbnail: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=400&h=250&fit=crop",
  },
  {
    id: "7",
    title: "Drip Irrigation Subsidy: Apply Before August 31",
    excerpt: "Government subsidy covers up to 55% of drip system cost — last date for applications approaching.",
    body: `The Karnataka State Micro Irrigation Programme is offering subsidies of up to 55% on drip irrigation systems for sugarcane. The deadline for the current cycle is August 31, 2026.\n\n**Subsidy details:**\n\n| Category | Subsidy % | Max area |\n|----------|-----------|----------|\n| Small/marginal farmers | 55% | 5 hectares |\n| Other farmers | 45% | 5 hectares |\n| SC/ST farmers | 55% + additional ₹5000 | 5 hectares |\n\n**How to apply:**\n\n1. Visit the Horticulture Department website or your taluka agriculture office\n2. Documents needed:\n   - Land records (RTC/Pahani)\n   - Aadhaar card\n   - Bank passbook (for DBT)\n   - Caste certificate (if applicable)\n3. Select an empaneled drip system supplier\n4. Submit application online or at the taluka office\n\n**Why switch to drip for sugarcane?**\n\n- 40-50% water savings compared to flood irrigation\n- 15-20% higher yield due to uniform moisture\n- Works perfectly with fertigation\n- Reduces weed growth between rows\n- Lower labor costs\n\nGBL is partnering with two empaneled suppliers to offer bundled packages for farmers in the catchment area. Contact your field coordinator for details.\n\n**Important:** Apply early. Funds are allocated on a first-come, first-served basis.`,
    date: "2026-06-20",
    author: "Dept. of Horticulture, Karnataka",
    thumbnail: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=250&fit=crop",
  },
  {
    id: "8",
    title: "Understanding Your Sugarcane Growth Stages",
    excerpt: "Knowing the four growth phases helps you irrigate and fertilize at the right time.",
    body: `Sugarcane has four distinct growth phases, each with different water and nutrient requirements. Understanding these stages is key to efficient farming.\n\n**Phase 1: Germination (0-45 days)**\n\nThe sett (planted piece) sprouts and establishes roots.\n- Water need: Low-moderate (light, frequent irrigation)\n- Fertilizer: None or minimal\n- Critical: Maintain soil moisture for uniform germination\n\n**Phase 2: Tillering (45-120 days)**\n\nMultiple shoots emerge from the base of the plant.\n- Water need: Moderate\n- Fertilizer: First dose of Nitrogen + full Phosphorus\n- Critical: Too much water causes waterlogging; too little reduces tiller count\n\n**Phase 3: Grand Growth (120-270 days)**\n\nThe main cane elongation period — this is where yield is made.\n- Water need: HIGH (peak water demand)\n- Fertilizer: Second dose of Nitrogen + Potassium\n- Critical: Any moisture stress here directly reduces yield\n\n**Phase 4: Maturation (270-360 days)**\n\nSugar accumulates in the stalk.\n- Water need: Reduce gradually\n- Fertilizer: None (excess Nitrogen reduces sugar content)\n- Critical: Withhold irrigation 2-3 weeks before harvest to improve sugar recovery\n\n**How DesiCane helps:**\n\nOur AI system tracks your crop's growth stage based on planting date and adjusts irrigation recommendations automatically. It factors in weather, soil type, and the specific water needs of each phase.\n\nThis means you don't need to memorize irrigation schedules — the app tells you exactly when and how much to irrigate.`,
    date: "2026-06-15",
    author: "Dr. Anand Sharma, KIAAR",
    thumbnail: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=250&fit=crop",
  },
];
