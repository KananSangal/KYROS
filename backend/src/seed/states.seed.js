const mongoose = require("mongoose");
const dotenv = require("dotenv");

const State = require("../models/state.model");

dotenv.config();

const states = [
  {
    name: "Andhra Pradesh",
    code: "AP",
    capital: "Amaravati",
    languages: ["Telugu", "Urdu"],
    greetings: [
      {
        language: "Telugu",
        text: "నమస్కారం",
        pronunciation: "Namaskāram"
      }
    ],
    festivals: ["Ugadi", "Sankranti", "Dasara"],
    cuisine: ["Pulihora", "Gongura Pachadi", "Pootharekulu"],
    artsAndDance: ["Kuchipudi", "Kalamkari"],
    heritage: ["Tirumala Venkateswara Temple", "Amaravati Stupa"],
    description:
      "Andhra Pradesh is known for Telugu culture, Kuchipudi dance, temples, crafts and coastal traditions."
  },

  {
    name: "Arunachal Pradesh",
    code: "AR",
    capital: "Itanagar",
    languages: ["English", "Nyishi", "Adi", "Apatani"],
    greetings: [
      {
        language: "Nyishi",
        text: "Ane",
        pronunciation: "A-ne"
      }
    ],
    festivals: ["Losar", "Solung", "Nyokum"],
    cuisine: ["Thukpa", "Momos", "Zan"],
    artsAndDance: ["Ponung", "Popir"],
    heritage: ["Tawang Monastery", "Ziro Valley"],
    description:
      "Arunachal Pradesh is known for its diverse tribal cultures, Himalayan landscapes, monasteries and traditional festivals."
  },

  {
    name: "Assam",
    code: "AS",
    capital: "Dispur",
    languages: ["Assamese", "Bodo", "Bengali"],
    greetings: [
      {
        language: "Assamese",
        text: "নমস্কাৰ",
        pronunciation: "Nomoskar"
      }
    ],
    festivals: ["Bihu", "Ambubachi Mela", "Ali-Aye-Ligang"],
    cuisine: ["Khar", "Masor Tenga", "Pitha"],
    artsAndDance: ["Sattriya", "Bihu Dance"],
    heritage: ["Kaziranga National Park", "Kamakhya Temple"],
    description:
      "Assam is known for Bihu, tea culture, wildlife, Sattriya traditions and the Brahmaputra valley."
  },

  {
    name: "Bihar",
    code: "BR",
    capital: "Patna",
    languages: ["Hindi", "Maithili", "Bhojpuri", "Magahi"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Chhath Puja", "Sama Chakeva", "Jitiya"],
    cuisine: ["Litti Chokha", "Thekua", "Sattu"],
    artsAndDance: ["Madhubani Painting", "Jat-Jatin"],
    heritage: ["Mahabodhi Temple", "Nalanda Mahavihara"],
    description:
      "Bihar has a rich Buddhist, Hindu and folk heritage and is especially known for Madhubani art and Chhath traditions."
  },

  {
    name: "Chhattisgarh",
    code: "CG",
    capital: "Raipur",
    languages: ["Hindi", "Chhattisgarhi", "Gondi"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Bastar Dussehra", "Hareli", "Teeja"],
    cuisine: ["Chila", "Fara", "Aamat"],
    artsAndDance: ["Panthi", "Raut Nacha"],
    heritage: ["Sirpur", "Chitrakote Falls"],
    description:
      "Chhattisgarh is known for tribal traditions, Bastar crafts, folk dances, forests and ancient archaeological sites."
  },

  {
    name: "Goa",
    code: "GA",
    capital: "Panaji",
    languages: ["Konkani", "Marathi", "English"],
    greetings: [
      {
        language: "Konkani",
        text: "देव बरे करूं",
        pronunciation: "Dev borem korum"
      }
    ],
    festivals: ["Goa Carnival", "Shigmo", "Christmas"],
    cuisine: ["Goan Fish Curry", "Bebinca", "Xacuti"],
    artsAndDance: ["Fugdi", "Dhalo"],
    heritage: ["Basilica of Bom Jesus", "Old Goa"],
    description:
      "Goa is known for Konkani culture, coastal cuisine, festivals, music and Portuguese-era heritage."
  },

  {
    name: "Gujarat",
    code: "GJ",
    capital: "Gandhinagar",
    languages: ["Gujarati", "Hindi"],
    greetings: [
      {
        language: "Gujarati",
        text: "નમસ્તે",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Navratri", "Uttarayan", "Janmashtami"],
    cuisine: ["Dhokla", "Thepla", "Undhiyu"],
    artsAndDance: ["Garba", "Dandiya Raas", "Patola Weaving"],
    heritage: ["Rani ki Vav", "Dholavira", "Somnath Temple"],
    description:
      "Gujarat is known for Garba, vibrant crafts, textiles, historic sites and distinctive vegetarian cuisine."
  },

  {
    name: "Haryana",
    code: "HR",
    capital: "Chandigarh",
    languages: ["Hindi", "Haryanvi", "Punjabi"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Teej", "Baisakhi", "Lohri"],
    cuisine: ["Bajra Khichdi", "Bajra Roti", "Churma"],
    artsAndDance: ["Dhamal", "Saang"],
    heritage: ["Kurukshetra", "Rakhigarhi"],
    description:
      "Haryana is known for agricultural traditions, folk culture, wrestling and its association with Kurukshetra."
  },

  {
    name: "Himachal Pradesh",
    code: "HP",
    capital: "Shimla",
    languages: ["Hindi", "Pahari"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Kullu Dussehra", "Losar", "Minjar"],
    cuisine: ["Dham", "Siddu", "Madra"],
    artsAndDance: ["Nati", "Chamba Rumal"],
    heritage: ["Kangra Fort", "Great Himalayan National Park"],
    description:
      "Himachal Pradesh is known for Himalayan traditions, temples, folk dances, handicrafts and mountain culture."
  },

  {
    name: "Jharkhand",
    code: "JH",
    capital: "Ranchi",
    languages: ["Hindi", "Santali", "Mundari", "Ho"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Sarhul", "Karma", "Sohrai"],
    cuisine: ["Dhuska", "Rugra", "Thekua"],
    artsAndDance: ["Chhau", "Paika"],
    heritage: ["Parasnath", "Betla National Park"],
    description:
      "Jharkhand is rich in tribal traditions, forests, folk art, festivals and mineral heritage."
  },

  {
    name: "Karnataka",
    code: "KA",
    capital: "Bengaluru",
    languages: ["Kannada", "Tulu", "Konkani"],
    greetings: [
      {
        language: "Kannada",
        text: "ನಮಸ್ಕಾರ",
        pronunciation: "Namaskara"
      }
    ],
    festivals: ["Mysuru Dasara", "Ugadi", "Hampi Utsav"],
    cuisine: ["Bisi Bele Bath", "Mysore Pak", "Ragi Mudde"],
    artsAndDance: ["Yakshagana", "Dollu Kunitha"],
    heritage: ["Hampi", "Mysore Palace", "Pattadakal"],
    description:
      "Karnataka is known for Kannada culture, classical and folk traditions, historic architecture and diverse cuisine."
  },

  {
    name: "Kerala",
    code: "KL",
    capital: "Thiruvananthapuram",
    languages: ["Malayalam", "English"],
    greetings: [
      {
        language: "Malayalam",
        text: "നമസ്കാരം",
        pronunciation: "Namaskaram"
      }
    ],
    festivals: ["Onam", "Vishu", "Thrissur Pooram"],
    cuisine: ["Appam", "Puttu", "Sadya"],
    artsAndDance: ["Kathakali", "Mohiniyattam", "Theyyam"],
    heritage: ["Padmanabhaswamy Temple", "Fort Kochi"],
    description:
      "Kerala is known for Malayalam culture, Onam, classical arts, backwaters and distinctive cuisine."
  },

  {
    name: "Madhya Pradesh",
    code: "MP",
    capital: "Bhopal",
    languages: ["Hindi", "Bundeli", "Malvi", "Gondi"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Khajuraho Dance Festival", "Bhagoria", "Tansen Samaroh"],
    cuisine: ["Poha", "Bhutte ka Kees", "Dal Bafla"],
    artsAndDance: ["Rai", "Matki", "Gond Art"],
    heritage: ["Khajuraho Temples", "Sanchi Stupa", "Bhimbetka"],
    description:
      "Madhya Pradesh is known for ancient heritage sites, tribal art, folk traditions and central Indian cuisine."
  },

  {
    name: "Maharashtra",
    code: "MH",
    capital: "Mumbai",
    languages: ["Marathi", "Hindi", "Konkani"],
    greetings: [
      {
        language: "Marathi",
        text: "नमस्कार",
        pronunciation: "Namaskar"
      }
    ],
    festivals: ["Ganesh Chaturthi", "Gudi Padwa", "Diwali"],
    cuisine: ["Pav Bhaji", "Puran Poli", "Misal Pav"],
    artsAndDance: ["Lavani", "Powada", "Warli Art"],
    heritage: ["Ajanta Caves", "Ellora Caves", "Chhatrapati Shivaji Terminus"],
    description:
      "Maharashtra is known for Marathi literature, forts, festivals, folk theatre, dance and diverse cuisine."
  },

  {
    name: "Manipur",
    code: "MN",
    capital: "Imphal",
    languages: ["Meitei", "English"],
    greetings: [
      {
        language: "Meitei",
        text: "ꯈꯨꯔꯨꯝꯖꯔꯤ",
        pronunciation: "Khurumjari"
      }
    ],
    festivals: ["Yaoshang", "Lai Haraoba", "Ningol Chakouba"],
    cuisine: ["Eromba", "Chamthong", "Singju"],
    artsAndDance: ["Manipuri Dance", "Thang-Ta"],
    heritage: ["Kangla Fort", "Loktak Lake"],
    description:
      "Manipur is known for Manipuri classical dance, indigenous traditions, Loktak Lake and martial arts."
  },

  {
    name: "Meghalaya",
    code: "ML",
    capital: "Shillong",
    languages: ["English", "Khasi", "Garo", "Jaintia"],
    greetings: [
      {
        language: "Khasi",
        text: "Kumno phi?",
        pronunciation: "Kumno phi"
      }
    ],
    festivals: ["Wangala", "Nongkrem Dance", "Shad Suk Mynsiem"],
    cuisine: ["Jadoh", "Dohneiihong", "Pukhlein"],
    artsAndDance: ["Wangala Dance", "Shad Suk Mynsiem"],
    heritage: ["Living Root Bridges", "Mawsmai Caves"],
    description:
      "Meghalaya is known for Khasi, Garo and Jaintia traditions, living root bridges, music and festivals."
  },

  {
    name: "Mizoram",
    code: "MZ",
    capital: "Aizawl",
    languages: ["Mizo", "English"],
    greetings: [
      {
        language: "Mizo",
        text: "Chibai",
        pronunciation: "Chi-bai"
      }
    ],
    festivals: ["Chapchar Kut", "Mim Kut", "Pawl Kut"],
    cuisine: ["Bai", "Vawksa Rep", "Mizo Sawhchiar"],
    artsAndDance: ["Cheraw", "Khuallam"],
    heritage: ["Phawngpui National Park", "Vantawng Falls"],
    description:
      "Mizoram is known for Mizo culture, bamboo traditions, community festivals and vibrant folk dances."
  },

  {
    name: "Nagaland",
    code: "NL",
    capital: "Kohima",
    languages: ["English", "Nagamese", "Ao", "Angami"],
    greetings: [
      {
        language: "Nagamese",
        text: "Nomoskar",
        pronunciation: "Nomoskar"
      }
    ],
    festivals: ["Hornbill Festival", "Moatsu", "Sekrenyi"],
    cuisine: ["Smoked Pork", "Axone", "Bamboo Shoot Dishes"],
    artsAndDance: ["Naga Folk Dances", "Traditional Weaving"],
    heritage: ["Kohima War Cemetery", "Kisama Heritage Village"],
    description:
      "Nagaland is known for its diverse Naga tribes, traditional crafts, music, dance and the Hornbill Festival."
  },

  {
    name: "Odisha",
    code: "OD",
    capital: "Bhubaneswar",
    languages: ["Odia", "Sambalpuri"],
    greetings: [
      {
        language: "Odia",
        text: "ନମସ୍କାର",
        pronunciation: "Namaskar"
      }
    ],
    festivals: ["Rath Yatra", "Nuakhai", "Durga Puja"],
    cuisine: ["Dalma", "Pakhala Bhata", "Chhena Poda"],
    artsAndDance: ["Odissi", "Pattachitra", "Chhau"],
    heritage: ["Konark Sun Temple", "Jagannath Temple", "Udayagiri Caves"],
    description:
      "Odisha is known for Odissi dance, temple architecture, Pattachitra art and rich coastal traditions."
  },

  {
    name: "Punjab",
    code: "PB",
    capital: "Chandigarh",
    languages: ["Punjabi", "Hindi"],
    greetings: [
      {
        language: "Punjabi",
        text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",
        pronunciation: "Sat Sri Akal"
      }
    ],
    festivals: ["Baisakhi", "Lohri", "Gurpurab"],
    cuisine: ["Sarson da Saag", "Makki di Roti", "Amritsari Kulcha"],
    artsAndDance: ["Bhangra", "Giddha", "Phulkari"],
    heritage: ["Golden Temple", "Jallianwala Bagh"],
    description:
      "Punjab is known for Punjabi language and culture, agriculture, music, energetic folk dances and distinctive cuisine."
  },

  {
    name: "Rajasthan",
    code: "RJ",
    capital: "Jaipur",
    languages: ["Hindi", "Rajasthani", "Marwari", "Mewari"],
    greetings: [
      {
        language: "Rajasthani",
        text: "राम राम सा",
        pronunciation: "Ram Ram Sa"
      }
    ],
    festivals: ["Gangaur", "Teej", "Pushkar Fair"],
    cuisine: ["Dal Baati Churma", "Gatte ki Sabzi", "Ker Sangri"],
    artsAndDance: ["Ghoomar", "Kalbelia", "Kathputli"],
    heritage: ["Amber Fort", "Hawa Mahal", "Jaisalmer Fort"],
    description:
      "Rajasthan is known for royal heritage, desert traditions, folk music, colorful crafts and distinctive cuisine."
  },

  {
    name: "Sikkim",
    code: "SK",
    capital: "Gangtok",
    languages: ["Nepali", "Sikkimese", "Lepcha", "English"],
    greetings: [
      {
        language: "Nepali",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Losar", "Pang Lhabsol", "Losung"],
    cuisine: ["Momos", "Thukpa", "Gundruk"],
    artsAndDance: ["Singhi Chham", "Maruni"],
    heritage: ["Rumtek Monastery", "Khangchendzonga National Park"],
    description:
      "Sikkim is known for Himalayan cultures, Buddhist monasteries, mountain landscapes and diverse communities."
  },

  {
    name: "Tamil Nadu",
    code: "TN",
    capital: "Chennai",
    languages: ["Tamil", "English"],
    greetings: [
      {
        language: "Tamil",
        text: "வணக்கம்",
        pronunciation: "Vanakkam"
      }
    ],
    festivals: ["Pongal", "Tamil New Year", "Karthigai Deepam"],
    cuisine: ["Idli", "Dosa", "Pongal"],
    artsAndDance: ["Bharatanatyam", "Karagattam", "Tanjore Painting"],
    heritage: ["Brihadisvara Temple", "Mahabalipuram", "Meenakshi Amman Temple"],
    description:
      "Tamil Nadu is known for Tamil language and literature, temples, Bharatanatyam, Carnatic traditions and cuisine."
  },

  {
    name: "Telangana",
    code: "TS",
    capital: "Hyderabad",
    languages: ["Telugu", "Urdu"],
    greetings: [
      {
        language: "Telugu",
        text: "నమస్కారం",
        pronunciation: "Namaskaram"
      }
    ],
    festivals: ["Bathukamma", "Bonalu", "Ugadi"],
    cuisine: ["Hyderabadi Biryani", "Sakinalu", "Sarva Pindi"],
    artsAndDance: ["Perini Shivatandavam", "Oggu Katha"],
    heritage: ["Charminar", "Golconda Fort", "Ramappa Temple"],
    description:
      "Telangana is known for Telugu and Deccani traditions, Bathukamma, historic forts and distinctive cuisine."
  },

  {
    name: "Tripura",
    code: "TR",
    capital: "Agartala",
    languages: ["Bengali", "Kokborok", "English"],
    greetings: [
      {
        language: "Bengali",
        text: "নমস্কার",
        pronunciation: "Nomoskar"
      }
    ],
    festivals: ["Kharchi Puja", "Garia Puja", "Ker Puja"],
    cuisine: ["Mui Borok", "Chakhwi", "Bamboo Shoot Dishes"],
    artsAndDance: ["Hojagiri", "Garia Dance"],
    heritage: ["Ujjayanta Palace", "Neermahal"],
    description:
      "Tripura is known for tribal traditions, Bengali culture, bamboo crafts and distinctive folk dances."
  },

  {
    name: "Uttar Pradesh",
    code: "UP",
    capital: "Lucknow",
    languages: ["Hindi", "Urdu", "Awadhi", "Braj"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Diwali", "Holi", "Dev Deepawali", "Kumbh Mela"],
    cuisine: ["Awadhi Biryani", "Tunday Kabab", "Petha"],
    artsAndDance: ["Kathak", "Raslila", "Chikankari"],
    heritage: ["Taj Mahal", "Varanasi Ghats", "Fatehpur Sikri"],
    description:
      "Uttar Pradesh is known for its ancient cities, pilgrimage traditions, classical arts, crafts and diverse cuisine."
  },

  {
    name: "Uttarakhand",
    code: "UK",
    capital: "Dehradun",
    languages: ["Hindi", "Garhwali", "Kumaoni"],
    greetings: [
      {
        language: "Hindi",
        text: "नमस्ते",
        pronunciation: "Namaste"
      }
    ],
    festivals: ["Harela", "Nanda Devi Raj Jat", "Phool Dei"],
    cuisine: ["Kafuli", "Aloo ke Gutke", "Bal Mithai"],
    artsAndDance: ["Chholiya", "Jhora", "Aipan Art"],
    heritage: ["Kedarnath", "Badrinath", "Valley of Flowers"],
    description:
      "Uttarakhand is known for Himalayan pilgrimage traditions, folk arts, mountain cuisine and natural heritage."
  },

  {
    name: "West Bengal",
    code: "WB",
    capital: "Kolkata",
    languages: ["Bengali", "Hindi", "Nepali"],
    greetings: [
      {
        language: "Bengali",
        text: "নমস্কার",
        pronunciation: "Nomoskar"
      }
    ],
    festivals: ["Durga Puja", "Poila Boishakh", "Kali Puja"],
    cuisine: ["Machher Jhol", "Rosogolla", "Mishti Doi"],
    artsAndDance: ["Baul", "Purulia Chhau", "Patachitra"],
    heritage: ["Victoria Memorial", "Sundarbans", "Darjeeling Himalayan Railway"],
    description:
      "West Bengal is known for Bengali literature, Durga Puja, music, arts, cuisine and rich historical heritage."
  }
];

const seedStates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🍃 MongoDB connected");

    await State.deleteMany({});

    await State.insertMany(states);

    console.log(`🇮🇳 ${states.length} states inserted successfully`);

    await mongoose.connection.close();

    console.log("🔌 MongoDB connection closed");
  } catch (error) {
    console.error("❌ State seed failed:", error.message);

    process.exit(1);
  }
};

seedStates();