export type Language = 'en' | 'kn' | 'hi' | 'mr' | 'ta' | 'te';
export type Decision = 'irrigate' | 'delay' | 'skip';

interface Templates {
  irrigate_reason_low_moisture_no_rain: string;
  irrigate_reason_high_et0: string;
  irrigate_reason_default: string;
  delay_reason_rain_forecast: string;
  delay_reason_moderate: string;
  skip_reason_high_moisture: string;
  skip_reason_rain_expected: string;
  decision_irrigate: string;
  decision_delay: string;
  decision_skip: string;
}

const TEMPLATES: Record<Language, Templates> = {
  en: {
    irrigate_reason_low_moisture_no_rain: 'Irrigate because soil moisture is low and no rain is forecast for 3 days.',
    irrigate_reason_high_et0: 'Irrigate because evapotranspiration demand is high relative to available moisture.',
    irrigate_reason_default: 'Irrigation is advised based on current field and weather conditions.',
    delay_reason_rain_forecast: 'Delay irrigation — rain is expected in the next 3 days.',
    delay_reason_moderate: 'Soil moisture and rain forecast suggest waiting 1-2 more days before irrigating.',
    skip_reason_high_moisture: 'Skip irrigation — soil moisture is sufficient. No water needed now.',
    skip_reason_rain_expected: 'Skip irrigation — sufficient rain is expected to meet crop water needs.',
    decision_irrigate: 'Irrigate Now',
    decision_delay: 'Delay Irrigation',
    decision_skip: 'Skip Irrigation',
  },
  kn: {
    irrigate_reason_low_moisture_no_rain: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆ ಇದೆ ಮತ್ತು 3 ದಿನ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿಲ್ಲ — ನೀರಾವರಿ ಮಾಡಿ.',
    irrigate_reason_high_et0: 'ಆವಿಯಾಗುವಿಕೆ ಬೇಡಿಕೆ ಹೆಚ್ಚಾಗಿದೆ — ನೀರಾವರಿ ಅಗತ್ಯ.',
    irrigate_reason_default: 'ಪ್ರಸ್ತುತ ಕ್ಷೇತ್ರ ಮತ್ತು ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ ನೀರಾವರಿ ಶಿಫಾರಸ್ಸು ಮಾಡಲಾಗಿದೆ.',
    delay_reason_rain_forecast: 'ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ — ನೀರಾವರಿ ಮುಂದೂಡಿ.',
    delay_reason_moderate: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಮಳೆ ಮುನ್ಸೂಚನೆ ಪ್ರಕಾರ 1-2 ದಿನ ಕಾಯಿರಿ.',
    skip_reason_high_moisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಾಕಷ್ಟಿದೆ — ನೀರಾವರಿ ಬೇಡ.',
    skip_reason_rain_expected: 'ಸಾಕಷ್ಟು ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ — ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ.',
    decision_irrigate: 'ಈಗಲೇ ನೀರಾವರಿ ಮಾಡಿ',
    decision_delay: 'ನೀರಾವರಿ ಮುಂದೂಡಿ',
    decision_skip: 'ನೀರಾವರಿ ಬೇಡ',
  },
  hi: {
    irrigate_reason_low_moisture_no_rain: 'मिट्टी की नमी कम है और 3 दिनों में बारिश की संभावना नहीं — सिंचाई करें।',
    irrigate_reason_high_et0: 'वाष्पीकरण की मांग अधिक है — सिंचाई आवश्यक है।',
    irrigate_reason_default: 'वर्तमान खेत और मौसम की स्थिति के आधार पर सिंचाई की सलाह दी जाती है।',
    delay_reason_rain_forecast: 'अगले 3 दिनों में बारिश की संभावना है — सिंचाई टालें।',
    delay_reason_moderate: 'मिट्टी की नमी और बारिश का पूर्वानुमान देखते हुए 1-2 दिन प्रतीक्षा करें।',
    skip_reason_high_moisture: 'मिट्टी में पर्याप्त नमी है — सिंचाई की जरूरत नहीं।',
    skip_reason_rain_expected: 'पर्याप्त बारिश की संभावना है — सिंचाई की आवश्यकता नहीं।',
    decision_irrigate: 'अभी सिंचाई करें',
    decision_delay: 'सिंचाई टालें',
    decision_skip: 'सिंचाई न करें',
  },
  mr: {
    irrigate_reason_low_moisture_no_rain: 'जमिनीतील ओलावा कमी आहे आणि ३ दिवसात पाऊस अपेक्षित नाही — पाणी द्या.',
    irrigate_reason_high_et0: 'बाष्पीभवनाची मागणी जास्त आहे — सिंचन आवश्यक आहे.',
    irrigate_reason_default: 'सध्याच्या शेत आणि हवामान परिस्थितीनुसार सिंचनाचा सल्ला दिला जातो.',
    delay_reason_rain_forecast: 'पुढील ३ दिवसात पाऊस अपेक्षित आहे — सिंचन पुढे ढकला.',
    delay_reason_moderate: 'जमिनीचा ओलावा आणि पर्जन्यमान लक्षात घेता १-२ दिवस थांबा.',
    skip_reason_high_moisture: 'जमिनीत पुरेसा ओलावा आहे — सिंचनाची गरज नाही.',
    skip_reason_rain_expected: 'पुरेसा पाऊस अपेक्षित आहे — सिंचन करू नका.',
    decision_irrigate: 'आत्ता पाणी द्या',
    decision_delay: 'सिंचन पुढे ढकला',
    decision_skip: 'सिंचन नको',
  },
  ta: {
    irrigate_reason_low_moisture_no_rain: 'மண் ஈரப்பதம் குறைவாக உள்ளது மற்றும் 3 நாட்களில் மழை இல்லை — நீர்ப்பாசனம் செய்யுங்கள்.',
    irrigate_reason_high_et0: 'ஆவியாதல் தேவை அதிகமாக உள்ளது — நீர்ப்பாசனம் அவசியம்.',
    irrigate_reason_default: 'தற்போதைய வயல் மற்றும் வானிலை நிலைகளின் அடிப்படையில் நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.',
    delay_reason_rain_forecast: 'அடுத்த 3 நாட்களில் மழை எதிர்பார்க்கப்படுகிறது — நீர்ப்பாசனத்தை தாமதப்படுத்துங்கள்.',
    delay_reason_moderate: 'மண் ஈரப்பதம் மற்றும் மழை முன்னறிவிப்பின் படி 1-2 நாட்கள் காத்திருங்கள்.',
    skip_reason_high_moisture: 'மண்ணில் போதுமான ஈரப்பதம் உள்ளது — நீர்ப்பாசனம் தேவையில்லை.',
    skip_reason_rain_expected: 'போதுமான மழை எதிர்பார்க்கப்படுகிறது — நீர்ப்பாசனம் வேண்டாம்.',
    decision_irrigate: 'இப்போதே நீர்ப்பாசனம்',
    decision_delay: 'நீர்ப்பாசனம் தாமதி',
    decision_skip: 'நீர்ப்பாசனம் வேண்டாம்',
  },
  te: {
    irrigate_reason_low_moisture_no_rain: 'నేల తేమ తక్కువగా ఉంది మరియు 3 రోజులలో వర్షం రాదు — నీరు పెట్టండి.',
    irrigate_reason_high_et0: 'ఆవిరైపోవడం డిమాండ్ ఎక్కువగా ఉంది — నీటిపారుదల అవసరం.',
    irrigate_reason_default: 'ప్రస్తుత పొలం మరియు వాతావరణ పరిస్థితుల ఆధారంగా నీటిపారుదల సిఫారసు చేయబడింది.',
    delay_reason_rain_forecast: 'తదుపరి 3 రోజులలో వర్షం అంచనా ఉంది — నీటిపారుదలను వాయిదా వేయండి.',
    delay_reason_moderate: 'నేల తేమ మరియు వర్షపాతం అంచనా ఆధారంగా 1-2 రోజులు వేచి ఉండండి.',
    skip_reason_high_moisture: 'నేల తేమ సరిపోతుంది — నీటిపారుదల అవసరం లేదు.',
    skip_reason_rain_expected: 'తగినంత వర్షం అంచనా ఉంది — నీటిపారుదల అక్కర్లేదు.',
    decision_irrigate: 'ఇప్పుడే నీరు పెట్టండి',
    decision_delay: 'నీటిపారుదల వాయిదా వేయండి',
    decision_skip: 'నీటిపారుదల వద్దు',
  },
};

type TemplateKey = keyof Templates;

export function translate(key: TemplateKey, lang: Language): string {
  return TEMPLATES[lang]?.[key] ?? TEMPLATES.en[key];
}

export function decisionLabel(decision: Decision, lang: Language): string {
  return translate(`decision_${decision}` as TemplateKey, lang);
}

export function buildExplanation(
  decision: Decision,
  lang: Language,
  soilMoisturePct: number,
  rain3dMm: number,
): string {
  if (decision === 'irrigate') {
    if (soilMoisturePct < 30 && rain3dMm < 5) return translate('irrigate_reason_low_moisture_no_rain', lang);
    return translate('irrigate_reason_default', lang);
  }
  if (decision === 'delay') {
    if (rain3dMm >= 5) return translate('delay_reason_rain_forecast', lang);
    return translate('delay_reason_moderate', lang);
  }
  // skip
  if (soilMoisturePct >= 60) return translate('skip_reason_high_moisture', lang);
  return translate('skip_reason_rain_expected', lang);
}
