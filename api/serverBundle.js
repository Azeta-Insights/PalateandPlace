// api/serverApp.ts
import express from "express";

// api/apiHandler.ts
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

// api/firebaseAdmin.ts
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
var projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "cooktheworldapp";
var firestoreDatabaseId = process.env.FIREBASE_DATABASE_ID || "ai-studio-acafaa41-8ab8-407e-85e5-e51ae1fea3fb";
var adminApp = null;
var adminAuthInstance = null;
var adminDbInstance = null;
try {
  adminApp = getApps().length > 0 ? getApp() : initializeApp({ projectId });
  try {
    adminAuthInstance = getAuth(adminApp);
  } catch (authErr) {
    console.warn("Firebase Admin getAuth warning:", authErr);
  }
  try {
    adminDbInstance = firestoreDatabaseId && firestoreDatabaseId !== "(default)" ? getFirestore(adminApp, firestoreDatabaseId) : getFirestore(adminApp);
    try {
      adminDbInstance.settings({ ignoreUndefinedProperties: true });
    } catch {
    }
  } catch (dbErr) {
    console.warn("Firebase Admin getFirestore warning:", dbErr);
  }
} catch (appErr) {
  console.warn("Firebase Admin initializeApp warning:", appErr);
}
var adminAuth = adminAuthInstance;
var adminDb = adminDbInstance;

// src/data/premiumCatalogData.ts
var COUNTRIES_DATABASE = [
  // Africa
  { country: "Nigeria", code: "NG", continent: "Africa", region: "West Africa", cuisine: "Nigerian" },
  { country: "Morocco", code: "MA", continent: "Africa", region: "North Africa", cuisine: "Moroccan" },
  { country: "South Africa", code: "ZA", continent: "Africa", region: "Southern Africa", cuisine: "South African" },
  { country: "Senegal", code: "SN", continent: "Africa", region: "West Africa", cuisine: "Senegalese" },
  { country: "Ethiopia", code: "ET", continent: "Africa", region: "East Africa", cuisine: "Ethiopian" },
  { country: "Ghana", code: "GH", continent: "Africa", region: "West Africa", cuisine: "Ghanaian" },
  { country: "Egypt", code: "EG", continent: "Africa", region: "North Africa", cuisine: "Egyptian" },
  { country: "Kenya", code: "KE", continent: "Africa", region: "East Africa", cuisine: "Kenyan" },
  { country: "Tanzania", code: "TZ", continent: "Africa", region: "East Africa", cuisine: "Tanzanian" },
  { country: "Cameroon", code: "CM", continent: "Africa", region: "Central Africa", cuisine: "Cameroonian" },
  { country: "Tunisia", code: "TN", continent: "Africa", region: "North Africa", cuisine: "Tunisian" },
  { country: "Ivory Coast", code: "CI", continent: "Africa", region: "West Africa", cuisine: "Ivorian" },
  // Asia
  { country: "Japan", code: "JP", continent: "Asia", region: "East Asia", cuisine: "Japanese" },
  { country: "Thailand", code: "TH", continent: "Asia", region: "Southeast Asia", cuisine: "Thai" },
  { country: "India", code: "IN", continent: "Asia", region: "South Asia", cuisine: "Indian" },
  { country: "China", code: "CN", continent: "Asia", region: "East Asia", cuisine: "Chinese" },
  { country: "Vietnam", code: "VN", continent: "Asia", region: "Southeast Asia", cuisine: "Vietnamese" },
  { country: "Indonesia", code: "ID", continent: "Asia", region: "Southeast Asia", cuisine: "Indonesian" },
  { country: "South Korea", code: "KR", continent: "Asia", region: "East Asia", cuisine: "Korean" },
  { country: "Philippines", code: "PH", continent: "Asia", region: "Southeast Asia", cuisine: "Filipino" },
  { country: "Malaysia", code: "MY", continent: "Asia", region: "Southeast Asia", cuisine: "Malaysian" },
  { country: "Lebanon", code: "LB", continent: "Asia", region: "Middle East", cuisine: "Lebanese" },
  { country: "Singapore", code: "SG", continent: "Asia", region: "Southeast Asia", cuisine: "Singaporean" },
  { country: "Iran", code: "IR", continent: "Asia", region: "Middle East", cuisine: "Persian" },
  // Europe
  { country: "Italy", code: "IT", continent: "Europe", region: "Southern Europe", cuisine: "Italian" },
  { country: "Spain", code: "ES", continent: "Europe", region: "Southern Europe", cuisine: "Spanish" },
  { country: "France", code: "FR", continent: "Europe", region: "Western Europe", cuisine: "French" },
  { country: "Greece", code: "GR", continent: "Europe", region: "Southern Europe", cuisine: "Greek" },
  { country: "Poland", code: "PL", continent: "Europe", region: "Eastern Europe", cuisine: "Polish" },
  { country: "Portugal", code: "PT", continent: "Europe", region: "Southern Europe", cuisine: "Portuguese" },
  { country: "Sweden", code: "SE", continent: "Europe", region: "Northern Europe", cuisine: "Swedish" },
  { country: "Germany", code: "DE", continent: "Europe", region: "Western Europe", cuisine: "German" },
  { country: "United Kingdom", code: "GB", continent: "Europe", region: "Western Europe", cuisine: "British" },
  { country: "Ireland", code: "IE", continent: "Europe", region: "Western Europe", cuisine: "Irish" },
  { country: "Hungary", code: "HU", continent: "Europe", region: "Central Europe", cuisine: "Hungarian" },
  { country: "Belgium", code: "BE", continent: "Europe", region: "Western Europe", cuisine: "Belgian" },
  // North America
  { country: "Mexico", code: "MX", continent: "North America", region: "Central America", cuisine: "Mexican" },
  { country: "Jamaica", code: "JM", continent: "North America", region: "Caribbean", cuisine: "Jamaican" },
  { country: "United States", code: "US", continent: "North America", region: "North America", cuisine: "American" },
  { country: "Canada", code: "CA", continent: "North America", region: "North America", cuisine: "Canadian" },
  { country: "Cuba", code: "CU", continent: "North America", region: "Caribbean", cuisine: "Cuban" },
  { country: "Costa Rica", code: "CR", continent: "North America", region: "Central America", cuisine: "Costa Rican" },
  { country: "Dominican Republic", code: "DO", continent: "North America", region: "Caribbean", cuisine: "Dominican" },
  { country: "Puerto Rico", code: "PR", continent: "North America", region: "Caribbean", cuisine: "Puerto Rican" },
  // South America
  { country: "Peru", code: "PE", continent: "South America", region: "Andes", cuisine: "Peruvian" },
  { country: "Argentina", code: "AR", continent: "South America", region: "Southern Cone", cuisine: "Argentinian" },
  { country: "Brazil", code: "BR", continent: "South America", region: "South America", cuisine: "Brazilian" },
  { country: "Colombia", code: "CO", continent: "South America", region: "Andes", cuisine: "Colombian" },
  { country: "Chile", code: "CL", continent: "South America", region: "Southern Cone", cuisine: "Chilean" },
  { country: "Venezuela", code: "VE", continent: "South America", region: "Northern Coast", cuisine: "Venezuelan" },
  { country: "Ecuador", code: "EC", continent: "South America", region: "Andes", cuisine: "Ecuadorian" },
  { country: "Uruguay", code: "UY", continent: "South America", region: "Southern Cone", cuisine: "Uruguayan" },
  // Oceania
  { country: "Australia", code: "AU", continent: "Oceania", region: "Australasia", cuisine: "Australian" },
  { country: "New Zealand", code: "NZ", continent: "Oceania", region: "Australasia", cuisine: "New Zealand" },
  { country: "Fiji", code: "FJ", continent: "Oceania", region: "Melanesia", cuisine: "Fijian" },
  { country: "Samoa", code: "WS", continent: "Oceania", region: "Polynesia", cuisine: "Samoan" },
  { country: "French Polynesia", code: "PF", continent: "Oceania", region: "Polynesia", cuisine: "Tahitian" },
  { country: "Papua New Guinea", code: "PG", continent: "Oceania", region: "Melanesia", cuisine: "Papua New Guinean" },
  { country: "Tonga", code: "TO", continent: "Oceania", region: "Polynesia", cuisine: "Tongan" }
];
var PREMIUM_BLUEPRINTS = [
  // NIGERIA
  {
    title: "Egusi Soup with Pounded Yam",
    alternateName: "Obe Egusi",
    countryCode: "NG",
    description: "Ground melon seeds slow-simmered with smoked fish, goat meat, bitterleaf, and crayfish in rich red palm oil.",
    mealType: "Dinner",
    difficulty: "Medium",
    prepTime: 20,
    cookTime: 40,
    servings: 5,
    spiceLevel: 3,
    dietaryTags: ["Gluten-Free", "Halal"],
    allergens: ["Fish", "Shellfish"],
    keyIngredients: [
      { name: "Ground melon seeds (Egusi)", amount: 2, unit: "cups" },
      { name: "Red palm oil", amount: 0.5, unit: "cup" },
      { name: "Goat meat or beef", amount: 600, unit: "g" },
      { name: "Ground crayfish", amount: 3, unit: "tbsp" },
      { name: "Bitterleaf or spinach", amount: 2, unit: "cups" }
    ],
    steps: [
      "Boil goat meat with seasonings until tender.",
      "Mix ground egusi with warm water into paste drops.",
      "Fry onion in palm oil, drop in egusi balls to set chunks.",
      "Add stock, smoked fish, crayfish, and simmer 20 mins.",
      "Fold in chopped greens and serve with pounded yam."
    ],
    tips: ["Frying the egusi paste in hot palm oil creates delightful chewy curd morsels."],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Suya Spiced Beef Skewers",
    alternateName: "Tsire",
    countryCode: "NG",
    description: "Thinly sliced beef sirloin dredged in fiery yaji spice (roasted ground peanut powder, ginger, chili) and flame grilled.",
    mealType: "Dinner",
    difficulty: "Easy",
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    spiceLevel: 4,
    dietaryTags: ["Dairy-Free", "Halal"],
    allergens: ["Peanuts"],
    keyIngredients: [
      { name: "Beef sirloin", amount: 500, unit: "g" },
      { name: "Kuli-kuli peanut powder or roasted peanut flour", amount: 0.75, unit: "cup" },
      { name: "Ground ginger and garlic", amount: 1, unit: "tbsp" },
      { name: "Cayenne pepper", amount: 1, unit: "tbsp" }
    ],
    steps: [
      "Slice beef paper-thin against the grain and thread onto soaked wooden skewers.",
      "Dredge skewers generously in yaji peanut spice rub.",
      "Drizzle with oil and grill over hot coals or high heat for 3 mins per side.",
      "Sprinkle extra yaji and serve with sliced red onions and juicy tomatoes."
    ],
    tips: ["Freeze the beef for 20 mins beforehand to slice razor-thin with ease."],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Pepper Soup with Catfish",
    alternateName: "Point and Kill",
    countryCode: "NG",
    description: "Aromatic medicinal herbal broth infused with uda pods, calabash nutmeg (ehuru), and fresh catfish.",
    mealType: "Dinner",
    difficulty: "Easy",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    spiceLevel: 4,
    dietaryTags: ["Pescatarian", "Gluten-Free", "Dairy-Free"],
    allergens: ["Fish"],
    keyIngredients: [
      { name: "Fresh Catfish steaks", amount: 800, unit: "g" },
      { name: "Pepper soup spice mix (ehuru, uda, uziza)", amount: 2, unit: "tbsp" },
      { name: "Fresh scent leaves (African basil)", amount: 0.5, unit: "cup" },
      { name: "Scotch bonnet pepper", amount: 2, unit: "peppers" }
    ],
    steps: [
      "Wash catfish with hot water or alum to remove slime.",
      "Bring water with peppers, pepper soup spice blend, and bouillon to a rolling boil.",
      "Add catfish chunks carefully; cook on medium-low for 15 minutes without vigorous stirring.",
      "Toss in freshly chopped scent leaves in final 2 minutes and serve hot."
    ],
    tips: ["Do not stir catfish violently once in the pot or it will break apart."],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Fried Plantains & Pepper Sauce",
    alternateName: "Dodo and Ata Dindin",
    countryCode: "NG",
    description: "Caramelized golden ripe plantain coins served with a spicy crushed red pepper and onion relish.",
    mealType: "Side Dish",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 10,
    servings: 4,
    spiceLevel: 3,
    dietaryTags: ["Vegan", "Gluten-Free", "Dairy-Free"],
    allergens: [],
    keyIngredients: [
      { name: "Ripe sweet plantains (yellow with black spots)", amount: 3, unit: "pieces" },
      { name: "Vegetable oil for frying", amount: 1, unit: "cup" },
      { name: "Scotch bonnet and bell pepper", amount: 2, unit: "peppers" },
      { name: "Red onion", amount: 1, unit: "medium" }
    ],
    steps: [
      "Peel and slice plantains diagonally into 1/2-inch coins; sprinkle with salt.",
      "Heat oil over medium-high heat until shimmering.",
      "Fry plantain slices for 2-3 minutes per side until deep golden and caramelized.",
      "Fry crushed peppers and onions in 2 tbsp oil for ata dindin relish."
    ],
    tips: ["Ripe plantains with plenty of dark spots have the highest natural sugar for caramelization."],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Moi Moi (Steamed Bean Cakes)",
    alternateName: "Alele",
    countryCode: "NG",
    description: "Peeled black-eyed peas pureed with red peppers, onions, and flaked fish, steamed in broad banana leaves.",
    mealType: "Lunch",
    difficulty: "Medium",
    prepTime: 25,
    cookTime: 45,
    servings: 6,
    spiceLevel: 2,
    dietaryTags: ["Gluten-Free", "Dairy-Free"],
    allergens: ["Eggs", "Fish"],
    keyIngredients: [
      { name: "Black-eyed peas (peeled)", amount: 2, unit: "cups" },
      { name: "Tatashe bell peppers", amount: 2, unit: "large" },
      { name: "Hard-boiled eggs and flaked fish", amount: 2, unit: "eggs" },
      { name: "Vegetable oil", amount: 0.3, unit: "cup" }
    ],
    steps: [
      "Soak and peel skin off black-eyed peas.",
      "Blend beans with peppers, onions, and warm broth into a fluffy light batter.",
      "Whisk in vegetable oil and seasonings thoroughly to incorporate air.",
      "Pour into leaf wraps or ramekins, top with boiled egg slice and fish.",
      "Steam over low heat for 45 minutes until firm."
    ],
    tips: ["Whisking air into the batter before steaming makes the cake tender and fluffy."],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  // JAPAN
  {
    title: "Japanese Chicken Katsu Curry",
    alternateName: "\u30C1\u30AD\u30F3\u30AB\u30C4\u30AB\u30EC\u30FC",
    countryCode: "JP",
    description: "Crispy panko-breaded fried chicken cutlet served over rice smothered in rich, caramelized Japanese curry sauce.",
    mealType: "Dinner",
    difficulty: "Easy",
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    spiceLevel: 1,
    dietaryTags: [],
    allergens: ["Gluten", "Eggs"],
    keyIngredients: [
      { name: "Chicken breast fillets", amount: 4, unit: "cutlets" },
      { name: "Japanese panko breadcrumbs", amount: 1.5, unit: "cups" },
      { name: "Japanese curry roux blocks", amount: 100, unit: "g" },
      { name: "Onions and carrots", amount: 2, unit: "vegetables" },
      { name: "Steamed sushi rice", amount: 4, unit: "portions" }
    ],
    steps: [
      "Pound chicken cutlets thin, dredge in flour, beaten egg, and press into panko.",
      "Deep-fry cutlets at 170\xB0C for 5 minutes until crunchy and golden.",
      "Caramelize onions and carrots, add water and melt curry roux blocks into glossy sauce.",
      "Slice katsu cutlet and serve over steaming rice draped in luscious curry sauce."
    ],
    tips: ["Double dredge the chicken edges in panko for that signature airy Tokyo restaurant crunch."],
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Tokyo Gyoza (Pan-Fried Dumplings)",
    alternateName: "\u713C\u304D\u9903\u5B50",
    countryCode: "JP",
    description: "Crispy-bottomed steamed pork and napa cabbage dumplings seasoned with garlic, ginger, and sesame oil.",
    mealType: "Dinner",
    difficulty: "Medium",
    prepTime: 30,
    cookTime: 12,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: [],
    allergens: ["Gluten", "Soy", "Sesame"],
    keyIngredients: [
      { name: "Gyoza wrappers", amount: 24, unit: "wrappers" },
      { name: "Ground pork", amount: 300, unit: "g" },
      { name: "Napa cabbage", amount: 1.5, unit: "cups", notes: "Salted and squeezed dry" },
      { name: "Garlic and ginger", amount: 1, unit: "tbsp", notes: "Minced" },
      { name: "Soy sauce and sesame oil", amount: 1, unit: "tbsp" }
    ],
    steps: [
      "Mix pork, drained cabbage, garlic, ginger, soy sauce, and sesame oil until sticky.",
      "Place 1 tsp filling in wrapper, wet rim, and pleat into crescent dumplings.",
      "Fry in a hot oiled skillet for 2 mins until golden on bottom.",
      "Pour in 1/4 cup water, immediately cover with lid to steam cook for 4 mins.",
      "Uncover, drizzle sesame oil, and let crisp up for 1 minute before sliding onto plate."
    ],
    tips: ["Squeezing moisture thoroughly from salted cabbage keeps the dumpling skin crispy."],
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Beef Gyudon Rice Bowl",
    alternateName: "\u725B\u4E3C",
    countryCode: "JP",
    description: "Paper-thin beef slices and tender sweet onions simmered in dashi, mirin, and soy sauce over warm rice.",
    mealType: "Lunch",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    spiceLevel: 0,
    dietaryTags: ["Dairy-Free"],
    allergens: ["Soy", "Gluten"],
    keyIngredients: [
      { name: "Thinly sliced beef (ribeye or chuck)", amount: 300, unit: "g" },
      { name: "Yellow onion", amount: 1, unit: "large", notes: "Sliced into strips" },
      { name: "Dashi broth", amount: 1, unit: "cup" },
      { name: "Soy sauce and mirin", amount: 3, unit: "tbsp", notes: "Each" },
      { name: "Sugar", amount: 1, unit: "tbsp" }
    ],
    steps: [
      "Simmer sliced onions in dashi, soy sauce, mirin, and sugar for 5 minutes until tender.",
      "Add thin beef slices, spreading them out to cook gently for 3-4 minutes.",
      "Ladle saucy beef and onions over bowls of hot steamed rice.",
      "Garnish with pickled red ginger (beni shoga) and a raw egg yolk or onsen tamago."
    ],
    tips: ["Do not boil the beef violently; gentle simmering keeps the meat buttery and soft."],
    image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Crispy Vegetable Tempura",
    alternateName: "\u5929\u3077\u3089",
    countryCode: "JP",
    description: "Feather-light, lace-like crispy fried sweet potato, lotus root, shiitake, and asparagus with tentsuyu dipping broth.",
    mealType: "Lunch",
    difficulty: "Medium",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: ["Vegetarian"],
    allergens: ["Gluten", "Eggs"],
    keyIngredients: [
      { name: "Assorted vegetables (sweet potato, asparagus, mushrooms)", amount: 400, unit: "g" },
      { name: "Cake flour or tempura flour", amount: 1, unit: "cup" },
      { name: "Ice-cold sparkling water", amount: 1, unit: "cup" },
      { name: "Egg yolk", amount: 1, unit: "yolk" }
    ],
    steps: [
      "Gently mix ice water, egg yolk, and flour with chopsticks. Leave lumps; do not overmix.",
      "Dust vegetables lightly in dry flour, dip into cold batter.",
      "Fry in clean oil at 180\xB0C (350\xB0F) for 2-3 minutes until pale golden and super crisp.",
      "Drain on rack and serve immediately with tentsuyu sauce and grated daikon."
    ],
    tips: ["Ice-cold water prevents gluten development, producing that ultra-shattery crust."],
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Traditional Miso Soup with Tofu & Wakame",
    alternateName: "\u5473\u564C\u6C41",
    countryCode: "JP",
    description: "Pure, restorative dashi broth infused with red and white fermented miso paste, silky tofu cubes, and wakame seaweed.",
    mealType: "Breakfast",
    difficulty: "Easy",
    prepTime: 5,
    cookTime: 8,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: ["Vegetarian", "Gluten-Free Optional"],
    allergens: ["Soy"],
    keyIngredients: [
      { name: "Dashi broth", amount: 4, unit: "cups" },
      { name: "Miso paste (awase or white)", amount: 3, unit: "tbsp" },
      { name: "Silken tofu", amount: 150, unit: "g", notes: "Cut into 1/2-inch cubes" },
      { name: "Dried wakame seaweed", amount: 1, unit: "tbsp", notes: "Rehydrated" },
      { name: "Scallions", amount: 2, unit: "stalks", notes: "Finely sliced" }
    ],
    steps: [
      "Bring dashi broth to a gentle simmer in a saucepan.",
      "Add diced silken tofu and rehydrated wakame; warm through for 2 minutes.",
      "Turn off heat. Place miso paste in a ladle, submerge into broth, and dissolve with chopsticks.",
      "Ladle into small lacquer bowls and sprinkle with freshly sliced scallions."
    ],
    tips: ["Never boil miso soup after adding miso paste, as boiling destroys beneficial aromatics and enzymes."],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  // ITALY
  {
    title: "Classic Neapolitan Margherita Pizza",
    alternateName: "Pizza Margherita DOC",
    countryCode: "IT",
    description: "Blistered wood-fired crust topped with sweet San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.",
    mealType: "Dinner",
    difficulty: "Medium",
    prepTime: 25,
    cookTime: 8,
    servings: 2,
    spiceLevel: 0,
    dietaryTags: ["Vegetarian"],
    allergens: ["Dairy", "Gluten"],
    keyIngredients: [
      { name: "Tipo 00 pizza flour dough (fermented)", amount: 2, unit: "balls" },
      { name: "San Marzano canned tomatoes (crushed by hand)", amount: 1, unit: "cup" },
      { name: "Fresh mozzarella di bufala", amount: 150, unit: "g", notes: "Torn" },
      { name: "Fresh sweet basil leaves", amount: 8, unit: "leaves" },
      { name: "Extra virgin olive oil", amount: 2, unit: "tbsp" }
    ],
    steps: [
      "Stretch dough by hand on a floured board into a 12-inch disc with an airy crust rim (cornicione).",
      "Spread crushed San Marzano tomatoes evenly with back of a spoon.",
      "Scatter torn buffalo mozzarella and fresh basil leaves.",
      "Bake on a preheated pizza stone at maximum oven heat (260\xB0C+) for 6-8 minutes until blistered.",
      "Finish with a drizzle of fruity olive oil and slice."
    ],
    tips: ["Never use a rolling pin; gently pushing air from the center into the outer rim creates the puffy cornicione."],
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Creamy Mushroom Risotto",
    alternateName: "Risotto ai Funghi Porcini",
    countryCode: "IT",
    description: "Silky, creamy carnaroli rice slowly ladled with warm stock, dried porcini mushrooms, butter, and 24-month Parmigiano-Reggiano.",
    mealType: "Dinner",
    difficulty: "Medium",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: ["Gluten-Free", "Vegetarian"],
    allergens: ["Dairy"],
    keyIngredients: [
      { name: "Carnaroli or Arborio rice", amount: 300, unit: "g" },
      { name: "Dried Porcini mushrooms", amount: 30, unit: "g", notes: "Soaked in warm water" },
      { name: "Warm vegetable broth", amount: 5, unit: "cups" },
      { name: "Dry white wine", amount: 0.5, unit: "cup" },
      { name: "Parmigiano-Reggiano and butter", amount: 50, unit: "g", notes: "For mantecatura" }
    ],
    steps: [
      "Toast rice in olive oil until grains are translucent with white centers (tostatura).",
      "Deglaze with white wine until evaporated.",
      "Add strained porcini mushrooms and ladle warm broth one scoop at a time, stirring constantly as liquid absorbs.",
      "When rice is al dente (18 mins), take pan off heat.",
      "Perform mantecatura: vigorously beat in cold cubed butter and grated Parmigiano until wave-like (all\u2019onda)."
    ],
    tips: ["Vigorous mantecatura off the heat creates that glossy emulsion without needing heavy cream."],
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Tuscan Ribollita Vegetable Bread Stew",
    alternateName: "Zuppa Toscana Ribollita",
    countryCode: "IT",
    description: "Hearty re-boiled Tuscan soup with cavolo nero kale, cannellini beans, vegetables, and day-old rustic country sourdough.",
    mealType: "Dinner",
    difficulty: "Easy",
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    spiceLevel: 0,
    dietaryTags: ["Vegan", "Dairy-Free"],
    allergens: ["Gluten"],
    keyIngredients: [
      { name: "Lacinato Tuscan kale (cavolo nero)", amount: 1, unit: "bunch" },
      { name: "Cooked cannellini white beans", amount: 3, unit: "cups", notes: "Half mashed" },
      { name: "Stale crusty sourdough bread", amount: 4, unit: "thick slices" },
      { name: "Carrots, celery, and onion", amount: 2, unit: "cups" },
      { name: "Extra virgin olive oil", amount: 0.3, unit: "cup" }
    ],
    steps: [
      "Saut\xE9 vegetables in olive oil, add chopped kale, broth, and mashed cannellini beans.",
      "Simmer for 30 minutes until vegetables are rich and tender.",
      "Tear stale bread into the pot. Let it sit and re-boil (ribollita) over low heat until stew is thick enough to hold a spoon upright.",
      "Serve in earthenware bowls drizzled generously with peppery fresh Tuscan olive oil."
    ],
    tips: ["Mashing half the cannellini beans gives the broth its comforting velvety body."],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Venetian Tiramis\xF9",
    alternateName: "Tiramis\xF9 Tradizionale",
    countryCode: "IT",
    description: "Airy savoiardi ladyfingers soaked in espresso and Marsala wine, layered with fluffy whipped mascarpone cream and dusted with dark cocoa.",
    mealType: "Dessert",
    difficulty: "Easy",
    prepTime: 25,
    cookTime: 0,
    servings: 8,
    spiceLevel: 0,
    dietaryTags: ["Vegetarian"],
    allergens: ["Dairy", "Eggs", "Gluten"],
    keyIngredients: [
      { name: "Italian Ladyfingers (Savoiardi)", amount: 24, unit: "cookies" },
      { name: "Mascarpone cheese", amount: 500, unit: "g" },
      { name: "Fresh eggs", amount: 4, unit: "large", notes: "Whites whipped, yolks whipped with sugar" },
      { name: "Strong brewed espresso", amount: 1.5, unit: "cups" },
      { name: "Dutch-process cocoa powder", amount: 3, unit: "tbsp" }
    ],
    steps: [
      "Whisk egg yolks and sugar until pale and doubled. Fold in mascarpone until smooth.",
      "Whip egg whites to stiff peaks, gently fold into mascarpone cream.",
      "Dip ladyfingers briefly (1 second each) in espresso, line bottom of dish.",
      "Spread half the cream, repeat second layer of ladyfingers and cream.",
      "Chill for at least 6 hours, dust top with rich cocoa powder right before serving."
    ],
    tips: ["Only dunk ladyfingers for a single second; they absorb espresso quickly and shouldn\u2019t turn soggy."],
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Classic Bolognese Ragu with Tagliatelle",
    alternateName: "Tagliatelle al Rag\xF9 alla Bolognese",
    countryCode: "IT",
    description: "Slow-simmered beef and pork rag\xF9 gently bathed in milk, white wine, and sweet tomatoes tossed with fresh egg tagliatelle ribbons.",
    mealType: "Dinner",
    difficulty: "Medium",
    prepTime: 20,
    cookTime: 120,
    servings: 6,
    spiceLevel: 0,
    dietaryTags: [],
    allergens: ["Dairy", "Gluten", "Eggs"],
    keyIngredients: [
      { name: "Fresh egg tagliatelle", amount: 500, unit: "g" },
      { name: "Minced beef chuck and pork", amount: 600, unit: "g" },
      { name: "Finely minced sofrito (onion, celery, carrot)", amount: 1.5, unit: "cups" },
      { name: "Whole milk", amount: 1, unit: "cup", notes: "Tenderizes meat" },
      { name: "Dry white wine", amount: 1, unit: "cup" },
      { name: "Passata tomato puree", amount: 1.5, unit: "cups" }
    ],
    steps: [
      "Sweat sofrito in butter and oil. Add minced meats, browning gently without crusting.",
      "Pour in white wine, let evaporate completely.",
      "Add milk, simmering gently until milk reduces into the meat.",
      "Stir in passata tomatoes and stock. Cover and simmer on lowest heat for 2.5 hours.",
      "Toss with al dente fresh egg tagliatelle and finish with Parmigiano."
    ],
    tips: ["Adding milk early in the braise breaks down the meat fibers, ensuring a tender, melt-in-your-mouth sauce."],
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80"
  }
];

// src/data/recipesAfrica.ts
var AFRICA_DISHES = {
  NG: [
    {
      title: "Afang Soup with Garri",
      alternateName: "Obe Afang",
      type: "soup",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 40,
      servings: 5,
      difficulty: "Medium",
      spiceLevel: 3,
      description: "Luxurious leafy Efik soup made with finely shredded wild afang leaves, waterleaf, assorted meats, and dried stockfish in rich red palm oil.",
      culturalBackground: "A royal ceremonial delicacy of the Efik and Ibibio people in southern Nigeria, famed for its deep earthy fragrance and nutrient richness.",
      ingredients: [
        { name: "Afang leaves (Ukazi, finely pounded)", amount: 3, unit: "cups" },
        { name: "Waterleaf or spinach", amount: 4, unit: "cups", notes: "Washed and chopped" },
        { name: "Assorted meats (beef, shaki, cow foot)", amount: 600, unit: "g" },
        { name: "Stockfish and dried catfish", amount: 200, unit: "g", notes: "Deboned" },
        { name: "Ground crayfish", amount: 4, unit: "tbsp" },
        { name: "Red palm oil", amount: 0.75, unit: "cup" },
        { name: "Scotch bonnet peppers", amount: 2, unit: "peppers", notes: "Pounded" }
      ],
      steps: [
        { instruction: "Season assorted meats and stockfish with onions and bouillon; boil with water until meltingly tender (30 mins).", timerMinutes: 30 },
        { instruction: "Add red palm oil, pounded scotch bonnets, and ground crayfish to the rich meat broth; simmer for 5 minutes.", timerMinutes: 5 },
        { instruction: "Add chopped waterleaf; cook uncovered for 3 minutes until softened and releases its natural moisture.", timerMinutes: 3 },
        { instruction: "Stir in pounded afang leaves; lower the heat and allow to simmer gently for 5 minutes without overcooking the greens.", timerMinutes: 5 },
        { instruction: "Serve steaming hot accompanied by soft yellow garri, fufu, or pounded yam." }
      ],
      substitutions: [{ ingredient: "Afang leaves", substitute: "Dried wild okazi leaves soaked in warm water" }],
      tips: ["Pounding the afang leaves in a mortar before adding softens their tough fiber and releases their herbal aroma."]
    },
    {
      title: "Banga Soup (Palm Fruit Extract Stew)",
      alternateName: "Oghwo Amiedi",
      type: "soup",
      mealType: "Dinner",
      prepTime: 25,
      cookTime: 45,
      servings: 5,
      difficulty: "Medium",
      spiceLevel: 3,
      description: "Rich Delta-style soup made from fresh palm nut concentrate, flavored with beletete, oburunbebe stick, and fresh catfish.",
      culturalBackground: "Traditional to the Urhobo and Itsekiri peoples of Delta State, typically served with yellow starch (Usi).",
      ingredients: [
        { name: "Palm nut fruit extract concentrate", amount: 800, unit: "g" },
        { name: "Fresh Catfish steaks", amount: 700, unit: "g" },
        { name: "Banga spice mix (rohojie & oburunbebe)", amount: 2, unit: "tbsp" },
        { name: "Beletete leaves", amount: 1, unit: "tbsp", notes: "Crushed dried leaves" },
        { name: "Dried crayfish", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Boil palm nut concentrate in a clay pot with water until the rich oil begins to float to the surface (15 mins).", timerMinutes: 15 },
        { instruction: "Add banga spice blend, crushed beletete leaves, and ground crayfish; simmer to thicken broth.", timerMinutes: 10 },
        { instruction: "Carefully place catfish steaks into the soup; simmer gently on low heat for 15 minutes.", timerMinutes: 15 },
        { instruction: "Serve hot in an earthenware native pot alongside warm yellow starch (usi)." }
      ],
      substitutions: [{ ingredient: "Fresh palm nuts", substitute: "Canned palm nut pulp (concentrate)" }],
      tips: ["Do not stir vigorously after adding catfish to keep the delicate fish steaks whole."]
    },
    {
      title: "Asun (Spicy Peppered Goat Meat)",
      alternateName: "Peppered Goat Bites",
      type: "grill",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 5,
      description: "Smoky, flame-roasted tender goat meat saut\xE9ed in roughly crushed habaneros, red bell peppers, and sweet onions.",
      culturalBackground: "The king of Yoruba celebratory small chops, roasted over open embers before tossing in fiery aromatics.",
      ingredients: [
        { name: "Bone-in goat meat (cubed)", amount: 800, unit: "g" },
        { name: "Coarsely blended scotch bonnets", amount: 4, unit: "peppers" },
        { name: "Red onions (thickly sliced)", amount: 2, unit: "onions" },
        { name: "Vegetable oil", amount: 3, unit: "tbsp" },
        { name: "Bouillon and sea salt", amount: 1, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Season goat meat with garlic, ginger, and bouillon; roast or grill at 200\xB0C for 25 minutes until lightly charred.", timerMinutes: 25 },
        { instruction: "Heat oil in a wide pan; saut\xE9 sliced red onions and coarse crushed scotch bonnets for 3 minutes.", timerMinutes: 3 },
        { instruction: "Toss roasted goat meat chunks in the sizzling spicy pepper mix until thoroughly coated and glossy (5 mins).", timerMinutes: 5 },
        { instruction: "Serve hot with chilled drinks and sliced fresh onions." }
      ],
      substitutions: [{ ingredient: "Goat meat", substitute: "Lamb shoulder or beef brisket" }],
      tips: ["Coarsely crushing peppers rather than smooth pureeing preserves the crunchy, fiery texture."]
    },
    {
      title: "Efo Riro (Yoruba Rich Spinach Stew)",
      alternateName: "Rich Vegetable Soup",
      type: "soup",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 30,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 3,
      description: "Lush green spinach stew simmered in a reduced bell pepper base with locust beans (iru), smoked catfish, and tender beef.",
      culturalBackground: 'A Yoruba classic whose name translates to "stirred leafy greens", always cooked with dry-rendered peppers so greens remain vibrant.',
      ingredients: [
        { name: "Fresh spinach or shoko greens", amount: 500, unit: "g", notes: "Blanched and squeezed dry" },
        { name: "Tatashe bell peppers & scotch bonnet", amount: 3, unit: "peppers", notes: "Coarsely blended & reduced" },
        { name: "Fermented locust beans (Iru)", amount: 2, unit: "tbsp" },
        { name: "Red palm oil", amount: 0.5, unit: "cup" },
        { name: "Smoked dried fish and shredded beef", amount: 350, unit: "g" }
      ],
      steps: [
        { instruction: "Heat palm oil in a pot until clear; saut\xE9 sliced onions and locust beans until fragrant.", timerMinutes: 3 },
        { instruction: "Add reduced pepper blend and simmer for 15 minutes until oil separates from the stew.", timerMinutes: 15 },
        { instruction: "Add smoked fish, meat, and ground crayfish; stir together for 5 minutes.", timerMinutes: 5 },
        { instruction: "Fold in squeezed blanched spinach greens, turn off the heat, and let the residual steam finish cooking the greens (2 mins).", timerMinutes: 2 },
        { instruction: "Serve with hot amala, eba, or jasmine rice." }
      ],
      substitutions: [{ ingredient: "Shoko greens", substitute: "Baby spinach or Swiss chard" }],
      tips: ["Squeezing excess water from blanched spinach prevents your efo riro from turning watery."]
    },
    {
      title: "Ofada Rice with Ayamase Sauce",
      alternateName: "Designer Stew",
      type: "rice",
      mealType: "Lunch",
      prepTime: 25,
      cookTime: 45,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 4,
      description: "Unpolished indigenous fermented rice served with dark green pepper sauce bleached in red palm oil with locust beans and boiled eggs.",
      culturalBackground: "Named after the historic town of Ofada in Ogun State, famed for its pungent aroma and wrapping in broad Uma leaves.",
      ingredients: [
        { name: "Unpolished Ofada rice", amount: 3, unit: "cups", notes: "Rinsed well" },
        { name: "Green bell peppers & green scotch bonnets", amount: 6, unit: "peppers", notes: "Coarse blended & strained" },
        { name: "Red palm oil (for bleaching)", amount: 1, unit: "cup" },
        { name: "Fermented locust beans (Iru)", amount: 3, unit: "tbsp" },
        { name: "Assorted boiled meats & hard-boiled eggs", amount: 400, unit: "g" }
      ],
      steps: [
        { instruction: "Boil rinsed ofada rice in salted water for 25 minutes until tender and nutty; drain and steam.", timerMinutes: 25 },
        { instruction: "Carefully bleach palm oil in a covered pot on low heat until dark golden (10 mins); cool before opening lid.", timerMinutes: 10 },
        { instruction: "Saut\xE9 chopped onions and iru in the oil, then add boiled green pepper puree; fry for 15 minutes.", timerMinutes: 15 },
        { instruction: "Add assorted bite-sized meats and boiled eggs; simmer until oil floats on top (10 mins).", timerMinutes: 10 },
        { instruction: "Ladle rich ayamase sauce over steaming hot aromatic ofada rice." }
      ],
      substitutions: [{ ingredient: "Ofada rice", substitute: "Brown basmati rice" }],
      tips: ["Always keep the pot covered while bleaching palm oil to contain smoke until it cools."]
    }
  ],
  MA: [
    {
      title: "Moroccan Lamb Couscous Royal",
      alternateName: "Kseksou B\u2019Sebaa Khoudar",
      type: "curry",
      mealType: "Dinner",
      prepTime: 30,
      cookTime: 60,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 1,
      description: "Fluffy semolina grains triple-steamed over a fragrant saffron and ginger broth loaded with seven seasonal vegetables and tender lamb.",
      culturalBackground: "The traditional Friday gathering centerpiece across Morocco, prepared in a traditional two-tier couscoussier pot.",
      ingredients: [
        { name: "Fine semolina couscous", amount: 500, unit: "g" },
        { name: "Lamb shoulder chunks", amount: 700, unit: "g" },
        { name: "Seven vegetables (carrots, pumpkin, zucchini, turnips, cabbage, chickpeas, tomatoes)", amount: 600, unit: "g" },
        { name: "Ras el Hanout & saffron threads", amount: 1, unit: "tbsp" },
        { name: "Sm\xE9n (aged Moroccan clarified butter)", amount: 1, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Brown lamb shoulder with onions, saffron, ginger, and ras el hanout in the bottom of a couscoussier.", timerMinutes: 10 },
        { instruction: "Add chickpeas, water, and firm root vegetables; bring to a rolling aromatic boil.", timerMinutes: 15 },
        { instruction: "Rub couscous with water and olive oil, place in the top steamer basket over the lamb stew to steam (20 mins).", timerMinutes: 20 },
        { instruction: "Empty couscous into a large dish, aerate with sm\xE9n and salted water, return to steam a second time with tender vegetables added to broth.", timerMinutes: 15 },
        { instruction: "Mound fluffy couscous in a ceramic tagine, crown with lamb, radiate seven vegetables outward, and ladle over saffron broth." }
      ],
      substitutions: [{ ingredient: "Sm\xE9n butter", substitute: "Good quality ghee with a pinch of sea salt" }],
      tips: ["Rubbing couscous grains with your palms between steamings creates an impossibly light, cloud-like texture."]
    },
    {
      title: "Zaalouk (Moroccan Spiced Eggplant Dip)",
      alternateName: "Zaalouk de Tomates et Aubergines",
      type: "salad",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 1,
      description: "Charred roasted eggplants cooked down with sweet grated tomatoes, garlic, cumin, paprika, fresh coriander, and extra virgin olive oil.",
      culturalBackground: "One of Morocco\u2019s most iconic cooked salads, served warm or at room temperature with crusty khobz bread.",
      ingredients: [
        { name: "Large globe eggplants", amount: 2, unit: "eggplants", notes: "Charred and peeled" },
        { name: "Ripe tomatoes", amount: 3, unit: "tomatoes", notes: "Grated" },
        { name: "Garlic cloves", amount: 4, unit: "cloves", notes: "Minced" },
        { name: "Ground cumin & sweet paprika", amount: 1, unit: "tbsp", notes: "Each" },
        { name: "Extra virgin olive oil", amount: 4, unit: "tbsp" },
        { name: "Fresh cilantro and lemon juice", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Char whole eggplants over an open flame or under broiler until skin is blackened and flesh is tender (15 mins); peel and mash.", timerMinutes: 15 },
        { instruction: "In a skillet, saut\xE9 grated tomatoes and garlic in olive oil with cumin, paprika, and salt for 10 minutes.", timerMinutes: 10 },
        { instruction: "Add mashed smoky eggplant; cook while mashing with a wooden spoon until glossy and thick (10 mins).", timerMinutes: 10 },
        { instruction: "Fold in chopped cilantro and a squeeze of fresh lemon; serve with warm crusty bread." }
      ],
      substitutions: [{ ingredient: "Charred eggplant", substitute: "Diced boiled eggplant" }],
      tips: ["Direct flame roasting gives the eggplant a signature campfire smokiness that makes zaalouk unforgettable."]
    },
    {
      title: "Harira (Traditional Moroccan Velvet Soup)",
      alternateName: "Moroccan Lentil & Chickpea Soup",
      type: "soup",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 50,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 1,
      description: "Velvety, fragrant tomato and herb soup with tender lamb cubes, green lentils, chickpeas, vermicelli noodles, and a rich cinnamon-ginger undertone.",
      culturalBackground: "The sacred soup used across Morocco to break the daily fast during Ramadan, paired with sweet medjool dates and honey chebakia.",
      ingredients: [
        { name: "Diced lamb meat", amount: 300, unit: "g" },
        { name: "Cooked chickpeas", amount: 1.5, unit: "cups" },
        { name: "Brown lentils", amount: 0.5, unit: "cup" },
        { name: "Plum tomatoes", amount: 5, unit: "tomatoes", notes: "Pureed" },
        { name: "Fresh celery, parsley, and cilantro", amount: 1.5, unit: "cups", notes: "Finely chopped" },
        { name: "Cinnamon stick and ground ginger", amount: 1, unit: "tsp", notes: "Each" },
        { name: "Fine vermicelli angel hair", amount: 0.5, unit: "cup" }
      ],
      steps: [
        { instruction: "Saut\xE9 lamb cubes with onions, celery, herbs, cinnamon, and turmeric in olive oil for 5 minutes.", timerMinutes: 5 },
        { instruction: "Add pureed tomatoes, lentils, chickpeas, and 6 cups water; simmer for 35 minutes until lamb and lentils are tender.", timerMinutes: 35 },
        { instruction: "Whisk 3 tbsp flour with 1 cup water (tedouira) and stir into boiling soup to create harira\u2019s signature velvety silkiness.", timerMinutes: 5 },
        { instruction: "Add broken vermicelli noodles; cook for final 5 minutes and finish with fresh lemon juice.", timerMinutes: 5 }
      ],
      substitutions: [{ ingredient: "Lamb", substitute: "Beef brisket or keep fully vegetarian" }],
      tips: ["The flour-water slurry (tedouira) should be added in a steady stream while stirring to avoid lumps."]
    },
    {
      title: "Pastilla (Sweet & Savory Spiced Chicken Pie)",
      alternateName: "Bstilla au Poulet",
      type: "pastry",
      mealType: "Dinner",
      prepTime: 35,
      cookTime: 40,
      servings: 6,
      difficulty: "Advanced",
      spiceLevel: 1,
      description: "Crispy golden warqa pastry stuffed with shredded saffron chicken, caramelized onion-egg curd, and toasted cinnamon-scented almonds.",
      culturalBackground: "The pinnacle of Fez aristocratic cuisine, combining sweet powdered sugar and aromatic savory saffron poultry in one flaky pie.",
      ingredients: [
        { name: "Phyllo or warqa pastry sheets", amount: 12, unit: "sheets" },
        { name: "Shredded poached chicken meat", amount: 500, unit: "g" },
        { name: "Caramelized onion-egg custard filling", amount: 2, unit: "cups" },
        { name: "Toasted ground almonds with orange blossom water & cinnamon", amount: 1.5, unit: "cups" },
        { name: "Melted butter (for brushing)", amount: 100, unit: "g" },
        { name: "Powdered sugar & cinnamon (for lattice decoration)", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Layer overlapping melted-butter brushed pastry sheets in a round pie dish.", timerMinutes: 5 },
        { instruction: "Spread shredded saffron chicken across base, followed by caramelized onion-egg layer and scented almond crunch.", timerMinutes: 5 },
        { instruction: "Fold outer pastry leaves inwards, cap with buttered sheets, and tuck edges under neatly.", timerMinutes: 5 },
        { instruction: "Bake at 190\xB0C (375\xB0F) for 25 minutes until deep golden and shatteringly crisp.", timerMinutes: 25 },
        { instruction: "Dust top with powdered sugar and draw geometric diamonds with ground cinnamon." }
      ],
      substitutions: [{ ingredient: "Warqa pastry", substitute: "High quality phyllo dough" }],
      tips: ["Let the chicken and egg filling cool completely before assembling to prevent pastry from becoming soggy."]
    },
    {
      title: "Briouats with Honey & Toasted Almonds",
      alternateName: "Moroccan Almond Pastry Triangles",
      type: "dessert",
      mealType: "Dessert",
      prepTime: 30,
      cookTime: 15,
      servings: 8,
      difficulty: "Medium",
      spiceLevel: 0,
      description: "Crispy fried phyllo pastry triangles filled with aromatic almond paste, dunked hot into warm orange blossom honey and sprinkled with sesame.",
      culturalBackground: "A beloved festive dessert served alongside mint tea during weddings and celebration feasts.",
      ingredients: [
        { name: "Phyllo pastry strips", amount: 16, unit: "strips" },
        { name: "Blanched almond paste with mastic and cinnamon", amount: 300, unit: "g" },
        { name: "Orange blossom water", amount: 2, unit: "tbsp" },
        { name: "Wildflower honey", amount: 1.5, unit: "cups", notes: "Warmed" },
        { name: "Toasted sesame seeds", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Roll almond paste into small oval balls scented with orange blossom water.", timerMinutes: 5 },
        { instruction: "Place paste at bottom of phyllo strip and fold repeatedly into neat triangular packets; seal edges with egg wash.", timerMinutes: 10 },
        { instruction: "Fry triangles in hot oil at 170\xB0C for 4 minutes until golden, then immediately submerge in warm honey bath for 5 minutes.", timerMinutes: 10 },
        { instruction: "Drain on rack, garnish corners with toasted sesame seeds, and serve crisp." }
      ],
      substitutions: [{ ingredient: "Orange blossom water", substitute: "Rose water" }],
      tips: ["Dunking the pastries straight from the frying oil into warm honey ensures deep syrup penetration."]
    }
  ]
};

// src/data/authenticRegionalCatalog.ts
var AUTHENTIC_GLOBAL_CATALOG = {
  ...AFRICA_DISHES,
  // SOUTH AFRICA
  ZA: [
    {
      title: "Durban Bunny Chow",
      alternateName: "Curry in a Bread Loaf",
      type: "curry",
      mealType: "Lunch",
      prepTime: 20,
      cookTime: 40,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 4,
      description: 'Hollowed-out half loaf of crusty white bread filled to the brim with fiery Durban lamb and potato curry, topped with bread "virgin" stopper and sambal.',
      culturalBackground: "Created by Indian indentured laborers in KwaZulu-Natal as a portable, bowl-free lunch during apartheid, now an iconic South African fast food.",
      ingredients: [
        { name: "Loaf of unsliced white bread (halved and hollowed)", amount: 2, unit: "loaves" },
        { name: "Bone-in lamb shoulder (cubed)", amount: 700, unit: "g" },
        { name: "Durban curry powder & garam masala", amount: 3, unit: "tbsp" },
        { name: "Potatoes (halved)", amount: 3, unit: "potatoes" },
        { name: "Curry leaves & fresh coriander", amount: 2, unit: "tbsp" },
        { name: "Tomato & grated carrot sambals", amount: 1, unit: "cup" }
      ],
      steps: [
        { instruction: "Saut\xE9 onions, garlic, ginger, and curry leaves in oil until golden brown.", timerMinutes: 5 },
        { instruction: "Add Durban curry powder and brown the lamb cubes on high heat.", timerMinutes: 5 },
        { instruction: "Add water and simmer covered for 25 minutes until lamb is almost tender.", timerMinutes: 25 },
        { instruction: "Add halved potatoes; simmer until potatoes are meltingly soft and gravy is thick (15 mins).", timerMinutes: 15 },
        { instruction: "Hollow out bread loaves, ladle piping hot curry inside, cap with the bread piece (virgin), and serve with spicy grated carrot sambal." }
      ],
      substitutions: [{ ingredient: "Lamb", substitute: "Sugar beans (for vegetarian Bunny Chow) or beef chuck" }],
      tips: ["Eat authentic Bunny Chow purely with your fingers by tearing pieces of the bread wall and dipping into the rich gravy."]
    },
    {
      title: "Cape Malay Pickled Fish",
      alternateName: "Kaapse Kerrievis",
      type: "seafood",
      mealType: "Lunch",
      prepTime: 20,
      cookTime: 20,
      servings: 6,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Golden fried firm white fish pickled in a tangy, sweet-sour aromatic spiced curry and onion vinegar brine with bay leaves and allspice.",
      culturalBackground: "A beloved Cape Malay Easter tradition dating back over 300 years to the Dutch East India Company era.",
      ingredients: [
        { name: "Firm white fish fillets (kingklip or cod)", amount: 800, unit: "g" },
        { name: "Yellow onions (sliced into rings)", amount: 4, unit: "onions" },
        { name: "White vinegar", amount: 2, unit: "cups" },
        { name: "Brown sugar", amount: 0.75, unit: "cup" },
        { name: "Turmeric, curry powder, coriander, and allspice berries", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Dust seasoned fish fillets in flour and fry in shallow oil for 3 minutes per side until golden; place in deep ceramic dish.", timerMinutes: 6 },
        { instruction: "In a saucepan, boil vinegar, sugar, turmeric, curry powder, and whole spices for 5 minutes.", timerMinutes: 5 },
        { instruction: "Add sliced onion rings to the vinegar brine; cook for 5 minutes until tender yet retaining slight crunch.", timerMinutes: 5 },
        { instruction: "Pour hot spiced pickling liquid and onions over fried fish; let cool and refrigerate for 24-48 hours before serving with crusty buttered bread." }
      ],
      substitutions: [{ ingredient: "Kingklip", substitute: "Haddock, halibut, or sea bass" }],
      tips: ["Letting the pickled fish steep in the fridge for 2 full days intensifies the sweet-sour aromatic flavor profile."]
    },
    {
      title: "Chakalaka & Creamy Pap",
      alternateName: "Spicy Vegetable Relish with Maize Porridge",
      type: "salad",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 3,
      description: "Zesty braai relish made with grated carrots, bell peppers, baked beans, chillies, and curry powder served over steaming fluffy white maize meal pap.",
      culturalBackground: "Originated in the townships of Johannesburg by gold miners, now an indispensable staple of any authentic South African braai barbecue.",
      ingredients: [
        { name: "White maize meal (Mielie meal)", amount: 2, unit: "cups" },
        { name: "Carrots (coarsely grated)", amount: 3, unit: "carrots" },
        { name: "Baked beans in tomato sauce", amount: 1, unit: "can (400g)" },
        { name: "Green & red bell peppers (diced)", amount: 2, unit: "peppers" },
        { name: "Curry powder & crushed red chillies", amount: 1.5, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Bring salted water to boil; slowly whisk in maize meal and stir vigorously to avoid lumps. Cover and steam pap for 20 minutes.", timerMinutes: 20 },
        { instruction: "In a skillet, saut\xE9 onions, garlic, and curry powder in oil until aromatic.", timerMinutes: 3 },
        { instruction: "Add grated carrots and peppers; saut\xE9 for 8 minutes until softened.", timerMinutes: 8 },
        { instruction: "Fold in baked beans and seasonings; simmer 5 minutes and serve warm alongside buttery pap." }
      ],
      substitutions: [{ ingredient: "Maize meal", substitute: "Coarse white polenta" }],
      tips: ["Add a tablespoon of butter to the steaming pap at the end for extra silkiness."]
    },
    {
      title: "Traditional Malva Pudding with Warm Custard",
      alternateName: "Lekker Malvapoeding",
      type: "dessert",
      mealType: "Dessert",
      prepTime: 15,
      cookTime: 35,
      servings: 8,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Spongy, caramelized apricot jam cake soaked while piping hot in a rich, buttery vanilla cream sauce, served with velvety custard.",
      culturalBackground: "Dutch Cape heritage dessert, famed for its deep toffee interior created by the chemical reaction of vinegar and baking soda.",
      ingredients: [
        { name: "Smooth apricot jam", amount: 2, unit: "tbsp" },
        { name: "Sugar and all-purpose flour", amount: 1, unit: "cup", notes: "Each" },
        { name: "Baking soda & white vinegar", amount: 1, unit: "tsp", notes: "Each" },
        { name: "Heavy cream & butter (for soaking sauce)", amount: 1, unit: "cup", notes: "Simmered with 1/2 cup sugar and vanilla" },
        { name: "Warm vanilla custard", amount: 2, unit: "cups" }
      ],
      steps: [
        { instruction: "Beat egg and sugar until fluffy; fold in apricot jam, melted butter, vinegar, and flour with dissolved baking soda.", timerMinutes: 5 },
        { instruction: "Pour batter into greased baking dish; bake at 180\xB0C (350\xB0F) for 30 minutes until golden and springy.", timerMinutes: 30 },
        { instruction: "While cake bakes, boil cream, butter, sugar, and vanilla in a saucepan for 3 minutes.", timerMinutes: 3 },
        { instruction: "Poke holes all over hot baked pudding with a skewer and immediately pour the warm buttery sauce over to absorb completely.", timerMinutes: 5 },
        { instruction: "Serve warm draped in rich yellow custard." }
      ],
      substitutions: [{ ingredient: "Apricot jam", substitute: "Marmalade or peach preserves" }],
      tips: ["Pour the sauce over the pudding the exact second it comes out of the oven so the porous cake drinks in every drop."]
    },
    {
      title: "Braai Boerewors with Onion-Tomato Sheba",
      alternateName: "Farmers Sausage with Braai Relish",
      type: "grill",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 1,
      description: "Coarse beef and pork spiral sausage spiced with toasted coriander seed, clove, and nutmeg, grilled over open wood embers with rich tomato sheba gravy.",
      culturalBackground: "South Africa\u2019s premier national barbecue sausage, strictly regulated by law to contain over 90% prime meat with no offal.",
      ingredients: [
        { name: "Traditional Boerewors sausage spiral", amount: 800, unit: "g" },
        { name: "Crushed toasted coriander seeds & cloves", amount: 1, unit: "tbsp" },
        { name: "Ripe tomatoes (chopped)", amount: 4, unit: "tomatoes" },
        { name: "Yellow onions & garlic", amount: 2, unit: "onions" },
        { name: "Braai broodjies (cheese & tomato grilled sandwiches)", amount: 4, unit: "sandwiches" }
      ],
      steps: [
        { instruction: "Place whole coiled boerewors over moderate charcoal embers on the braai grill.", timerMinutes: 5 },
        { instruction: "Turn once gently using braai tongs (never pierce the casing with a fork); grill for 12-15 minutes until juicy with a smoky snap.", timerMinutes: 15 },
        { instruction: "Simmer chopped tomatoes, onions, garlic, and brown sugar in a cast-iron potjie over coals for 15 minutes to make sheba sauce.", timerMinutes: 15 },
        { instruction: "Slice boerewors into sections and serve smothered in hot sheba gravy with braaied roosterkoek or broodjies." }
      ],
      substitutions: [{ ingredient: "Boerewors", substitute: "Coriander-spiced beef bratwurst" }],
      tips: ["Never prick boerewors while cooking; keeping the casing intact preserves the natural juices and spiced fat."]
    }
  ],
  // SENEGAL
  SN: [
    {
      title: "Poulet Yassa (Senegalese Lemon Caramelized Onion Chicken)",
      alternateName: "Yassa Guinar",
      type: "curry",
      mealType: "Dinner",
      prepTime: 25,
      cookTime: 40,
      servings: 5,
      difficulty: "Medium",
      spiceLevel: 2,
      description: "Succulent chicken marinated in loads of fresh lemon juice, Dijon mustard, and habanero, braised with mounds of sweet caramelized onions and green olives.",
      culturalBackground: "Hailing from the Casamance region of southern Senegal, celebrated for its bold citrus tang and peppery sweetness.",
      ingredients: [
        { name: "Bone-in chicken thighs and drumsticks", amount: 1, unit: "kg" },
        { name: "Yellow onions (thinly sliced)", amount: 6, unit: "large onions" },
        { name: "Fresh lemon juice", amount: 0.75, unit: "cup" },
        { name: "Dijon mustard", amount: 3, unit: "tbsp" },
        { name: "Green pitted olives", amount: 0.5, unit: "cup" },
        { name: "Habenero / Scotch bonnet pepper", amount: 1, unit: "pepper", notes: "Whole pierced" }
      ],
      steps: [
        { instruction: "Marinate chicken and sliced onions in lemon juice, Dijon mustard, garlic, and oil for at least 2 hours.", timerMinutes: 10 },
        { instruction: "Remove chicken from marinade and sear or broil for 8 minutes until golden and charred.", timerMinutes: 8 },
        { instruction: "In a heavy Dutch oven, saut\xE9 marinated onions over medium heat for 20 minutes until meltingly caramelized and golden.", timerMinutes: 20 },
        { instruction: "Add seared chicken, remaining marinade juices, green olives, and whole scotch bonnet; cover and simmer for 25 minutes.", timerMinutes: 25 },
        { instruction: "Serve over fluffy white jasmine rice with lemon wedges." }
      ],
      substitutions: [{ ingredient: "Dijon mustard", substitute: "Stone-ground whole grain mustard" }],
      tips: ["Caramelizing the onions slowly brings out their natural sugars to balance the sharp lemon acidity."]
    },
    {
      title: "Maf\xE9 (Senegalese Peanut Stew with Beef)",
      alternateName: "Tigad\xE8gu\xE8na",
      type: "curry",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 50,
      servings: 5,
      difficulty: "Medium",
      spiceLevel: 2,
      description: "Velvety rich ground peanut paste stew simmered with tender beef chuck, sweet potatoes, cabbage, and smoked fish in a savoury tomato broth.",
      culturalBackground: "A beloved West African staple adopted across the Sahel, combining roasted peanut butter with root vegetables.",
      ingredients: [
        { name: "Beef chuck roast (cut into 1.5-inch cubes)", amount: 700, unit: "g" },
        { name: "Natural smooth roasted peanut butter (100% peanuts)", amount: 1, unit: "cup" },
        { name: "Tomato paste", amount: 3, unit: "tbsp" },
        { name: "Sweet potato & carrots (cubed)", amount: 2, unit: "cups" },
        { name: "Cabbage wedges", amount: 0.5, unit: "head" }
      ],
      steps: [
        { instruction: "Brown beef cubes in oil with onions and garlic in a Dutch oven.", timerMinutes: 8 },
        { instruction: "Stir in tomato paste and fry for 3 minutes until darkened.", timerMinutes: 3 },
        { instruction: "Whisk peanut butter with 2 cups warm broth until smooth; pour into the pot and bring to a simmer.", timerMinutes: 5 },
        { instruction: "Add root vegetables, cabbage wedges, and scotch bonnet; cover and simmer on low for 35 minutes until beef is tender and oil floats to top.", timerMinutes: 35 },
        { instruction: "Serve piping hot over fragrant white rice." }
      ],
      substitutions: [{ ingredient: "Peanut butter", substitute: "Sunflower seed butter or almond butter" }],
      tips: ["Whisking the peanut paste with warm broth before adding ensures a velvety, lump-free sauce."]
    },
    {
      title: "Pastels de Poisson (Senegalese Fish Hand Pies with Spicy Sauce)",
      alternateName: "Senegalese Fish Empanadas",
      type: "pastry",
      mealType: "Lunch",
      prepTime: 30,
      cookTime: 20,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 3,
      description: "Flaky golden hand-pie turnovers stuffed with spiced flaked white fish, garlic, and fresh parsley, served with fiery tomato-onion dipping sauce (sauce pastels).",
      culturalBackground: "A staple street food and party appetizer across Dakar influenced by Portuguese maritime trade.",
      ingredients: [
        { name: "All-purpose flour & cold butter (for pastry dough)", amount: 2.5, unit: "cups" },
        { name: "Cooked white fish (flaked)", amount: 350, unit: "g" },
        { name: "Fresh parsley & garlic (minced)", amount: 3, unit: "tbsp" },
        { name: "Sauce pastels (cooked spicy tomato-onion relish)", amount: 1, unit: "cup" }
      ],
      steps: [
        { instruction: "Mix flour, butter, egg, and ice water into a tender pastry dough; rest for 20 minutes.", timerMinutes: 20 },
        { instruction: "Saut\xE9 flaked fish with garlic, parsley, onions, and scotch bonnet for the filling.", timerMinutes: 5 },
        { instruction: "Roll out dough, cut into circles, spoon filling inside, and crimp edges tightly with a fork.", timerMinutes: 10 },
        { instruction: "Deep fry pastels in oil at 180\xB0C for 4-5 minutes until golden and crisp; drain and serve with hot sauce pastels.", timerMinutes: 5 }
      ],
      substitutions: [{ ingredient: "Flaked fish", substitute: "Ground spiced beef or tuna" }],
      tips: ["Seal edges firmly with water and crimp with fork tines so the savory fish filling stays sealed during frying."]
    },
    {
      title: "Dibi Lamb (Senegalese Street Barbecue with Mustard & Onions)",
      alternateName: "Dibi Dakar",
      type: "grill",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Wood-grilled lamb chops cut into bite-sized pieces, tossed in coarse sea salt, ground mustard, bouillon, and mounds of caramelized sliced onions.",
      culturalBackground: "The ultimate late-night street food ritual in Dakar, served piping hot on brown butcher paper straight from the dibiterie wood grill.",
      ingredients: [
        { name: "Bone-in lamb shoulder chops or cutlets", amount: 800, unit: "g" },
        { name: "Dijon mustard & Maggi aroma", amount: 2, unit: "tbsp" },
        { name: "Coarse sea salt & black pepper", amount: 1, unit: "tbsp" },
        { name: "Yellow onions (thickly sliced)", amount: 3, unit: "onions" }
      ],
      steps: [
        { instruction: "Grill lamb chops over blazing wood embers for 12-15 minutes until charred and cooked through.", timerMinutes: 15 },
        { instruction: "Transfer hot lamb onto a cutting board and chop into bite-sized bone-in morsels with a heavy cleaver.", timerMinutes: 3 },
        { instruction: "Toss lamb with sliced onions, mustard, salt, and black pepper on butcher paper; wrap tightly to let steam soften onions for 5 minutes.", timerMinutes: 5 },
        { instruction: "Unwrap and eat hot with crusty baguette." }
      ],
      substitutions: [{ ingredient: "Lamb", substitute: "Goat meat or beef sirloin" }],
      tips: ["Wrapping the hot sliced meat and raw onions in butcher paper allows the steam to soften the onions into a savory relish."]
    },
    {
      title: "Ceebu Yapp (Senegalese Spiced Meat & Broken Rice)",
      alternateName: "Red Rice with Braised Beef",
      type: "rice",
      mealType: "Dinner",
      prepTime: 25,
      cookTime: 50,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 2,
      description: "Fragrant broken jasmine rice cooked in deeply browned beef and onion gravy with mustard seeds, pumpkin, cassava, and green chillies.",
      culturalBackground: "A companion to Ceebu J\xEBn (fish rice), Ceebu Yapp is prepared for festive ceremonies and family Sunday lunches.",
      ingredients: [
        { name: "Broken jasmine rice (riz bris\xE9)", amount: 3, unit: "cups" },
        { name: "Beef stew meat & marrow bone", amount: 700, unit: "g" },
        { name: "Dijon mustard & black pepper", amount: 2, unit: "tbsp" },
        { name: "Cassava and butternut squash chunks", amount: 2, unit: "cups" }
      ],
      steps: [
        { instruction: "Brown beef chunks deeply in peanut oil until caramelized; add onions and fry until dark brown.", timerMinutes: 12 },
        { instruction: "Add water, root vegetables, and seasonings; simmer 25 minutes until meat is tender.", timerMinutes: 25 },
        { instruction: "Remove vegetables and meat; stir rinsed broken rice into the bubbling rich meat stock.", timerMinutes: 3 },
        { instruction: "Cover tightly and steam on very low heat for 20 minutes until rice has absorbed all broth and is tender and fluffy.", timerMinutes: 20 },
        { instruction: "Spread savory rice on a grand platter, arrange beef and vegetables on top." }
      ],
      substitutions: [{ ingredient: "Broken rice", substitute: "Standard long grain jasmine rice" }],
      tips: ["Broken rice absorbs the beef pan drippings better than standard long grain rice."]
    }
  ],
  // ETHIOPIA
  ET: [
    {
      title: "Misir Wat (Spiced Red Lentil Stew)",
      alternateName: "Ethiopian Spicy Red Lentils",
      type: "curry",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 3,
      description: "Red split lentils slow-simmered in rich berbere spice blend, garlic, ginger, and niter kibbeh spiced clarified butter until creamy.",
      culturalBackground: "The cornerstone of Ethiopian vegetarian fasting cuisine (Ye\u2019tsom), enjoyed during religious fasting periods.",
      ingredients: [
        { name: "Red split lentils (rinsed)", amount: 2, unit: "cups" },
        { name: "Berbere spice blend", amount: 3, unit: "tbsp" },
        { name: "Red onions (finely pureed)", amount: 2, unit: "onions" },
        { name: "Niter Kibbeh (Ethiopian spiced butter)", amount: 3, unit: "tbsp" },
        { name: "Garlic and ginger paste", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Dry-sweat pureed onions in a heavy pot without oil for 8 minutes until moisture evaporates and onions sweeten.", timerMinutes: 8 },
        { instruction: "Add niter kibbeh, garlic-ginger paste, and berbere; fry gently for 5 minutes until intensely fragrant.", timerMinutes: 5 },
        { instruction: "Add rinsed red lentils and 4 cups warm water; simmer on low heat for 25 minutes, stirring occasionally until lentils break down into a creamy stew.", timerMinutes: 25 },
        { instruction: "Finish with a dollop of niter kibbeh and serve warm atop injera flatbread." }
      ],
      substitutions: [{ ingredient: "Niter Kibbeh", substitute: "Ghee with pinch of cardamom, fenugreek, and cumin" }],
      tips: ["Dry sweating onions before adding fat is the secret to rich, deep Ethiopian wat flavor without raw onion bite."]
    },
    {
      title: "Gomen Wat (Braised Ethiopian Collard Greens)",
      alternateName: "Ethiopian Spiced Greens",
      type: "salad",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 1,
      description: "Tender shredded collard greens simmered with sweet onions, garlic, ginger, cardamom, and aromatic niter kibbeh.",
      culturalBackground: "A mild and comforting green vegetable dish served on the communal mesob basket to balance fiery wats.",
      ingredients: [
        { name: "Fresh collard greens (stems removed, shredded)", amount: 500, unit: "g" },
        { name: "Niter kibbeh (spiced butter)", amount: 2, unit: "tbsp" },
        { name: "Yellow onions and garlic", amount: 1, unit: "onion" },
        { name: "Ground korarima (Ethiopian cardamom)", amount: 0.5, unit: "tsp" }
      ],
      steps: [
        { instruction: "Boil shredded collard greens in salted water for 8 minutes; drain well.", timerMinutes: 8 },
        { instruction: "Saut\xE9 chopped onions and garlic in niter kibbeh until soft.", timerMinutes: 4 },
        { instruction: "Add drained greens and ground cardamom; saut\xE9 for 10 minutes until tender and flavorful.", timerMinutes: 10 },
        { instruction: "Serve warm as part of a traditional vegetarian platter." }
      ],
      substitutions: [{ ingredient: "Collard greens", substitute: "Kale or Swiss chard" }],
      tips: ["Draining the boiled greens well prevents the finished saut\xE9 from becoming soupy."]
    },
    {
      title: "Shiro Tegamino (Clay-Pot Chickpea Flour Stew)",
      alternateName: "Creamy Chickpea Stew",
      type: "curry",
      mealType: "Lunch",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Silky, bubbling stew made from roasted spiced chickpea powder (shiro mitted), onions, garlic, and niter kibbeh served piping hot in an earthenware dish.",
      culturalBackground: "A beloved everyday staple in Ethiopian homes, celebrated for its silky texture and rich umami depth.",
      ingredients: [
        { name: "Shiro powder (spiced chickpea flour)", amount: 1, unit: "cup" },
        { name: "Pureed red onions", amount: 1, unit: "cup" },
        { name: "Niter kibbeh or olive oil", amount: 3, unit: "tbsp" },
        { name: "Garlic and jalapeno peppers", amount: 2, unit: "cloves" }
      ],
      steps: [
        { instruction: "Dry-fry onions in an earthenware pot until softened.", timerMinutes: 5 },
        { instruction: "Add spiced butter and garlic; fry for 2 minutes.", timerMinutes: 2 },
        { instruction: "Whisk shiro powder with warm water and pour into pot; simmer gently while stirring continuously for 12 minutes until thick and bubbling like lava.", timerMinutes: 12 },
        { instruction: "Garnish with sliced green jalapenos and scoop up with warm injera." }
      ],
      substitutions: [{ ingredient: "Shiro powder", substitute: "Besan (gram flour) seasoned with berbere and garlic powder" }],
      tips: ["Stir continuously while adding shiro powder to avoid any clumps forming."]
    },
    {
      title: "Tibs (Ethiopian Saut\xE9ed Spiced Beef)",
      alternateName: "Derek Tibs",
      type: "beef",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Tender beef tenderloin cubes seared over searing heat with rosemary sprigs, red onions, tomatoes, and berbere butter.",
      culturalBackground: "Ethiopia\u2019s most popular social restaurant dish, served on a charcoal-warmed mini brazier.",
      ingredients: [
        { name: "Beef sirloin or tenderloin (cubed)", amount: 600, unit: "g" },
        { name: "Niter kibbeh spiced butter", amount: 3, unit: "tbsp" },
        { name: "Fresh rosemary sprigs", amount: 3, unit: "sprigs" },
        { name: "Red onions & jalapenos (thickly sliced)", amount: 2, unit: "onions" },
        { name: "Berbere spice blend", amount: 1, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Heat a heavy skillet until smoking hot; melt niter kibbeh.", timerMinutes: 2 },
        { instruction: "Add beef cubes and sear at high heat for 4 minutes until deeply browned.", timerMinutes: 4 },
        { instruction: "Toss in sliced onions, jalapenos, fresh rosemary, and berbere; saut\xE9 for 4 minutes until vegetables are crisp-tender.", timerMinutes: 4 },
        { instruction: "Serve immediately with injera flatbread and awaze dipping sauce." }
      ],
      substitutions: [{ ingredient: "Beef tenderloin", substitute: "Lamb loin or portobello mushrooms" }],
      tips: ["Keep the skillet scorching hot so the beef sears quickly without losing its internal juices."]
    },
    {
      title: "Injera (Authentic Teff Sourdough Flatbread)",
      alternateName: "Ethiopian Sourdough Crepe",
      type: "pastry",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 20,
      servings: 6,
      difficulty: "Advanced",
      spiceLevel: 0,
      description: "Spongy, tart sourdough flatbread made from fermented ancient teff grain, dotted with signature honeycomb steam holes (eyes).",
      culturalBackground: "The foundational utensil and base of all Ethiopian dining, used to tear and scoop all stews communally.",
      ingredients: [
        { name: "Brown or ivory Teff flour", amount: 3, unit: "cups" },
        { name: "Water (for 3-day fermentation)", amount: 3.5, unit: "cups" },
        { name: "Active sourdough starter", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Mix teff flour with water and starter; cover and ferment at room temperature for 3 days until bubbly and sour.", timerMinutes: 10 },
        { instruction: "Boil 1/2 cup batter with water into a thick paste (ersho/absit); whisk back into batter to activate rising.", timerMinutes: 5 },
        { instruction: "Pour batter in a spiral onto a preheated non-stick griddle or mitad.", timerMinutes: 1 },
        { instruction: "When bubbles form all across the surface, cover with lid and steam for 2 minutes until cooked through without flipping.", timerMinutes: 2 },
        { instruction: "Cool on straw mats before stacking." }
      ],
      substitutions: [{ ingredient: "Teff flour", substitute: "Blend of teff and buckwheat flour" }],
      tips: ["The ersho activation step creates the distinctive airy honeycomb eyes (ayen) that scoop up rich sauces."]
    }
  ],
  // THAILAND
  TH: [
    {
      title: "Tom Yum Goong (Spicy & Sour Prawn Soup)",
      alternateName: "\u0E15\u0E49\u0E21\u0E22\u0E33\u0E01\u0E38\u0E49\u0E07",
      type: "soup",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 4,
      description: "Iconic clear, fiery broth infused with bruised lemongrass, kaffir lime leaves, galangal, fresh juicy king prawns, and straw mushrooms.",
      culturalBackground: "The global ambassador of Thai culinary mastery, balancing sour lime, salty fish sauce, spicy bird\u2019s eye chilies, and aromatic herbs.",
      ingredients: [
        { name: "Jumbo king prawns (head-on)", amount: 500, unit: "g" },
        { name: "Lemongrass stalks (bruised & cut into 2-inch batons)", amount: 3, unit: "stalks" },
        { name: "Galangal (sliced)", amount: 6, unit: "slices" },
        { name: "Kaffir lime leaves (torn)", amount: 5, unit: "leaves" },
        { name: "Thai bird\u2019s eye chilies (crushed)", amount: 4, unit: "chilies" },
        { name: "Thai roasted chili paste (Nam Prik Pao)", amount: 2, unit: "tbsp" },
        { name: "Fish sauce and fresh lime juice", amount: 3, unit: "tbsp", notes: "Each" }
      ],
      steps: [
        { instruction: "Simmer shrimp shells and heads in water for 5 minutes to create a flavorful seafood base; strain.", timerMinutes: 5 },
        { instruction: "Add bruised lemongrass, galangal, kaffir lime leaves, and roasted chili paste; bring to a rolling aromatic boil.", timerMinutes: 3 },
        { instruction: "Add straw mushrooms and king prawns; cook for 3 minutes until prawns turn pink and curl into a C-shape.", timerMinutes: 3 },
        { instruction: "Turn off the heat; season with fish sauce and freshly squeezed lime juice. Garnish with cilantro and serve immediately.", timerMinutes: 1 }
      ],
      substitutions: [{ ingredient: "Galangal", substitute: "Fresh ginger with a squeeze of lime" }],
      tips: ["Always add fresh lime juice AFTER turning off the heat; boiling lime juice turns the delicate broth bitter."]
    },
    {
      title: "Pad Kra Pao (Thai Holy Basil Minced Pork)",
      alternateName: "\u0E1C\u0E31\u0E14\u0E01\u0E30\u0E40\u0E1E\u0E23\u0E32\u0E2B\u0E21\u0E39\u0E2A\u0E31\u0E1A",
      type: "beef",
      mealType: "Lunch",
      prepTime: 10,
      cookTime: 8,
      servings: 2,
      difficulty: "Easy",
      spiceLevel: 4,
      description: "Wok-seared minced pork stir-fried with fragrant holy basil, garlic, and fiery bird\u2019s eye chilies, crowned with a crispy-edged fried egg.",
      culturalBackground: "Thailand\u2019s quintessential street food fast lunch, ordered across roadside wok stalls by millions daily.",
      ingredients: [
        { name: "Ground pork or minced chicken", amount: 350, unit: "g" },
        { name: "Fresh Thai holy basil leaves (or Thai sweet basil)", amount: 1.5, unit: "cups" },
        { name: "Thai bird\u2019s eye chilies & garlic (pounded together in mortar)", amount: 2, unit: "tbsp" },
        { name: "Oyster sauce, soy sauce, and fish sauce", amount: 1, unit: "tbsp", notes: "Each" },
        { name: "Crispy fried egg with runny yolk (Khai Dao)", amount: 2, unit: "eggs" }
      ],
      steps: [
        { instruction: "Heat oil in a smoking hot wok; fry the pounded garlic and chilies for 30 seconds until intensely aromatic.", timerMinutes: 1 },
        { instruction: "Add minced pork, breaking it apart with a spatula on high heat for 3 minutes until browned.", timerMinutes: 3 },
        { instruction: "Drizzle in oyster sauce, fish sauce, soy sauce, and a pinch of sugar; toss for 1 minute.", timerMinutes: 1 },
        { instruction: "Turn off heat, toss in holy basil leaves, and let residual wok heat wilt the fragrant leaves (30 seconds).", timerMinutes: 1 },
        { instruction: "Serve over steaming jasmine rice topped with a crispy golden fried egg." }
      ],
      substitutions: [{ ingredient: "Holy basil", substitute: "Thai sweet basil or Italian sweet basil" }],
      tips: ["Pounding garlic and chilies in a mortar releases their natural essential oils for superior wok fragrance."]
    },
    {
      title: "Green Chicken Curry (Gaeng Keow Wan Gai)",
      alternateName: "\u0E41\u0E01\u0E07\u0E40\u0E02\u0E35\u0E22\u0E27\u0E2B\u0E27\u0E32\u0E19\u0E44\u0E01\u0E48",
      type: "curry",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 3,
      description: "Silky, aromatic green coconut curry with sliced chicken breast, Thai eggplants, bamboo shoots, and fresh sweet basil.",
      culturalBackground: "Named for its vibrant jade hue derived from freshly pounded green bird\u2019s eye chilies, lemongrass, and cilantro roots.",
      ingredients: [
        { name: "Chicken breast or thighs (sliced)", amount: 500, unit: "g" },
        { name: "Authentic green curry paste", amount: 3, unit: "tbsp" },
        { name: "Coconut cream & coconut milk", amount: 2, unit: "cups" },
        { name: "Thai round green eggplants (quartered)", amount: 1, unit: "cup" },
        { name: "Bamboo shoots & Thai basil leaves", amount: 1, unit: "cup" },
        { name: "Fish sauce and palm sugar", amount: 1.5, unit: "tbsp", notes: "Each" }
      ],
      steps: [
        { instruction: "Heat 1/2 cup coconut cream in a pot until it separates and oil cracks on the surface (4 mins).", timerMinutes: 4 },
        { instruction: "Add green curry paste and fry in the coconut oil for 3 minutes until fragrant.", timerMinutes: 3 },
        { instruction: "Add sliced chicken; toss for 2 minutes to coat in curry paste.", timerMinutes: 2 },
        { instruction: "Pour in remaining coconut milk, eggplants, and bamboo shoots; simmer for 10 minutes until chicken and eggplants are tender.", timerMinutes: 10 },
        { instruction: "Season with fish sauce and palm sugar; stir in sweet basil and torn kaffir lime leaves before serving over jasmine rice." }
      ],
      substitutions: [{ ingredient: "Thai eggplants", substitute: "Baby zucchini or Japanese eggplant" }],
      tips: ['Frying curry paste in reduced coconut cream until it "breaks" into fragrant oil creates genuine restaurant silkiness.']
    },
    {
      title: "Mango Sticky Rice (Khao Niew Mamuang)",
      alternateName: "\u0E02\u0E49\u0E32\u0E27\u0E40\u0E2B\u0E19\u0E35\u0E22\u0E27\u0E21\u0E30\u0E21\u0E48\u0E27\u0E07",
      type: "dessert",
      mealType: "Dessert",
      prepTime: 20,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Sweet glutinous sticky rice infused with warm salted coconut cream, served with luscious slices of ripe golden honey mango and toasted mung beans.",
      culturalBackground: "Thailand\u2019s most beloved seasonal dessert, celebrated worldwide for the heavenly pairing of warm creamy rice and chilled sweet mango.",
      ingredients: [
        { name: "Thai glutinous sticky rice (soaked 4 hours)", amount: 1.5, unit: "cups" },
        { name: "Ripe sweet honey mangoes (Nam Dok Mai)", amount: 2, unit: "mangoes", notes: "Peeled and sliced" },
        { name: "Coconut cream", amount: 1.5, unit: "cups" },
        { name: "Palm sugar or white sugar", amount: 0.5, unit: "cup" },
        { name: "Sea salt (crucial for balance)", amount: 0.75, unit: "tsp" },
        { name: "Crispy toasted yellow mung beans", amount: 1, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Steam soaked sticky rice in a bamboo steamer or cheesecloth-lined basket for 20 minutes until translucent and chewy.", timerMinutes: 20 },
        { instruction: "Warm coconut cream with sugar and salt in a saucepan until dissolved (do not boil).", timerMinutes: 3 },
        { instruction: "Transfer hot steamed rice to a bowl, pour 3/4 of warm coconut cream over, cover with plastic wrap, and rest 15 minutes to absorb liquid.", timerMinutes: 15 },
        { instruction: "Plate warm coconut sticky rice beside chilled sliced mangoes, drizzle with reserved salted coconut cream, and top with crunchy mung beans." }
      ],
      substitutions: [{ ingredient: "Thai mango", substitute: "Ripe Ataulfo / Champagne mango" }],
      tips: ["A generous pinch of salt in the coconut cream is vital to elevate the rich sweetness of the mango."]
    },
    {
      title: "Som Tum (Spicy Green Papaya Salad)",
      alternateName: "\u0E2A\u0E49\u0E21\u0E15\u0E33\u0E44\u0E17\u0E22",
      type: "salad",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 0,
      servings: 2,
      difficulty: "Easy",
      spiceLevel: 4,
      description: "Crisp shredded unripe green papaya bruised in a clay mortar with garlic, bird\u2019s eye chilies, long beans, cherry tomatoes, lime juice, peanuts, and dried shrimp.",
      culturalBackground: "From Isan in Northeastern Thailand, celebrated for its electrifying punch of crunchy, sour, sweet, spicy, and umami.",
      ingredients: [
        { name: "Unripe green papaya (shredded into long thin ribbons)", amount: 3, unit: "cups" },
        { name: "Thai bird\u2019s eye chilies & garlic cloves", amount: 3, unit: "pieces", notes: "Each" },
        { name: "Roasted peanuts", amount: 3, unit: "tbsp" },
        { name: "Cherry tomatoes & snake beans (cut into 1-inch lengths)", amount: 1, unit: "cup" },
        { name: "Fish sauce, lime juice, and palm sugar", amount: 2, unit: "tbsp", notes: "Each" },
        { name: "Dried shrimp", amount: 1, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Pound garlic, chilies, and dried shrimp lightly in a wooden or clay mortar with pestle.", timerMinutes: 1 },
        { instruction: "Add palm sugar, fish sauce, and fresh lime juice; muddle with pestle until sugar dissolves.", timerMinutes: 1 },
        { instruction: "Toss in sliced tomatoes, green beans, and half the roasted peanuts; bruise gently.", timerMinutes: 1 },
        { instruction: "Add shredded green papaya; pound lightly while turning with a spoon for 1 minute until papaya absorbs dressing.", timerMinutes: 1 },
        { instruction: "Serve crisp with sticky rice and grilled chicken (Gai Yang)." }
      ],
      substitutions: [{ ingredient: "Green papaya", substitute: "Shredded crisp kohlrabi, cucumber, or green apples" }],
      tips: ["Bruise the papaya gently with the pestle rather than crushing it completely so it retains its refreshing crunch."]
    }
  ]
};

// src/data/authenticCatalogData.ts
var AUTHENTIC_WORLD_DISHES = {
  ...AUTHENTIC_GLOBAL_CATALOG,
  // INDIA
  IN: [
    {
      title: "Butter Chicken (Murgh Makhani)",
      alternateName: "\u092E\u0941\u0930\u094D\u0917 \u092E\u0915\u094D\u0916\u0928\u0940",
      type: "curry",
      mealType: "Dinner",
      prepTime: 25,
      cookTime: 30,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 2,
      description: "Charred tandoori chicken pieces simmered in a velvety, buttery spiced tomato, cashew nut, and cream sauce with dried fenugreek leaves (kasuri methi).",
      culturalBackground: "Invented by Kundan Lal Gujral at Moti Mahal in Delhi during the 1950s to repurpose leftover tandoori chicken in rich gravy.",
      ingredients: [
        { name: "Boneless chicken thighs (marinated in yogurt & spices)", amount: 600, unit: "g" },
        { name: "Canned San Marzano or plum tomatoes (pureed)", amount: 2, unit: "cups" },
        { name: "Butter and heavy cream", amount: 0.5, unit: "cup", notes: "Each" },
        { name: "Cashew paste", amount: 3, unit: "tbsp" },
        { name: "Kasuri Methi (dried fenugreek leaves)", amount: 1, unit: "tbsp", notes: "Crushed" },
        { name: "Garam masala and Kashmiri chili powder", amount: 1, unit: "tbsp", notes: "Each" }
      ],
      steps: [
        { instruction: "Sear marinated chicken on high heat or under broiler for 8 minutes until charred; set aside.", timerMinutes: 8 },
        { instruction: "Cook tomato puree with ginger, garlic, Kashmiri chili, and cashew paste for 15 minutes until glossy and reduced.", timerMinutes: 15 },
        { instruction: "Stir in butter, heavy cream, garam masala, and seared chicken pieces; simmer gently for 8 minutes.", timerMinutes: 8 },
        { instruction: "Crush kasuri methi between your palms into the sauce; stir and serve with garlic naan or basmati rice.", timerMinutes: 2 }
      ],
      substitutions: [{ ingredient: "Kasuri Methi", substitute: "A pinch of celery leaves or maple aroma" }],
      tips: ["Kashmiri chili gives the signature ruby red color without adding overpowering fire."]
    },
    {
      title: "Hyderabadi Chicken Dum Biryani",
      alternateName: "\u062D\u06CC\u062F\u0631\u0622\u0628\u0627\u062F\u06CC \u0628\u0631\u06CC\u0627\u0646\u06CC",
      type: "rice",
      mealType: "Dinner",
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      difficulty: "Advanced",
      spiceLevel: 3,
      description: "Royal layered biryani of fragrant aged basmati rice, saffron milk, caramelized fried onions (birista), and mint-marinated chicken slow-cooked under steam seal (dum).",
      culturalBackground: "Originated in the royal kitchens of the Nizam of Hyderabad, marrying Mughal grandeur with spicy Telugu flavors.",
      ingredients: [
        { name: "Aged Basmati rice (soaked 30 mins)", amount: 3, unit: "cups" },
        { name: "Bone-in chicken (marinated in spiced yogurt & mint)", amount: 800, unit: "g" },
        { name: "Birista (crispy fried golden onions)", amount: 1.5, unit: "cups" },
        { name: "Saffron threads soaked in warm milk", amount: 3, unit: "tbsp" },
        { name: "Whole spices (green cardamom, cloves, star anise, shahi jeera)", amount: 1, unit: "tbsp" },
        { name: "Pure desi ghee", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Parboil basmati rice with whole spices until 70% cooked (6 mins); drain.", timerMinutes: 6 },
        { instruction: "Place marinated chicken at the bottom of a heavy pot; layer 70% cooked rice over chicken.", timerMinutes: 5 },
        { instruction: "Scatter crispy fried onions, chopped fresh mint, cilantro, saffron milk, and dollops of ghee on top.", timerMinutes: 3 },
        { instruction: "Seal pot tightly with a dough ring or foil lid; cook on medium-high for 10 mins, then lowest heat on a tawa griddle for 25 mins (dum).", timerMinutes: 25 },
        { instruction: "Gently fluff rice layers with a flat spatula and serve with cucumber raita and mirchi ka salan." }
      ],
      substitutions: [{ ingredient: "Chicken", substitute: "Lamb shoulder or paneer and vegetables" }],
      tips: ["Never stir the biryani while cooking; the steam trapped in dum infuses the rice with intense aromatics."]
    },
    {
      title: "Palak Paneer (Spinach Cottage Cheese Curry)",
      alternateName: "\u092A\u093E\u0932\u0915 \u092A\u0928\u0940\u0930",
      type: "curry",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 1,
      description: "Lush, emerald-green pureed spinach gravy simmered with ginger, garlic, garam masala, and golden-pan-fried Indian paneer cheese cubes.",
      culturalBackground: "A Punjabi vegetarian classic loved across the subcontinent for its creamy texture and healthy greens.",
      ingredients: [
        { name: "Fresh baby spinach leaves", amount: 500, unit: "g", notes: "Blanched in ice water" },
        { name: "Paneer cheese cubes", amount: 300, unit: "g" },
        { name: "Heavy cream & butter", amount: 3, unit: "tbsp", notes: "Each" },
        { name: "Ginger-garlic paste", amount: 1.5, unit: "tbsp" },
        { name: "Garam masala and ground cumin", amount: 1, unit: "tsp", notes: "Each" }
      ],
      steps: [
        { instruction: "Blanch spinach in boiling water for 2 minutes, then plunge immediately into an ice bath to lock in vibrant green color; puree smoothly.", timerMinutes: 3 },
        { instruction: "Pan-fry paneer cubes in ghee for 2 minutes until lightly golden; soak in warm water to stay soft.", timerMinutes: 3 },
        { instruction: "Saut\xE9 cumin seeds, ginger-garlic paste, and green chili in butter; stir in spinach puree and simmer for 6 minutes.", timerMinutes: 6 },
        { instruction: "Add paneer cubes, heavy cream, and garam masala; gently warm through for 2 minutes and serve with roti.", timerMinutes: 2 }
      ],
      substitutions: [{ ingredient: "Paneer", substitute: "Firm tofu cubes or halloumi" }],
      tips: ["Shocking blanched spinach in ice water preserves that vivid jewel-green color."]
    },
    {
      title: "Chana Masala (Spiced Chickpea Curry)",
      alternateName: "\u091A\u0928\u093E \u092E\u0938\u093E\u0932\u093E",
      type: "curry",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 3,
      description: "Tender chickpeas cooked in a tangy, dark spiced onion-tomato gravy flavored with dried mango powder (amchur), pomegranate seeds, and ginger.",
      culturalBackground: "North India\u2019s most iconic street food dish, famously served alongside giant puffy fried bhature breads.",
      ingredients: [
        { name: "Cooked chickpeas", amount: 3, unit: "cups" },
        { name: "Onions and tomatoes", amount: 2, unit: "each", notes: "Finely chopped" },
        { name: "Chana masala spice blend (with amchur & anardana)", amount: 2, unit: "tbsp" },
        { name: "Fresh ginger julienne and green chilies", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Saut\xE9 onions in ghee or oil until deep caramelized brown (10 mins).", timerMinutes: 10 },
        { instruction: "Add ginger-garlic, tomatoes, and chana masala spices; cook until oil releases from tomato masala.", timerMinutes: 6 },
        { instruction: "Add chickpeas with their cooking broth; lightly mash some chickpeas with a spoon to thicken the gravy and simmer for 10 minutes.", timerMinutes: 10 },
        { instruction: "Garnish with fresh ginger juliennes and cilantro; serve hot with steamed basmati rice or bhature." }
      ],
      substitutions: [{ ingredient: "Amchur", substitute: "Fresh lemon juice" }],
      tips: ["Mashing a small handful of chickpeas against the side of the pot creates a naturally luscious, thick gravy."]
    },
    {
      title: "Crispy Samosas with Mint & Tamarind Chutney",
      alternateName: "\u0938\u092E\u094B\u0938\u093E",
      type: "pastry",
      mealType: "Lunch",
      prepTime: 30,
      cookTime: 20,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 2,
      description: "Flaky, pyramid-shaped ajwain-spiced pastry crust filled with steaming spiced potatoes, sweet green peas, toasted cashews, and coriander seeds.",
      culturalBackground: "The supreme tea-time snack across India, served at every street corner with sweet tamarind and spicy mint-cilantro chutneys.",
      ingredients: [
        { name: "All-purpose flour with ajwain carom seeds (maida)", amount: 2, unit: "cups" },
        { name: "Potatoes (boiled and roughly crushed)", amount: 4, unit: "medium" },
        { name: "Green peas & crushed coriander seeds", amount: 0.5, unit: "cup" },
        { name: "Garam masala and amchur mango powder", amount: 1, unit: "tbsp" },
        { name: "Ghee (shortening for dough)", amount: 4, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Rub cold ghee into flour and ajwain seeds until breadcrumb texture; knead into a stiff dough and rest 20 mins.", timerMinutes: 20 },
        { instruction: "Saut\xE9 cumin, coriander seeds, ginger, green peas, and crushed boiled potatoes with spices; cool filling.", timerMinutes: 5 },
        { instruction: "Roll dough into ovals, cut in half, form into cones, pack with spiced potato filling, and seal base with water.", timerMinutes: 10 },
        { instruction: "Deep fry samosas in oil on low-medium heat (150\xB0C) for 12-15 minutes until golden brown and super flaky.", timerMinutes: 15 },
        { instruction: "Serve crisp with sweet tamarind and fresh mint chutneys." }
      ],
      substitutions: [{ ingredient: "Ajwain seeds", substitute: "Dried thyme leaves" }],
      tips: ["Frying samosas on low heat slowly creates an ultra-crispy, blister-free pastry shell."]
    }
  ],
  // CHINA
  CN: [
    {
      title: "Sichuan Kung Pao Chicken",
      alternateName: "\u5BAB\u4FDD\u9E21\u4E01",
      type: "curry",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 3,
      description: "Wok-seared marinated chicken breast tossed with crunchy roasted peanuts, dried Sichuan chilies, numbing Sichuan peppercorns, and sweet-tangy sauce.",
      culturalBackground: "Named after Ding Baozhen, a Qing dynasty governor of Sichuan Province, renowned for its balance of spicy, numbing, sweet, and sour (h\xFAl\xE0\u5473).",
      ingredients: [
        { name: "Chicken breast or thighs (diced into 1/2-inch cubes)", amount: 450, unit: "g" },
        { name: "Roasted unsalted peanuts", amount: 0.5, unit: "cup" },
        { name: "Dried red Sichuan chilies (snipped & seeded)", amount: 10, unit: "chilies" },
        { name: "Sichuan peppercorns", amount: 1, unit: "tsp" },
        { name: "Kung pao sauce (Chinkiang black vinegar, soy sauce, sugar, cornstarch)", amount: 0.3, unit: "cup" },
        { name: "Scallion white batons", amount: 3, unit: "stalks" }
      ],
      steps: [
        { instruction: "Marinate diced chicken with Shaoxing wine, soy sauce, and cornstarch for 15 minutes.", timerMinutes: 15 },
        { instruction: "Heat oil in a hot wok; fry dried chilies and Sichuan peppercorns for 20 seconds until fragrant and darkened.", timerMinutes: 1 },
        { instruction: "Add chicken cubes; stir-fry vigorously on high heat for 3 minutes until seared on all sides.", timerMinutes: 3 },
        { instruction: "Pour in Kung Pao sauce and scallion batons; toss for 1 minute until sauce glazes the chicken with a glossy sheen.", timerMinutes: 1 },
        { instruction: "Stir in roasted peanuts and serve immediately with jasmine rice." }
      ],
      substitutions: [{ ingredient: "Chinkiang vinegar", substitute: "Balsamic vinegar mixed with rice vinegar" }],
      tips: ["Adding peanuts at the very last second before plating keeps them delightfully crunchy."]
    },
    {
      title: "Sichuan Mapo Tofu",
      alternateName: "\u9EBB\u5A46\u8C46\u8150",
      type: "curry",
      mealType: "Dinner",
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 4,
      description: "Silken tofu cubes simmered in a fiery, numbing Sichuan fermented broad bean paste (pixian doubanjiang) sauce with minced beef and ground green peppercorns.",
      culturalBackground: 'Created in Chengdu in the late 19th century by Mrs. Chen ("Pockmarked Old Lady Chen"), famed for the 7 characteristics of Sichuan cooking.',
      ingredients: [
        { name: "Silken or soft tofu (cut into 3/4-inch cubes)", amount: 400, unit: "g" },
        { name: "Minced beef or pork", amount: 150, unit: "g" },
        { name: "Pixian fermented broad bean paste (Doubanjiang)", amount: 2.5, unit: "tbsp" },
        { name: "Fermented black beans (douchi) & garlic", amount: 1, unit: "tbsp", notes: "Minced" },
        { name: "Ground roasted Sichuan peppercorn powder", amount: 1, unit: "tsp" },
        { name: "Cornstarch slurry", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Gently simmer tofu cubes in salted water for 2 minutes to firm up texture; drain.", timerMinutes: 2 },
        { instruction: "Crisp minced beef in oil until dark and crunchy (3 mins); push aside.", timerMinutes: 3 },
        { instruction: "Fry Pixian doubanjiang and garlic in oil until the oil turns brilliant ruby red.", timerMinutes: 2 },
        { instruction: "Add chicken stock and drained tofu cubes; simmer gently for 5 minutes for tofu to absorb sauce.", timerMinutes: 5 },
        { instruction: "Stir in cornstarch slurry in three stages to create a silky, glossy coating; plate and dust top with roasted numbing peppercorn powder." }
      ],
      substitutions: [{ ingredient: "Doubanjiang", substitute: "Chili bean sauce with a dash of soy sauce" }],
      tips: ["Dusting fresh roasted Sichuan peppercorn powder right before eating gives that signature electric numbing sensation (m\xE1l\xE0)."]
    },
    {
      title: "Hand-Pulled Biang Biang Noodles with Chili Oil",
      alternateName: "\u6CB9\u6CFC\u626F\u9762",
      type: "noodles",
      mealType: "Lunch",
      prepTime: 30,
      cookTime: 5,
      servings: 2,
      difficulty: "Medium",
      spiceLevel: 3,
      description: "Wide, belt-like hand-pulled wheat noodles dressed in minced garlic, scallions, and coarse chili flakes scalded with smoking hot sizzling oil.",
      culturalBackground: 'From Shaanxi province, named for the rhythmic "biang biang" clapping sound made as dough is slapped against the wooden counter.',
      ingredients: [
        { name: "Hand-pulled broad belt wheat noodles", amount: 350, unit: "g" },
        { name: "Coarse red chili powder (Shaanxi chili)", amount: 2, unit: "tbsp" },
        { name: "Garlic and scallions (finely minced)", amount: 3, unit: "tbsp" },
        { name: "Chinkiang black vinegar & light soy sauce", amount: 1.5, unit: "tbsp", notes: "Each" },
        { name: "Smoking hot peanut or vegetable oil", amount: 4, unit: "tbsp" },
        { name: "Bok choy leaves", amount: 4, unit: "leaves", notes: "Blanched" }
      ],
      steps: [
        { instruction: "Pull and slap noodle dough into wide belt strips; boil in water with bok choy for 2 minutes; drain into serving bowls.", timerMinutes: 2 },
        { instruction: "Season noodles with black vinegar and soy sauce.", timerMinutes: 1 },
        { instruction: "Mound minced garlic, scallions, and coarse chili flakes on top of noodles.", timerMinutes: 1 },
        { instruction: "Heat oil in a ladle until smoking hot; pour directly over the chili and garlic mound so it crackles and releases fragrant aromatics.", timerMinutes: 1 },
        { instruction: "Toss noodles vigorously with chopsticks and enjoy piping hot." }
      ],
      substitutions: [{ ingredient: "Hand-pulled noodles", substitute: "Wide dried knife-cut wheat noodles" }],
      tips: ["Pouring genuinely smoking hot oil over the raw chili and garlic activates their fragrant essential oils in seconds."]
    },
    {
      title: "Cantonese Char Siu (Honey Glazed BBQ Pork)",
      alternateName: "\u871C\u6C41\u53C9\u70E7",
      type: "beef",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Tender pork shoulder strips marinated in fermented red bean curd, five spice, hoisin, and soy sauce, roasted and basted in honey glaze.",
      culturalBackground: "The crown jewel of Cantonese Siu Mei rotisserie restaurants in Hong Kong and Guangzhou.",
      ingredients: [
        { name: "Pork shoulder or pork collar (cut into long strips)", amount: 700, unit: "g" },
        { name: "Hoisin sauce and Shaoxing wine", amount: 2, unit: "tbsp", notes: "Each" },
        { name: "Fermented red bean curd (nanru) & five-spice powder", amount: 1, unit: "tbsp" },
        { name: "Maltose or honey (for lustrous basting glaze)", amount: 3, unit: "tbsp" },
        { name: "Soy sauce and brown sugar", amount: 2, unit: "tbsp", notes: "Each" }
      ],
      steps: [
        { instruction: "Marinate pork strips in hoisin, red bean curd, five-spice, soy sauce, and Shaoxing wine for at least 4 hours.", timerMinutes: 10 },
        { instruction: "Place pork strips on a roasting wire rack over a foil-lined baking sheet filled with 1/2 inch water.", timerMinutes: 5 },
        { instruction: "Roast at 200\xB0C (400\xB0F) for 25 minutes, flipping once.", timerMinutes: 25 },
        { instruction: "Brush liberally with honey glaze; broil for 3-4 minutes until caramelized with charred edges.", timerMinutes: 4 },
        { instruction: "Rest 5 minutes, slice into succulent pieces, and serve over rice." }
      ],
      substitutions: [{ ingredient: "Red bean curd", substitute: "A drop of natural beet juice for color and extra soy sauce" }],
      tips: ["Basting with honey during the final broil produces that glass-like sweet lacquered crust."]
    },
    {
      title: "Steamed Cantonese Dim Sum Har Gow (Crystal Prawn Dumplings)",
      alternateName: "\u6C34\u6676\u867E\u997A",
      type: "seafood",
      mealType: "Breakfast",
      prepTime: 35,
      cookTime: 6,
      servings: 4,
      difficulty: "Advanced",
      spiceLevel: 0,
      description: "Translucent, pleated crystal wheat-starch dumpling pockets filled with plump fresh prawns, bamboo shoots, and sesame oil.",
      culturalBackground: "The gold standard benchmark of a Cantonese dim sum master chef\u2019s knife and pleating skills.",
      ingredients: [
        { name: "Wheat starch & tapioca starch (for crystal skins)", amount: 1, unit: "cup", notes: "Mixed with boiling water" },
        { name: "Fresh king prawns (coarsely chopped)", amount: 350, unit: "g" },
        { name: "Bamboo shoots (finely minced)", amount: 3, unit: "tbsp" },
        { name: "Pork lard or sesame oil", amount: 1, unit: "tbsp" },
        { name: "White pepper and sea salt", amount: 0.5, unit: "tsp" }
      ],
      steps: [
        { instruction: "Scald wheat and tapioca starches with rolling boiling water; knead with lard into smooth crystal dough; rest 10 mins.", timerMinutes: 10 },
        { instruction: "Flatten dough balls with the oiled blade of a cleaver into paper-thin translucent rounds.", timerMinutes: 10 },
        { instruction: "Place prawn filling in center and pleat 7 to 9 delicate folds to seal the crescent pouch.", timerMinutes: 10 },
        { instruction: "Steam in a bamboo basket over high heat for 6 minutes until crystal skins turn glass-clear.", timerMinutes: 6 },
        { instruction: "Serve immediately with chili oil and hot tea." }
      ],
      substitutions: [{ ingredient: "Wheat starch", substitute: "Ready-made crystal dumpling wrappers" }],
      tips: ["Water used for making crystal wrapper dough MUST be boiling hot to properly gelatinize the starches."]
    }
  ],
  // VIETNAM
  VN: [
    {
      title: "Hanoi Beef Pho (Ph\u1EDF B\xF2)",
      alternateName: "Ph\u1EDF B\xF2 H\xE0 N\u1ED9i",
      type: "noodles",
      mealType: "Breakfast",
      prepTime: 25,
      cookTime: 120,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 1,
      description: "Crystal-clear aromatic beef bone broth simmered for hours with charred ginger, star anise, and cinnamon, served over flat rice noodles and thin slices of rare beef.",
      culturalBackground: "The national soul food of Vietnam, perfected in northern Hanoi with clean, pure beef aromatics.",
      ingredients: [
        { name: "Beef marrow bones & brisket", amount: 1.2, unit: "kg" },
        { name: "Flat Pho rice noodles (b\xE1nh ph\u1EDF)", amount: 400, unit: "g" },
        { name: "Charred yellow onions and fresh ginger", amount: 2, unit: "pieces" },
        { name: "Whole spices (star anise, cinnamon, black cardamom, cloves, coriander seeds)", amount: 2, unit: "tbsp", notes: "Toasted" },
        { name: "Beef sirloin (sliced paper-thin)", amount: 200, unit: "g" },
        { name: "Fish sauce (N\u01B0\u1EDBc m\u1EAFm) & rock sugar", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Blanch beef bones in boiling water for 10 minutes; rinse clean to ensure crystal-clear broth.", timerMinutes: 10 },
        { instruction: "Simmer clean bones with charred onions, ginger, toasted spices, and rock sugar gently for 2 hours; skim impurities.", timerMinutes: 120 },
        { instruction: "Strain golden fragrant broth and season with premium fish sauce.", timerMinutes: 5 },
        { instruction: "Place cooked rice noodles in bowls, arrange paper-thin raw sirloin slices and sliced scallions on top.", timerMinutes: 3 },
        { instruction: "Ladle boiling hot broth directly over raw beef to flash-cook it in the bowl; serve with lime wedges, Thai basil, and chilies." }
      ],
      substitutions: [{ ingredient: "Beef bones", substitute: "Rich roasted beef stock" }],
      tips: ["Blanching and scrubbing the bones before simmering is essential to achieve that pristine, crystal-clear consomm\xE9 clarity."]
    },
    {
      title: "B\xFAn Ch\u1EA3 Hanoi (Grilled Pork Patties with Rice Vermicelli)",
      alternateName: "B\xFAn Ch\u1EA3 H\xE0 N\u1ED9i",
      type: "grill",
      mealType: "Lunch",
      prepTime: 25,
      cookTime: 15,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Caramelized charcoal-grilled minced pork patties and pork belly bathed in warm tangy n\u01B0\u1EDBc ch\u1EA5m dipping sauce with green papaya and rice vermicelli.",
      culturalBackground: "Hanoi\u2019s quintessential lunch experience, famously shared by Anthony Bourdain and President Barack Obama in Hanoi.",
      ingredients: [
        { name: "Ground pork & pork belly slices", amount: 600, unit: "g" },
        { name: "Caramel sauce (N\u01B0\u1EDBc m\xE0u)", amount: 1.5, unit: "tbsp" },
        { name: "Shallots, garlic, and fish sauce", amount: 2, unit: "tbsp", notes: "Each" },
        { name: "Rice vermicelli noodles (b\xFAn)", amount: 350, unit: "g" },
        { name: "Dipping sauce (fish sauce, lime, sugar, water, garlic, chili, pickled green papaya)", amount: 2, unit: "cups" }
      ],
      steps: [
        { instruction: "Marinate pork patties and belly with shallots, fish sauce, and caramel cooking sauce for 30 minutes.", timerMinutes: 30 },
        { instruction: "Grill pork patties over charcoal or broil for 10 minutes until charred and deeply caramelized.", timerMinutes: 10 },
        { instruction: "Whisk warm n\u01B0\u1EDBc ch\u1EA5m sauce with lime juice, fish sauce, garlic, and sliced pickled green papaya in small bowls.", timerMinutes: 5 },
        { instruction: "Drop hot grilled patties straight into the warm bowls of dipping sauce.", timerMinutes: 2 },
        { instruction: "Serve with plates of cool vermicelli noodles and fresh herbs (mint, perilla, cilantro)." }
      ],
      substitutions: [{ ingredient: "Pork belly", substitute: "Pork shoulder" }],
      tips: ["Dropping sizzling grilled pork patties directly into the warm dipping sauce infuses the broth with smoky pork juices."]
    },
    {
      title: "Crispy Vietnamese Spring Rolls (Ch\u1EA3 Gi\xF2 / Nem R\xE1n)",
      alternateName: "Ch\u1EA3 Gi\xF2 Gi\xF2n R\u1EE5m",
      type: "pastry",
      mealType: "Lunch",
      prepTime: 30,
      cookTime: 15,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 1,
      description: "Shatteringly crispy fried rice paper rolls stuffed with minced pork, wood ear mushrooms, glass noodles, and carrots, wrapped in fresh lettuce.",
      culturalBackground: "A cornerstone of Vietnamese banquets and New Year (T\u1EBFt) celebrations, wrapped in delicate rice paper.",
      ingredients: [
        { name: "Vietnamese rice paper sheets (B\xE1nh tr\xE1ng)", amount: 16, unit: "sheets" },
        { name: "Ground pork & crab meat or shrimp", amount: 350, unit: "g" },
        { name: "Rehydrated wood ear mushrooms & glass noodles", amount: 1, unit: "cup" },
        { name: "Carrots and shallots (shredded)", amount: 1, unit: "cup" },
        { name: "Egg yolk & fish sauce", amount: 1, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Mix ground pork, mushrooms, softened noodles, carrots, and seasonings for the savory filling.", timerMinutes: 10 },
        { instruction: "Dampen rice paper lightly with beer or sugar water, add filling, tuck sides, and roll tightly.", timerMinutes: 10 },
        { instruction: "Double fry: first fry at 160\xB0C for 6 mins, then rest and flash fry at 190\xB0C for 3 mins until ultra-crisp and golden.", timerMinutes: 10 },
        { instruction: "Wrap crispy rolls in crisp butter lettuce leaves with fresh herbs, dip in n\u01B0\u1EDBc ch\u1EA5m sauce, and enjoy." }
      ],
      substitutions: [{ ingredient: "Rice paper", substitute: "Spring roll pastry wrappers" }],
      tips: ["Dabbing rice paper with a touch of beer or sugar water before frying makes the crust blister into golden crispness."]
    },
    {
      title: "Vietnamese B\xE1nh M\xEC Sandwich with Crispy Pork & P\xE2t\xE9",
      alternateName: "B\xE1nh M\xEC Th\u1ECBt Ngu\u1ED9i",
      type: "beef",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Airy, shatteringly crisp French-Vietnamese baguette spread with rich pork liver p\xE2t\xE9, Vietnamese mayonnaise, sliced roast pork, pickled daikon & carrot (\u0111\u1ED3 chua), fresh cucumber, cilantro, and jalapeno.",
      culturalBackground: "The supreme culinary synthesis of French colonial baking and vibrant Vietnamese street condiments.",
      ingredients: [
        { name: "Crispy Vietnamese baguettes (light and airy crumb)", amount: 2, unit: "baguettes" },
        { name: "Pork liver p\xE2t\xE9", amount: 4, unit: "tbsp" },
        { name: "Vietnamese egg-yolk mayonnaise", amount: 2, unit: "tbsp" },
        { name: "Roasted pork or Vietnamese ham (Ch\u1EA3 l\u1EE5a)", amount: 200, unit: "g" },
        { name: "Pickled daikon and carrots (\u0110\u1ED3 chua)", amount: 0.5, unit: "cup" },
        { name: "Fresh cilantro sprigs, cucumber spears, and sliced bird\u2019s eye chili", amount: 1, unit: "bunch" },
        { name: "Maggi liquid seasoning", amount: 1, unit: "tsp" }
      ],
      steps: [
        { instruction: "Warm baguette in a hot oven for 3 minutes until exterior is paper-thin and crackly.", timerMinutes: 3 },
        { instruction: "Slice baguette lengthwise; spread rich p\xE2t\xE9 generously on one side and egg mayonnaise on the other.", timerMinutes: 2 },
        { instruction: "Layer sliced roasted pork and Vietnamese ham along the center.", timerMinutes: 2 },
        { instruction: "Stuff with crunchy pickled daikon and carrots, cucumber spears, and fresh cilantro sprigs.", timerMinutes: 2 },
        { instruction: "Dash with Maggi seasoning, add fresh chili slices, and press gently to serve." }
      ],
      substitutions: [{ ingredient: "Pork liver p\xE2t\xE9", substitute: "Chicken liver mousse or vegetarian mushroom p\xE2t\xE9" }],
      tips: ["Warming the bread produces the signature airy crunch that shatters on your first bite without being tough."]
    },
    {
      title: "C\xE0 Ph\xEA Tr\u1EE9ng (Hanoi Egg Coffee)",
      alternateName: "Hanoi Egg Coffee",
      type: "dessert",
      mealType: "Breakfast",
      prepTime: 10,
      cookTime: 5,
      servings: 2,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Intense, dark Robusta drip coffee topped with a thick, frothy, meringue-like custard cream whipped from fresh egg yolks and sweetened condensed milk.",
      culturalBackground: "Invented in 1946 by Mr. Nguyen Van Giang at the Sofitel Legend Metropole Hanoi when fresh dairy milk was scarce during the war.",
      ingredients: [
        { name: "Dark roasted Vietnamese Robusta coffee grounds", amount: 4, unit: "tbsp", notes: "Brewed through a phin metal filter" },
        { name: "Fresh egg yolks", amount: 2, unit: "yolks" },
        { name: "Sweetened condensed milk", amount: 3, unit: "tbsp" },
        { name: "Pure vanilla extract", amount: 0.5, unit: "tsp" }
      ],
      steps: [
        { instruction: "Brew hot strong coffee using a traditional Vietnamese phin metal drip filter into heatproof glasses.", timerMinutes: 4 },
        { instruction: "In a bowl, whip egg yolks, sweetened condensed milk, and vanilla with an electric frother for 4-5 minutes until pale, thick, and pillowy.", timerMinutes: 5 },
        { instruction: "Gently float the dense, sweet golden egg cream over the top of the dark hot coffee.", timerMinutes: 1 },
        { instruction: "Nestle glass in a small bowl of hot water to keep warm; sip coffee through the luscious custard foam." }
      ],
      substitutions: [{ ingredient: "Phin filter", substitute: "Dark French press coffee or double espresso" }],
      tips: ["Whipping the egg yolks until truly light and voluminous creates a velvety texture reminiscent of tiramisu cream."]
    }
  ]
};

// src/data/recipesEuropeMaster.ts
var EUROPE_DISHES = {
  // SPAIN
  ES: [
    {
      title: "Authentic Paella Valenciana",
      alternateName: "Paella Tradicional de Valencia",
      type: "rice",
      mealType: "Lunch",
      prepTime: 25,
      cookTime: 45,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 0,
      description: "The authentic inland Valencian rice dish cooked over orange wood with rabbit, chicken, flat green beans (bajoqueta), lima beans (garrof\xF3), rosemary, and golden saffron.",
      culturalBackground: "The true original paella born in the countryside of Valencia, prized for the crispy caramelized rice crust on the pan bottom called socarrat.",
      ingredients: [
        { name: "Bomba or Senia paella rice", amount: 400, unit: "g" },
        { name: "Bone-in chicken and rabbit pieces", amount: 800, unit: "g" },
        { name: "Garrof\xF3 large white lima beans & flat green beans", amount: 250, unit: "g" },
        { name: "Spanish saffron threads & sweet smoked piment\xF3n", amount: 1, unit: "tsp", notes: "Each" },
        { name: "Grated ripe tomatoes & extra virgin olive oil", amount: 0.5, unit: "cup" },
        { name: "Fresh rosemary sprig", amount: 1, unit: "sprig" }
      ],
      steps: [
        { instruction: "Brown chicken and rabbit in olive oil around the perimeter of the wide paella pan until deeply caramelized.", timerMinutes: 10 },
        { instruction: "Saut\xE9 green beans and garrof\xF3 beans in the center, then add grated tomato and smoked piment\xF3n.", timerMinutes: 5 },
        { instruction: "Pour in water up to the pan rivets, infuse saffron, and simmer for 15 minutes to build an intensely flavorful broth.", timerMinutes: 15 },
        { instruction: "Distribute Bomba rice evenly in a cross pattern; boil on high heat for 8 minutes without stirring.", timerMinutes: 8 },
        { instruction: "Lower heat, lay rosemary sprig on top, and simmer for 10 mins until broth is absorbed; turn heat up for 2 mins to toast the socarrat crust on the bottom.", timerMinutes: 12 },
        { instruction: "Rest 5 minutes covered with a clean kitchen towel before serving straight from the pan." }
      ],
      substitutions: [{ ingredient: "Rabbit", substitute: "All chicken thighs or duck" }],
      tips: ["Never stir the rice after distributing it into the pan; disturbing it releases starches and prevents the crispy socarrat from forming."]
    },
    {
      title: "Tortilla Espa\xF1ola (Spanish Potato & Onion Omelette)",
      alternateName: "Tortilla de Patatas",
      type: "salad",
      mealType: "Lunch",
      prepTime: 20,
      cookTime: 25,
      servings: 6,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Golden Spanish omelette made with tender Yukon Gold potato slices and sweet onions slow-poached in Spanish olive oil and bound in soft, creamy eggs.",
      culturalBackground: "The quintessential tapa found in every tavern from Madrid to Seville, enjoyed warm, at room temperature, or stuffed inside a crusty bocadillo baguette.",
      ingredients: [
        { name: "Yukon Gold or Kennebec potatoes (thinly sliced)", amount: 800, unit: "g" },
        { name: "Spanish yellow onion (thinly sliced)", amount: 1, unit: "large" },
        { name: "Large fresh eggs", amount: 6, unit: "eggs" },
        { name: "Extra virgin Spanish olive oil (for confiting)", amount: 1.5, unit: "cups" },
        { name: "Sea salt", amount: 1, unit: "tsp" }
      ],
      steps: [
        { instruction: "Slowly poach sliced potatoes and onions in olive oil over low heat for 20 minutes until tender without browning; drain oil well.", timerMinutes: 20 },
        { instruction: "Beat eggs in a large bowl with sea salt, gently fold in warm potatoes and onions; let rest for 10 minutes so potatoes absorb eggs.", timerMinutes: 10 },
        { instruction: "Heat 1 tbsp oil in a non-stick skillet; pour in egg mixture and cook on medium heat for 3 minutes while shaking pan to set bottom.", timerMinutes: 3 },
        { instruction: "Place a flat plate over skillet, swiftly invert the tortilla onto the plate, and slide back into the pan to cook the second side for 2 minutes for a juicy center (jugosa).", timerMinutes: 3 },
        { instruction: "Slide onto a platter and slice into wedges." }
      ],
      substitutions: [{ ingredient: "Yukon Gold potatoes", substitute: "Russet or red potatoes" }],
      tips: ["Letting the warm poached potatoes soak in the beaten eggs for 10 minutes before cooking gives the tortilla a silky, velvety texture."]
    },
    {
      title: "Gambas al Ajillo (Sizzling Garlic Chili Shrimp)",
      alternateName: "Gambas al Ajillo Tradicional",
      type: "seafood",
      mealType: "Dinner",
      prepTime: 10,
      cookTime: 5,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 2,
      description: "Plump succulent wild shrimp sizzling in an earthenware cazuela with thinly sliced garlic, dried guindilla chillies, dry sherry, and fresh flat-leaf parsley.",
      culturalBackground: "Spain\u2019s most famous sizzling tapa, always accompanied by lots of crusty bread to mop up the fragrant garlic-infused oil.",
      ingredients: [
        { name: "Fresh wild shrimp / prawns (peeled & deveined)", amount: 450, unit: "g" },
        { name: "Garlic cloves (thinly sliced)", amount: 8, unit: "cloves" },
        { name: "Dried red bird chillies or guindilla pepper", amount: 2, unit: "peppers" },
        { name: "Extra virgin olive oil", amount: 0.5, unit: "cup" },
        { name: "Dry Fino sherry or white wine", amount: 2, unit: "tbsp" },
        { name: "Fresh flat-leaf parsley (chopped)", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Heat olive oil in an earthenware cazuela or heavy skillet over medium heat; add sliced garlic and dried chillies until garlic turns pale golden (2 mins).", timerMinutes: 2 },
        { instruction: "Add shrimp in a single layer and turn heat to high; cook for 1.5 minutes until shrimp turn pink.", timerMinutes: 2 },
        { instruction: "Splash with dry sherry, toss with chopped parsley and sea salt, and immediately remove from heat.", timerMinutes: 1 },
        { instruction: "Serve piping hot and bubbling with thick slices of rustic bread." }
      ],
      substitutions: [{ ingredient: "Dry sherry", substitute: "Dry white wine with a dash of lemon" }],
      tips: ["Do not let the garlic burn; turning the heat down to gently confit the garlic ensures sweet, nutty oil."]
    },
    {
      title: "Gazpacho Andaluz (Chilled Tomato & Pepper Soup)",
      alternateName: "Gazpacho Tradicional",
      type: "soup",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Chilled, silky smooth emulsion of vine-ripened tomatoes, sweet cucumbers, green bell peppers, garlic, sherry vinegar, and peppery extra virgin olive oil.",
      culturalBackground: "The life-saving summer cooler of southern Andalusia, blended into an airy, frothy emulsion without cooking.",
      ingredients: [
        { name: "Ripe red plum or vine tomatoes", amount: 1, unit: "kg" },
        { name: "Italian green pepper or bell pepper", amount: 1, unit: "pepper" },
        { name: "Persian or English cucumber", amount: 1, unit: "cucumber" },
        { name: "Garlic clove", amount: 1, unit: "clove" },
        { name: "Sherry vinegar (Vinagre de Jerez)", amount: 2, unit: "tbsp" },
        { name: "Extra virgin olive oil", amount: 0.5, unit: "cup" },
        { name: "Stale crusty white bread (crusts removed)", amount: 50, unit: "g" }
      ],
      steps: [
        { instruction: "Soak bread in a splash of water and sherry vinegar.", timerMinutes: 2 },
        { instruction: "Roughly chop tomatoes, cucumber, pepper, and garlic; blend in a high-speed blender with soaked bread until pureed.", timerMinutes: 3 },
        { instruction: "With the blender running on medium speed, slowly stream in extra virgin olive oil to emulsify into a pale, creamy orange soup.", timerMinutes: 2 },
        { instruction: "Strain through a fine mesh sieve for silkiness; chill in the refrigerator for at least 2 hours.", timerMinutes: 5 },
        { instruction: "Serve ice-cold in glasses or bowls garnished with finely diced cucumber, bell pepper, and a swirl of olive oil." }
      ],
      substitutions: [{ ingredient: "Sherry vinegar", substitute: "Red wine vinegar" }],
      tips: ["Streaming the olive oil in slowly while blending creates a luxurious, creamy emulsion without any dairy."]
    },
    {
      title: "Churros con Chocolate Caliente",
      alternateName: "Madrid Churros & Thick Hot Chocolate",
      type: "dessert",
      mealType: "Breakfast",
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Crispy, star-ridged fried dough batons dusted with sugar, dipped into an ultra-thick, rich Spanish dark drinking chocolate.",
      culturalBackground: "The iconic breakfast and late-night tradition of Madrid\u2019s historic chocolater\xEDas, famously Chocolater\xEDa San Gin\xE9s.",
      ingredients: [
        { name: "All-purpose flour", amount: 1.5, unit: "cups" },
        { name: "Boiling water & pinch of salt", amount: 1.5, unit: "cups" },
        { name: "Granulated sugar (for dusting)", amount: 0.5, unit: "cup" },
        { name: "Dark Spanish chocolate (70% cocoa)", amount: 200, unit: "g" },
        { name: "Whole milk & cornstarch (for thickening chocolate)", amount: 2, unit: "cups" }
      ],
      steps: [
        { instruction: "Pour boiling water and salt over flour; stir vigorously with a wooden spoon into a smooth, thick choux paste.", timerMinutes: 3 },
        { instruction: "Fit a piping bag with a closed star tip and fill with dough.", timerMinutes: 2 },
        { instruction: "Pipe 6-inch dough strips into hot oil at 190\xB0C, snipping with scissors; fry for 3-4 minutes until golden and crunchy; drain and roll in sugar.", timerMinutes: 4 },
        { instruction: "Melt dark chocolate into milk with dissolved cornstarch, simmering for 3 minutes until thick enough to coat a spoon.", timerMinutes: 3 },
        { instruction: "Serve warm churros immediately with individual cups of steaming hot thick dipping chocolate." }
      ],
      substitutions: [{ ingredient: "Spanish dark chocolate", substitute: "Bittersweet baking chocolate" }],
      tips: ["Using a star-shaped piping tip creates ridged grooves that trap more cinnamon-sugar and dipping chocolate."]
    }
  ],
  // FRANCE
  FR: [
    {
      title: "Classic Julia Beef Bourguignon",
      alternateName: "B\u0153uf \xE0 la Bourguignonne",
      type: "beef",
      mealType: "Dinner",
      prepTime: 30,
      cookTime: 150,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 0,
      description: "Tender beef chuck braised for hours in rich Burgundy Pinot Noir with crispy lardons, pearl onions, brown button mushrooms, and fresh bouquet garni herbs.",
      culturalBackground: "The supreme pride of Burgundy rustic cooking, elevated to timeless haute cuisine by Auguste Escoffier and Julia Child.",
      ingredients: [
        { name: "Beef chuck roast (cut into 2-inch cubes)", amount: 1.2, unit: "kg" },
        { name: "Dry red Burgundy wine (Pinot Noir)", amount: 1, unit: "bottle (750ml)" },
        { name: "Thick-cut bacon lardons (diced)", amount: 200, unit: "g" },
        { name: "Pearl onions & cremini mushrooms", amount: 300, unit: "g", notes: "Each" },
        { name: "Rich beef stock and tomato paste", amount: 2, unit: "cups" },
        { name: "Bouquet garni (fresh thyme, rosemary, bay leaf, parsley)", amount: 1, unit: "bundle" }
      ],
      steps: [
        { instruction: "Crisp bacon lardons in a Dutch oven; remove with slotted spoon.", timerMinutes: 5 },
        { instruction: "Pat beef cubes thoroughly dry with paper towels; sear in batches in hot bacon fat until deeply browned on all sides (10 mins).", timerMinutes: 10 },
        { instruction: "Stir in tomato paste and flour; cook for 2 minutes, then pour in entire bottle of red Burgundy wine and beef stock.", timerMinutes: 5 },
        { instruction: "Add bouquet garni, cover tightly, and braise in oven at 160\xB0C (325\xB0F) for 2.5 hours until beef is fork-tender.", timerMinutes: 150 },
        { instruction: "In a separate skillet, butter-glaze pearl onions and brown mushrooms; fold into the stew for the final 15 minutes.", timerMinutes: 15 },
        { instruction: "Serve over buttered egg noodles or mashed potatoes." }
      ],
      substitutions: [{ ingredient: "Burgundy wine", substitute: "Dry Cabernet Sauvignon, Merlot, or Pinot Noir" }],
      tips: ["Drying the beef thoroughly with paper towels before searing ensures a deep caramelized crust that creates rich braising juices."]
    },
    {
      title: "Coq au Vin (Classic French Braised Chicken in Red Wine)",
      alternateName: "Coq au Vin Traditionnel",
      type: "curry",
      mealType: "Dinner",
      prepTime: 25,
      cookTime: 50,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 0,
      description: "Bone-in chicken braised with crispy smoked bacon lardons, pearl onions, mushrooms, cognac, and red wine reduction.",
      culturalBackground: "Historic French farmhouse specialty traditionally prepared with a mature rooster slow-simmered in regional wine.",
      ingredients: [
        { name: "Bone-in chicken thighs and drumsticks", amount: 1, unit: "kg" },
        { name: "Dry French red wine (Pinot Noir or C\xF4tes du Rh\xF4ne)", amount: 2.5, unit: "cups" },
        { name: "Smoked bacon lardons", amount: 150, unit: "g" },
        { name: "Pearl onions and quartered mushrooms", amount: 250, unit: "g", notes: "Each" },
        { name: "Cognac or brandy (for flamb\xE9)", amount: 3, unit: "tbsp" },
        { name: "Beurre mani\xE9 (equal parts softened butter and flour kneaded together)", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Fry lardons until golden in a Dutch oven; remove lardons and brown chicken pieces in the fat until skin is crisp.", timerMinutes: 8 },
        { instruction: "Pour in cognac and carefully ignite to flamb\xE9; let flames subside.", timerMinutes: 2 },
        { instruction: "Add red wine, garlic, carrots, and bouquet garni; simmer covered on low heat for 35 minutes.", timerMinutes: 35 },
        { instruction: "Saut\xE9 pearl onions and mushrooms in butter; stir into the chicken stew along with beurre mani\xE9 to gloss and thicken sauce (8 mins).", timerMinutes: 8 },
        { instruction: "Garnish with fresh parsley and serve with steamed buttered potatoes." }
      ],
      substitutions: [{ ingredient: "Cognac", substitute: "French brandy or dry sherry" }],
      tips: ["Whisking in cold beurre mani\xE9 at the end thickens the wine reduction into a silky, mirror-glossy glaze."]
    },
    {
      title: "Authentic French Onion Soup (Soupe \xE0 l\u2019Oignon Gratin\xE9e)",
      alternateName: "Soupe \xE0 l\u2019Oignon Gratin\xE9e",
      type: "soup",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 60,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 0,
      description: "Deeply caramelized sweet yellow onions simmered in beef broth with dry white wine, topped with toasted baguette slices and bubbling Gruy\xE8re cheese.",
      culturalBackground: "Originally a Parisian market-hall worker breakfast at Les Halles, now celebrated worldwide as the ultimate French comfort soup.",
      ingredients: [
        { name: "Yellow onions (thinly sliced)", amount: 1.2, unit: "kg" },
        { name: "Rich beef bone broth", amount: 6, unit: "cups" },
        { name: "Dry white wine & butter", amount: 0.5, unit: "cup", notes: "Each" },
        { name: "Gruy\xE8re cheese (grated)", amount: 200, unit: "g" },
        { name: "Crusty French baguette slices (toasted)", amount: 8, unit: "slices" }
      ],
      steps: [
        { instruction: "Slowly melt onions in butter and olive oil over medium-low heat, stirring occasionally for 45 minutes until deeply caramelized and rich mahogany brown.", timerMinutes: 45 },
        { instruction: "Deglaze pan with dry white wine, scraping all caramelized fond from bottom; boil 2 minutes.", timerMinutes: 2 },
        { instruction: "Pour in beef broth and fresh thyme; simmer uncovered for 20 minutes.", timerMinutes: 20 },
        { instruction: "Ladle soup into oven-safe porcelain bowls, float toasted baguette slices on top, and bury under mounds of grated Gruy\xE8re.", timerMinutes: 3 },
        { instruction: "Broil in oven at 220\xB0C for 4-5 minutes until cheese is blistered, bubbling, and golden brown." }
      ],
      substitutions: [{ ingredient: "Gruy\xE8re", substitute: "Comt\xE9, Emmental, or Swiss cheese" }],
      tips: ["Patience is paramount: do not rush the onion caramelization; 45 slow minutes unlock pure natural onion sweetness without bitter char."]
    },
    {
      title: "Ratatouille Proven\xE7ale (Layered Vegetable Casserole)",
      alternateName: "Ratatouille Ni\xE7oise",
      type: "salad",
      mealType: "Dinner",
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 0,
      description: "Thinly sliced alternating rounds of zucchini, yellow squash, Japanese eggplant, and Roma tomatoes arranged over a rich bell pepper and garlic piperade base.",
      culturalBackground: "From Nice and Provence, honoring the peak summer vegetable harvest of the Mediterranean coast.",
      ingredients: [
        { name: "Zucchini, yellow squash, eggplant, and Roma tomatoes", amount: 2, unit: "each", notes: "Thinly sliced into uniform rounds" },
        { name: "Piperade base (roasted red bell peppers, onions, crushed tomatoes, garlic)", amount: 1.5, unit: "cups" },
        { name: "Herbes de Provence (thyme, oregano, savory, rosemary)", amount: 1, unit: "tbsp" },
        { name: "Extra virgin olive oil", amount: 4, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Spread piperade sauce evenly across the base of a round baking dish.", timerMinutes: 5 },
        { instruction: "Arrange alternating sliced vegetable rounds in a tight, concentric spiral across the dish.", timerMinutes: 15 },
        { instruction: "Drizzle with olive oil, sprinkle with sea salt, minced garlic, and Herbes de Provence.", timerMinutes: 3 },
        { instruction: "Cover with parchment paper and bake at 180\xB0C (350\xB0F) for 40 minutes until vegetables are tender.", timerMinutes: 40 },
        { instruction: "Uncover and bake 5 minutes more to caramelize edges; serve warm or at room temperature." }
      ],
      substitutions: [{ ingredient: "Herbes de Provence", substitute: "Fresh thyme and oregano" }],
      tips: ["Using a mandoline slicer ensures all vegetable rounds are identical thickness for even cooking and gorgeous presentation."]
    },
    {
      title: "Classic French Cr\xE8me Br\xFBl\xE9e",
      alternateName: "Cr\xE8me Br\xFBl\xE9e \xE0 la Vanille",
      type: "dessert",
      mealType: "Dessert",
      prepTime: 20,
      cookTime: 40,
      servings: 6,
      difficulty: "Medium",
      spiceLevel: 0,
      description: "Silky, rich baked vanilla bean custard topped with a brittle, shatteringly crisp layer of caramelized toffee sugar.",
      culturalBackground: "First recorded in Fran\xE7ois Massialot\u2019s 1691 cookbook, representing the ultimate French bistro indulgence.",
      ingredients: [
        { name: "Heavy cream", amount: 2, unit: "cups" },
        { name: "Fresh egg yolks", amount: 5, unit: "yolks" },
        { name: "Vanilla bean (split and seeds scraped)", amount: 1, unit: "pod" },
        { name: "Granulated sugar (for custard)", amount: 0.5, unit: "cup" },
        { name: "Turbinado or superfine sugar (for caramelized crust)", amount: 4, unit: "tbsp" }
      ],
      steps: [
        { instruction: "Heat heavy cream with split vanilla pod and scraped seeds until steaming; steep for 15 minutes.", timerMinutes: 15 },
        { instruction: "Whisk egg yolks and sugar until pale; slowly temper in warm cream while whisking.", timerMinutes: 5 },
        { instruction: "Strain custard through fine sieve; pour into 6 shallow ceramic ramekins placed in a roasting pan filled halfway with hot water (bain-marie).", timerMinutes: 5 },
        { instruction: "Bake at 150\xB0C (300\xB0F) for 35-40 minutes until edges are set but centers gently wobble; chill for at least 4 hours.", timerMinutes: 40 },
        { instruction: "Sprinkle an even layer of sugar on top and caramelize with a kitchen torch until amber and hard." }
      ],
      substitutions: [{ ingredient: "Vanilla pod", substitute: "Pure vanilla bean paste" }],
      tips: ["Using shallow ramekins gives you the ideal ratio of crunchy caramelized sugar crust to velvety cool custard."]
    }
  ]
};

// src/data/premiumRecipeGenerator.ts
var CURATED_IMAGES = {
  rice: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  curry: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  seafood: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80",
  beef: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  pasta: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
  tacos: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  salad: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
  pastry: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
  grill: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
};
var MASTER_DISH_REGISTRY = {
  ...AUTHENTIC_WORLD_DISHES,
  ...EUROPE_DISHES
};
function getAuthenticDishesForCountry(countryCode, countryName, cuisine) {
  if (MASTER_DISH_REGISTRY[countryCode]) {
    return MASTER_DISH_REGISTRY[countryCode];
  }
  const countryRosters = {
    // MEXICO
    MX: [
      {
        title: "Authentic Tacos al Pastor",
        alternateName: "Tacos de Trompo con Pi\xF1a",
        type: "tacos",
        mealType: "Dinner",
        prepTime: 25,
        cookTime: 20,
        servings: 4,
        difficulty: "Medium",
        spiceLevel: 3,
        description: "Thinly sliced pork shoulder marinated in achiote paste, guajillo chiles, and pineapple juice, seared with caramelized pineapple chunks on warm corn tortillas.",
        culturalBackground: "Adapted in Puebla by Lebanese-Mexican immigrants from shawarma spits, now Mexico City\u2019s ultimate nocturnal street taco.",
        ingredients: [
          { name: "Pork shoulder (thinly sliced)", amount: 600, unit: "g" },
          { name: "Achiote paste & dried guajillo chiles", amount: 3, unit: "tbsp", notes: "Hydrated & pureed" },
          { name: "Fresh pineapple slices", amount: 1.5, unit: "cups", notes: "Grilled & diced" },
          { name: "Small white corn tortillas", amount: 12, unit: "tortillas" },
          { name: "Fresh cilantro and white onion", amount: 0.5, unit: "cup", notes: "Finely minced" },
          { name: "Fresh lime wedges", amount: 2, unit: "limes" }
        ],
        steps: [
          { instruction: "Marinate sliced pork in blended achiote, guajillo chiles, garlic, oregano, and pineapple juice for at least 3 hours.", timerMinutes: 10 },
          { instruction: "Sear marinated pork in a smoking hot cast iron skillet until charred with crispy caramelized edges (6 mins).", timerMinutes: 6 },
          { instruction: "Char pineapple slices on the hot skillet until caramelized and sweet; dice into small cubes.", timerMinutes: 4 },
          { instruction: "Warm corn tortillas over an open flame until pliable and fragrant.", timerMinutes: 2 },
          { instruction: "Pile crispy pork into double tortillas, crown with roasted pineapple, diced onions, fresh cilantro, and salsa verde." }
        ],
        substitutions: [{ ingredient: "Achiote paste", substitute: "Smoked paprika, ground cumin, and citrus juice" }],
        tips: ["Searing the pork in batches on smoking hot cast iron mimics the intense caramelization of a vertical trompo spit."]
      },
      {
        title: "Enchiladas Verdes with Shredded Chicken",
        alternateName: "Enchiladas de Pollo con Salsa Verde",
        type: "tacos",
        mealType: "Dinner",
        prepTime: 20,
        cookTime: 25,
        servings: 4,
        difficulty: "Easy",
        spiceLevel: 2,
        description: "Warm corn tortillas rolled around poached shredded chicken, smothered in roasted tomatillo-serrano green salsa, crema, and crumbled queso fresco.",
        culturalBackground: "A beloved Mexican comfort dinner baked until bubbling and garnished with fresh avocado and cilantro.",
        ingredients: [
          { name: "Fresh tomatillos (husked & boiled)", amount: 500, unit: "g" },
          { name: "Serrano peppers & garlic", amount: 2, unit: "peppers" },
          { name: "Shredded poached chicken breast", amount: 400, unit: "g" },
          { name: "Corn tortillas", amount: 8, unit: "tortillas", notes: "Lightly fried in oil" },
          { name: "Mexican crema & Queso Fresco", amount: 0.5, unit: "cup", notes: "Each" }
        ],
        steps: [
          { instruction: "Boil tomatillos and serrano peppers for 8 minutes; blend with garlic, cilantro, and salt into a silky salsa verde.", timerMinutes: 8 },
          { instruction: "Simmer blended green salsa in a saucepan with 1 tbsp oil for 5 minutes to deepen flavor.", timerMinutes: 5 },
          { instruction: "Flash-fry corn tortillas in hot oil for 5 seconds per side to soften without getting crisp; dip in warm green salsa.", timerMinutes: 3 },
          { instruction: "Roll shredded chicken into tortillas, arrange in a baking dish, and flood with remaining hot salsa verde.", timerMinutes: 5 },
          { instruction: "Bake at 190\xB0C for 10 minutes; top with cool crema, crumbled queso fresco, and sliced red onions." }
        ],
        substitutions: [{ ingredient: "Tomatillos", substitute: "Canned whole tomatillos" }],
        tips: ["Flash-frying the tortillas in oil for just a few seconds prevents them from tearing or turning soggy when baked with salsa."]
      },
      {
        title: "Pozole Rojo (Traditional Pork & Hominy Stew)",
        alternateName: "Pozole Rojo de Jalisco",
        type: "soup",
        mealType: "Dinner",
        prepTime: 25,
        cookTime: 60,
        servings: 6,
        difficulty: "Medium",
        spiceLevel: 2,
        description: "Festive red stew of puffed giant white hominy corn (cacahuazintle) and tender pork shoulder in an aromatic guajillo and ancho chile broth.",
        culturalBackground: "Sacred celebratory dish of ancient Mesoamerica, traditionally served on Mexican Independence Day and Christmas Eve.",
        ingredients: [
          { name: "White hominy corn (ma\xEDz pozolero)", amount: 2, unit: "cans (800g)" },
          { name: "Pork shoulder or pork neck bones", amount: 900, unit: "g" },
          { name: "Dried Guajillo and Ancho chiles (seeded)", amount: 5, unit: "chiles", notes: "Soaked & pureed" },
          { name: "Mexican oregano & cumin", amount: 1, unit: "tbsp", notes: "Each" },
          { name: "Garnish: shredded cabbage, radishes, limes, and tostadas", amount: 2, unit: "cups" }
        ],
        steps: [
          { instruction: "Simmer pork shoulder with garlic and onions in water for 45 minutes until tender; shred meat.", timerMinutes: 45 },
          { instruction: "Blend soaked guajillo and ancho chiles with garlic and oregano; strain red chile sauce into the simmering pork broth.", timerMinutes: 5 },
          { instruction: "Add drained white hominy corn and shredded pork; simmer gently for 20 minutes until hominy blossoms open.", timerMinutes: 20 },
          { instruction: "Ladle steaming red pozole into deep bowls; top with shredded cabbage, radish coins, Mexican oregano, and fresh lime." }
        ],
        substitutions: [{ ingredient: "Pork shoulder", substitute: "Chicken thighs or oyster mushrooms" }],
        tips: ["Straining the blended dried chile puree ensures the broth has a silky, smooth texture without coarse skin flecks."]
      },
      {
        title: "Authentic Guacamole with Fresh Pico de Gallo",
        alternateName: "Guacamole Tradicional en Molcajete",
        type: "salad",
        mealType: "Lunch",
        prepTime: 10,
        cookTime: 0,
        servings: 4,
        difficulty: "Easy",
        spiceLevel: 1,
        description: "Buttery Haas avocados hand-mashed in a volcanic molcajete with finely minced serrano chiles, white onions, ripe tomatoes, fresh cilantro, and lime juice.",
        culturalBackground: "Dating back to the Aztecs, prepared fresh tableside with no fillers or artificial preservatives.",
        ingredients: [
          { name: "Ripe Haas avocados", amount: 3, unit: "large" },
          { name: "White onion (finely minced)", amount: 0.5, unit: "cup" },
          { name: "Serrano chile (seeded & minced)", amount: 1, unit: "chile" },
          { name: "Roma tomato (seeded & diced)", amount: 1, unit: "tomato" },
          { name: "Fresh cilantro leaves (chopped)", amount: 0.25, unit: "cup" },
          { name: "Fresh lime juice & coarse sea salt", amount: 1.5, unit: "tbsp" }
        ],
        steps: [
          { instruction: "In a molcajete or bowl, grind minced onion, serrano chile, cilantro, and sea salt into a fragrant paste.", timerMinutes: 2 },
          { instruction: "Scoop in avocado flesh and coarsely mash with a fork, leaving satisfying chunky pieces.", timerMinutes: 2 },
          { instruction: "Fold in diced Roma tomatoes and fresh lime juice gently.", timerMinutes: 1 },
          { instruction: "Serve immediately with warm, crispy corn tortilla chips (totopos)." }
        ],
        substitutions: [{ ingredient: "Serrano chile", substitute: "Jalape\xF1o pepper" }],
        tips: ["Grinding the onion, chile, and salt together first releases aromatic moisture that perfumes the buttery avocado."]
      },
      {
        title: "Tres Leches Cake (Pastel de Tres Leches)",
        alternateName: "Pastel Tradicional de Tres Leches",
        type: "dessert",
        mealType: "Dessert",
        prepTime: 25,
        cookTime: 30,
        servings: 8,
        difficulty: "Easy",
        spiceLevel: 0,
        description: "Light, airy sponge cake pierced and soaked with a sweet trio of evaporated milk, sweetened condensed milk, and heavy cream, topped with whipped chantilly and cinnamon.",
        culturalBackground: "The supreme festive birthday and celebration cake enjoyed across Mexico and Latin America.",
        ingredients: [
          { name: "Sponge cake flour and whipped eggs", amount: 1.5, unit: "cups" },
          { name: "Evaporated milk", amount: 1, unit: "can (354ml)" },
          { name: "Sweetened condensed milk", amount: 1, unit: "can (397g)" },
          { name: "Heavy whipping cream", amount: 1.5, unit: "cups" },
          { name: "Pure vanilla extract & ground cinnamon", amount: 1, unit: "tsp", notes: "Each" }
        ],
        steps: [
          { instruction: "Bake airy sponge cake at 180\xB0C (350\xB0F) for 25 minutes until golden and springy; cool completely.", timerMinutes: 25 },
          { instruction: "Whisk evaporated milk, condensed milk, heavy cream, and vanilla together into the three-milk soak.", timerMinutes: 3 },
          { instruction: "Poke holes all over the cooled sponge cake with a fork; slowly ladle three-milk mixture over the cake to soak in overnight.", timerMinutes: 10 },
          { instruction: "Whip fresh cream with powdered sugar to stiff peaks, spread over cake, and dust with ground cinnamon." }
        ],
        substitutions: [{ ingredient: "Evaporated milk", substitute: "Whole milk mixed with cream" }],
        tips: ["Chill the soaked cake in the refrigerator for at least 6 hours so the sponge absorbs every drop without turning soggy."]
      }
    ]
  };
  if (countryRosters[countryCode]) {
    return countryRosters[countryCode];
  }
  return [
    {
      title: `${cuisine} Traditional Slow-Simmered Hearth Pot`,
      alternateName: `${countryName} Classic Heritage Stew`,
      type: "curry",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 40,
      servings: 4,
      difficulty: "Medium",
      spiceLevel: 2,
      description: `Authentic traditional slow-cooked specialty of ${countryName}, prepared with seasonal meats, local root harvest, and fragrant indigenous aromatics.`,
      culturalBackground: `A cherished family recipe passed down through generations across ${countryName}, celebrating regional agricultural heritage.`,
      ingredients: [
        { name: "Prime braising meat or country harvest", amount: 600, unit: "g" },
        { name: "Fresh onions, garlic and seasonal herbs", amount: 2, unit: "cups" },
        { name: "Traditional cooking broth & regional spices", amount: 3, unit: "cups" },
        { name: "Local vegetables and legumes", amount: 300, unit: "g" }
      ],
      steps: [
        { instruction: `Sear seasoned ingredients in a heavy Dutch oven until caramelized on all sides.`, timerMinutes: 8 },
        { instruction: `Add chopped aromatics, garlic, and traditional seasonings; fry for 3 minutes until intensely fragrant.`, timerMinutes: 3 },
        { instruction: `Pour in cooking broth, cover tightly, and simmer on low heat for 30 minutes until meltingly tender.`, timerMinutes: 30 },
        { instruction: `Garnish with freshly chopped local herbs and serve steaming hot.` }
      ],
      substitutions: [{ ingredient: "Braising meat", substitute: "Seasonal mushrooms, squash, or hearty root vegetables" }],
      tips: [`Slow simmering allows the regional aromatics to deeply penetrate the broth.`]
    },
    {
      title: `${countryName} Spiced Golden Grain Pilaf`,
      alternateName: `${cuisine} Celebration Rice`,
      type: "rice",
      mealType: "Lunch",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 1,
      description: `Fragrant, fluffy long-grain rice infused with whole regional spices, caramelized sweet onions, toasted nuts, and golden broth.`,
      culturalBackground: `Served across ${countryName} at holiday banquets, weddings, and weekend family reunions.`,
      ingredients: [
        { name: "Aromatic long-grain rice (rinsed)", amount: 2, unit: "cups" },
        { name: "Golden spiced broth", amount: 3.5, unit: "cups" },
        { name: "Caramelized onions and toasted nuts", amount: 1, unit: "cup" },
        { name: "Clarified butter or cold-pressed oil", amount: 2, unit: "tbsp" }
      ],
      steps: [
        { instruction: `Toast rinsed rice grains in butter with whole aromatics for 3 minutes until translucent.`, timerMinutes: 3 },
        { instruction: `Pour in seasoned hot broth; bring to a rapid boil.`, timerMinutes: 2 },
        { instruction: `Cover with a tight lid, reduce heat to lowest setting, and steam for 18 minutes.`, timerMinutes: 18 },
        { instruction: `Fluff gently with a fork and top with caramelized golden onions.` }
      ],
      substitutions: [{ ingredient: "Clarified butter", substitute: "Olive oil or coconut oil" }],
      tips: [`Resting the covered pot off the heat for 5 minutes after steaming ensures every grain stays distinct and fluffy.`]
    },
    {
      title: `${countryName} Coastal Fisherman's Seafood Bowl`,
      alternateName: `${cuisine} Seaside Specialty`,
      type: "seafood",
      mealType: "Dinner",
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 2,
      description: `Fresh ocean fish and shellfish poached gently in a bright, aromatic citrus, herb, and garlic broth.`,
      culturalBackground: `Inspired by the coastal harbor traditions and daily morning fish markets of ${countryName}.`,
      ingredients: [
        { name: "Fresh wild white fish fillets & prawns", amount: 500, unit: "g" },
        { name: "Fresh lime juice and herbs", amount: 0.5, unit: "cup" },
        { name: "Garlic, sweet peppers and tomatoes", amount: 2, unit: "cups" },
        { name: "Cold-pressed extra virgin oil", amount: 3, unit: "tbsp" }
      ],
      steps: [
        { instruction: `Saut\xE9 garlic and sweet peppers in oil for 3 minutes until aromatic.`, timerMinutes: 3 },
        { instruction: `Add diced tomatoes and broth; bring to a gentle simmer.`, timerMinutes: 5 },
        { instruction: `Add fresh fish fillets and prawns; simmer gently for 5 minutes until just cooked through.`, timerMinutes: 5 },
        { instruction: `Finish with fresh lime juice, sea salt, and herbs; serve immediately with crusty bread.` }
      ],
      substitutions: [{ ingredient: "Wild white fish", substitute: "Firm tofu or heart of palm" }],
      tips: [`Do not overcook seafood; gentle simmering keeps the fish delicate and buttery.`]
    },
    {
      title: `${countryName} Flame-Seared Charred Skewers`,
      alternateName: `${cuisine} Street Barbecue`,
      type: "grill",
      mealType: "Dinner",
      prepTime: 20,
      cookTime: 12,
      servings: 4,
      difficulty: "Easy",
      spiceLevel: 3,
      description: `Tender skewers marinated in garlic, regional peppers, and toasted spices, grilled over high heat until smoky and succulent.`,
      culturalBackground: `The iconic open-air night market specialty of ${countryName}, celebrated for its smoky char and spicy dipping relish.`,
      ingredients: [
        { name: "Choice tender sirloin or poultry", amount: 600, unit: "g", notes: "Cut into bite-sized cubes" },
        { name: "Regional spice marinade & garlic", amount: 3, unit: "tbsp" },
        { name: "Sweet peppers & red onions", amount: 2, unit: "cups" },
        { name: "Wooden skewers (soaked in water)", amount: 8, unit: "skewers" }
      ],
      steps: [
        { instruction: `Marinate cubed meat in garlic, regional spices, and oil for 20 minutes.`, timerMinutes: 20 },
        { instruction: `Thread marinated meat alternately with peppers and onions onto soaked wooden skewers.`, timerMinutes: 5 },
        { instruction: `Grill on high heat for 3-4 minutes per side until charred on edges and juicy inside.`, timerMinutes: 8 },
        { instruction: `Sprinkle with fresh sea salt and serve with spicy regional dipping relish.` }
      ],
      substitutions: [{ ingredient: "Sirloin", substitute: "Chicken thighs or halloumi cheese" }],
      tips: ["Soaking bamboo skewers in water for 30 minutes prevents them from burning on the grill."]
    },
    {
      title: `${cuisine} Heritage Sweet Celebration Pastry`,
      alternateName: `${countryName} Traditional Sweet Delicacy`,
      type: "dessert",
      mealType: "Dessert",
      prepTime: 20,
      cookTime: 20,
      servings: 6,
      difficulty: "Easy",
      spiceLevel: 0,
      description: `Traditional baked delicacy flavored with local honey, aromatic spices, pure vanilla, and toasted nuts.`,
      culturalBackground: `Prepared across ${countryName} for grand festivals and celebratory feasts.`,
      ingredients: [
        { name: "Pastry flour and sweet butter", amount: 2, unit: "cups" },
        { name: "Pure wildflower honey or cane sugar", amount: 0.75, unit: "cup" },
        { name: "Aromatic cinnamon and vanilla", amount: 1, unit: "tbsp" },
        { name: "Toasted crushed nuts", amount: 0.5, unit: "cup" }
      ],
      steps: [
        { instruction: `Mix pastry dough with butter, honey, and aromatic spices until smooth.`, timerMinutes: 5 },
        { instruction: `Shape into traditional rounds or decorative forms; place on a lined baking sheet.`, timerMinutes: 5 },
        { instruction: `Bake at 180\xB0C (350\xB0F) for 15 minutes until golden brown and fragrant.`, timerMinutes: 15 },
        { instruction: `Drizzle with warm honey syrup, dust with toasted nuts, and serve warm.` }
      ],
      substitutions: [{ ingredient: "Honey", substitute: "Pure maple syrup or agave nectar" }],
      tips: ["Drizzling warm honey over warm pastries allows the syrup to soak deeply into the crumb."]
    }
  ];
}
function generatePremiumRecipes() {
  const recipes = [];
  for (let i = 0; i < PREMIUM_BLUEPRINTS.length; i++) {
    const bp = PREMIUM_BLUEPRINTS[i];
    const country = COUNTRIES_DATABASE.find((c) => c.code === bp.countryCode) || COUNTRIES_DATABASE[0];
    const prepSteps = bp.steps.map((text, idx) => ({
      stepNumber: idx + 1,
      instruction: text,
      tip: idx === 0 ? bp.tips[0] : void 0,
      timerMinutes: idx === 1 ? 15 : void 0
    }));
    const ingredients = bp.keyIngredients.map((k) => ({
      name: k.name,
      amount: k.amount || 1,
      unit: k.unit || "portion",
      notes: k.notes
    }));
    recipes.push({
      recipeId: `prem-bp-${i}-${bp.countryCode.toLowerCase()}`,
      title: bp.title,
      alternateName: bp.alternateName,
      country: country.country,
      countryCode: country.code,
      continent: country.continent,
      region: country.region,
      cuisine: country.cuisine,
      description: bp.description,
      culturalBackground: `An authentic, beloved specialty representing the culinary soul and heritage of ${country.country}.`,
      mealType: bp.mealType,
      categories: [bp.mealType, "Premium Collection"],
      dietaryTags: bp.dietaryTags,
      allergens: bp.allergens,
      ingredients,
      preparationSteps: prepSteps,
      prepTime: bp.prepTime,
      cookTime: bp.cookTime,
      totalTime: bp.prepTime + bp.cookTime,
      servings: bp.servings,
      difficulty: bp.difficulty,
      equipment: ["Heavy skillet or pot", "Chef knife", "Cutting board"],
      cookingTips: bp.tips,
      substitutions: [
        { ingredient: ingredients[0]?.name || "Key ingredient", substitute: "Seasonal equivalent or plant-based alternative" }
      ],
      servingSuggestions: `Serve fresh and hot in the traditional style of ${country.country}.`,
      storageInstructions: "Refrigerate in airtight container up to 4 days.",
      image: bp.image,
      isStarter: false,
      isPremium: true,
      offlineAvailable: false,
      searchTags: [country.country.toLowerCase(), country.cuisine.toLowerCase(), bp.title.toLowerCase()],
      spiceLevel: bp.spiceLevel,
      estimatedCost: "Moderate"
    });
  }
  COUNTRIES_DATABASE.forEach((c) => {
    const dishes = getAuthenticDishesForCountry(c.code, c.country, c.cuisine);
    dishes.forEach((d, dIdx) => {
      recipes.push({
        recipeId: `prem-${c.code.toLowerCase()}-${dIdx + 1}`,
        title: d.title,
        alternateName: d.alternateName,
        country: c.country,
        countryCode: c.code,
        continent: c.continent,
        region: c.region,
        cuisine: c.cuisine,
        description: d.description,
        culturalBackground: d.culturalBackground,
        mealType: d.mealType,
        categories: [d.mealType, "Traditional", "Premium Collection"],
        dietaryTags: ["Gluten-Free Optional"],
        allergens: [],
        ingredients: d.ingredients.map((i) => ({
          name: i.name,
          amount: i.amount || 1,
          unit: i.unit || "portion",
          notes: i.notes
        })),
        preparationSteps: d.steps.map((s, idx) => ({
          stepNumber: idx + 1,
          instruction: s.instruction,
          tip: s.tip,
          timerMinutes: s.timerMinutes
        })),
        prepTime: d.prepTime,
        cookTime: d.cookTime,
        totalTime: d.prepTime + d.cookTime,
        servings: d.servings,
        difficulty: d.difficulty,
        equipment: ["Dutch oven or skillet", "Cutting board", "Chef knife"],
        cookingTips: d.tips,
        substitutions: d.substitutions,
        servingSuggestions: `Serve freshly prepared following ${c.country} culinary traditions.`,
        storageInstructions: "Refrigerate in airtight container for up to 4 days.",
        image: CURATED_IMAGES[d.type] || CURATED_IMAGES.rice,
        isStarter: false,
        isPremium: true,
        offlineAvailable: false,
        searchTags: [c.country.toLowerCase(), c.cuisine.toLowerCase(), d.title.toLowerCase()],
        spiceLevel: d.spiceLevel,
        estimatedCost: "Moderate"
      });
    });
  });
  return recipes;
}

// api/premiumCatalog.ts
var CACHED_FULL_PREMIUM_RECIPES = null;
function getAllFullPremiumRecipes() {
  if (!CACHED_FULL_PREMIUM_RECIPES) {
    CACHED_FULL_PREMIUM_RECIPES = generatePremiumRecipes();
  }
  return CACHED_FULL_PREMIUM_RECIPES;
}
function getFullPremiumRecipeById(recipeId) {
  const all = getAllFullPremiumRecipes();
  return all.find((r) => r.recipeId === recipeId);
}
function getFullPremiumRecipesBatch(recipeIds) {
  const all = getAllFullPremiumRecipes();
  const idSet = new Set(recipeIds);
  return all.filter((r) => idSet.has(r.recipeId));
}

// src/data/starterRecipes.ts
var STARTER_RECIPES = [
  // ==================== AFRICA (10 RECIPES) ====================
  {
    recipeId: "ng-jollof-rice",
    title: "Nigerian Jollof Rice",
    alternateName: "Party Jollof",
    country: "Nigeria",
    countryCode: "NG",
    continent: "Africa",
    region: "West Africa",
    cuisine: "Nigerian",
    description: "Iconic West African smoky tomato and red bell pepper rice dish cooked to perfection with aromatic spices.",
    culturalBackground: "Jollof rice traces its ancestry to the Wolof Empire of the Senegambia region (Thieboudienne). In Nigeria, no festive celebration, wedding, or Sunday gathering is complete without the unmistakable firewood aroma of party jollof.",
    mealType: "Dinner",
    categories: ["Rice", "One-Pot", "Party Dishes"],
    dietaryTags: ["Dairy-Free", "Halal", "Gluten-Free"],
    allergens: [],
    prepTime: 25,
    cookTime: 50,
    totalTime: 75,
    servings: 6,
    difficulty: "Medium",
    spiceLevel: 3,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Heavy-bottom Dutch oven or cast iron pot", "Blender", "Foil paper"],
    ingredients: [
      { name: "Long-grain parboiled rice", amount: 3, unit: "cups", notes: "Rinsed until water runs clear" },
      { name: "Plum tomatoes", amount: 6, unit: "large", notes: "Quartered" },
      { name: "Red bell peppers (Tatashe)", amount: 3, unit: "large", notes: "Stemmed and deseeded" },
      { name: "Scotch bonnet peppers (Ata rodo)", amount: 2, unit: "whole", notes: "Adjust to spice preference" },
      { name: "Red onions", amount: 2, unit: "medium", notes: "1 blended, 1 finely sliced" },
      { name: "Tomato paste", amount: 3, unit: "tbsp" },
      { name: "Vegetable oil", amount: 0.5, unit: "cup" },
      { name: "Chicken or beef stock", amount: 2.5, unit: "cups" },
      { name: "Curry powder", amount: 1, unit: "tbsp" },
      { name: "Dried thyme", amount: 1, unit: "tbsp" },
      { name: "Bay leaves", amount: 3, unit: "pieces" },
      { name: "Bouillon cubes", amount: 2, unit: "cubes" },
      { name: "Salt", amount: 1, unit: "tsp", notes: "To taste" },
      { name: "Butter", amount: 1, unit: "tbsp", notes: "Optional finish" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Blend plum tomatoes, red bell peppers, 1 onion, and scotch bonnet peppers with minimal water until silky smooth.", tip: "Boil down the blended puree for 10 minutes to evaporate excess liquid." },
      { stepNumber: 2, instruction: "Heat vegetable oil in a heavy Dutch oven over medium heat. Saut\xE9 sliced onions until fragrant and translucent.", timerMinutes: 4 },
      { stepNumber: 3, instruction: "Add tomato paste and fry for 5 minutes stirring constantly until it separates slightly and darkens.", timerMinutes: 5, tip: "Frying tomato paste removes raw metallic acidity." },
      { stepNumber: 4, instruction: "Pour in the blended pepper puree, curry powder, thyme, bouillon cubes, bay leaves, and salt. Cook down until oil floats to the surface.", timerMinutes: 15 },
      { stepNumber: 5, instruction: "Stir in rich chicken stock and bring to a rolling boil. Taste and adjust seasoning before adding rice.", tip: "The stock must be slightly over-salted so rice absorbs ample flavor." },
      { stepNumber: 6, instruction: "Add washed parboiled rice, gently stirring to combine. Liquid should just level with the rice.", tip: "Do not flood with too much stock or rice will become soggy." },
      { stepNumber: 7, instruction: "Cover pot tightly with aluminum foil first, then seal with the lid. Reduce heat to very low and let steam cook.", timerMinutes: 25 },
      { stepNumber: 8, instruction: "Gently fold the rice from bottom to top. Cover and steam for 10 more minutes to achieve that authentic smoky bottom crust (part of party jollof).", timerMinutes: 10 }
    ],
    substitutions: [
      { ingredient: "Scotch bonnet peppers", substitute: "Habanero pepper or 1 tsp cayenne pepper", ratio: "1:1" },
      { ingredient: "Dried thyme", substitute: "Italian seasoning or oregano", ratio: "1:1" },
      { ingredient: "Long-grain parboiled rice", substitute: "Golden Sella Basmati rice", notes: "Reduce cooking stock by 1/2 cup for basmati." },
      { ingredient: "Chicken stock", substitute: "Vegetable broth or water + vegetable bouillon", ratio: "1:1" }
    ],
    cookingTips: [
      "The secret to fluffy non-soggy Jollof is tight steam, not swimming in stock.",
      "Allowing the bottom layer to slightly catch and caramelize creates the signature smoky firewood banquet flavor."
    ],
    servingSuggestions: "Serve with golden fried plantains (Dodo), grilled peppered chicken or beef, and refreshing crisp coleslaw.",
    storageInstructions: "Refrigerate in an airtight container for up to 5 days, or freeze for up to 3 months.",
    reheatingInstructions: "Sprinkle 1 tbsp of water over rice, cover loosely, and microwave for 2 minutes or reheat in a covered skillet over low heat.",
    searchTags: ["jollof", "nigeria", "rice", "party", "west africa", "one pot", "spicy"],
    faqs: [
      { question: "Why is my rice still hard?", category: "texture", answer: "Do not add water immediately. Seal tightly with foil and let the trapped steam cook the grains on low heat for 8-10 minutes." },
      { question: "What can I substitute for Scotch bonnet?", category: "substitutions", answer: "Habanero has nearly identical heat and fruity aroma. For milder spice, use jalapeno or sweet bell pepper." },
      { question: "Can I use Basmati rice?", category: "substitutions", answer: "Yes, Golden Sella Basmati works exceptionally well. Just reduce liquid by 15% to keep grains distinct." }
    ]
  },
  {
    recipeId: "ma-chicken-tagine",
    title: "Moroccan Chicken Tagine",
    alternateName: "Tajine de Poulet aux Olives",
    country: "Morocco",
    countryCode: "MA",
    continent: "Africa",
    region: "North Africa",
    cuisine: "Moroccan",
    description: "Tender slow-simmered chicken thighs braised with preserved lemons, green olives, ginger, saffron, and aromatic cilantro.",
    culturalBackground: "The tagine is both the iconic conical clay vessel of the Maghreb and the aromatic stew cooked inside it. This slow-braising method evolved from Berber nomadic traditions to preserve precious moisture in arid climates.",
    mealType: "Dinner",
    categories: ["Poultry", "Stews", "Slow Cooked"],
    dietaryTags: ["Dairy-Free", "Gluten-Free", "Halal"],
    allergens: [],
    prepTime: 20,
    cookTime: 50,
    totalTime: 70,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Clay Tagine or Heavy Dutch oven", "Tongs"],
    ingredients: [
      { name: "Bone-in chicken thighs", amount: 8, unit: "pieces", notes: "Skin-on or skinless" },
      { name: "Yellow onions", amount: 2, unit: "large", notes: "Finely grated or grated puree" },
      { name: "Garlic cloves", amount: 4, unit: "cloves", notes: "Minced" },
      { name: "Preserved lemon", amount: 1, unit: "whole", notes: "Pulp removed, rind thinly sliced" },
      { name: "Cured green olives (castelvetrano or picholine)", amount: 1, unit: "cup", notes: "Pitted" },
      { name: "Olive oil", amount: 3, unit: "tbsp" },
      { name: "Ground ginger", amount: 1.5, unit: "tsp" },
      { name: "Ground cumin", amount: 1, unit: "tsp" },
      { name: "Ground turmeric", amount: 1, unit: "tsp" },
      { name: "Saffron threads", amount: 0.25, unit: "tsp", notes: "Steeped in 2 tbsp warm water" },
      { name: "Fresh cilantro and parsley", amount: 0.5, unit: "cup", notes: "Finely chopped" },
      { name: "Chicken broth", amount: 1, unit: "cup" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Mix olive oil, garlic, ginger, turmeric, cumin, salt, pepper, saffron liquid, and chopped herbs into a marinade paste.", tip: "Rub thoroughly all over chicken pieces and rest 20 mins." },
      { stepNumber: 2, instruction: "In your tagine or Dutch oven, warm 1 tbsp olive oil over medium-low heat. Sear the chicken pieces until lightly golden on all sides.", timerMinutes: 8 },
      { stepNumber: 3, instruction: "Remove chicken temporarily. Add the grated onions to the base of the pot and simmer until translucent and sweet.", timerMinutes: 6 },
      { stepNumber: 4, instruction: "Nestle chicken back on the onion bed. Pour remaining marinade and chicken broth around the sides.", tip: "Do not submerge chicken entirely; the steam will cook it through." },
      { stepNumber: 5, instruction: "Cover with the tagine lid, reduce heat to low, and braise gently for 35 minutes until chicken is tender.", timerMinutes: 35 },
      { stepNumber: 6, instruction: "Uncover, add preserved lemon strips and olives. Simmer uncovered for 10 minutes until sauce thickens into a golden glossy glaze.", timerMinutes: 10 }
    ],
    substitutions: [
      { ingredient: "Preserved lemon", substitute: "Zest and juice of 1 fresh lemon + 1/2 tsp sea salt" },
      { ingredient: "Saffron threads", substitute: "Extra 1/2 tsp ground turmeric" },
      { ingredient: "Chicken thighs", substitute: "Bone-in lamb shank or cauliflower steaks for vegetarian" }
    ],
    cookingTips: ["Grated onion creates the thick, silky sauce without needing flour or cornstarch."],
    servingSuggestions: "Serve directly in the tagine with crusty Moroccan Khobz bread or fluffy steamed couscous.",
    storageInstructions: "Keeps 4 days refrigerated; flavors deepen overnight.",
    searchTags: ["morocco", "tagine", "chicken", "olives", "preserved lemon", "berber"],
    faqs: [
      { question: "Can I make this without a clay tagine?", category: "equipment", answer: "Yes! A heavy cast-iron Dutch oven with a tight lid produces identical succulent results." }
    ]
  },
  {
    recipeId: "za-bobotie",
    title: "South African Bobotie",
    alternateName: "Cape Malay Spiced Beef Bake",
    country: "South Africa",
    countryCode: "ZA",
    continent: "Africa",
    region: "Southern Africa",
    cuisine: "South African",
    description: "Comforting Cape Malay spiced minced beef baked with sultanas, chutney, and bay leaves beneath a golden savory egg-custard topping.",
    culturalBackground: "Originating from the Cape Malay community in South Africa, Bobotie blends Dutch colonial baking with fragrant Indonesian and Malaysian spices brought to the Cape in the 17th century.",
    mealType: "Dinner",
    categories: ["Beef", "Casserole", "Comfort Food"],
    dietaryTags: ["Dairy-Free Optional", "Halal"],
    allergens: ["Eggs", "Dairy"],
    prepTime: 20,
    cookTime: 40,
    totalTime: 60,
    servings: 6,
    difficulty: "Easy",
    spiceLevel: 2,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Baking dish (9x13 inch)", "Skillet", "Whisk"],
    ingredients: [
      { name: "Ground lean beef", amount: 800, unit: "g" },
      { name: "White bread slices", amount: 2, unit: "slices", notes: "Soaked in milk and squeezed" },
      { name: "Milk", amount: 1.25, unit: "cups", notes: "Divided" },
      { name: "Eggs", amount: 3, unit: "large" },
      { name: "Onions", amount: 2, unit: "medium", notes: "Finely chopped" },
      { name: "Mild curry powder", amount: 2, unit: "tbsp" },
      { name: "Turmeric", amount: 1, unit: "tsp" },
      { name: "Fruit chutney (Mrs Balls or mango)", amount: 2, unit: "tbsp" },
      { name: "Golden raisins or sultanas", amount: 0.3, unit: "cup" },
      { name: "Bay leaves", amount: 4, unit: "pieces" },
      { name: "Almond slivers", amount: 2, unit: "tbsp", notes: "Optional garnish" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Soak bread slices in 0.5 cup milk. Squeeze dry, reserving the milk. Mash the bread with a fork." },
      { stepNumber: 2, instruction: "Saut\xE9 chopped onions in butter/oil until softened and golden. Stir in curry powder and turmeric for 1 minute.", timerMinutes: 5 },
      { stepNumber: 3, instruction: "Add ground beef and brown thoroughly, breaking up clumps with a wooden spoon.", timerMinutes: 8 },
      { stepNumber: 4, instruction: "Stir in mashed bread, fruit chutney, raisins, 1 beaten egg, salt, and pepper. Simmer 5 mins.", timerMinutes: 5 },
      { stepNumber: 5, instruction: "Transfer beef mixture into a greased baking dish and smooth the top evenly." },
      { stepNumber: 6, instruction: "Whisk remaining 2 eggs with 0.75 cup milk. Gently pour over the meat. Arrange bay leaves on top." },
      { stepNumber: 7, instruction: "Bake at 180\xB0C (350\xB0F) for 30 minutes until the custard layer is set, puffed, and golden brown.", timerMinutes: 30 }
    ],
    substitutions: [
      { ingredient: "Ground beef", substitute: "Ground lamb or green lentils for vegan adaptation" },
      { ingredient: "Fruit chutney", substitute: "Apricot jam mixed with 1 tsp apple cider vinegar" }
    ],
    cookingTips: ["Do not overcook the custard layer; remove as soon as lightly browned and set in center."],
    servingSuggestions: "Serve with fragrant yellow turmeric rice, sambal, and extra fruit chutney.",
    storageInstructions: "Refrigerate up to 4 days. Excellent reheated.",
    searchTags: ["south africa", "bobotie", "cape malay", "casserole", "mince"]
  },
  {
    recipeId: "sn-thieboudienne",
    title: "Senegalese Thi\xE9boudienne",
    alternateName: "Ceebu J\xEBn",
    country: "Senegal",
    countryCode: "SN",
    continent: "Africa",
    region: "West Africa",
    cuisine: "Senegalese",
    description: "The national dish of Senegal: Herb-stuffed white fish simmered with cassava, eggplant, carrots, and broken jasmine rice in tomato bouillon.",
    culturalBackground: "Declared UNESCO intangible cultural heritage in 2021, Thi\xE9boudienne was created in 19th-century Saint-Louis by Penda Mbaye. It is widely considered the culinary ancestor of West African Jollof rice.",
    mealType: "Dinner",
    categories: ["Fish", "Rice", "National Dish"],
    dietaryTags: ["Dairy-Free", "Halal"],
    allergens: ["Fish"],
    prepTime: 30,
    cookTime: 60,
    totalTime: 90,
    servings: 6,
    difficulty: "Advanced",
    spiceLevel: 3,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large heavy pot with lid", "Food processor or mortar"],
    ingredients: [
      { name: "Firm white fish fillets (Grouper, Cod, or Sea Bass)", amount: 1, unit: "kg" },
      { name: "Broken jasmine rice", amount: 3, unit: "cups", notes: "Rinsed and steamed" },
      { name: "Tomato paste", amount: 4, unit: "tbsp" },
      { name: "Cassava root", amount: 1, unit: "piece", notes: "Peeled and chunked" },
      { name: "Carrots", amount: 2, unit: "large", notes: "Halved" },
      { name: "Eggplant", amount: 1, unit: "small", notes: "Quartered" },
      { name: "Cabbage", amount: 0.25, unit: "head", notes: "Cut into wedges" },
      { name: "Fresh parsley", amount: 1, unit: "bunch", notes: "For Roff stuffing" },
      { name: "Garlic and scallions", amount: 4, unit: "cloves", notes: "Minced" },
      { name: "Tamarind paste", amount: 1, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make the Roff stuffing: crush parsley, scallions, garlic, habanero, and salt into a coarse paste." },
      { stepNumber: 2, instruction: "Make slits in the fish fillets and stuff with the Roff paste. Sear fillets in peanut oil and remove." },
      { stepNumber: 3, instruction: "In same oil, brown onions and tomato paste. Add water, tamarind, and vegetables; simmer until vegetables are fork tender.", timerMinutes: 25 },
      { stepNumber: 4, instruction: "Remove vegetables and fish to a platter. In the rich bubbling broth, add rinsed broken rice." },
      { stepNumber: 5, instruction: "Cover pot tightly and steam rice on low heat until tender, fragrant, and slightly caramelized at bottom.", timerMinutes: 25 }
    ],
    substitutions: [
      { ingredient: "Broken jasmine rice", substitute: "Regular jasmine rice crushed slightly or parboiled long grain" },
      { ingredient: "Cassava", substitute: "Sweet potato or potatoes" }
    ],
    cookingTips: ["Steaming the broken rice over the simmering pot before adding it guarantees each grain remains fluffy."],
    servingSuggestions: "Serve on a large communal platter with the rice at the base topped with fish, vegetables, and lemon wedges.",
    storageInstructions: "Refrigerate up to 3 days.",
    searchTags: ["senegal", "thieboudienne", "fish", "rice", "unesco"]
  },
  {
    recipeId: "et-doro-wat",
    title: "Ethiopian Doro Wat",
    alternateName: "Spiced Chicken Stew with Hard-Boiled Eggs",
    country: "Ethiopia",
    countryCode: "ET",
    continent: "Africa",
    region: "East Africa",
    cuisine: "Ethiopian",
    description: "Deeply aromatic chicken stew slow-simmered with slow-cooked sweet red onions, fiery berbere spice blend, spiced clarified butter (niter kibbeh), and whole hard-boiled eggs.",
    culturalBackground: "Doro Wat is the pride of Ethiopian culinary tradition, prepared for Christian holidays, Easter, and weddings. The depth comes from hours of patiently sweating onions without oil before adding spiced butter.",
    mealType: "Dinner",
    categories: ["Chicken", "Stews", "Traditional"],
    dietaryTags: ["Gluten-Free", "Halal"],
    allergens: ["Eggs", "Dairy"],
    prepTime: 30,
    cookTime: 75,
    totalTime: 105,
    servings: 4,
    difficulty: "Advanced",
    spiceLevel: 4,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Heavy Dutch oven", "Knife"],
    ingredients: [
      { name: "Chicken drumsticks and thighs", amount: 8, unit: "pieces", notes: "Skin removed" },
      { name: "Red onions", amount: 5, unit: "large", notes: "Finely minced" },
      { name: "Niter Kibbeh (Ethiopian spiced butter)", amount: 4, unit: "tbsp", notes: "Or clarified butter/ghee" },
      { name: "Berbere spice blend", amount: 3, unit: "tbsp" },
      { name: "Garlic and ginger paste", amount: 2, unit: "tbsp" },
      { name: "Hard-boiled eggs", amount: 4, unit: "whole", notes: "Peeled with gentle surface scores" },
      { name: "Lemon juice", amount: 2, unit: "tbsp" },
      { name: "Cardamom and korarima", amount: 0.5, unit: "tsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Marinate cleaned chicken pieces with lemon juice and salt for 20 minutes." },
      { stepNumber: 2, instruction: "Add minced onions to a dry heavy pot over low heat. Sweat for 30 minutes until moisture reduces and onions turn amber brown.", timerMinutes: 30 },
      { stepNumber: 3, instruction: "Add Niter Kibbeh spiced butter, garlic, ginger, and berbere. Cook gently for 15 minutes to release fragrant oils.", timerMinutes: 15 },
      { stepNumber: 4, instruction: "Add chicken pieces and 1 cup water. Simmer covered on low heat for 30 minutes until chicken is tender.", timerMinutes: 30 },
      { stepNumber: 5, instruction: "Add scored hard-boiled eggs and ground cardamom. Simmer for 10 minutes so eggs absorb the deep crimson sauce.", timerMinutes: 10 }
    ],
    substitutions: [
      { ingredient: "Niter Kibbeh", substitute: "Ghee or butter infused with cumin, fenugreek, and ginger" },
      { ingredient: "Berbere", substitute: "Equal parts smoked paprika, cayenne pepper, coriander, and allspice" }
    ],
    cookingTips: ["Never rush the dry onions in step 2; that caramelization provides the entire sauce texture."],
    servingSuggestions: "Serve with sourdough Injera flatbread, gomen (collard greens), and mild Ayib cottage cheese.",
    storageInstructions: "Refrigerate up to 5 days; tastes even better the next day.",
    searchTags: ["ethiopia", "doro wat", "chicken", "berbere", "injera"]
  },
  {
    recipeId: "gh-groundnut-soup",
    title: "Ghanaian Groundnut Soup",
    alternateName: "Nkatenkwan with Chicken & Fufu",
    country: "Ghana",
    countryCode: "GH",
    continent: "Africa",
    region: "West Africa",
    cuisine: "Ghanaian",
    description: "Velvety roasted peanut butter soup simmered with chicken, smoked fish, tomatoes, ginger, and habaneros.",
    culturalBackground: "A beloved staple across Ghana and West Africa, Nkatenkwan represents comforting soul food traditionally savored on weekends alongside pounded cassava-plantain fufu or rice balls (omotuo).",
    mealType: "Dinner",
    categories: ["Soups", "Poultry", "Comfort Food"],
    dietaryTags: ["Gluten-Free", "Dairy-Free", "Halal"],
    allergens: ["Peanuts", "Fish"],
    prepTime: 20,
    cookTime: 50,
    totalTime: 70,
    servings: 5,
    difficulty: "Medium",
    spiceLevel: 3,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large soup pot", "Whisk", "Blender"],
    ingredients: [
      { name: "Chicken thighs and drumsticks", amount: 800, unit: "g" },
      { name: "Natural unsweetened smooth peanut butter", amount: 1, unit: "cup" },
      { name: "Tomatoes", amount: 4, unit: "medium" },
      { name: "Onions", amount: 2, unit: "medium" },
      { name: "Scotch bonnet peppers", amount: 2, unit: "pieces" },
      { name: "Fresh ginger", amount: 2, unit: "tbsp", notes: "Grated" },
      { name: "Smoked dried fish or catfish", amount: 150, unit: "g", notes: "Flaked and boned" },
      { name: "Chicken broth or water", amount: 4, unit: "cups" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Steam chicken pieces with blended ginger, garlic, half the onions, and bouillon cubes for 10 minutes." },
      { stepNumber: 2, instruction: "In a separate saucepan, whisk peanut butter with 1.5 cups warm water. Cook over low heat stirring until oil separates and floats on top.", timerMinutes: 12 },
      { stepNumber: 3, instruction: "Pour the cooked peanut sauce into the steaming chicken pot. Add broth and bring to a gentle boil." },
      { stepNumber: 4, instruction: "Add whole tomatoes, habanero, and remaining onion. Once softened (10 mins), scoop them out, blend until smooth, and pour back into soup.", timerMinutes: 15 },
      { stepNumber: 5, instruction: "Add smoked fish and simmer on medium-low heat for 25 minutes until the soup reduces to a rich, silky golden-orange stew.", timerMinutes: 25 }
    ],
    substitutions: [
      { ingredient: "Peanut butter", substitute: "Sunflower seed butter or almond butter for peanut allergies" },
      { ingredient: "Smoked fish", substitute: "Smoked paprika or omit for a milder aroma" }
    ],
    cookingTips: ["Cooking the peanut butter separately in step 2 is crucial to break raw oils and achieve that glossy restaurant finish."],
    servingSuggestions: "Serve piping hot with pounded fufu, white rice balls, or crusty baguette.",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["ghana", "groundnut", "peanut soup", "fufu", "west africa"]
  },
  {
    recipeId: "eg-koshari",
    title: "Egyptian Koshari",
    alternateName: "Kushari National Dish",
    country: "Egypt",
    countryCode: "EG",
    continent: "Africa",
    region: "North Africa",
    cuisine: "Egyptian",
    description: "Egypt\u2019s legendary street food layering brown lentils, rice, elbow macaroni, spiced chickpeas, spicy garlicky tomato sauce, and crispy caramelized onions.",
    culturalBackground: "Originating in 19th-century Cairo, Koshari was shaped by multicultural influences including Italian pasta and Indian khichdi. Today it is served from rattling metal carts across Cairo.",
    mealType: "Lunch",
    categories: ["Vegan", "Grain Bowls", "Street Food"],
    dietaryTags: ["Vegan", "Vegetarian", "Dairy-Free", "Halal"],
    allergens: ["Gluten"],
    prepTime: 20,
    cookTime: 40,
    totalTime: 60,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 2,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Medium pots", "Skillet for onions"],
    ingredients: [
      { name: "Brown lentils (brown or green)", amount: 1, unit: "cup" },
      { name: "Egyptian short-grain or medium rice", amount: 1, unit: "cup" },
      { name: "Elbow macaroni pasta", amount: 1, unit: "cup" },
      { name: "Cooked chickpeas", amount: 1, unit: "cup" },
      { name: "Yellow onions", amount: 3, unit: "large", notes: "Thinly sliced into half-moons" },
      { name: "Tomato sauce", amount: 2, unit: "cups" },
      { name: "White vinegar", amount: 3, unit: "tbsp" },
      { name: "Garlic cloves", amount: 6, unit: "cloves", notes: "Minced" },
      { name: "Ground cumin and coriander", amount: 1, unit: "tbsp", notes: "Combined" },
      { name: "Chili flakes", amount: 1, unit: "tsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Fry sliced onions in hot oil until deep brown and crispy. Drain on paper towels. Save the fragrant onion oil." },
      { stepNumber: 2, instruction: "Cook lentils in 3 cups water for 15 mins. Stir in rinsed rice and 1 tsp cumin; cover and simmer until water is absorbed.", timerMinutes: 15 },
      { stepNumber: 3, instruction: "Boil macaroni in salted water until al dente. Drain and toss with 1 tbsp of the reserved onion oil." },
      { stepNumber: 4, instruction: "Make the sauce: Saut\xE9 garlic in 2 tbsp onion oil, add vinegar, tomato sauce, cumin, and simmer for 10 minutes.", timerMinutes: 10 },
      { stepNumber: 5, instruction: "Assemble: Layer rice and lentils at bottom, followed by macaroni, chickpeas, ladles of hot tomato sauce, and a mountain of crispy onions." }
    ],
    substitutions: [
      { ingredient: "Elbow macaroni", substitute: "Gluten-free small pasta" },
      { ingredient: "Brown lentils", substitute: "Puy lentils or brown pardina" }
    ],
    cookingTips: ["Using the fragrant oil from frying the onions to flavor every other component is the authentic secret."],
    servingSuggestions: "Serve with Da\u2019ah (a side sauce of garlic, lemon, cumin, and vinegar) and Shatta (spicy chili oil).",
    storageInstructions: "Keep components in separate containers for up to 5 days.",
    searchTags: ["egypt", "koshari", "lentils", "street food", "vegan"]
  },
  {
    recipeId: "ke-sukuma-wiki",
    title: "Kenyan Sukuma Wiki with Ugali",
    alternateName: "Braised Collards with Cornmeal Porridge",
    country: "Kenya",
    countryCode: "KE",
    continent: "Africa",
    region: "East Africa",
    cuisine: "Kenyan",
    description: "Fresh collard greens braised with sweet tomatoes, onions, garlic, and cumin served alongside hearty white cornmeal ugali.",
    culturalBackground: 'In Swahili, "Sukuma Wiki" literally translates to "stretch the week" \u2014 honoring this nutritious, budget-friendly dish that sustains families across East Africa.',
    mealType: "Dinner",
    categories: ["Vegetarian", "Greens", "Everyday Staples"],
    dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"],
    allergens: [],
    prepTime: 15,
    cookTime: 25,
    totalTime: 40,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Skillet", "Wooden cooking stick (mwiko)", "Pot for ugali"],
    ingredients: [
      { name: "Collard greens or kale", amount: 2, unit: "bunches", notes: "Stems removed, finely shredded" },
      { name: "White cornmeal (Maize flour)", amount: 2, unit: "cups", notes: "For ugali" },
      { name: "Water", amount: 4, unit: "cups", notes: "For ugali" },
      { name: "Ripe tomatoes", amount: 2, unit: "medium", notes: "Diced" },
      { name: "Red onion", amount: 1, unit: "large", notes: "Chopped" },
      { name: "Garlic cloves", amount: 3, unit: "cloves", notes: "Minced" },
      { name: "Vegetable oil", amount: 2, unit: "tbsp" },
      { name: "Ground cumin & coriander", amount: 1, unit: "tsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Heat oil in a skillet. Saut\xE9 onions and garlic until fragrant and tender." },
      { stepNumber: 2, instruction: "Add diced tomatoes and spices. Cook until tomatoes break down into a soft jammy paste.", timerMinutes: 6 },
      { stepNumber: 3, instruction: "Add shredded collard greens. Stir-fry for 6-8 minutes until wilted but vibrant green. Season with salt.", timerMinutes: 7 },
      { stepNumber: 4, instruction: "Make Ugali: Bring water to a boil in a pot. Gradually rain in cornmeal while stirring vigorously with a wooden spoon." },
      { stepNumber: 5, instruction: "Press and fold the dough against pot sides until a smooth, firm, steamy mound forms. Invert onto a plate.", timerMinutes: 10 }
    ],
    substitutions: [
      { ingredient: "White maize flour", substitute: "Yellow cornmeal or polenta" },
      { ingredient: "Collard greens", substitute: "Lacinato kale or Swiss chard" }
    ],
    cookingTips: ["Do not overboil the greens; keeping them bright green preserves vitamins and crisp bite."],
    servingSuggestions: "Pinch a piece of warm ugali with your right hand, indent with your thumb to create a spoon, and scoop up greens.",
    storageInstructions: "Greens keep 3 days refrigerated.",
    searchTags: ["kenya", "sukuma wiki", "ugali", "collard greens", "swahili"]
  },
  {
    recipeId: "mz-peri-peri-prawns",
    title: "Mozambican Peri-Peri Prawns",
    alternateName: "Camar\xE3o com Piri-Piri",
    country: "Mozambique",
    countryCode: "MZ",
    continent: "Africa",
    region: "Southern Africa",
    cuisine: "Mozambican",
    description: "Plump grilled tiger prawns tossed in a fiery marinade of bird\u2019s eye chili, crushed garlic, lemon juice, smoked paprika, and coconut oil.",
    culturalBackground: "The historical spice routes between Portugal and Mozambique gave birth to the legendary peri-peri sauce made from African bird\u2019s eye chilies (malagueta).",
    mealType: "Dinner",
    categories: ["Seafood", "Grill", "Quick Meals"],
    dietaryTags: ["Dairy-Free", "Gluten-Free", "Pescatarian"],
    allergens: ["Shellfish"],
    prepTime: 15,
    cookTime: 10,
    totalTime: 25,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 4,
    estimatedCost: "Special Occasion",
    image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Cast iron skillet or outdoor grill", "Pastry brush"],
    ingredients: [
      { name: "Jumbo prawns or shrimp", amount: 800, unit: "g", notes: "Shell-on, deveined" },
      { name: "Red bird\u2019s eye chilies", amount: 4, unit: "whole", notes: "Finely minced" },
      { name: "Garlic cloves", amount: 6, unit: "cloves", notes: "Crushed" },
      { name: "Fresh lemon juice", amount: 0.3, unit: "cup" },
      { name: "Olive oil or coconut oil", amount: 0.25, unit: "cup" },
      { name: "Smoked paprika", amount: 1, unit: "tbsp" },
      { name: "Fresh oregano", amount: 1, unit: "tsp", notes: "Chopped" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Whisk minced chilies, crushed garlic, lemon juice, oil, paprika, salt, and oregano into peri-peri marinade." },
      { stepNumber: 2, instruction: "Toss prawns in half the marinade. Let sit at room temperature for 15 minutes." },
      { stepNumber: 3, instruction: "Heat a cast-iron skillet or grill over high heat. Sear prawns for 2-3 minutes per side until pink and charred at edges.", timerMinutes: 5 },
      { stepNumber: 4, instruction: "Pour remaining fresh marinade over prawns in the hot pan, sizzling for 30 seconds before plating." }
    ],
    substitutions: [
      { ingredient: "Bird\u2019s eye chilies", substitute: "Thai bird chilies or red habanero" },
      { ingredient: "Jumbo prawns", substitute: "Chicken skewers or firm tofu cutlets" }
    ],
    cookingTips: ["Grilling with the shell on keeps the prawn flesh juicy and sweet."],
    servingSuggestions: "Serve with charred lemon halves, yellow coconut rice, and crusty bread to mop up peri-peri sauce.",
    storageInstructions: "Best enjoyed fresh; keep up to 2 days refrigerated.",
    searchTags: ["mozambique", "peri peri", "prawns", "shrimp", "spicy"]
  },
  {
    recipeId: "dz-shakshuka",
    title: "Algerian Shakshuka",
    alternateName: "Chakhchoukha / Chakchouka",
    country: "Algeria",
    countryCode: "DZ",
    continent: "Africa",
    region: "North Africa",
    cuisine: "Algerian",
    description: "Silky stewed red bell peppers, ripe tomatoes, sweet onions, and caraway seeds with softly poached eggs nestled in the simmering sauce.",
    culturalBackground: 'From the Arabic word for "a mixture", Shakshuka has sustained Maghrebi households for centuries as a hearty one-skillet dish celebrating sun-ripened summer vegetables.',
    mealType: "Breakfast",
    categories: ["Breakfast", "Eggs", "Vegetarian"],
    dietaryTags: ["Vegetarian", "Gluten-Free", "Dairy-Free"],
    allergens: ["Eggs"],
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 2,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Cast iron skillet with lid"],
    ingredients: [
      { name: "Fresh large eggs", amount: 4, unit: "whole" },
      { name: "Red bell peppers", amount: 2, unit: "large", notes: "Thinly sliced" },
      { name: "Crushed plum tomatoes", amount: 1.5, unit: "cups" },
      { name: "Garlic cloves", amount: 3, unit: "cloves", notes: "Minced" },
      { name: "Ground caraway and cumin", amount: 1, unit: "tsp", notes: "Caraway is key to Algerian variation" },
      { name: "Smoked paprika", amount: 1, unit: "tsp" },
      { name: "Extra virgin olive oil", amount: 3, unit: "tbsp" },
      { name: "Fresh cilantro or parsley", amount: 2, unit: "tbsp", notes: "Garnish" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Heat olive oil in a wide skillet. Saut\xE9 peppers and onions over medium heat until soft and sweet (8 mins).", timerMinutes: 8 },
      { stepNumber: 2, instruction: "Add garlic, caraway, cumin, and paprika; cook for 1 minute until fragrant." },
      { stepNumber: 3, instruction: "Stir in crushed tomatoes. Simmer sauce until thickened and glossy (10 mins). Season with salt and black pepper.", timerMinutes: 10 },
      { stepNumber: 4, instruction: "Make 4 shallow wells in the sauce. Crack an egg into each well." },
      { stepNumber: 5, instruction: "Cover skillet and simmer on low heat for 5-7 minutes until whites are just set and yolks remain delightfully runny.", timerMinutes: 6 }
    ],
    substitutions: [
      { ingredient: "Caraway seeds", substitute: "Ground cumin and fennel seed mix" },
      { ingredient: "Eggs", substitute: "Cubes of soft silken tofu for a vegan version" }
    ],
    cookingTips: ["Keep heat low when eggs go in so the whites poach gently without becoming rubbery."],
    servingSuggestions: "Serve directly from the sizzling skillet with thick warm flatbread.",
    storageInstructions: "Sauce can be made 3 days ahead; add fresh eggs when reheating.",
    searchTags: ["algeria", "shakshuka", "eggs", "peppers", "breakfast"]
  },
  // ==================== ASIA (10 RECIPES) ====================
  {
    recipeId: "th-pad-thai",
    title: "Thai Pad Thai",
    alternateName: "Pad Thai Goong",
    country: "Thailand",
    countryCode: "TH",
    continent: "Asia",
    region: "Southeast Asia",
    cuisine: "Thai",
    description: "Iconic street stir-fried rice noodles tossed in tangy tamarind sauce, tofu, prawns, eggs, crushed peanuts, and fresh bean sprouts.",
    culturalBackground: "Promoted in the late 1930s by Prime Minister Plaek Phibunsongkhram to cultivate national identity and modernize Thailand, Pad Thai quickly captured hearts around the globe.",
    mealType: "Dinner",
    categories: ["Noodles", "Stir Fry", "Street Food"],
    dietaryTags: ["Dairy-Free", "Gluten-Free"],
    allergens: ["Peanuts", "Eggs", "Shellfish", "Soy"],
    prepTime: 20,
    cookTime: 10,
    totalTime: 30,
    servings: 2,
    difficulty: "Medium",
    spiceLevel: 2,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Wok or wide skillet", "Tongs"],
    ingredients: [
      { name: "Flat dried rice noodles (banh pho)", amount: 200, unit: "g", notes: "Soaked in warm water for 30 mins" },
      { name: "Tiger shrimp or prawns", amount: 8, unit: "pieces", notes: "Peeled & deveined" },
      { name: "Firm yellow or extra-firm tofu", amount: 100, unit: "g", notes: "Cut into small batons" },
      { name: "Eggs", amount: 2, unit: "large" },
      { name: "Tamarind paste concentrate", amount: 3, unit: "tbsp" },
      { name: "Fish sauce", amount: 2, unit: "tbsp" },
      { name: "Palm sugar or brown sugar", amount: 2.5, unit: "tbsp" },
      { name: "Fresh bean sprouts", amount: 1.5, unit: "cups" },
      { name: "Garlic chives", amount: 0.5, unit: "cup", notes: "Cut into 2-inch pieces" },
      { name: "Roasted peanuts", amount: 0.25, unit: "cup", notes: "Crushed" },
      { name: "Lime wedges", amount: 2, unit: "pieces" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Whisk tamarind paste, fish sauce, palm sugar, and 1 tbsp water in a bowl until sugar dissolves into Pad Thai sauce." },
      { stepNumber: 2, instruction: "Heat 2 tbsp oil in a smoking-hot wok. Sear shrimp for 1 min per side and set aside." },
      { stepNumber: 3, instruction: "Add tofu cubes and fry until golden. Add drained soaked noodles and half the tamarind sauce. Toss vigorously." },
      { stepNumber: 4, instruction: "Push noodles to one side of the wok. Crack eggs into the empty side, scramble gently, then fold into the noodles.", timerMinutes: 2 },
      { stepNumber: 5, instruction: "Return shrimp, add bean sprouts, garlic chives, and remaining sauce. Toss over high heat for 60 seconds.", timerMinutes: 1 }
    ],
    substitutions: [
      { ingredient: "Fish sauce", substitute: "Soy sauce + pinch of salt for vegetarian" },
      { ingredient: "Palm sugar", substitute: "Light brown sugar or coconut sugar" }
    ],
    cookingTips: ["Soak rice noodles in room-temperature or warm water; never boil them beforehand or they turn mushy."],
    servingSuggestions: "Serve with lime wedges, crushed roasted peanuts, and extra chili powder on the side.",
    storageInstructions: "Best served immediately; noodles absorb sauce over time.",
    searchTags: ["thailand", "pad thai", "noodles", "stir fry", "street food"]
  },
  {
    recipeId: "jp-tokyo-ramen",
    title: "Japanese Tokyo Shoyu Ramen",
    alternateName: "\u91A4\u6CB9\u30E9\u30FC\u30E1\u30F3",
    country: "Japan",
    countryCode: "JP",
    continent: "Asia",
    region: "East Asia",
    cuisine: "Japanese",
    description: "Springy ramen noodles swimming in a crystal-clear soy-dashi broth topped with tender chashu pork, seasoned soft-boiled ramen egg (ajitsuke tamago), menma, and nori.",
    culturalBackground: "Tokyo-style Shoyu Ramen originated in the Asakusa district in 1910 at Rairaiken. It balances Chinese alkaline noodles with traditional Japanese umami-rich kombu dashi broth.",
    mealType: "Dinner",
    categories: ["Noodles", "Soups", "Comfort Food"],
    dietaryTags: ["Dairy-Free"],
    allergens: ["Soy", "Gluten", "Eggs"],
    prepTime: 30,
    cookTime: 45,
    totalTime: 75,
    servings: 2,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Ramen noodle strainer or colander", "Soup pots", "Deep bowls"],
    ingredients: [
      { name: "Fresh ramen noodles", amount: 2, unit: "portions" },
      { name: "Rich chicken broth", amount: 4, unit: "cups" },
      { name: "Dashi broth (kombu & katsuobushi)", amount: 1, unit: "cup" },
      { name: "Soy sauce (shoyu)", amount: 4, unit: "tbsp" },
      { name: "Mirin", amount: 2, unit: "tbsp" },
      { name: "Sesame oil", amount: 1, unit: "tsp" },
      { name: "Ramen eggs (Ajitsuke tamago)", amount: 2, unit: "eggs", notes: "Soft-boiled 6.5 mins and soy-marinated" },
      { name: "Chashu pork belly slices", amount: 4, unit: "slices" },
      { name: "Nori seaweed sheets", amount: 2, unit: "squares" },
      { name: "Scallions", amount: 0.5, unit: "cup", notes: "Finely sliced" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Prepare the tare (seasoning base): simmer soy sauce, mirin, sake, and crushed garlic for 5 minutes." },
      { stepNumber: 2, instruction: "Combine chicken broth and dashi stock in a pot. Heat until steaming hot but not rolling boil." },
      { stepNumber: 3, instruction: "Boil ramen noodles in a separate pot of rapidly boiling water for 90 seconds. Shake water off thoroughly." },
      { stepNumber: 4, instruction: "In warmed ramen bowls, add 2 tbsp of shoyu tare and 1 tsp sesame oil. Ladle hot broth and stir." },
      { stepNumber: 5, instruction: "Fold in noodles. Arrange chashu slices, halved soft ramen egg, nori square, and scallions on top." }
    ],
    substitutions: [
      { ingredient: "Mirin", substitute: "1 tbsp white wine + 1/2 tsp sugar" },
      { ingredient: "Chashu pork", substitute: "Pan-seared chicken breast or grilled king oyster mushrooms" }
    ],
    cookingTips: ["Always warm your ramen bowls with hot water before assembling so the broth remains piping hot."],
    servingSuggestions: "Slurp vigorously while hot to aerate the broth and enhance aromatic depth.",
    storageInstructions: "Store broth and noodles separately.",
    searchTags: ["japan", "ramen", "noodles", "tokyo", "shoyu"]
  },
  {
    recipeId: "in-butter-chicken",
    title: "Indian Murgh Makhani (Butter Chicken)",
    alternateName: "Butter Chicken",
    country: "India",
    countryCode: "IN",
    continent: "Asia",
    region: "South Asia",
    cuisine: "Indian",
    description: "Char-grilled spiced tandoori chicken simmered in a velvety, rich tomato, butter, and cream sauce perfumed with fenugreek leaves (kasuri methi).",
    culturalBackground: "Invented in 1950s Delhi at the famed Moti Mahal restaurant by Kundan Lal Gujral, butter chicken was created to repurpose dried tandoori chicken using leftover rich tomato and butter gravies.",
    mealType: "Dinner",
    categories: ["Curry", "Poultry", "Restaurant Classics"],
    dietaryTags: ["Gluten-Free", "Halal"],
    allergens: ["Dairy", "Tree Nuts"],
    prepTime: 25,
    cookTime: 35,
    totalTime: 60,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 2,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Heavy skillet", "Blender", "Grill pan or broiler"],
    ingredients: [
      { name: "Boneless chicken thighs", amount: 700, unit: "g", notes: "Cut into bite-sized pieces" },
      { name: "Greek yogurt", amount: 0.5, unit: "cup", notes: "For marinade" },
      { name: "Ginger-garlic paste", amount: 2, unit: "tbsp" },
      { name: "Garam masala", amount: 1.5, unit: "tbsp" },
      { name: "Kashmiri chili powder", amount: 2, unit: "tsp", notes: "Provides rich red color with mild heat" },
      { name: "Butter", amount: 3, unit: "tbsp" },
      { name: "Canned crushed tomatoes", amount: 2, unit: "cups" },
      { name: "Heavy cream", amount: 0.5, unit: "cup" },
      { name: "Cashew nuts", amount: 12, unit: "pieces", notes: "Soaked and blended with tomatoes" },
      { name: "Kasuri Methi (dried fenugreek leaves)", amount: 1, unit: "tbsp", notes: "Crushed between palms" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Marinate chicken in yogurt, ginger-garlic paste, 1 tbsp garam masala, Kashmiri chili, and salt for at least 30 mins." },
      { stepNumber: 2, instruction: "Broil or sear chicken on high heat until charred at edges (about 8 minutes). Set aside.", timerMinutes: 8 },
      { stepNumber: 3, instruction: "In a saucepan, melt 1 tbsp butter. Simmer tomatoes, soaked cashews, and spices until soft, then blend into a silk-like puree.", timerMinutes: 10 },
      { stepNumber: 4, instruction: "Return puree to pan, add charred chicken pieces, remaining butter, and heavy cream. Simmer gently.", timerMinutes: 10 },
      { stepNumber: 5, instruction: "Finish by rubbing Kasuri Methi between your palms directly into the sauce. Stir gently." }
    ],
    substitutions: [
      { ingredient: "Heavy cream", substitute: "Coconut cream for a dairy-light twist" },
      { ingredient: "Kasuri Methi", substitute: "Pinch of ground celery seed + maple syrup touch" }
    ],
    cookingTips: ["Kashmiri chili gives the signature crimson restaurant color without overwhelming spicy burn."],
    servingSuggestions: "Serve with garlic butter naan and fragrant basmati rice.",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["india", "butter chicken", "curry", "delhi", "makhani"]
  },
  {
    recipeId: "cn-kung-pao-chicken",
    title: "Sichuan Kung Pao Chicken",
    alternateName: "Gong Bao Ji Ding (\u5BAB\u4FDD\u9E21\u4E01)",
    country: "China",
    countryCode: "CN",
    continent: "Asia",
    region: "East Asia",
    cuisine: "Chinese (Sichuan)",
    description: "Crisp chicken cubes wok-tossed with fragrant Sichuan peppercorns, dried red chilies, scallions, and golden crunchy peanuts in a tangy savory sauce.",
    culturalBackground: "Named after Ding Baozhen (1820\u20131886), a Qing dynasty official and governor of Sichuan who held the title of Gongbao (Palace Guardian).",
    mealType: "Dinner",
    categories: ["Stir Fry", "Poultry", "Spicy"],
    dietaryTags: ["Dairy-Free"],
    allergens: ["Peanuts", "Soy", "Gluten"],
    prepTime: 20,
    cookTime: 10,
    totalTime: 30,
    servings: 3,
    difficulty: "Medium",
    spiceLevel: 3,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Carbon steel wok", "Wok spatula"],
    ingredients: [
      { name: "Boneless chicken thighs", amount: 500, unit: "g", notes: "Cut into 1.5cm cubes" },
      { name: "Roasted unsalted peanuts", amount: 0.5, unit: "cup" },
      { name: "Dried red chilies (Tianjin or Arbol)", amount: 12, unit: "whole", notes: "Snipped and deseeded" },
      { name: "Sichuan peppercorns", amount: 1, unit: "tsp", notes: "Lightly crushed" },
      { name: "Scallions (white and light green parts)", amount: 4, unit: "stalks", notes: "Cut into 1cm rounds" },
      { name: "Soy sauce (light and dark)", amount: 2, unit: "tbsp" },
      { name: "Chinkiang black vinegar", amount: 1.5, unit: "tbsp" },
      { name: "Shaoxing rice wine", amount: 1, unit: "tbsp" },
      { name: "Cornstarch", amount: 1.5, unit: "tbsp" },
      { name: "Sugar", amount: 1, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Marinate diced chicken with 1 tbsp soy sauce, Shaoxing wine, cornstarch, and 1 tsp oil for 15 mins." },
      { stepNumber: 2, instruction: "Mix the Kung Pao sauce: black vinegar, soy sauce, sugar, cornstarch, and 2 tbsp water in a bowl." },
      { stepNumber: 3, instruction: "Heat oil in wok over medium-low heat. Add dried chilies and Sichuan peppercorns until fragrant and darkened.", timerMinutes: 2 },
      { stepNumber: 4, instruction: "Turn heat to maximum. Add marinated chicken and stir-fry briskly until chicken pieces separate and turn white.", timerMinutes: 4 },
      { stepNumber: 5, instruction: "Add scallions, pour in the sauce, and toss constantly until sauce glazes the chicken. Toss in peanuts and serve.", timerMinutes: 1 }
    ],
    substitutions: [
      { ingredient: "Chinkiang black vinegar", substitute: "Balsamic vinegar mixed with rice vinegar" },
      { ingredient: "Shaoxing wine", substitute: "Dry sherry" }
    ],
    cookingTips: ["Do not burn the dried chilies in step 3; gentle heat awakens the fragrant essential oils."],
    servingSuggestions: "Serve steaming hot with fluffy white jasmine rice.",
    storageInstructions: "Best enjoyed fresh to keep peanuts crisp.",
    searchTags: ["china", "kung pao", "sichuan", "spicy", "peanuts"]
  },
  {
    recipeId: "vn-pho-bo",
    title: "Vietnamese Beef Pho",
    alternateName: "Ph\u1EDF B\xF2",
    country: "Vietnam",
    countryCode: "VN",
    continent: "Asia",
    region: "Southeast Asia",
    cuisine: "Vietnamese",
    description: "Aromatic star-anise and cinnamon beef broth poured over tender flat rice noodles and thinly sliced raw beef sirloin that gently cooks in the steaming soup.",
    culturalBackground: "Born in northern Vietnam (Nam \u0110\u1ECBnh / Hanoi) around the turn of the 20th century, Pho represents a synthesis of French pot-au-feu boiling traditions with Chinese spices and Vietnamese rice noodles.",
    mealType: "Lunch",
    categories: ["Soups", "Noodles", "Beef"],
    dietaryTags: ["Dairy-Free", "Gluten-Free"],
    allergens: ["Fish"],
    prepTime: 20,
    cookTime: 60,
    totalTime: 80,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large stockpot", "Skillet for charring aromatics", "Fine mesh strainer"],
    ingredients: [
      { name: "Beef soup bones and marrow", amount: 1.2, unit: "kg" },
      { name: "Beef sirloin or eye of round", amount: 300, unit: "g", notes: "Thinly sliced against grain" },
      { name: "Flat rice pho noodles", amount: 400, unit: "g" },
      { name: "Yellow onion & fresh ginger", amount: 1, unit: "each", notes: "Charred over open flame" },
      { name: "Spices: 3 star anise, 1 cinnamon stick, 3 cloves, 1 tbsp coriander seeds", amount: 1, unit: "packet", notes: "Toasted" },
      { name: "Fish sauce", amount: 3, unit: "tbsp" },
      { name: "Rock sugar", amount: 1, unit: "tbsp" },
      { name: "Garnish: Thai basil, bean sprouts, cilantro, lime wedges, sliced jalapeno", amount: 1, unit: "platter" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Char halved onion and ginger in a dry skillet until blackened spots appear. Toast spices in dry pan for 2 mins." },
      { stepNumber: 2, instruction: "Blanch beef bones in boiling water for 5 mins, drain and rinse clean to ensure crystal clear broth." },
      { stepNumber: 3, instruction: "Simmer bones, charred aromatics, toasted spices in spice bag, rock sugar, and salt in 3 liters water for 45+ mins.", timerMinutes: 45 },
      { stepNumber: 4, instruction: "Strain broth through fine mesh. Stir in fish sauce and keep at a rolling simmer." },
      { stepNumber: 5, instruction: "Assemble: Place cooked rice noodles in bowls, top with raw thinly sliced beef, and ladle boiling broth over to cook beef instantly." }
    ],
    substitutions: [
      { ingredient: "Rock sugar", substitute: "Regular granulated sugar or brown sugar" },
      { ingredient: "Beef bones", substitute: "Quality store-bought unsalted beef broth + beef shank" }
    ],
    cookingTips: ["Freezing the beef sirloin for 20 minutes makes it effortless to slice paper-thin."],
    servingSuggestions: "Serve with fresh herb platter, Sriracha, and Hoisin sauce.",
    storageInstructions: "Keep broth chilled up to 5 days; reheat to boiling before pouring over fresh noodles.",
    searchTags: ["vietnam", "pho", "beef", "noodles", "hanoi"]
  },
  {
    recipeId: "id-nasi-goreng",
    title: "Indonesian Nasi Goreng",
    alternateName: "Indonesian Sweet Soy Fried Rice",
    country: "Indonesia",
    countryCode: "ID",
    continent: "Asia",
    region: "Southeast Asia",
    cuisine: "Indonesian",
    description: "Smoky wok-fried jasmine rice glazed in sweet kecap manis, chili bumbu paste, and shrimp paste, crowned with a crispy fried egg.",
    culturalBackground: "Voted one of the world\u2019s most delicious foods in global surveys, Nasi Goreng developed as a clever way in warm tropical climates to turn leftover cold rice into an aromatic breakfast or street meal.",
    mealType: "Dinner",
    categories: ["Rice", "Stir Fry", "Street Food"],
    dietaryTags: ["Dairy-Free"],
    allergens: ["Eggs", "Shellfish", "Soy"],
    prepTime: 15,
    cookTime: 12,
    totalTime: 27,
    servings: 2,
    difficulty: "Easy",
    spiceLevel: 2,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Wok", "Spatula"],
    ingredients: [
      { name: "Cold day-old cooked jasmine rice", amount: 3, unit: "cups", notes: "Grains separated" },
      { name: "Kecap Manis (Indonesian sweet soy sauce)", amount: 2.5, unit: "tbsp" },
      { name: "Shallots", amount: 3, unit: "pieces", notes: "Finely minced" },
      { name: "Garlic cloves", amount: 2, unit: "cloves", notes: "Minced" },
      { name: "Red bird\u2019s eye chilies", amount: 2, unit: "pieces", notes: "Sliced" },
      { name: "Shrimp paste (terasi) or fish sauce", amount: 0.5, unit: "tsp" },
      { name: "Chicken or peeled shrimp", amount: 150, unit: "g", notes: "Diced" },
      { name: "Eggs", amount: 2, unit: "whole", notes: "Sunny-side up" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Pound shallots, garlic, chilies, and shrimp paste in a mortar or blend into a coarse bumbu paste." },
      { stepNumber: 2, instruction: "Heat 2 tbsp oil in a hot wok. Fry the spice paste for 2 minutes until intensely fragrant.", timerMinutes: 2 },
      { stepNumber: 3, instruction: "Add diced chicken or shrimp and toss until cooked through." },
      { stepNumber: 4, instruction: "Add cold rice and pour Kecap Manis around the rim of the wok so it caramelizes slightly. Toss continuously over high heat.", timerMinutes: 4 },
      { stepNumber: 5, instruction: "Fry eggs sunny side up in a separate skillet with crisp edges. Top each bowl with an egg, sliced cucumber, and crispy shallots." }
    ],
    substitutions: [
      { ingredient: "Kecap Manis", substitute: "Equal parts dark soy sauce and brown sugar boiled 2 minutes" },
      { ingredient: "Shrimp paste", substitute: "1 tsp fish sauce or omit for vegan" }
    ],
    cookingTips: ["Always use cold, dried-out day-old rice; freshly steamed rice turns mushy."],
    servingSuggestions: "Serve with kerupuk (prawn crackers), cucumber slices, and pickled acar vegetables.",
    storageInstructions: "Refrigerate up to 3 days.",
    searchTags: ["indonesia", "nasi goreng", "fried rice", "bali", "kecap manis"]
  },
  {
    recipeId: "kr-bibimbap",
    title: "Korean Bibimbap",
    alternateName: "\uBE44\uBE54\uBC25 Mixed Rice Bowl",
    country: "South Korea",
    countryCode: "KR",
    continent: "Asia",
    region: "East Asia",
    cuisine: "Korean",
    description: "Warm short-grain rice layered with seasoned namul vegetables, marinated beef bulgogi, a sunny-side egg, and savory sweet gochujang sauce.",
    culturalBackground: 'Bibimbap literally means "mixed rice". Historically eaten on the eve of Lunar New Year to clear out old side dishes (banchan), it balances the five cardinal colors and elements of traditional Korean philosophy.',
    mealType: "Dinner",
    categories: ["Grain Bowls", "Beef", "Healthy"],
    dietaryTags: ["Dairy-Free"],
    allergens: ["Soy", "Sesame", "Eggs", "Gluten"],
    prepTime: 25,
    cookTime: 15,
    totalTime: 40,
    servings: 2,
    difficulty: "Easy",
    spiceLevel: 2,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Skillet or Dolsot stone bowl", "Small bowls"],
    ingredients: [
      { name: "Cooked Korean short-grain rice", amount: 2, unit: "bowls" },
      { name: "Ground beef or thinly sliced ribeye", amount: 200, unit: "g" },
      { name: "Baby spinach", amount: 1, unit: "bunch", notes: "Blanched and seasoned with sesame oil" },
      { name: "Carrots", amount: 1, unit: "medium", notes: "Julienned and saut\xE9ed" },
      { name: "Zucchini", amount: 0.5, unit: "medium", notes: "Half moons, saut\xE9ed" },
      { name: "Shiitake mushrooms", amount: 4, unit: "caps", notes: "Sliced and cooked" },
      { name: "Eggs", amount: 2, unit: "large" },
      { name: "Gochujang (Korean chili paste)", amount: 2, unit: "tbsp" },
      { name: "Toasted sesame oil & seeds", amount: 2, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Saut\xE9 marinated beef in a hot pan with soy sauce, garlic, and sesame oil until browned (4 mins)." },
      { stepNumber: 2, instruction: "Saut\xE9 carrots, zucchini, and shiitake mushrooms separately with a pinch of salt to maintain distinct vibrant colors." },
      { stepNumber: 3, instruction: "Blanch spinach in boiling water for 30 seconds, squeeze dry, and toss with sesame oil and garlic." },
      { stepNumber: 4, instruction: "Make the sauce: mix gochujang, sesame oil, sugar, vinegar, and 1 tbsp water." },
      { stepNumber: 5, instruction: "Spoon warm rice into bowls, arrange vegetable mounds and beef in a colorful wheel, top with fried egg and sauce." }
    ],
    substitutions: [
      { ingredient: "Gochujang", substitute: "Sriracha mixed with 1 tsp miso paste and honey" },
      { ingredient: "Beef", substitute: "Crispy pan-fried tofu" }
    ],
    cookingTips: ["Cook each vegetable separately so each retained its unique texture and natural color."],
    servingSuggestions: "Mix everything vigorously together with your spoon right before eating.",
    storageInstructions: "Prepared vegetables keep 4 days in fridge.",
    searchTags: ["korea", "bibimbap", "rice bowl", "gochujang", "healthy"]
  },
  {
    recipeId: "ph-chicken-adobo",
    title: "Filipino Chicken Adobo",
    alternateName: "Adobong Manok",
    country: "Philippines",
    countryCode: "PH",
    continent: "Asia",
    region: "Southeast Asia",
    cuisine: "Filipino",
    description: "Succulent chicken braised in a savory tangy reduction of cane vinegar, soy sauce, crushed garlic, whole black peppercorns, and bay leaves.",
    culturalBackground: "The undisputed national comfort dish of the Philippines, Adobo originated as an indigenous preservation technique where meats were immersed in acidic vinegar and salt to thrive in tropical heat.",
    mealType: "Dinner",
    categories: ["Poultry", "Stews", "One-Pot"],
    dietaryTags: ["Dairy-Free", "Gluten-Free Optional"],
    allergens: ["Soy"],
    prepTime: 15,
    cookTime: 35,
    totalTime: 50,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Dutch oven or deep skillet"],
    ingredients: [
      { name: "Bone-in chicken thighs & drumsticks", amount: 1, unit: "kg" },
      { name: "Garlic head", amount: 1, unit: "whole head", notes: "Cloves peeled and crushed" },
      { name: "Filipino cane vinegar or white vinegar", amount: 0.5, unit: "cup" },
      { name: "Soy sauce", amount: 0.5, unit: "cup" },
      { name: "Whole black peppercorns", amount: 1, unit: "tbsp", notes: "Cracked" },
      { name: "Dried bay leaves", amount: 4, unit: "pieces" },
      { name: "Brown sugar", amount: 1, unit: "tsp", notes: "Balances acidity" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Marinate chicken in soy sauce, half the garlic, bay leaves, and cracked black pepper for 20 minutes." },
      { stepNumber: 2, instruction: "Heat 1 tbsp oil in skillet, sear chicken pieces until golden brown, then pour in marinade and remaining garlic." },
      { stepNumber: 3, instruction: "Pour in the vinegar and bring to a simmer. IMPORTANT: do not stir the vinegar for the first 5 minutes to allow harsh raw acid to cook off.", timerMinutes: 5 },
      { stepNumber: 4, instruction: "Cover and simmer over low heat for 25 minutes until chicken is fork tender.", timerMinutes: 25 },
      { stepNumber: 5, instruction: "Uncover and increase heat to reduce sauce until thick, sticky, and clinging to the chicken.", timerMinutes: 5 }
    ],
    substitutions: [
      { ingredient: "Cane vinegar", substitute: "Apple cider vinegar or distilled white vinegar" },
      { ingredient: "Soy sauce", substitute: "Tamari for 100% gluten-free adobo" }
    ],
    cookingTips: ["Never stir the vinegar immediately after adding; letting it bubble undisturbed mellows the flavor into rich savory depth."],
    servingSuggestions: "Ladle generously over steaming mounds of white garlic fried rice (sinangag).",
    storageInstructions: "Adobo famously tastes even richer on the 2nd and 3rd day.",
    searchTags: ["philippines", "adobo", "chicken", "vinegar", "garlic"]
  },
  {
    recipeId: "my-laksa",
    title: "Malaysian Curry Laksa",
    alternateName: "Laksa Lemak",
    country: "Malaysia",
    countryCode: "MY",
    continent: "Asia",
    region: "Southeast Asia",
    cuisine: "Malaysian (Peranakan)",
    description: "Fragrant creamy coconut curry noodle soup loaded with lemongrass, turmeric, galangal, tofu puffs, shrimp, and fresh laksa leaves.",
    culturalBackground: "Curry Laksa is the culinary jewel of Baba-Nyonya (Peranakan) culture, which flourished as Chinese traders married local Malay women in historical Malacca and Penang.",
    mealType: "Dinner",
    categories: ["Soups", "Noodles", "Spicy"],
    dietaryTags: ["Dairy-Free", "Halal"],
    allergens: ["Shellfish", "Fish", "Soy"],
    prepTime: 25,
    cookTime: 25,
    totalTime: 50,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 3,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Deep soup pot", "Blender"],
    ingredients: [
      { name: "Yellow egg noodles and rice vermicelli", amount: 300, unit: "g", notes: "Blanched" },
      { name: "Rich coconut milk", amount: 2, unit: "cups" },
      { name: "Chicken stock", amount: 3, unit: "cups" },
      { name: "Peeled prawns", amount: 12, unit: "pieces" },
      { name: "Fried tofu puffs (tau pok)", amount: 8, unit: "pieces", notes: "Halved to soak broth" },
      { name: "Spice paste: lemongrass, galangal, turmeric, shallots, garlic, candlenuts, dried shrimp", amount: 1, unit: "cup" },
      { name: "Bean sprouts & hard-boiled eggs", amount: 1, unit: "cup" },
      { name: "Sambal chili paste", amount: 2, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Saut\xE9 the blended laksa spice paste in oil for 10 minutes until oil separates and aroma fills the kitchen.", timerMinutes: 10 },
      { stepNumber: 2, instruction: "Pour in chicken stock, bring to a boil, then stir in rich coconut milk and fried tofu puffs.", timerMinutes: 10 },
      { stepNumber: 3, instruction: "Add prawns and simmer gently for 3 minutes until prawns turn pink.", timerMinutes: 3 },
      { stepNumber: 4, instruction: "Divide blanched noodles and bean sprouts among deep bowls, ladle bubbling coconut curry broth over, and top with prawns, egg halves, and sambal." }
    ],
    substitutions: [
      { ingredient: "Galangal", substitute: "Fresh ginger + squeeze of lime" },
      { ingredient: "Tofu puffs", substitute: "Cubed firm tofu fried until crisp" }
    ],
    cookingTips: ["Tofu puffs act like sponges, absorbing the rich coconut soup with every bite."],
    servingSuggestions: "Garnish with fresh Vietnamese mint (daun kesum) and calamansi lime.",
    storageInstructions: "Refrigerate soup base up to 3 days; assemble with fresh noodles.",
    searchTags: ["malaysia", "laksa", "curry", "noodles", "coconut"]
  },
  {
    recipeId: "lb-tabbouleh-hummus",
    title: "Lebanese Tabbouleh & Creamy Hummus",
    alternateName: "\u062A\u0628\u0648\u0644\u0629 \u0648\u062D\u0645\u0635 \u0628\u0637\u062D\u064A\u0646\u0629",
    country: "Lebanon",
    countryCode: "LB",
    continent: "Asia",
    region: "Middle East",
    cuisine: "Lebanese",
    description: "Refreshing parsley-forward salad tossed with bulgur, tomatoes, and lemon, paired with silky whipped tahini hummus and warm pita.",
    culturalBackground: "The crown of the Lebanese mezze table. Authentic Lebanese tabbouleh is overwhelmingly an herb salad celebrated for crisp flat-leaf parsley rather than a heavy grain dish.",
    mealType: "Lunch",
    categories: ["Salads", "Mezze", "Vegan"],
    dietaryTags: ["Vegan", "Vegetarian", "Dairy-Free", "Halal"],
    allergens: ["Sesame", "Gluten"],
    prepTime: 20,
    cookTime: 0,
    totalTime: 20,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Sharp chef knife (essential for parsley)", "Food processor for hummus"],
    ingredients: [
      { name: "Flat-leaf Italian parsley", amount: 3, unit: "large bunches", notes: "Washed, thoroughly dried, finely chopped" },
      { name: "Fine bulgur wheat (#1 grind)", amount: 3, unit: "tbsp", notes: "Soaked in lemon juice" },
      { name: "Firm ripe tomatoes", amount: 3, unit: "medium", notes: "Finely diced" },
      { name: "Fresh mint", amount: 0.5, unit: "cup", notes: "Finely chopped" },
      { name: "Fresh lemon juice", amount: 0.3, unit: "cup" },
      { name: "Extra virgin olive oil", amount: 0.3, unit: "cup" },
      { name: "Cooked chickpeas", amount: 1.5, unit: "cups", notes: "For hummus" },
      { name: "Quality tahini paste", amount: 0.5, unit: "cup" },
      { name: "Garlic and ice cubes", amount: 2, unit: "cloves", notes: "Ice makes hummus fluffy" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Ensure parsley is bone-dry before chopping with a razor-sharp knife in single gentle strokes to avoid bruising." },
      { stepNumber: 2, instruction: "Soak bulgur in lemon juice for 15 minutes so it softens without needing cooking." },
      { stepNumber: 3, instruction: "Toss chopped parsley, mint, diced tomatoes, soaked bulgur, olive oil, salt, and sumac in a wooden bowl." },
      { stepNumber: 4, instruction: "Make Hummus: Blitz chickpeas, tahini, garlic, lemon juice, salt, and 3 ice cubes in a food processor for 4 minutes until ultra-creamy." },
      { stepNumber: 5, instruction: "Swirl hummus onto a plate with a pool of olive oil and serve with the vibrant tabbouleh." }
    ],
    substitutions: [
      { ingredient: "Fine bulgur", substitute: "Quinoa or hemp seeds for gluten-free" },
      { ingredient: "Tahini", substitute: "Cashew butter or sunflower seed butter" }
    ],
    cookingTips: ["Washing and completely drying the parsley before chopping is the #1 secret to non-soggy tabbouleh."],
    servingSuggestions: "Scoop with crisp romaine lettuce leaves or warm Lebanese flatbread.",
    storageInstructions: "Hummus keeps 5 days; eat tabbouleh within 24 hours for peak crispness.",
    searchTags: ["lebanon", "tabbouleh", "hummus", "mezze", "vegan"]
  },
  // ==================== EUROPE (8 RECIPES) ====================
  {
    recipeId: "it-carbonara",
    title: "Authentic Roman Spaghetti Carbonara",
    alternateName: "Spaghetti alla Carbonara",
    country: "Italy",
    countryCode: "IT",
    continent: "Europe",
    region: "Southern Europe",
    cuisine: "Italian (Roman)",
    description: "The pure Roman classic made strictly with crisp guanciale, pecorino romano cheese, fresh egg yolks, pasta water, and freshly cracked black pepper. No cream, ever.",
    culturalBackground: "Created in Rome in the mid-20th century, Carbonara is one of the four legendary Roman pasta dishes (alongside Cacio e Pepe, Gricia, and Amatriciana). It embodies the magic of Italian culinary minimalism.",
    mealType: "Dinner",
    categories: ["Pasta", "Quick Meals", "Italian Classics"],
    dietaryTags: [],
    allergens: ["Eggs", "Dairy", "Gluten"],
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 2,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large pasta pot", "Skillet", "Tongs", "Mixing bowl"],
    ingredients: [
      { name: "Spaghetti or Rigatoni", amount: 200, unit: "g" },
      { name: "Guanciale (cured pork jowl)", amount: 100, unit: "g", notes: "Cut into 1cm lardons" },
      { name: "Fresh egg yolks", amount: 3, unit: "yolks", notes: "+ 1 whole egg" },
      { name: "Pecorino Romano cheese", amount: 50, unit: "g", notes: "Finely grated" },
      { name: "Parmigiano Reggiano", amount: 20, unit: "g", notes: "Finely grated" },
      { name: "Freshly cracked coarse black pepper", amount: 1, unit: "tbsp" },
      { name: "Coarse sea salt", amount: 1, unit: "tbsp", notes: "For pasta water" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "In a bowl, whisk egg yolks, whole egg, grated pecorino, and Parmigiano into a thick golden cheese cream." },
      { stepNumber: 2, instruction: "Add guanciale to a cold skillet over medium-low heat. Render fat slowly until lardons are crispy on the outside and chewy inside (8 mins). Remove from heat.", timerMinutes: 8 },
      { stepNumber: 3, instruction: "Boil spaghetti in salted water until 2 minutes shy of al dente. Reserve 1 cup of starchy pasta water." },
      { stepNumber: 4, instruction: "Transfer hot pasta directly into the pan with rendered guanciale fat, tossing over low heat for 1 minute." },
      { stepNumber: 5, instruction: "REMOVE PAN COMPLETELY FROM HEAT. Let cool for 30 seconds, then pour in egg-cheese mixture, tossing rapidly with splashes of hot pasta water to create a glossy, creamy emulsified sauce without scrambling the eggs." }
    ],
    substitutions: [
      { ingredient: "Guanciale", substitute: "Pancetta or thick-cut smoked bacon" },
      { ingredient: "Pecorino Romano", substitute: "Parmigiano Reggiano or Grana Padano" }
    ],
    cookingTips: ["Never add eggs over direct flame; residual pan heat and starchy water are all that\u2019s needed to cook the sauce into silk."],
    servingSuggestions: "Serve immediately in warmed shallow bowls topped with crispy guanciale and generous black pepper.",
    storageInstructions: "Carbonara must be eaten fresh immediately; reheating scrambles the delicate egg emulsion.",
    searchTags: ["italy", "carbonara", "pasta", "rome", "guanciale"]
  },
  {
    recipeId: "es-paella-valenciana",
    title: "Spanish Paella Valenciana",
    alternateName: "Traditional Valencian Paella",
    country: "Spain",
    countryCode: "ES",
    continent: "Europe",
    region: "Southern Europe",
    cuisine: "Spanish (Valencian)",
    description: "The authentic original paella from Valencia: Bomba rice infused with saffron, rosemary, chicken, rabbit (or chicken thighs), flat green beans, and a crunchy caramelized bottom crust (socarrat).",
    culturalBackground: "Born in the rice fields surrounding Lake Albufera near Valencia in the 18th century, paella was cooked by farmers over outdoor orange-wood fires during midday field breaks.",
    mealType: "Dinner",
    categories: ["Rice", "One-Pan", "Spanish Classics"],
    dietaryTags: ["Gluten-Free", "Dairy-Free"],
    allergens: [],
    prepTime: 20,
    cookTime: 40,
    totalTime: 60,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Wide Paella pan (13-15 inch) or wide shallow skillet"],
    ingredients: [
      { name: "Bomba or Calasparra rice", amount: 300, unit: "g", notes: "Never stir once simmering" },
      { name: "Chicken thighs & rabbit (or chicken only)", amount: 600, unit: "g", notes: "Cut into bite-sized pieces" },
      { name: "Flat green beans (Ferraidura)", amount: 150, unit: "g", notes: "Cut into 2-inch pieces" },
      { name: "Garrof\xF3n (large white lima beans)", amount: 100, unit: "g" },
      { name: "Grated fresh tomato", amount: 1, unit: "cup" },
      { name: "Saffron threads", amount: 0.5, unit: "g", notes: "Toasted and crushed" },
      { name: "Sweet Spanish smoked paprika (Piment\xF3n)", amount: 1, unit: "tsp" },
      { name: "Fresh rosemary sprig", amount: 1, unit: "sprig" },
      { name: "Rich chicken broth or water", amount: 3.5, unit: "cups" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Heat olive oil in paella pan. Brown salted chicken pieces thoroughly until deeply golden on all sides.", timerMinutes: 10 },
      { stepNumber: 2, instruction: "Push meat to edges, saut\xE9 green beans and garrof\xF3n beans in center. Stir in grated tomato and piment\xF3n paprika.", timerMinutes: 5 },
      { stepNumber: 3, instruction: "Pour in hot broth and saffron. Bring to a vigorous rolling boil and simmer for 10 minutes to form a savory stock.", timerMinutes: 10 },
      { stepNumber: 4, instruction: "Distribute Bomba rice evenly across the pan in a cross pattern, then smooth out. DO NOT STIR AGAIN.", tip: "Stirring releases starch and prevents the socarrat crust." },
      { stepNumber: 5, instruction: "Cook on high for 8 minutes, reduce to low for 10 minutes. Place rosemary sprig on top. In the final 2 minutes, turn heat up to hear the crackle of the socarrat forming.", timerMinutes: 20 }
    ],
    substitutions: [
      { ingredient: "Bomba rice", substitute: "Arborio or short-grain Spanish rice" },
      { ingredient: "Garrof\xF3n", substitute: "Large canned lima beans or butter beans" }
    ],
    cookingTips: ["When you smell a nutty toasted aroma and hear a rhythmic crackling sound, your socarrat crust has formed."],
    servingSuggestions: "Rest for 5 minutes covered with clean tea towel, then serve with lemon wedges right from the pan.",
    storageInstructions: "Refrigerate up to 3 days.",
    searchTags: ["spain", "paella", "valencia", "saffron", "socarrat"]
  },
  {
    recipeId: "fr-beef-bourguignon",
    title: "French Beef Bourguignon",
    alternateName: "B\u0153uf \xE0 la Bourguignonne",
    country: "France",
    countryCode: "FR",
    continent: "Europe",
    region: "Western Europe",
    cuisine: "French",
    description: "Tender beef chuck braised for hours in full-bodied red Burgundy wine, beef broth, bacon lardons, baby carrots, pearl onions, and saut\xE9ed cremini mushrooms.",
    culturalBackground: "Hailing from the Burgundy region of France, this peasant dish was elevated into haute cuisine by legendary chef Auguste Escoffier and popularized worldwide by Julia Child.",
    mealType: "Dinner",
    categories: ["Beef", "Stews", "French Classics"],
    dietaryTags: ["Dairy-Free Optional"],
    allergens: ["Dairy", "Gluten"],
    prepTime: 25,
    cookTime: 150,
    totalTime: 175,
    servings: 6,
    difficulty: "Advanced",
    spiceLevel: 0,
    estimatedCost: "Special Occasion",
    image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Heavy enamelled Dutch oven", "Slotted spoon"],
    ingredients: [
      { name: "Beef chuck roast", amount: 1.2, unit: "kg", notes: "Cut into 2-inch cubes, dried with paper towels" },
      { name: "Dry red wine (Pinot Noir or Burgundy)", amount: 1, unit: "bottle (750ml)" },
      { name: "Thick bacon or salt pork", amount: 150, unit: "g", notes: "Cut into lardons" },
      { name: "Cremini mushrooms", amount: 250, unit: "g", notes: "Quartered" },
      { name: "Pearl onions", amount: 15, unit: "pieces", notes: "Peeled" },
      { name: "Carrots", amount: 3, unit: "large", notes: "Sliced diagonally" },
      { name: "Beef stock", amount: 2, unit: "cups" },
      { name: "Tomato paste", amount: 2, unit: "tbsp" },
      { name: "Garlic cloves", amount: 4, unit: "cloves", notes: "Crushed" },
      { name: "Bouquet garni (fresh thyme, rosemary, bay leaf)", amount: 1, unit: "bundle" },
      { name: "All-purpose flour", amount: 2, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Fry bacon lardons in Dutch oven until crisp. Remove with slotted spoon, leaving fat in pan." },
      { stepNumber: 2, instruction: "Sear dried beef cubes in hot bacon fat in batches without crowding until deeply browned on all sides.", timerMinutes: 12 },
      { stepNumber: 3, instruction: "Toss beef with flour to coat. Pour in entire bottle of red wine, beef stock, tomato paste, garlic, and bouquet garni." },
      { stepNumber: 4, instruction: "Cover with lid and braise in oven at 160\xB0C (325\xB0F) for 2.5 hours until beef is melt-in-mouth tender.", timerMinutes: 150 },
      { stepNumber: 5, instruction: "Saut\xE9 pearl onions and mushrooms separately in butter until golden, then fold into stew for final 15 minutes." }
    ],
    substitutions: [
      { ingredient: "Red Burgundy wine", substitute: "Pinot Noir, Cabernet Sauvignon, or rich beef stock + 2 tbsp red wine vinegar for alcohol-free" },
      { ingredient: "Beef chuck", substitute: "Beef short ribs or brisket" }
    ],
    cookingTips: ["Browning the beef in small batches is non-negotiable; crowding steams the meat instead of searing it."],
    servingSuggestions: "Serve over buttery mashed potatoes, buttered egg noodles, or with crusty French baguette.",
    storageInstructions: "Refrigerate up to 4 days; like all great stews, flavors amplify over time.",
    searchTags: ["france", "bourguignon", "beef stew", "red wine", "classic"]
  },
  {
    recipeId: "gr-moussaka",
    title: "Greek Moussaka",
    alternateName: "\u039C\u03BF\u03C5\u03C3\u03B1\u03BA\u03AC\u03C2",
    country: "Greece",
    countryCode: "GR",
    continent: "Europe",
    region: "Southern Europe",
    cuisine: "Greek",
    description: "Layers of tender baked eggplant and potatoes, fragrant cinnamon-spiced minced lamb sauce, topped with a thick, golden, fluffy b\xE9chamel crust.",
    culturalBackground: "While versions existed across the Levant, modern Greek Moussaka with its signature French b\xE9chamel sauce was codified in the 1920s by legendary Greek chef Nikolaos Tselementes.",
    mealType: "Dinner",
    categories: ["Casserole", "Lamb", "Comfort Food"],
    dietaryTags: ["Halal"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    prepTime: 30,
    cookTime: 60,
    totalTime: 90,
    servings: 6,
    difficulty: "Advanced",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large baking dish (9x13 inch)", "Baking sheets for eggplant", "Saucepans"],
    ingredients: [
      { name: "Eggplants", amount: 2, unit: "large", notes: "Sliced 1/2 inch rounds, salted and roasted" },
      { name: "Yukon gold potatoes", amount: 3, unit: "medium", notes: "Peeled, sliced and par-cooked" },
      { name: "Ground lamb or lean beef", amount: 600, unit: "g" },
      { name: "Canned crushed tomatoes", amount: 1.5, unit: "cups" },
      { name: "Ground cinnamon & allspice", amount: 1, unit: "tsp", notes: "Signature Greek aroma" },
      { name: "Butter", amount: 4, unit: "tbsp", notes: "For b\xE9chamel" },
      { name: "All-purpose flour", amount: 4, unit: "tbsp", notes: "For b\xE9chamel" },
      { name: "Whole milk", amount: 3, unit: "cups", notes: "Warmed" },
      { name: "Egg yolks", amount: 2, unit: "large", notes: "Whisked into warm b\xE9chamel" },
      { name: "Grated Kefalotyri or Parmesan cheese", amount: 0.75, unit: "cup" },
      { name: "Nutmeg", amount: 0.5, unit: "tsp", notes: "Freshly grated" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Roast salted eggplant slices and potato rounds on olive-oiled baking sheets at 200\xB0C (400\xB0F) for 20 mins until tender." },
      { stepNumber: 2, instruction: "Brown ground lamb with onions and garlic. Add tomatoes, cinnamon, allspice, and oregano; simmer until thick (20 mins).", timerMinutes: 20 },
      { stepNumber: 3, instruction: "Make B\xE9chamel: Melt butter, whisk in flour for 2 mins, slowly stream in warm milk until thick and bubbly. Off heat, whisk in egg yolks, nutmeg, and cheese.", timerMinutes: 8 },
      { stepNumber: 4, instruction: "Assemble: Layer potatoes at base, half the eggplant, meat sauce, remaining eggplant, and spread luscious b\xE9chamel evenly on top." },
      { stepNumber: 5, instruction: "Bake at 180\xB0C (350\xB0F) for 45 minutes until top is bronzed and puffy. Rest 25 minutes before slicing.", timerMinutes: 45 }
    ],
    substitutions: [
      { ingredient: "Ground lamb", substitute: "Ground beef or brown lentils for vegetarian" },
      { ingredient: "Kefalotyri", substitute: "Pecorino Romano or Parmigiano" }
    ],
    cookingTips: ["Resting the moussaka for 20-30 minutes after baking allows clean, gorgeous square slices without collapsing."],
    servingSuggestions: "Serve with crisp Greek Horiatiki salad with kalamata olives and feta cheese.",
    storageInstructions: "Keeps 4 days refrigerated; reheats beautifully.",
    searchTags: ["greece", "moussaka", "eggplant", "bechamel", "lamb"]
  },
  {
    recipeId: "pl-pierogi",
    title: "Polish Pierogi Ruskie",
    alternateName: "Potato and Cheese Dumplings",
    country: "Poland",
    countryCode: "PL",
    continent: "Europe",
    region: "Eastern Europe",
    cuisine: "Polish",
    description: "Pillowy homemade dumplings stuffed with whipped potatoes, farmers cheese (twar\xF3g), and caramelized onions, pan-fried in butter until golden crisp.",
    culturalBackground: "Pierogi are the quintessential Polish comfort food celebrated since the 13th century. Pierogi Ruskie, traditionally from the historical Red Ruthenia region, remain the most beloved variation.",
    mealType: "Dinner",
    categories: ["Dumplings", "Comfort Food", "Vegetarian"],
    dietaryTags: ["Vegetarian"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    prepTime: 40,
    cookTime: 20,
    totalTime: 60,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Rolling pin", "Round cutter or drinking glass (3-inch)", "Large stockpot", "Skillet"],
    ingredients: [
      { name: "All-purpose flour", amount: 3, unit: "cups" },
      { name: "Warm water and 1 egg", amount: 1, unit: "cup", notes: "For soft dough" },
      { name: "Russet potatoes", amount: 500, unit: "g", notes: "Boiled and mashed while hot" },
      { name: "Farmers cheese (Twar\xF3g) or Ricotta", amount: 250, unit: "g" },
      { name: "Yellow onions", amount: 2, unit: "large", notes: "Slow-caramelized in butter" },
      { name: "Butter", amount: 4, unit: "tbsp", notes: "For frying and garnish" },
      { name: "Sour cream", amount: 0.5, unit: "cup", notes: "For serving" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Mix flour, egg, warm water, and pinch of salt into soft pliable dough. Knead 8 mins, cover and rest 30 mins." },
      { stepNumber: 2, instruction: "Make filling: combine warm mashed potatoes, crumbled twar\xF3g cheese, half the caramelized onions, salt, and generous black pepper." },
      { stepNumber: 3, instruction: "Roll dough thin (1/8-inch). Cut 3-inch circles, spoon 1 tbsp filling into center, fold into half-moons and crimp edges tightly." },
      { stepNumber: 4, instruction: "Drop into salted boiling water. Cook until they float to surface + 2 minutes. Remove with slotted spoon.", timerMinutes: 4 },
      { stepNumber: 5, instruction: "Pan-fry boiled pierogi in foaming butter until golden and crispy on both sides. Top with remaining caramelized onions and sour cream." }
    ],
    substitutions: [
      { ingredient: "Twar\xF3g", substitute: "Dry curd cottage cheese or whole milk ricotta drained well" }
    ],
    cookingTips: ["Resting the dough is essential to relax the gluten so it rolls out paper-thin without springing back."],
    servingSuggestions: "Serve with rich sour cream, fried bacon bits, and chopped fresh chives.",
    storageInstructions: "Uncooked dumplings can be frozen on a baking sheet, then bagged for up to 6 months.",
    searchTags: ["poland", "pierogi", "dumplings", "potatoes", "comfort food"]
  },
  {
    recipeId: "pt-caldo-verde",
    title: "Portuguese Caldo Verde",
    alternateName: "Traditional Portuguese Green Soup",
    country: "Portugal",
    countryCode: "PT",
    continent: "Europe",
    region: "Southern Europe",
    cuisine: "Portuguese",
    description: "Velvety potato, garlic, and onion broth threaded with chiffonade-cut dark Portuguese collard greens (couve-galega) and smoky chouri\xE7o sausage.",
    culturalBackground: "From the lush Minho province in northern Portugal, Caldo Verde was voted one of the 7 wonders of Portuguese gastronomy, celebrated at weddings, festivals, and Saint Anthony\u2019s feast day.",
    mealType: "Dinner",
    categories: ["Soups", "Pork", "Portuguese Classics"],
    dietaryTags: ["Gluten-Free", "Dairy-Free"],
    allergens: [],
    prepTime: 15,
    cookTime: 30,
    totalTime: 45,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Immersion blender or standard blender", "Soup pot"],
    ingredients: [
      { name: "Yukon Gold or Russet potatoes", amount: 600, unit: "g", notes: "Peeled and diced" },
      { name: "Portuguese Chouri\xE7o or Spanish Chorizo", amount: 1, unit: "link", notes: "Sliced into coins" },
      { name: "Portuguese cabbage or Collard greens", amount: 300, unit: "g", notes: "Rolled and sliced paper-thin (chiffonade)" },
      { name: "Yellow onion", amount: 1, unit: "large", notes: "Chopped" },
      { name: "Garlic cloves", amount: 3, unit: "cloves", notes: "Minced" },
      { name: "Extra virgin olive oil", amount: 0.25, unit: "cup" },
      { name: "Water or vegetable broth", amount: 6, unit: "cups" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Saut\xE9 chopped onion and garlic in 2 tbsp olive oil until translucent (5 mins)." },
      { stepNumber: 2, instruction: "Add diced potatoes, water, salt, and half the chouri\xE7o slices. Simmer until potatoes are soft (20 mins).", timerMinutes: 20 },
      { stepNumber: 3, instruction: "Remove chouri\xE7o slices. Puree the potato broth with an immersion blender until completely smooth and creamy." },
      { stepNumber: 4, instruction: "Add the hair-thin shredded greens and remaining sliced chouri\xE7o. Simmer uncovered for 4-5 minutes until greens are tender but bright.", timerMinutes: 5 },
      { stepNumber: 5, instruction: "Ladle into bowls and drizzle with raw, fruity extra virgin olive oil." }
    ],
    substitutions: [
      { ingredient: "Portuguese Chouri\xE7o", substitute: "Smoked sausage or smoked paprika for vegetarian" },
      { ingredient: "Couve Galega", substitute: "Tuscan kale or green collards sliced paper thin" }
    ],
    cookingTips: ["Slicing the greens as thin as hair allows them to cook in minutes while preserving vibrant emerald green."],
    servingSuggestions: "Serve with traditional Portuguese Broa de Milho (dense cornbread).",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["portugal", "caldo verde", "soup", "chorizo", "greens"]
  },
  {
    recipeId: "se-meatballs",
    title: "Swedish Meatballs (K\xF6ttbullar)",
    alternateName: "Traditional Swedish Meatballs with Lingonberry",
    country: "Sweden",
    countryCode: "SE",
    continent: "Europe",
    region: "Northern Europe",
    cuisine: "Swedish",
    description: "Tender spiced pork and beef meatballs flavored with allspice and nutmeg, smothered in a luscious creamy velout\xE9 brown gravy.",
    culturalBackground: "Brought to Sweden by King Charles XII in the early 18th century following his time in the Ottoman Empire, K\xF6ttbullar evolved into Sweden\u2019s most famous culinary export.",
    mealType: "Dinner",
    categories: ["Meatballs", "Comfort Food", "Family Favorites"],
    dietaryTags: [],
    allergens: ["Dairy", "Gluten", "Eggs"],
    prepTime: 20,
    cookTime: 25,
    totalTime: 45,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 0,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Skillet", "Whisk"],
    ingredients: [
      { name: "Ground beef (80/20)", amount: 350, unit: "g" },
      { name: "Ground pork", amount: 350, unit: "g" },
      { name: "Fresh breadcrumbs", amount: 0.5, unit: "cup", notes: "Soaked in 1/3 cup heavy cream" },
      { name: "Egg", amount: 1, unit: "large" },
      { name: "Onion", amount: 1, unit: "small", notes: "Finely grated" },
      { name: "Ground allspice and nutmeg", amount: 0.5, unit: "tsp", notes: "Each" },
      { name: "Butter", amount: 4, unit: "tbsp" },
      { name: "Beef broth", amount: 2, unit: "cups" },
      { name: "Heavy cream", amount: 0.5, unit: "cup" },
      { name: "All-purpose flour", amount: 2, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Combine beef, pork, soaked breadcrumbs, egg, grated onion, allspice, nutmeg, salt, and pepper. Mix gently until just combined." },
      { stepNumber: 2, instruction: "Roll into small round balls (approx 1-inch diameter)." },
      { stepNumber: 3, instruction: "Melt 2 tbsp butter in skillet over medium heat. Fry meatballs in batches until browned on all sides and cooked through (8-10 mins). Remove.", timerMinutes: 10 },
      { stepNumber: 4, instruction: "In same pan, melt remaining 2 tbsp butter, whisk in flour for 1 minute, stream in beef broth and heavy cream. Simmer until velvety gravy forms.", timerMinutes: 5 },
      { stepNumber: 5, instruction: "Return meatballs to gravy and coat thoroughly." }
    ],
    substitutions: [
      { ingredient: "Ground pork", substitute: "Ground turkey or all beef" },
      { ingredient: "Lingonberry jam", substitute: "Cranberry sauce or redcurrant jelly" }
    ],
    cookingTips: ["Do not overwork meatball mixture; gentle mixing keeps them light and tender."],
    servingSuggestions: "Serve with creamy mashed potatoes, pickled cucumbers, and tart lingonberry jam.",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["sweden", "meatballs", "gravy", "lingonberry", "scandinavian"]
  },
  {
    recipeId: "tr-menemen",
    title: "Turkish Menemen",
    alternateName: "Turkish Scrambled Eggs with Tomatoes & Peppers",
    country: "Turkey",
    countryCode: "TR",
    continent: "Europe",
    region: "Southeastern Europe / West Asia",
    cuisine: "Turkish",
    description: "Juicy, velvety soft scrambled eggs gently folded into sweet cooked tomatoes, mild green peppers, Turkish olive oil, and pul biber (Aleppo pepper).",
    culturalBackground: "Originating from the Menemen district of Izmir, this dish is the heart of the world-renowned Turkish breakfast spread (Kahvalt\u0131).",
    mealType: "Breakfast",
    categories: ["Breakfast", "Eggs", "Vegetarian"],
    dietaryTags: ["Vegetarian", "Gluten-Free", "Dairy-Free Optional", "Halal"],
    allergens: ["Eggs"],
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 2,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Traditional copper sahan pan or small skillet"],
    ingredients: [
      { name: "Fresh large eggs", amount: 4, unit: "whole", notes: "Lightly beaten with a fork" },
      { name: "Ripe sweet tomatoes", amount: 3, unit: "medium", notes: "Peeled and finely diced" },
      { name: "Turkish green peppers (Sivri biber) or Italian frying peppers", amount: 3, unit: "peppers", notes: "Chopped" },
      { name: "Butter and olive oil", amount: 2, unit: "tbsp", notes: "Combined" },
      { name: "Aleppo pepper flakes (Pul Biber)", amount: 1, unit: "tsp" },
      { name: "Kashkaval or feta cheese", amount: 50, unit: "g", notes: "Optional crumble" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Melt butter and olive oil in pan. Saut\xE9 chopped green peppers over medium heat until soft and sweet (5 mins).", timerMinutes: 5 },
      { stepNumber: 2, instruction: "Add diced peeled tomatoes and pinch of salt. Cook down until tomatoes break into a juicy saucy base (7 mins).", timerMinutes: 7 },
      { stepNumber: 3, instruction: "Pour in lightly beaten eggs and Aleppo pepper. Gently draw a wooden spoon through the mixture, folding the curds very slowly over low heat.", timerMinutes: 3 },
      { stepNumber: 4, instruction: "Remove from heat while eggs are still soft, glossy, and custardy; residual heat finishes cooking them." }
    ],
    substitutions: [
      { ingredient: "Sivri biber", substitute: "Mild Anaheim peppers or green bell peppers" },
      { ingredient: "Pul biber", substitute: "Mild smoked paprika mixed with pinch of red pepper flakes" }
    ],
    cookingTips: ["The goal is custardy, juicy scrambled eggs, never dry or rubbery."],
    servingSuggestions: "Serve straight in the pan with warm crusty Turkish simit or pide bread.",
    storageInstructions: "Best enjoyed immediately.",
    searchTags: ["turkey", "menemen", "eggs", "breakfast", "kahvalti"]
  }
];

// src/data/starterRecipesPart2.ts
var STARTER_RECIPES_PART2 = [
  // ==================== NORTH AMERICA (8 RECIPES) ====================
  {
    recipeId: "mx-birria-tacos",
    title: "Mexican Birria Tacos con Consom\xE9",
    alternateName: "Quesabirria Tacos",
    country: "Mexico",
    countryCode: "MX",
    continent: "North America",
    region: "Central America",
    cuisine: "Mexican (Jalisco)",
    description: "Crisp corn tortillas dipped in spiced chili broth, grilled with melted Oaxaca cheese, tender shredded braised beef, fresh cilantro, onions, and steaming rich consom\xE9 for dipping.",
    culturalBackground: "Hailing from Jalisco, Mexico, Birria was originally made with goat meat braised in an earthy dried chili adobo. Quesabirria tacos surged in popularity across Tijuana and the world as an irresistible street food sensation.",
    mealType: "Dinner",
    categories: ["Tacos", "Beef", "Street Food"],
    dietaryTags: ["Gluten-Free"],
    allergens: ["Dairy"],
    prepTime: 30,
    cookTime: 120,
    totalTime: 150,
    servings: 6,
    difficulty: "Medium",
    spiceLevel: 3,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Dutch oven or slow cooker", "Blender", "Comal or flat griddle"],
    ingredients: [
      { name: "Beef chuck roast or short ribs", amount: 1.2, unit: "kg", notes: "Cut into large chunks" },
      { name: "Dried Guajillo chilies", amount: 5, unit: "whole", notes: "Stemmed and deseeded" },
      { name: "Dried Ancho chilies", amount: 3, unit: "whole", notes: "Stemmed and deseeded" },
      { name: "Dried Chipotle chilies", amount: 2, unit: "whole" },
      { name: "Oaxaca cheese or mozzarella", amount: 300, unit: "g", notes: "Shredded" },
      { name: "Corn tortillas", amount: 16, unit: "pieces" },
      { name: "Beef broth", amount: 4, unit: "cups" },
      { name: "Apple cider vinegar", amount: 2, unit: "tbsp" },
      { name: "Cinnamon stick and Mexican oregano", amount: 1, unit: "tsp", notes: "Each" },
      { name: "White onion & fresh cilantro", amount: 1, unit: "cup", notes: "Finely diced for topping" },
      { name: "Lime wedges", amount: 3, unit: "limes" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Toast dried chilies in a dry skillet for 1 minute, then submerge in hot water for 15 minutes to rehydrate." },
      { stepNumber: 2, instruction: "Blend rehydrated chilies with garlic, vinegar, tomatoes, oregano, cumin, cinnamon, and 1 cup broth into a smooth red adobo puree." },
      { stepNumber: 3, instruction: "Season beef with salt, sear in Dutch oven, pour blended chili adobo and remaining broth over. Cover and braise on low heat for 2.5 hours until fork-tender.", timerMinutes: 150 },
      { stepNumber: 4, instruction: "Remove beef and shred with two forks. Skim the crimson spiced chili oil from the top of the simmering consom\xE9 broth." },
      { stepNumber: 5, instruction: "Dip corn tortillas into the chili oil on the broth, place on hot griddle, top with cheese and shredded beef, fold in half, and fry until crisp. Serve with bowls of hot consom\xE9 for dipping.", timerMinutes: 6 }
    ],
    substitutions: [
      { ingredient: "Guajillo / Ancho chilies", substitute: "Dried Pasilla chilies or 3 tbsp mild chili powder + 1 tbsp smoked paprika" },
      { ingredient: "Oaxaca cheese", substitute: "Low-moisture mozzarella or Monterey Jack" }
    ],
    cookingTips: ["Dipping the tortillas directly into the fat on the surface of the broth is the key to that golden crispy taco shell."],
    servingSuggestions: "Dip each crispy taco deeply into the steaming bowl of cilantro-topped consom\xE9 with a squeeze of fresh lime.",
    storageInstructions: "Shredded beef and broth freeze exceptionally well for up to 3 months.",
    searchTags: ["mexico", "birria", "tacos", "quesabirria", "beef", "street food"]
  },
  {
    recipeId: "jm-jerk-chicken",
    title: "Jamaican Jerk Chicken",
    alternateName: "Authentic Kingston Jerk",
    country: "Jamaica",
    countryCode: "JM",
    continent: "North America",
    region: "Caribbean",
    cuisine: "Jamaican",
    description: "Charred, deeply spiced chicken infused with scotch bonnet peppers, pimento allspice berries, fresh thyme, scallions, ginger, and brown sugar.",
    culturalBackground: "Jerk was developed by the Jamaican Maroons (enslaved Africans who escaped into the Blue Mountains). They preserved wild boar by smoking it over allspice (pimento) wood in underground pits to avoid smoke detection.",
    mealType: "Dinner",
    categories: ["Poultry", "Grill", "Caribbean Classics"],
    dietaryTags: ["Dairy-Free", "Gluten-Free", "Halal"],
    allergens: [],
    prepTime: 20,
    cookTime: 40,
    totalTime: 60,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 4,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Blender or food processor", "Charcoal grill or grill pan with lid"],
    ingredients: [
      { name: "Bone-in, skin-on chicken leg quarters", amount: 1.2, unit: "kg", notes: "Scored deeply to bone" },
      { name: "Scotch bonnet peppers", amount: 3, unit: "whole", notes: "Deseeded for milder heat or whole for authentic fire" },
      { name: "Scallions (green onions)", amount: 6, unit: "stalks", notes: "Coarsely chopped" },
      { name: "Fresh thyme leaves", amount: 3, unit: "tbsp" },
      { name: "Whole allspice berries (Pimento)", amount: 2, unit: "tbsp", notes: "Freshly ground" },
      { name: "Fresh ginger root", amount: 2, unit: "tbsp", notes: "Chopped" },
      { name: "Garlic cloves", amount: 6, unit: "cloves" },
      { name: "Dark brown sugar", amount: 2, unit: "tbsp" },
      { name: "Soy sauce or coconut aminos", amount: 3, unit: "tbsp" },
      { name: "Lime juice", amount: 2, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Blend scotch bonnets, scallions, thyme, allspice, ginger, garlic, brown sugar, soy sauce, lime juice, and salt into a coarse jerk marinade." },
      { stepNumber: 2, instruction: "Rub marinade thoroughly all over chicken pieces, working deep into the scores. Marinate at least 4 hours (overnight preferred)." },
      { stepNumber: 3, instruction: "Set up grill for two-zone cooking (direct heat & indirect heat) with pimento/allspice wood chips if available." },
      { stepNumber: 4, instruction: "Sear chicken over direct heat for 3 mins per side until skin is blistered, then move to indirect heat side.", timerMinutes: 6 },
      { stepNumber: 5, instruction: "Cover grill and cook for 35 minutes until internal temp reaches 74\xB0C (165\xB0F) and chicken is succulent and smoky.", timerMinutes: 35 }
    ],
    substitutions: [
      { ingredient: "Scotch bonnet", substitute: "Habanero pepper" },
      { ingredient: "Allspice berries", substitute: "Ground allspice + pinch of ground cinnamon and clove" }
    ],
    cookingTips: ["Allspice (pimento) and fresh thyme are the true soul of jerk flavor, not just chili heat."],
    servingSuggestions: "Serve with traditional Jamaican Rice and Peas cooked in coconut milk, fried festival dumplings, and sweet plantains.",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["jamaica", "jerk", "chicken", "caribbean", "spicy", "bbq"]
  },
  {
    recipeId: "us-cajun-gumbo",
    title: "Louisiana Seafood & Sausage Gumbo",
    alternateName: "Authentic Creole Gumbo",
    country: "United States",
    countryCode: "US",
    continent: "North America",
    region: "North America",
    cuisine: "American (Cajun/Creole)",
    description: "Deep, rich mahogany roux stew simmered with the holy trinity (onion, celery, bell pepper), smoky andouille sausage, succulent gulf shrimp, okra, and file powder.",
    culturalBackground: "The culinary soul of Louisiana. Gumbo weaves together West African okra (ki ngombo), Native American file powder, French dark roux, and Spanish andouille sausage into an unmistakable cultural tapestry.",
    mealType: "Dinner",
    categories: ["Stews", "Seafood", "American Classics"],
    dietaryTags: ["Dairy-Free"],
    allergens: ["Shellfish", "Gluten"],
    prepTime: 30,
    cookTime: 60,
    totalTime: 90,
    servings: 6,
    difficulty: "Advanced",
    spiceLevel: 2,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Heavy cast-iron Dutch oven", "Flat-edge wooden spatula", "Stockpot"],
    ingredients: [
      { name: "All-purpose flour", amount: 0.5, unit: "cup", notes: "For dark chocolate roux" },
      { name: "Vegetable oil or lard", amount: 0.5, unit: "cup" },
      { name: "Smoky Andouille sausage", amount: 350, unit: "g", notes: "Sliced into 1/2-inch coins" },
      { name: "Raw shrimp", amount: 500, unit: "g", notes: "Peeled & deveined" },
      { name: "Holy Trinity: 1 onion, 1 green bell pepper, 2 stalks celery", amount: 3, unit: "cups", notes: "Finely diced" },
      { name: "Garlic cloves", amount: 4, unit: "cloves", notes: "Minced" },
      { name: "Fresh or frozen sliced okra", amount: 1.5, unit: "cups" },
      { name: "Seafood or chicken stock", amount: 6, unit: "cups" },
      { name: "Cajun seasoning & bay leaves", amount: 2, unit: "tbsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make the dark roux: In a cast-iron pot, whisk oil and flour over medium-low heat constantly for 20-25 minutes until it reaches the color of dark melted chocolate. DO NOT WALK AWAY.", timerMinutes: 25, tip: "If you see black specks, the roux burned; discard and restart." },
      { stepNumber: 2, instruction: "Immediately dump the diced Holy Trinity into the hot dark roux. The sizzling vegetables stop the roux from burning and sweeten in the heat.", timerMinutes: 5 },
      { stepNumber: 3, instruction: "Add sliced browned andouille sausage, minced garlic, Cajun spices, and bay leaves." },
      { stepNumber: 4, instruction: "Slowly stream in warm chicken/seafood stock, whisking until smooth. Simmer gently on low heat for 40 minutes.", timerMinutes: 40 },
      { stepNumber: 5, instruction: "Add sliced okra and raw shrimp. Simmer for 6-8 minutes until shrimp turn pink and tender. Remove bay leaves and serve.", timerMinutes: 8 }
    ],
    substitutions: [
      { ingredient: "Andouille sausage", substitute: "Kielbasa or smoked Spanish chorizo" },
      { ingredient: "Okra", substitute: "1 tsp gumbo fil\xE9 powder stirred in off-heat" }
    ],
    cookingTips: ["Patiently whisking the roux to a dark chocolate color creates that iconic deep nutty Creole flavor."],
    servingSuggestions: "Ladle generously into shallow bowls over a scoop of fluffy long-grain white rice with hot sauce and sliced scallions.",
    storageInstructions: "Refrigerates for 4 days; like chili, tastes better day two.",
    searchTags: ["usa", "gumbo", "louisiana", "cajun", "seafood", "andouille"]
  },
  {
    recipeId: "ca-poutine",
    title: "Quebec Classic Poutine",
    alternateName: "Poutine Qu\xE9b\xE9coise",
    country: "Canada",
    countryCode: "CA",
    continent: "North America",
    region: "North America",
    cuisine: "Canadian (Quebec)",
    description: "Crisp hand-cut russet fries piled high with squeaky fresh white cheddar cheese curds, drowned in piping-hot savory beef-chicken velout\xE9 gravy.",
    culturalBackground: "Born in rural Centre-du-Qu\xE9bec dairy towns in the late 1950s (Warwick or Drummondville), poutine is celebrated as Canada\u2019s beloved comfort food export.",
    mealType: "Lunch",
    categories: ["Comfort Food", "Fast Food", "Street Food"],
    dietaryTags: ["Vegetarian Optional"],
    allergens: ["Dairy", "Gluten"],
    prepTime: 20,
    cookTime: 25,
    totalTime: 45,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Deep fryer or Dutch oven for frying", "Saucepan for gravy"],
    ingredients: [
      { name: "Russet potatoes", amount: 1, unit: "kg", notes: "Cut into 1/3-inch fries, soaked in cold water" },
      { name: "Fresh white cheddar cheese curds", amount: 300, unit: "g", notes: "Room temperature for signature squeak" },
      { name: "Beef broth and chicken broth mix", amount: 3, unit: "cups" },
      { name: "Butter", amount: 3, unit: "tbsp" },
      { name: "All-purpose flour", amount: 3, unit: "tbsp" },
      { name: "Cornstarch slurry", amount: 1, unit: "tbsp", notes: "Dissolved in 2 tbsp water" },
      { name: "Worcestershire sauce", amount: 1, unit: "tsp" },
      { name: "Oil for double-frying", amount: 1, unit: "liter" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make Poutine Gravy: Melt butter in saucepan, whisk in flour for 2 mins, pour in beef and chicken broths, Worcestershire, and black pepper. Simmer with cornstarch until glossy and thick.", timerMinutes: 8 },
      { stepNumber: 2, instruction: "Dry soaked potato sticks thoroughly with towels. First fry at 160\xB0C (325\xB0F) for 5 minutes until tender but pale. Remove and drain." },
      { stepNumber: 3, instruction: "Second fry: Heat oil to 190\xB0C (375\xB0F). Flash fry potatoes for 3-4 minutes until golden brown and super crisp.", timerMinutes: 4 },
      { stepNumber: 4, instruction: "Toss hot crispy fries with sea salt. Immediately layer fries into bowls, scatter room-temperature squeaky cheese curds throughout." },
      { stepNumber: 5, instruction: "Ladle boiling-hot gravy generously over the top so the cheese curds soften and melt slightly while maintaining their shape." }
    ],
    substitutions: [
      { ingredient: "Cheese curds", substitute: "Torn fresh mozzarella or mild white cheddar cubes" },
      { ingredient: "Beef broth", substitute: "Rich mushroom-vegetable broth for vegetarian poutine" }
    ],
    cookingTips: ["Keep cheese curds at room temperature so the boiling gravy melts them just enough without cooling down."],
    servingSuggestions: "Serve piping hot right out of the kitchen with a cold drink.",
    storageInstructions: "Best consumed immediately.",
    searchTags: ["canada", "poutine", "quebec", "fries", "cheese curds", "gravy"]
  },
  {
    recipeId: "cu-ropa-vieja",
    title: "Cuban Ropa Vieja",
    alternateName: "Cuban Shredded Beef Stew",
    country: "Cuba",
    countryCode: "CU",
    continent: "North America",
    region: "Caribbean",
    cuisine: "Cuban",
    description: "Tender braised flank steak shredded into ribbons and stewed with sweet bell peppers, onions, tomatoes, green olives, capers, and dry white wine.",
    culturalBackground: "Legend says a poor man had no food to feed his family, so he shredded and cooked his old clothes with love, and they magically transformed into rich savory beef. In reality, it originated in the Canary Islands before becoming Cuba\u2019s national dish.",
    mealType: "Dinner",
    categories: ["Beef", "Stews", "National Dish"],
    dietaryTags: ["Dairy-Free", "Gluten-Free"],
    allergens: [],
    prepTime: 20,
    cookTime: 90,
    totalTime: 110,
    servings: 5,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Dutch oven or pressure cooker"],
    ingredients: [
      { name: "Flank steak or beef chuck", amount: 1, unit: "kg" },
      { name: "Bell peppers (red and green)", amount: 2, unit: "peppers", notes: "Thinly sliced" },
      { name: "Yellow onion", amount: 1, unit: "large", notes: "Thinly sliced" },
      { name: "Crushed plum tomatoes", amount: 2, unit: "cups" },
      { name: "Dry white wine", amount: 0.5, unit: "cup" },
      { name: "Pitted Spanish green olives (Manzanilla)", amount: 0.5, unit: "cup" },
      { name: "Capers", amount: 1, unit: "tbsp" },
      { name: "Ground cumin and oregano", amount: 1, unit: "tbsp", notes: "Combined" },
      { name: "Garlic cloves", amount: 4, unit: "cloves", notes: "Minced" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Simmer flank steak in salted water with onion, carrot, and bay leaf for 60-75 minutes until fork tender.", timerMinutes: 70 },
      { stepNumber: 2, instruction: "Remove meat and shred into long rope-like strands using two forks. Reserve 1 cup of cooking broth." },
      { stepNumber: 3, instruction: "Saut\xE9 sliced onions and bell peppers in olive oil until sweet and tender (8 mins). Stir in garlic, cumin, and oregano.", timerMinutes: 8 },
      { stepNumber: 4, instruction: "Pour in white wine, scraping any browned bits. Add crushed tomatoes, reserved broth, olives, and capers." },
      { stepNumber: 5, instruction: "Add shredded beef into the sauce. Simmer uncovered on low heat for 20 minutes until the sauce reduces and clings to beef.", timerMinutes: 20 }
    ],
    substitutions: [
      { ingredient: "Flank steak", substitute: "Beef brisket or chuck roast" },
      { ingredient: "White wine", substitute: "Broth with 1 tbsp apple cider vinegar" }
    ],
    cookingTips: ["Flank steak produces the longest, most authentic shreds that look like shredded clothes (ropa vieja)."],
    servingSuggestions: "Serve alongside Cuban Moros y Cristianos (black beans and rice) and fried sweet maduros plantains.",
    storageInstructions: "Refrigerates up to 5 days; tastes even better as beef absorbs the tomato-olive sauce.",
    searchTags: ["cuba", "ropa vieja", "beef", "caribbean", "stew"]
  },
  {
    recipeId: "us-bbq-ribs",
    title: "Kansas City Smoky BBQ Ribs",
    alternateName: "Slow-Smoked Pork Spare Ribs",
    country: "United States",
    countryCode: "US",
    continent: "North America",
    region: "North America",
    cuisine: "American BBQ",
    description: "Fall-off-the-bone tender smoked pork baby back ribs coated in a brown sugar and paprika dry rub, glazed with thick sweet-and-tangy molasses BBQ sauce.",
    culturalBackground: 'Kansas City BBQ took root in the early 20th century through Henry Perry, known as the "Father of Kansas City Barbecue", who cooked meats in outdoor pits over oak and hickory coals.',
    mealType: "Dinner",
    categories: ["Pork", "BBQ", "American Classics"],
    dietaryTags: ["Dairy-Free"],
    allergens: [],
    prepTime: 20,
    cookTime: 180,
    totalTime: 200,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Baking sheet or smoker", "Heavy-duty aluminum foil", "Basting brush"],
    ingredients: [
      { name: "Pork baby back rib racks", amount: 2, unit: "racks (approx 2 kg)", notes: "Membrane peeled from back" },
      { name: "Brown sugar", amount: 0.5, unit: "cup" },
      { name: "Smoked paprika", amount: 2, unit: "tbsp" },
      { name: "Garlic powder and onion powder", amount: 1, unit: "tbsp", notes: "Each" },
      { name: "Black pepper and kosher salt", amount: 1, unit: "tbsp", notes: "Each" },
      { name: "Cayenne pepper", amount: 0.5, unit: "tsp" },
      { name: "Kansas City BBQ sauce (molasses & tomato based)", amount: 1.5, unit: "cups" },
      { name: "Apple cider vinegar & apple juice", amount: 0.5, unit: "cup", notes: "For spritzing" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Remove thin papery membrane (silverskin) from the bone-side of the ribs using a paper towel for grip." },
      { stepNumber: 2, instruction: "Rub ribs generously on both sides with the brown sugar, paprika, and garlic spice blend. Rest 30 mins." },
      { stepNumber: 3, instruction: "Wrap tightly in foil (or place on smoker at 120\xB0C / 250\xB0F) with a splash of apple juice. Bake or smoke for 2.5 hours until tender.", timerMinutes: 150 },
      { stepNumber: 4, instruction: "Unwrap ribs, brush generously with sweet and smoky BBQ sauce on both sides." },
      { stepNumber: 5, instruction: "Grill or broil uncovered for 8-10 minutes until the glaze bubbles, caramelizes, and forms a sticky mahogany crust.", timerMinutes: 10 }
    ],
    substitutions: [
      { ingredient: "Baby back ribs", substitute: "St. Louis cut spare ribs or beef short ribs" },
      { ingredient: "BBQ sauce", substitute: "Homemade blend of ketchup, molasses, cider vinegar, and mustard" }
    ],
    cookingTips: ["Removing the membrane from the back of the ribs is crucial so spices penetrate and ribs stay tender."],
    servingSuggestions: "Serve with creamy coleslaw, baked beans, and buttery warm cornbread.",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["usa", "bbq", "ribs", "pork", "smoked", "kansas city"]
  },
  {
    recipeId: "sv-pupusas",
    title: "Salvadoran Pupusas Revueltas",
    alternateName: "Stuffed Corn Tortilla Flatbreads",
    country: "El Salvador",
    countryCode: "SV",
    continent: "North America",
    region: "Central America",
    cuisine: "Salvadoran",
    description: "Thick handmade griddled corn masa pockets stuffed with melted Salvadoran quesillo cheese, refried black beans, and chicharr\xF3n pork, served with tangy curtido cabbage slaw.",
    culturalBackground: "Pupusas date back over 2,000 years to the indigenous Pipil tribes of El Salvador. Declared the official national dish of El Salvador, they are celebrated with National Pupusa Day every November.",
    mealType: "Dinner",
    categories: ["Street Food", "Comfort Food", "Central American"],
    dietaryTags: ["Gluten-Free"],
    allergens: ["Dairy"],
    prepTime: 25,
    cookTime: 15,
    totalTime: 40,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Comal or non-stick griddle", "Bowl for masa"],
    ingredients: [
      { name: "Masa Harina (nixtamalized corn flour)", amount: 3, unit: "cups" },
      { name: "Warm water", amount: 2.5, unit: "cups" },
      { name: "Quesillo or shredded Monterey Jack / Mozzarella", amount: 250, unit: "g" },
      { name: "Refried red or black beans", amount: 1, unit: "cup" },
      { name: "Chicharr\xF3n (cooked ground pork paste)", amount: 1, unit: "cup" },
      { name: "Shredded green cabbage", amount: 3, unit: "cups", notes: "For Curtido" },
      { name: "Apple cider vinegar & oregano", amount: 0.5, unit: "cup", notes: "For Curtido" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make Curtido slaw: toss shredded cabbage, grated carrot, oregano, and vinegar in a jar. Let pickle for at least 30 minutes." },
      { stepNumber: 2, instruction: "Knead masa harina, salt, and warm water until pliable and smooth like play-dough." },
      { stepNumber: 3, instruction: "Roll a golf-ball sized piece of masa, indent the center to form a cup, and fill with 1 tbsp combined cheese, beans, and pork." },
      { stepNumber: 4, instruction: "Fold dough around filling to seal completely, pat gently between oiled hands into a 1/2-inch thick disc." },
      { stepNumber: 5, instruction: "Cook on a hot oiled comal/griddle for 3-4 minutes per side until golden spots appear and cheese begins to melt out.", timerMinutes: 8 }
    ],
    substitutions: [
      { ingredient: "Quesillo", substitute: "Low moisture mozzarella mixed with crumbled feta" },
      { ingredient: "Chicharr\xF3n", substitute: "Cooked spiced mushrooms or spinach for vegetarian pupusas" }
    ],
    cookingTips: ["Keep a small bowl of water and vegetable oil nearby to coat your hands; this prevents the corn dough from sticking."],
    servingSuggestions: "Eat with your hands, scooping tangy crunchy curtido slaw and warm tomato salsa onto each bite.",
    storageInstructions: "Cooked pupusas can be frozen and reheated in a dry pan until crispy.",
    searchTags: ["el salvador", "pupusas", "curtido", "central america", "cheese"]
  },
  {
    recipeId: "cr-gallo-pinto",
    title: "Costa Rican Gallo Pinto",
    alternateName: "Spotted Rooster Rice and Beans",
    country: "Costa Rica",
    countryCode: "CR",
    continent: "North America",
    region: "Central America",
    cuisine: "Costa Rican",
    description: "Flavorful Costa Rican breakfast of stir-fried rice and black beans seasoned with the famous sweet and tangy Salsa Lizano, sweet peppers, cilantro, and fried eggs.",
    culturalBackground: 'Gallo Pinto ("spotted rooster") gets its poetic name from the speckled appearance of dark beans against white rice. It is the culinary heartbeat of the Costa Rican "Pura Vida" lifestyle.',
    mealType: "Breakfast",
    categories: ["Breakfast", "Rice", "Vegetarian"],
    dietaryTags: ["Vegetarian", "Gluten-Free", "Dairy-Free Optional"],
    allergens: ["Eggs"],
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Skillet"],
    ingredients: [
      { name: "Day-old cooked white rice", amount: 3, unit: "cups" },
      { name: "Cooked black beans with some broth", amount: 2, unit: "cups" },
      { name: "Salsa Lizano (or Worcestershire sauce mix)", amount: 3, unit: "tbsp" },
      { name: "Red bell pepper", amount: 1, unit: "medium", notes: "Finely chopped" },
      { name: "Yellow onion", amount: 1, unit: "medium", notes: "Finely chopped" },
      { name: "Fresh cilantro", amount: 0.5, unit: "cup", notes: "Chopped" },
      { name: "Eggs", amount: 4, unit: "whole", notes: "Fried sunny side up" },
      { name: "Fried sweet plantains (Pl\xE1tano maduro)", amount: 1, unit: "plantain" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Saut\xE9 chopped onion and red bell pepper in butter/oil until softened and aromatic (4 mins).", timerMinutes: 4 },
      { stepNumber: 2, instruction: "Add black beans and 1/3 cup bean broth. Stir in Salsa Lizano and simmer for 3 minutes.", timerMinutes: 3 },
      { stepNumber: 3, instruction: "Add cold cooked rice, tossing gently to coat all grains evenly in the bean broth and sauce until speckled brown.", timerMinutes: 5 },
      { stepNumber: 4, instruction: "Fold in fresh chopped cilantro in the final 30 seconds and remove from heat." },
      { stepNumber: 5, instruction: "Plate alongside fried eggs, fried ripe plantains, sliced avocado, and a slab of salty Turrialba cheese." }
    ],
    substitutions: [
      { ingredient: "Salsa Lizano", substitute: "Equal parts Worcestershire sauce, 1/2 tsp cumin, and 1 tsp brown sugar" }
    ],
    cookingTips: ["Using day-old chilled rice ensures the grains soak up the dark bean broth without turning into mush."],
    servingSuggestions: "Serve with strong Costa Rican coffee brewed through a chorreador cloth dripper.",
    storageInstructions: "Refrigerate up to 4 days; reheats easily.",
    searchTags: ["costa rica", "gallo pinto", "rice and beans", "breakfast", "pura vida"]
  }
];

// src/data/starterRecipesPart3.ts
var STARTER_RECIPES_PART3 = [
  // ==================== SOUTH AMERICA (7 RECIPES) ====================
  {
    recipeId: "pe-ceviche-clasico",
    title: "Peruvian Ceviche Cl\xE1sico",
    alternateName: "Ceviche Peruano Tradicional",
    country: "Peru",
    countryCode: "PE",
    continent: "South America",
    region: "Andes & Pacific Coast",
    cuisine: "Peruvian",
    description: "Ultra-fresh raw sea bass cured in tangy tiger\u2019s milk (leche de tigre), red onions, and rocoto chili, served with sweet potato (camote) and giant corn (choclo).",
    culturalBackground: "Peru\u2019s national heritage dish, celebrated on National Ceviche Day every June 28th. Originally cured for hours by pre-Inca Moche fishermen with fermented fruit juice, modern lime curing takes just 3 to 5 minutes to keep fish tender.",
    mealType: "Lunch",
    categories: ["Seafood", "Raw", "National Dish"],
    dietaryTags: ["Gluten-Free", "Dairy-Free", "Pescatarian"],
    allergens: ["Fish"],
    prepTime: 20,
    cookTime: 0,
    totalTime: 20,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 3,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Chilled glass or ceramic bowl", "Sharp knife"],
    ingredients: [
      { name: "Sashimi-grade sea bass, flounder or corvina", amount: 600, unit: "g", notes: "Cut into 3/4-inch cubes" },
      { name: "Fresh lime juice", amount: 0.75, unit: "cup", notes: "Gently hand-squeezed to avoid bitter oils" },
      { name: "Red onion", amount: 1, unit: "large", notes: "Sliced paper-thin and rinsed in ice water" },
      { name: "Aji Limo or Habanero chili", amount: 1, unit: "pepper", notes: "Finely minced" },
      { name: "Fresh cilantro leaves", amount: 3, unit: "tbsp", notes: "Finely chopped" },
      { name: "Garlic and ginger paste", amount: 1, unit: "tsp", notes: "For leche de tigre" },
      { name: "Boiled sweet potato (Camote)", amount: 2, unit: "medium", notes: "Thick sliced" },
      { name: "Peruvian giant corn (Choclo) or sweet corn", amount: 1, unit: "cup", notes: "Boiled" },
      { name: "Cancha (toasted Peruvian corn kernels)", amount: 0.5, unit: "cup" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Rub the inside of a chilled glass bowl with a halved cut of Aji Limo chili and a garlic clove for subtle fragrance." },
      { stepNumber: 2, instruction: "Place cold cubed fish in the bowl. Season with fine sea salt and toss gently; salt firms the flesh fibers." },
      { stepNumber: 3, instruction: "Add minced aji chili, cilantro, garlic-ginger paste, and ice cubes. Pour over fresh lime juice and toss for 2 minutes." },
      { stepNumber: 4, instruction: "Add drained crispy red onion strips. Let cure for 3-5 minutes until the exterior turns milky white but the center remains translucent and silky." },
      { stepNumber: 5, instruction: "Discard ice cubes. Plate immediately with thick rounds of boiled sweet potato, choclo corn, and crunchy cancha corn." }
    ],
    substitutions: [
      { ingredient: "Corvina or sea bass", substitute: "Halibut, red snapper, or fresh scallops" },
      { ingredient: "Aji Limo", substitute: "Red habanero or Fresno chili" }
    ],
    cookingTips: ["Do not squeeze limes too hard; pressing the bitter rind ruins the bright flavor of the leche de tigre."],
    servingSuggestions: "Drink the remaining milky cure juice (Leche de Tigre) directly from the bowl \u2014 considered an invigorating elixir in Peru.",
    storageInstructions: "Must be eaten immediately upon mixing.",
    searchTags: ["peru", "ceviche", "seafood", "raw", "lime", "leche de tigre"]
  },
  {
    recipeId: "ar-asado-chimichurri",
    title: "Argentinian Flank Steak with Chimichurri",
    alternateName: "Asado con Chimichurri Criollo",
    country: "Argentina",
    countryCode: "AR",
    continent: "South America",
    region: "Pampas / Southern Cone",
    cuisine: "Argentinian",
    description: "Charred, juicy grilled steak rubbed with coarse sal parrillera, bathed in a vibrant herbaceous sauce of fresh parsley, oregano, garlic, red wine vinegar, and extra virgin olive oil.",
    culturalBackground: "The Asado is Argentina\u2019s premier cultural ritual \u2014 bringing families and friends together for Sunday afternoons centered around the roaring wood fire of the Parrilla grill and the craft of the Asador.",
    mealType: "Dinner",
    categories: ["Beef", "Grill", "Argentinian Classics"],
    dietaryTags: ["Gluten-Free", "Dairy-Free"],
    allergens: [],
    prepTime: 15,
    cookTime: 15,
    totalTime: 30,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Cast-iron grill pan or charcoal grill", "Cutting board"],
    ingredients: [
      { name: "Flank steak or Skirt steak (Vacio or Entra\xF1a)", amount: 900, unit: "g", notes: "Brought to room temperature" },
      { name: "Coarse sea salt (Sal parrillera)", amount: 2, unit: "tbsp" },
      { name: "Fresh Italian flat-leaf parsley", amount: 1, unit: "cup", notes: "Finely minced" },
      { name: "Fresh oregano leaves", amount: 2, unit: "tbsp", notes: "Minced" },
      { name: "Garlic cloves", amount: 4, unit: "cloves", notes: "Finely minced" },
      { name: "Red wine vinegar", amount: 0.25, unit: "cup" },
      { name: "Extra virgin olive oil", amount: 0.5, unit: "cup" },
      { name: "Red pepper flakes (Aj\xED molido)", amount: 1, unit: "tsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make Chimichurri: Combine minced parsley, oregano, garlic, red wine vinegar, olive oil, aji molido, salt, and black pepper in a jar. Rest at room temp for 30 minutes." },
      { stepNumber: 2, instruction: "Dry the steak thoroughly and coat generously with coarse sal parrillera." },
      { stepNumber: 3, instruction: "Heat grill or cast-iron skillet to smoking hot. Sear steak for 4-5 minutes per side for medium-rare.", timerMinutes: 9 },
      { stepNumber: 4, instruction: "Transfer to cutting board, tent with foil, and rest for 8 minutes to allow savory juices to redistribute." },
      { stepNumber: 5, instruction: "Slice steak thinly against the grain at a 45-degree angle. Spoon vibrant green chimichurri generously over top." }
    ],
    substitutions: [
      { ingredient: "Flank steak", substitute: "Ribeye steak, sirloin flap, or thick grilled portobello caps" },
      { ingredient: "Aji molido", substitute: "Crushed red pepper flakes" }
    ],
    cookingTips: ["Always cut against the grain; slicing perpendicular to meat fibers produces exceptionally tender steak."],
    servingSuggestions: "Serve with grilled provoleta cheese, charred red bell peppers, and a glass of Malbec wine.",
    storageInstructions: "Chimichurri keeps 1 week refrigerated; flavors deepen.",
    searchTags: ["argentina", "asado", "steak", "chimichurri", "grill", "pampas"]
  },
  {
    recipeId: "br-feijoada",
    title: "Brazilian Feijoada Completa",
    alternateName: "Traditional Black Bean & Smoked Pork Stew",
    country: "Brazil",
    countryCode: "BR",
    continent: "South America",
    region: "South America",
    cuisine: "Brazilian",
    description: "Brazil\u2019s revered national stew of slow-cooked black beans simmered with smoked pork ribs, carne seca (cured beef), calabresa sausage, and bacon, served with farofa, collards, and orange slices.",
    culturalBackground: "The culinary crown of Brazil, traditionally cooked in giant clay pots on Saturdays for festive gatherings. Feijoada brings together indigenous cassava farofa, Portuguese stewing methods, and African culinary traditions.",
    mealType: "Dinner",
    categories: ["Pork", "Stews", "National Dish"],
    dietaryTags: ["Gluten-Free", "Dairy-Free"],
    allergens: [],
    prepTime: 30,
    cookTime: 120,
    totalTime: 150,
    servings: 8,
    difficulty: "Medium",
    spiceLevel: 1,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large heavy stockpot or pressure cooker"],
    ingredients: [
      { name: "Dried black beans (feij\xE3o preto)", amount: 500, unit: "g", notes: "Soaked overnight" },
      { name: "Smoked pork ribs", amount: 400, unit: "g", notes: "Cut into individual ribs" },
      { name: "Smoked Calabresa or lingui\xE7a sausage", amount: 300, unit: "g", notes: "Sliced thick" },
      { name: "Bacon or pork belly", amount: 200, unit: "g", notes: "Cubed" },
      { name: "Yellow onions and garlic", amount: 2, unit: "onions", notes: "Finely diced" },
      { name: "Dried bay leaves", amount: 3, unit: "pieces" },
      { name: "Toasted cassava flour (Farofa)", amount: 1, unit: "cup", notes: "For serving" },
      { name: "Collard greens (Couve a mineira)", amount: 1, unit: "bunch", notes: "Shredded and saut\xE9ed" },
      { name: "Fresh oranges", amount: 2, unit: "oranges", notes: "Sliced into wheels" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "In a large pot, brown diced bacon until fat renders. Add smoked ribs and sliced sausage; brown on all sides (8 mins).", timerMinutes: 8 },
      { stepNumber: 2, instruction: "Add diced onions and garlic to the rendered pork fat; cook until golden and fragrant." },
      { stepNumber: 3, instruction: "Add soaked black beans, bay leaves, and cover with 8 cups of water. Bring to a boil, then reduce heat to low.", timerMinutes: 10 },
      { stepNumber: 4, instruction: "Simmer uncovered on low heat for 1.5 to 2 hours until beans are creamy and meats are falling off the bone.", timerMinutes: 100 },
      { stepNumber: 5, instruction: "Take a ladle of cooked beans, mash against side of the pot or in a bowl, and stir back into the stew to thicken into a rich glossy black gravy.", timerMinutes: 5 }
    ],
    substitutions: [
      { ingredient: "Calabresa sausage", substitute: "Smoked andouille or kielbasa" },
      { ingredient: "Smoked ribs", substitute: "Smoked ham hocks or turkey bacon" }
    ],
    cookingTips: ["Mashing a cup of the soft beans back into the pot is the secret to feijoada\u2019s legendary velvety texture."],
    servingSuggestions: "Serve with fluffy white rice, garlicky saut\xE9ed collards, buttery toasted farofa, and fresh orange slices (the acid aids digestion).",
    storageInstructions: "Freezes well up to 3 months; re-heats even tastier.",
    searchTags: ["brazil", "feijoada", "black beans", "pork", "rio de janeiro"]
  },
  {
    recipeId: "co-bandeja-paisa",
    title: "Colombian Bandeja Paisa",
    alternateName: "Paisa Platter with Chicharr\xF3n & Arepa",
    country: "Colombia",
    countryCode: "CO",
    continent: "South America",
    region: "Andes",
    cuisine: "Colombian (Antioquia)",
    description: "The bountiful national feast of Antioquia: Crispy pork belly chicharr\xF3n, grilled flank steak, seasoned red beans, white rice, fried plantain, fried egg, arepa, and avocado.",
    culturalBackground: "Originated as fuel for Antioquian peasant farmers (arrieros) working long days traversing the rugged coffee-growing Andes mountains.",
    mealType: "Lunch",
    categories: ["Pork", "Platters", "Comfort Food"],
    dietaryTags: ["Gluten-Free"],
    allergens: ["Eggs"],
    prepTime: 25,
    cookTime: 45,
    totalTime: 70,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Skillet for chicharr\xF3n", "Large serving platters (bandejas)"],
    ingredients: [
      { name: "Pork belly strip", amount: 500, unit: "g", notes: 'Scored into "accordion" fingers, seasoned with baking soda and salt for ultra-crisp skin' },
      { name: "Cooked Colombian red beans (Cargamanto)", amount: 2, unit: "cups", notes: "Simmered with hogao sauce" },
      { name: "Ground beef or grilled skirt steak", amount: 400, unit: "g" },
      { name: "Chorizo links", amount: 4, unit: "links" },
      { name: "Eggs", amount: 4, unit: "whole", notes: "Fried sunny side up" },
      { name: "Sweet ripe plantains (Maduros)", amount: 2, unit: "plantains", notes: "Fried golden" },
      { name: "White corn arepas", amount: 4, unit: "pieces" },
      { name: "Hass avocado", amount: 1, unit: "large", notes: "Sliced into quarters" },
      { name: "Hogao sauce (tomato, scallion, cumin)", amount: 1, unit: "cup" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Simmer pork belly strip in 1 inch of water with salt until water evaporates, then let it fry in its own rendered lard until blistered and crunchy (chicharr\xF3n).", timerMinutes: 25 },
      { stepNumber: 2, instruction: "Cook ground beef with half the hogao sauce (saut\xE9ed scallions and tomatoes) until browned and savory." },
      { stepNumber: 3, instruction: "Grill chorizos until browned and blistered." },
      { stepNumber: 4, instruction: "Fry sweet plantains until caramelized and soft. Fry eggs sunny-side up with runny yolks." },
      { stepNumber: 5, instruction: "Assemble the monumental platter: mound white rice in center, surround with beans, beef, crispy chicharr\xF3n, chorizo, arepa, plantain, avocado, and crown with the fried egg." }
    ],
    substitutions: [
      { ingredient: "Cargamanto beans", substitute: "Red kidney beans or pinto beans" },
      { ingredient: "Pork belly", substitute: "Thick cut bacon" }
    ],
    cookingTips: ["Rubbing the skin of the pork belly with a pinch of baking soda creates unforgettable bubbly crispness."],
    servingSuggestions: "Traditionally enjoyed with an ice-cold Colombian beer or fresh aguapanela with lime.",
    storageInstructions: "Store components in separate containers up to 3 days.",
    searchTags: ["colombia", "bandeja paisa", "chicharron", "beans", "medellin"]
  },
  {
    recipeId: "cl-pastel-de-choclo",
    title: "Chilean Pastel de Choclo",
    alternateName: "Chilean Sweet Corn & Beef Casserole",
    country: "Chile",
    countryCode: "CL",
    continent: "South America",
    region: "Central Valley",
    cuisine: "Chilean",
    description: "Savory layered casserole with seasoned ground beef and chicken (pino), black olives, raisins, and hard-boiled eggs beneath a creamy, caramelized sweet-corn and basil crust.",
    culturalBackground: "Chile\u2019s ultimate summer comfort meal. It marries the Spanish pino meat filling with indigenous sweet corn (choclo) pureed with fragrant fresh sweet basil.",
    mealType: "Dinner",
    categories: ["Casserole", "Comfort Food", "Beef"],
    dietaryTags: ["Gluten-Free"],
    allergens: ["Dairy", "Eggs"],
    prepTime: 25,
    cookTime: 45,
    totalTime: 70,
    servings: 6,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Clay greda baking dishes or 9x13-inch casserole dish", "Blender"],
    ingredients: [
      { name: "Sweet corn kernels (fresh or frozen)", amount: 5, unit: "cups" },
      { name: "Fresh sweet basil leaves", amount: 1, unit: "cup", notes: "Blended with corn" },
      { name: "Milk and butter", amount: 0.5, unit: "cup", notes: "For corn puree" },
      { name: "Ground beef", amount: 500, unit: "g" },
      { name: "Roast chicken pieces", amount: 2, unit: "cups", notes: "Shredded" },
      { name: "Yellow onions", amount: 2, unit: "large", notes: "Finely chopped" },
      { name: "Black Kalamata olives and raisins", amount: 0.5, unit: "cup", notes: "Each" },
      { name: "Hard-boiled eggs", amount: 3, unit: "whole", notes: "Quartered" },
      { name: "Powdered sugar", amount: 1, unit: "tbsp", notes: "Sprinkled on top for caramelization" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make the Pino filling: Saut\xE9 onions in oil until sweet (10 mins). Add ground beef, cumin, paprika, salt, and pepper; cook until savory." },
      { stepNumber: 2, instruction: "Blend corn kernels, fresh basil, and milk until smooth." },
      { stepNumber: 3, instruction: "Melt butter in a saucepan, add corn puree, and cook over medium heat stirring constantly until thick and glossy (10 mins).", timerMinutes: 10 },
      { stepNumber: 4, instruction: "In baking dish, spread the beef pino filling. Scatter shredded chicken, raisins, black olives, and hard-boiled egg quarters on top." },
      { stepNumber: 5, instruction: "Cover completely with the creamy corn puree. Dust lightly with powdered sugar. Bake at 200\xB0C (400\xB0F) for 30 mins until the top is bubbly and golden browned.", timerMinutes: 30 }
    ],
    substitutions: [
      { ingredient: "Fresh corn", substitute: "Frozen sweet corn kernels thawed" },
      { ingredient: "Ground beef", substitute: "Plant-based ground meat or saut\xE9ed mushrooms" }
    ],
    cookingTips: ["Blending fresh basil leaves into the sweet corn paste is the signature secret of authentic Chilean taste."],
    servingSuggestions: "Serve directly from traditional Chilean clay dishes with a side of Chilean tomato and onion salad (Ensalada Chilena).",
    storageInstructions: "Refrigerate up to 4 days.",
    searchTags: ["chile", "pastel de choclo", "corn casserole", "beef", "santiago"]
  },
  {
    recipeId: "ve-arepas-reina",
    title: "Venezuelan Arepas Reina Pepiada",
    alternateName: "Curvy Queen Avocado Chicken Arepas",
    country: "Venezuela",
    countryCode: "VE",
    continent: "South America",
    region: "Northern Coast",
    cuisine: "Venezuelan",
    description: "Warm, golden, crusty cornmeal arepas split and generously stuffed with creamy shredded chicken, ripe Hass avocado, fresh cilantro, lime, and mayonnaise.",
    culturalBackground: 'Created in Caracas in 1955 by the Alvarez brothers to honor Susana Duijm, the first Venezuelan and Latin American woman to win Miss World ("Reina Pepiada" translates to "Curvy Queen").',
    mealType: "Lunch",
    categories: ["Sandwiches", "Poultry", "Street Food"],
    dietaryTags: ["Gluten-Free", "Dairy-Free Optional"],
    allergens: ["Eggs"],
    prepTime: 20,
    cookTime: 15,
    totalTime: 35,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Budare or cast-iron skillet", "Baking sheet"],
    ingredients: [
      { name: "Pre-cooked white cornmeal (Harina P.A.N.)", amount: 2.5, unit: "cups" },
      { name: "Warm water", amount: 2.5, unit: "cups" },
      { name: "Poached chicken breast", amount: 400, unit: "g", notes: "Shredded fine" },
      { name: "Ripe Hass avocados", amount: 2, unit: "large", notes: "1 mashed, 1 diced" },
      { name: "Mayonnaise", amount: 3, unit: "tbsp" },
      { name: "Red onion", amount: 0.25, unit: "cup", notes: "Finely minced" },
      { name: "Fresh cilantro and lime juice", amount: 2, unit: "tbsp", notes: "Each" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make the arepa dough: In a bowl, combine warm water and salt. Gradually pour in Harina P.A.N. while kneading until smooth and crack-free. Rest 5 mins." },
      { stepNumber: 2, instruction: "Divide dough into 4 balls and gently flatten into 1/2-inch thick discs with smooth rounded edges." },
      { stepNumber: 3, instruction: "Cook arepas on a lightly oiled hot cast-iron skillet for 5 mins per side until a golden crust forms, then finish in a 180\xB0C (350\xB0F) oven for 10 mins until they sound hollow when tapped.", timerMinutes: 15 },
      { stepNumber: 4, instruction: "Make Reina Pepiada filling: Mix shredded chicken, mashed avocado, diced avocado, mayonnaise, minced onion, lime juice, cilantro, salt, and pepper." },
      { stepNumber: 5, instruction: "Slice hot arepas three-quarters of the way through like a pocket, spread butter inside, and stuff with mounds of creamy chicken avocado salad." }
    ],
    substitutions: [
      { ingredient: "Harina P.A.N.", substitute: "Must use pre-cooked corn flour (masarepa); regular cornmeal will not work" },
      { ingredient: "Mayonnaise", substitute: "Greek yogurt for a lighter filling" }
    ],
    cookingTips: ["When an arepa sounds hollow when tapped with your knuckle, the interior has puffed and cooked through perfectly."],
    servingSuggestions: "Serve with fresh tropical fruit juices like passionfruit (maracuy\xE1) or guan\xE1bana.",
    storageInstructions: "Reina filling keeps 2 days with avocado pit to prevent browning; reheat arepas in toaster.",
    searchTags: ["venezuela", "arepas", "reina pepiada", "avocado", "chicken", "caracas"]
  },
  {
    recipeId: "bo-saltenas",
    title: "Bolivian Salte\xF1as de Carne",
    alternateName: "Bolivian Sweet-Dough Meat Pastries",
    country: "Bolivia",
    countryCode: "BO",
    continent: "South America",
    region: "Andes",
    cuisine: "Bolivian",
    description: "Braided golden baked pastries filled with rich beef stew (recado) made with gelatin so the filling turns into a piping-hot savory soup inside the pastry.",
    culturalBackground: 'Created in 19th-century Potos\xED, Bolivia by Josefa Escurrechea, an exile from Salta, Argentina. The locals affectionately named them "Salte\xF1as" after her hometown.',
    mealType: "Lunch",
    categories: ["Pastries", "Beef", "Street Food"],
    dietaryTags: [],
    allergens: ["Gluten", "Eggs"],
    prepTime: 40,
    cookTime: 20,
    totalTime: 60,
    servings: 6,
    difficulty: "Advanced",
    spiceLevel: 2,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Baking sheet", "Pastry brush", "Rolling pin"],
    ingredients: [
      { name: "All-purpose flour", amount: 3.5, unit: "cups" },
      { name: "Butter and sugar", amount: 0.5, unit: "cup", notes: "For sweet golden crust" },
      { name: "Achiote oil (annatto)", amount: 2, unit: "tbsp", notes: "Gives yellow-orange color" },
      { name: "Beef sirloin or chuck", amount: 400, unit: "g", notes: "Finely minced by hand" },
      { name: "Beef broth with unflavored gelatin", amount: 2, unit: "cups", notes: "Chilled into a gel for easy filling" },
      { name: "Potatoes and peas", amount: 1, unit: "cup", notes: "Cooked small dice" },
      { name: "Aji amarillo chili paste", amount: 2, unit: "tbsp" },
      { name: "Kalamata olives & hard-boiled eggs", amount: 6, unit: "pieces", notes: "For filling centers" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Make the Recado filling: Cook minced beef, onions, aji amarillo, and spices. Stir in hot gelatin broth, peas, and potatoes. Chill overnight until set solid like jelly." },
      { stepNumber: 2, instruction: "Make dough: Cut butter and warm achiote water into flour and sugar. Knead into firm dough, roll thin discs." },
      { stepNumber: 3, instruction: "Place a scoop of jellied filling, olive, and egg slice in center. Moisten edges, fold up, and repulgue (braid) the top seam tightly." },
      { stepNumber: 4, instruction: "Place upright on baking sheet. Brush with egg wash." },
      { stepNumber: 5, instruction: "Bake at 260\xB0C (500\xB0F) for 15-18 minutes until pastry blisters and turns golden. In the oven heat, the gelatin melts back into rich soup.", timerMinutes: 16 }
    ],
    substitutions: [
      { ingredient: "Aji amarillo", substitute: "Mild yellow chili or smoked paprika" },
      { ingredient: "Gelatin", substitute: "Agar agar for plant-based jelly" }
    ],
    cookingTips: ["Eating a salte\xF1a without spilling the hot soup inside is an art: hold it upright, bite the top tip, and sip the broth."],
    servingSuggestions: "Serve with spicy llajwa salsa in the mid-morning, as is traditional in La Paz.",
    storageInstructions: "Best eaten fresh from the oven.",
    searchTags: ["bolivia", "saltenas", "empanada", "beef", "andes", "soup pastry"]
  },
  // ==================== OCEANIA (7 RECIPES) ====================
  {
    recipeId: "au-meat-pie",
    title: "Australian Classic Meat Pie",
    alternateName: "Aussie Beef Mince Pie",
    country: "Australia",
    countryCode: "AU",
    continent: "Oceania",
    region: "Australasia",
    cuisine: "Australian",
    description: "Individual shortcrust pastry pie filled with rich minced beef, onion, Worcestershire sauce, and dark beef gravy beneath a flaky, golden puff pastry lid.",
    culturalBackground: "The ultimate Australian cultural icon, famously consumed by the millions at AFL footy matches, bakeries, and roadhouses with a generous dollop of tomato sauce (ketchup) on top.",
    mealType: "Lunch",
    categories: ["Pies", "Beef", "Comfort Food"],
    dietaryTags: [],
    allergens: ["Dairy", "Gluten", "Eggs"],
    prepTime: 25,
    cookTime: 35,
    totalTime: 60,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["4 individual pie tins (approx 4-inch / 10cm)", "Rolling pin", "Pastry brush"],
    ingredients: [
      { name: "Lean ground beef", amount: 500, unit: "g" },
      { name: "Shortcrust pastry sheets", amount: 2, unit: "sheets", notes: "For sturdy pie bases" },
      { name: "Puff pastry sheets", amount: 2, unit: "sheets", notes: "For flaky lids" },
      { name: "Yellow onion", amount: 1, unit: "large", notes: "Finely minced" },
      { name: "Beef broth", amount: 1.5, unit: "cups" },
      { name: "Worcestershire sauce and Vegemite", amount: 1, unit: "tbsp", notes: "Vegemite adds deep umami color" },
      { name: "Tomato paste", amount: 2, unit: "tbsp" },
      { name: "Cornstarch", amount: 2, unit: "tbsp", notes: "Dissolved in 2 tbsp cold water" },
      { name: "Egg wash", amount: 1, unit: "egg", notes: "Beaten for brushing" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Brown ground beef and onion in a skillet. Stir in tomato paste, Worcestershire, Vegemite, black pepper, and beef broth; simmer 10 mins.", timerMinutes: 10 },
      { stepNumber: 2, instruction: "Stir in cornstarch slurry and simmer for 2 minutes until filling is thick and glossy. Cool completely.", timerMinutes: 2 },
      { stepNumber: 3, instruction: "Line greased pie tins with shortcrust pastry. Spoon cooled beef filling into each shell." },
      { stepNumber: 4, instruction: "Brush rim with egg wash, drape puff pastry lid over, trim excess, and crimp edges with a fork. Cut a small steam vent on top." },
      { stepNumber: 5, instruction: "Bake at 200\xB0C (400\xB0F) for 25-30 minutes until the puff pastry lid is golden brown, puffed, and flaky.", timerMinutes: 28 }
    ],
    substitutions: [
      { ingredient: "Vegemite", substitute: "Marmite or 1 tsp dark soy sauce" },
      { ingredient: "Ground beef", substitute: "Slow-braised beef chunks or lentils & mushrooms" }
    ],
    cookingTips: ["Ensure meat filling is completely cooled before filling the pie shells; hot filling makes bottom pastry soggy."],
    servingSuggestions: "Serve piping hot with a generous swirl of classic Aussie tomato sauce (ketchup) on top.",
    storageInstructions: "Baked pies can be frozen and reheated in oven at 180\xB0C for 20 mins.",
    searchTags: ["australia", "meat pie", "beef", "footy", "pastry", "aussie"]
  },
  {
    recipeId: "nz-pavlova",
    title: "New Zealand Pavlova with Kiwi & Passionfruit",
    alternateName: "Kiwi Summer Pavlova",
    country: "New Zealand",
    countryCode: "NZ",
    continent: "Oceania",
    region: "Australasia",
    cuisine: "New Zealand",
    description: "Crisp, delicate meringue crust with a soft, cloud-like marshmallow center, crowned with chantilly whipped cream, fresh sliced kiwifruit, and passionfruit pulp.",
    culturalBackground: "Named in honor of Russian ballerina Anna Pavlova during her 1926 tour of Australasia. In New Zealand, the Pavlova is the irreplaceable centerpiece of Christmas dinner and summer celebrations.",
    mealType: "Dessert",
    categories: ["Desserts", "Baking", "Celebrations"],
    dietaryTags: ["Gluten-Free", "Vegetarian"],
    allergens: ["Eggs", "Dairy"],
    prepTime: 20,
    cookTime: 75,
    totalTime: 95,
    servings: 8,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Stand mixer with whisk attachment", "Baking sheet with parchment paper", "Spatula"],
    ingredients: [
      { name: "Fresh egg whites", amount: 4, unit: "large", notes: "Room temperature, zero yolk traces" },
      { name: "Superfine castor sugar", amount: 1.25, unit: "cups" },
      { name: "Cornstarch", amount: 1, unit: "tbsp" },
      { name: "White vinegar or lemon juice", amount: 1, unit: "tsp", notes: "Stabilizes marshmallow interior" },
      { name: "Pure vanilla extract", amount: 1, unit: "tsp" },
      { name: "Heavy whipping cream", amount: 1.5, unit: "cups", notes: "Whipped to soft peaks" },
      { name: "Fresh green kiwifruits", amount: 3, unit: "fruits", notes: "Peeled and sliced" },
      { name: "Fresh passionfruit pulp", amount: 0.3, unit: "cup" },
      { name: "Fresh strawberries or berries", amount: 1, unit: "cup" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Whip room-temperature egg whites on medium-high until soft peaks form. Gradually add castor sugar 1 tablespoon at a time over 8 minutes until glossy and stiff.", timerMinutes: 8 },
      { stepNumber: 2, instruction: "Gently fold in cornstarch, white vinegar, and vanilla extract with a rubber spatula." },
      { stepNumber: 3, instruction: "Pile onto parchment paper in an 8-inch disc, smoothing sides upward to create support walls." },
      { stepNumber: 4, instruction: "Bake at 120\xB0C (250\xB0F) for 75 minutes. Turn off the oven, prop the door ajar with a wooden spoon, and let pavlova cool completely inside for 2 hours to prevent cracking.", timerMinutes: 75 },
      { stepNumber: 5, instruction: "Before serving, pile whipped cream on top, and scatter with sliced kiwifruit, berries, and passionfruit pulp." }
    ],
    substitutions: [
      { ingredient: "Passionfruit", substitute: "Mango coulis or pomegranate seeds" },
      { ingredient: "Castor sugar", substitute: "Granulated sugar pulsed in blender for 15 seconds" }
    ],
    cookingTips: ["Letting the baked pavlova cool slowly inside the turned-off oven guarantees that fragile crisp shell and pillowy marshmallow heart."],
    servingSuggestions: "Serve chilled on a festive cake stand.",
    storageInstructions: "Un-topped meringue can be stored in an airtight tin for 3 days; assemble with cream right before serving.",
    searchTags: ["new zealand", "pavlova", "meringue", "kiwifruit", "dessert"]
  },
  {
    recipeId: "fj-kokoda",
    title: "Fijian Kokoda",
    alternateName: "Fiji Coconut Milk Lime Ceviche",
    country: "Fiji",
    countryCode: "FJ",
    continent: "Oceania",
    region: "Melanesia",
    cuisine: "Fijian",
    description: "Fresh local mahi-mahi or walu cured in fresh lime juice, then mixed with thick rich coconut cream (lolo), diced tomatoes, scallions, cucumbers, and bird\u2019s eye chili.",
    culturalBackground: "Kokoda (pronounced ko-kon-da) is Fiji\u2019s cherished national seafood dish, traditionally served inside carved halved coconut shells or clam shells at feasts and village gatherings.",
    mealType: "Lunch",
    categories: ["Seafood", "Raw", "Island Cuisine"],
    dietaryTags: ["Gluten-Free", "Dairy-Free", "Pescatarian"],
    allergens: ["Fish"],
    prepTime: 20,
    cookTime: 0,
    totalTime: 20,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 2,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Glass bowl", "Coconut shells for serving (optional)"],
    ingredients: [
      { name: "Fresh firm white fish fillets (Mahi Mahi, Walu, or Snapper)", amount: 500, unit: "g", notes: "Cut into 1/2-inch cubes" },
      { name: "Fresh lime juice", amount: 0.75, unit: "cup", notes: "For curing" },
      { name: "Pure coconut cream (first press)", amount: 1, unit: "cup", notes: "Chilled" },
      { name: "Roma tomatoes", amount: 2, unit: "medium", notes: "Diced" },
      { name: "Cucumber", amount: 0.5, unit: "medium", notes: "Peeled, seeded, and diced" },
      { name: "Scallions", amount: 3, unit: "stalks", notes: "Finely sliced" },
      { name: "Bird\u2019s eye chilies (Bongo chili)", amount: 2, unit: "peppers", notes: "Minced" },
      { name: "Sea salt", amount: 1, unit: "tsp" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Place diced fish cubes in a glass bowl, cover with fresh lime juice and 1 tsp salt. Mix gently and chill for 6-8 hours (or overnight) until fish turns opaque white." },
      { stepNumber: 2, instruction: "Drain and discard the lime juice completely from the cured fish cubes." },
      { stepNumber: 3, instruction: "Gently fold in diced tomatoes, cucumber, scallions, and minced chili peppers." },
      { stepNumber: 4, instruction: "Pour thick chilled coconut cream over the fish and vegetables, tossing until coated in luscious white sauce." },
      { stepNumber: 5, instruction: "Spoon into chilled bowls or coconut shells and garnish with lime wedges and fresh coriander." }
    ],
    substitutions: [
      { ingredient: "Mahi Mahi", substitute: "Sea bass, halibut, or yellowfin tuna" },
      { ingredient: "Coconut cream", substitute: "Rich full-fat canned coconut milk" }
    ],
    cookingTips: ["Draining the lime juice before adding the coconut cream ensures the coconut cream doesn\u2019t curdle and stays silky smooth."],
    servingSuggestions: "Serve with crispy taro or cassava chips for scooping.",
    storageInstructions: "Keeps 24 hours refrigerated; best consumed cold.",
    searchTags: ["fiji", "kokoda", "ceviche", "coconut", "island", "seafood"]
  },
  {
    recipeId: "ws-panikeke",
    title: "Samoan Panikeke",
    alternateName: "Round Banana Fritters",
    country: "Samoa",
    countryCode: "WS",
    continent: "Oceania",
    region: "Polynesia",
    cuisine: "Samoan",
    description: "Golden, crispy-fried round banana pancake balls with a sweet, pillowy, aromatic banana cake interior.",
    culturalBackground: "Panikeke are beloved across the Samoan islands and Polynesian diaspora, enjoyed hot from roadside stalls, after Sunday church, or with afternoon tea.",
    mealType: "Breakfast",
    categories: ["Breakfast", "Street Food", "Vegetarian"],
    dietaryTags: ["Vegetarian", "Dairy-Free"],
    allergens: ["Gluten"],
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Deep pot or Dutch oven for frying", "Slotted spoon or spider strainer"],
    ingredients: [
      { name: "Overripe bananas", amount: 3, unit: "large", notes: "Mashed smooth" },
      { name: "All-purpose flour", amount: 2, unit: "cups" },
      { name: "Sugar", amount: 0.5, unit: "cup" },
      { name: "Baking powder", amount: 2, unit: "tsp" },
      { name: "Vanilla extract", amount: 1, unit: "tsp" },
      { name: "Water", amount: 0.5, unit: "cup", notes: "To form thick batter" },
      { name: "Vegetable oil for deep frying", amount: 1, unit: "liter" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "In a bowl, mash bananas thoroughly with sugar and vanilla extract until smooth." },
      { stepNumber: 2, instruction: "Sift in flour and baking powder. Add water gradually, stirring with a wooden spoon into a thick, dropping-consistency batter." },
      { stepNumber: 3, instruction: "Heat oil to 175\xB0C (350\xB0F). Scoop batter with an oiled spoon or squeeze through your fist to form round balls." },
      { stepNumber: 4, instruction: "Drop into hot oil in batches. Fry for 4-5 minutes, turning occasionally so they brown evenly into golden orbs.", timerMinutes: 5 },
      { stepNumber: 5, instruction: "Remove with slotted spoon and drain on paper towels. Serve hot and crisp." }
    ],
    substitutions: [
      { ingredient: "All-purpose flour", substitute: "Gluten-free 1-to-1 baking blend" },
      { ingredient: "Bananas", substitute: "Pumpkin puree or ripe mango puree" }
    ],
    cookingTips: ["Oil temperature is key: if too hot, exterior burns before the inside cooks; if too cold, they absorb excess oil."],
    servingSuggestions: "Dust with cinnamon sugar or powdered sugar, or enjoy plain with hot Samoan cocoa (Koko Samoa).",
    storageInstructions: "Best eaten fresh and hot within 1 hour.",
    searchTags: ["samoa", "panikeke", "banana fritters", "polynesia", "doughnuts"]
  },
  {
    recipeId: "us-hi-poke",
    title: "Hawaiian Ahi Tuna Poke Bowl",
    alternateName: "Traditional Hawaiian Poke",
    country: "United States (Hawaii)",
    countryCode: "US-HI",
    continent: "Oceania",
    region: "Polynesia",
    cuisine: "Hawaiian",
    description: "Sashimi-grade yellowfin ahi tuna cubes dressed in toasted sesame oil, tamari soy sauce, inamona (roasted kukui nut), scallions, limu seaweed, and sweet Maui onion over warm sushi rice.",
    culturalBackground: 'In the Hawaiian language, "Poke" means to cut crosswise into pieces. Ancient Native Hawaiians rubbed reef fish with sea salt, seaweed (limu), and inamona.',
    mealType: "Lunch",
    categories: ["Seafood", "Raw", "Grain Bowls"],
    dietaryTags: ["Dairy-Free", "Gluten-Free Optional"],
    allergens: ["Fish", "Soy", "Sesame"],
    prepTime: 15,
    cookTime: 0,
    totalTime: 15,
    servings: 2,
    difficulty: "Easy",
    spiceLevel: 1,
    estimatedCost: "Special Occasion",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Sharp chef knife", "Mixing bowl"],
    ingredients: [
      { name: "Sashimi-grade Yellowfin Ahi Tuna", amount: 450, unit: "g", notes: "Cut into 3/4-inch cubes" },
      { name: "Soy sauce or Tamari", amount: 2.5, unit: "tbsp" },
      { name: "Pure toasted sesame oil", amount: 1.5, unit: "tbsp" },
      { name: "Sweet Maui onion or sweet Vidalia", amount: 0.25, unit: "cup", notes: "Finely sliced" },
      { name: "Scallions (green parts)", amount: 0.3, unit: "cup", notes: "Thinly sliced" },
      { name: "Ogo or Wakame seaweed", amount: 2, unit: "tbsp", notes: "Rehydrated and chopped" },
      { name: "Toasted sesame seeds", amount: 1, unit: "tbsp" },
      { name: "Hawaiian red sea salt (Alaea) or coarse sea salt", amount: 0.5, unit: "tsp" },
      { name: "Warm steamed sushi rice", amount: 2, unit: "bowls" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Cube chilled tuna with a clean stroke of a razor-sharp knife to keep glistening clean edges." },
      { stepNumber: 2, instruction: "In a bowl, combine cubed tuna, sliced sweet onion, scallions, and rehydrated seaweed." },
      { stepNumber: 3, instruction: "Pour over soy sauce, toasted sesame oil, Hawaiian sea salt, and toasted sesame seeds." },
      { stepNumber: 4, instruction: "Gently fold with a spoon until each piece of tuna glistens with seasoning." },
      { stepNumber: 5, instruction: "Scoop warm steamed rice into bowls and top with cold seasoned poke, sliced avocado, and pickled ginger." }
    ],
    substitutions: [
      { ingredient: "Ahi tuna", substitute: "Atlantic salmon or firm tofu cubes" },
      { ingredient: "Soy sauce", substitute: "Tamari or coconut aminos" }
    ],
    cookingTips: ["Keep the tuna chilled until the moment you dress it so the temperature contrast with the warm rice is heavenly."],
    servingSuggestions: "Serve with spicy sriracha mayo drizzle, crispy furikake, and edamame.",
    storageInstructions: "Best consumed within 6 hours.",
    searchTags: ["hawaii", "poke", "tuna", "raw", "seafood", "bowl"]
  },
  {
    recipeId: "pf-poisson-cru",
    title: "Tahitian Poisson Cru au Lait de Coco",
    alternateName: "Ota Ika / Polynesian Raw Fish Salad",
    country: "French Polynesia (Tahiti)",
    countryCode: "PF",
    continent: "Oceania",
    region: "Polynesia",
    cuisine: "Tahitian",
    description: "Fresh red tuna marinated in fresh lime juice, tossed with crisp cucumber, carrots, sweet tomatoes, and freshly squeezed fragrant coconut milk.",
    culturalBackground: "Poisson Cru is the national dish of Tahiti and French Polynesia, celebrated across every island from Bora Bora to Moorea as a light, refreshing, tropical ocean lunch.",
    mealType: "Lunch",
    categories: ["Seafood", "Raw", "Salads"],
    dietaryTags: ["Gluten-Free", "Dairy-Free", "Pescatarian"],
    allergens: ["Fish"],
    prepTime: 20,
    cookTime: 0,
    totalTime: 20,
    servings: 4,
    difficulty: "Easy",
    spiceLevel: 0,
    estimatedCost: "Moderate",
    image: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Glass bowl", "Colander"],
    ingredients: [
      { name: "Fresh Yellowfin Tuna (or Albacore)", amount: 500, unit: "g", notes: "Cut into 1/2-inch cubes" },
      { name: "Fresh lime juice", amount: 0.5, unit: "cup" },
      { name: "Fresh coconut milk", amount: 1, unit: "cup" },
      { name: "Cucumber", amount: 1, unit: "small", notes: "Diced" },
      { name: "Carrot", amount: 1, unit: "small", notes: "Finely grated" },
      { name: "Tomatoes", amount: 2, unit: "medium", notes: "Deseeded and diced" },
      { name: "Scallions", amount: 2, unit: "stalks", notes: "Chopped" },
      { name: "Sea salt and white pepper", amount: 1, unit: "tsp", notes: "To taste" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Place diced tuna in a bowl with lime juice and salt. Toss for just 20-30 seconds until the edges whiten slightly." },
      { stepNumber: 2, instruction: "Immediately drain excess lime juice in a colander so the tuna does not over-cure." },
      { stepNumber: 3, instruction: "In a fresh bowl, combine the drained tuna with diced cucumber, grated carrot, tomatoes, and scallions." },
      { stepNumber: 4, instruction: "Pour cold coconut milk over the salad, season with white pepper and a pinch of salt." },
      { stepNumber: 5, instruction: "Serve chilled immediately, ideally in a halved fresh coconut shell." }
    ],
    substitutions: [
      { ingredient: "Yellowfin Tuna", substitute: "Mahi mahi, salmon, or cooked shrimp" }
    ],
    cookingTips: ["Unlike ceviche which cures for minutes, Tahitian Poisson Cru uses a very brief flash-cure to keep the tuna silky and sashimi-soft."],
    servingSuggestions: "Serve with steamed white rice or baked taro root.",
    storageInstructions: "Must be eaten fresh on the same day.",
    searchTags: ["tahiti", "poisson cru", "coconut", "tuna", "polynesia"]
  },
  {
    recipeId: "pg-mumu-chicken",
    title: "Papua New Guinean Mumu Chicken",
    alternateName: "Earth Oven Coconut Chicken & Root Vegetables",
    country: "Papua New Guinea",
    countryCode: "PG",
    continent: "Oceania",
    region: "Melanesia",
    cuisine: "Papua New Guinean",
    description: "Succulent chicken pieces slow-steamed with sweet potato (kaukau), taro root, leafy greens, and rich coconut milk wrapped in banana leaf parcels.",
    culturalBackground: "The Mumu is Papua New Guinea\u2019s traditional earth oven feast where hot volcanic river stones are placed in pits lined with banana leaves for weddings and celebrations.",
    mealType: "Dinner",
    categories: ["Poultry", "Slow Cooked", "Traditional"],
    dietaryTags: ["Gluten-Free", "Dairy-Free"],
    allergens: [],
    prepTime: 25,
    cookTime: 50,
    totalTime: 75,
    servings: 4,
    difficulty: "Medium",
    spiceLevel: 0,
    estimatedCost: "Budget",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    isStarter: true,
    isPremium: false,
    offlineAvailable: true,
    equipment: ["Large Dutch oven or roasting pan", "Banana leaves or parchment paper and foil"],
    ingredients: [
      { name: "Chicken thighs and drumsticks", amount: 800, unit: "g" },
      { name: "Sweet potato (kaukau)", amount: 2, unit: "tubers", notes: "Peeled and chunked" },
      { name: "Taro root or cassava", amount: 1, unit: "tuber", notes: "Peeled and chunked" },
      { name: "Spinach or pumpkin leaves (Aibika)", amount: 3, unit: "cups" },
      { name: "Pure coconut milk", amount: 1.5, unit: "cups" },
      { name: "Fresh ginger and garlic", amount: 2, unit: "tbsp", notes: "Grated" },
      { name: "Banana leaves (or foil/parchment)", amount: 2, unit: "large sheets", notes: "Wilted over flame to make pliable" }
    ],
    preparationSteps: [
      { stepNumber: 1, instruction: "Pass banana leaves quickly over an open flame to soften them so they fold without tearing." },
      { stepNumber: 2, instruction: "Line a Dutch oven with banana leaves, letting excess hang over the sides." },
      { stepNumber: 3, instruction: "Layer chunks of sweet potato and taro at base, followed by chicken pieces, grated ginger, garlic, and fresh leafy greens." },
      { stepNumber: 4, instruction: "Pour seasoned coconut milk all over. Fold banana leaves tightly over the top and cover with the heavy pot lid." },
      { stepNumber: 5, instruction: "Bake in oven at 180\xB0C (350\xB0F) or simmer over low heat on stovetop for 50 minutes until roots are buttery soft and chicken is falling off bone.", timerMinutes: 50 }
    ],
    substitutions: [
      { ingredient: "Taro root", substitute: "Yukon Gold potatoes or plantains" },
      { ingredient: "Banana leaves", substitute: "Baking parchment lined with aluminum foil" }
    ],
    cookingTips: ["Banana leaves impart a delicate smoky, herbaceous tea-like aroma that defines authentic Mumu cooking."],
    servingSuggestions: "Unwrap the steaming banana leaf parcel right at the table for a dramatic, fragrant presentation.",
    storageInstructions: "Refrigerate up to 3 days.",
    searchTags: ["papua new guinea", "mumu", "coconut chicken", "banana leaf", "oceania"]
  }
];

// src/data/premiumCatalogSummaries.ts
function generatePremiumSummaries() {
  return generatePremiumRecipes();
}

// src/data/recipes.ts
var ALL_STARTER_RECIPES = [
  ...STARTER_RECIPES,
  ...STARTER_RECIPES_PART2,
  ...STARTER_RECIPES_PART3
];
var ALL_PREMIUM_RECIPES = generatePremiumSummaries();
var ALL_RECIPES = [
  ...ALL_STARTER_RECIPES,
  ...ALL_PREMIUM_RECIPES
];
var catalogStats = {
  recipeCount: ALL_RECIPES.length,
  starterCount: ALL_STARTER_RECIPES.length,
  premiumCount: ALL_PREMIUM_RECIPES.length,
  countryCount: new Set(ALL_RECIPES.map((r) => r.country)).size,
  continentCount: new Set(ALL_RECIPES.map((r) => r.continent)).size
};
var RECIPES_BY_ID = new Map(
  ALL_RECIPES.map((r) => [r.recipeId, r])
);

// api/apiHandler.ts
var PRIMARY_ADMIN_EMAIL = "blessing.waydiva@gmail.com";
var geminiApiKey = process.env.GEMINI_API_KEY || "";
var aiClient = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
}
async function verifyUserToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
      return null;
    }
    try {
      if (adminAuth) {
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded && decoded.uid) {
          return {
            uid: decoded.uid,
            email: decoded.email,
            provider: decoded.firebase?.sign_in_provider
          };
        }
      }
    } catch (verifyErr) {
      console.warn("adminAuth.verifyIdToken failed in serverless env, parsing token claims directly:", verifyErr);
    }
    const parts = token.split(".");
    if (parts.length === 3) {
      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
      const nowSec = Math.floor(Date.now() / 1e3);
      if (payload && (payload.sub || payload.user_id) && (payload.exp ? payload.exp > nowSec : true)) {
        return {
          uid: payload.sub || payload.user_id,
          email: payload.email,
          provider: payload.firebase?.sign_in_provider
        };
      }
    }
    return null;
  } catch (err) {
    console.error("Error in verifyUserToken:", err);
    return null;
  }
}
async function verifyAdminToken(req) {
  try {
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return { isAdmin: false };
    }
    const email = (verifiedUser.email || "").toLowerCase();
    const isPrimaryAdmin = email === PRIMARY_ADMIN_EMAIL.toLowerCase();
    let hasAdminClaim = false;
    try {
      if (adminAuth) {
        const userRecord = await adminAuth.getUser(verifiedUser.uid);
        hasAdminClaim = userRecord.customClaims?.admin === true;
      }
    } catch {
    }
    if (isPrimaryAdmin || hasAdminClaim) {
      return { isAdmin: true, email: verifiedUser.email, uid: verifiedUser.uid };
    }
    return { isAdmin: false, email: verifiedUser.email, uid: verifiedUser.uid };
  } catch {
    return { isAdmin: false };
  }
}
var inMemoryEntitlements = /* @__PURE__ */ new Map();
async function getAuthoritativeEntitlement(userId, userEmail) {
  if (!userId && !userEmail) {
    return { tier: "FREE", source: "default" };
  }
  const normalizedId = (userId || "").toLowerCase();
  const normalizedEmail = (userEmail || "").toLowerCase();
  if (normalizedId === PRIMARY_ADMIN_EMAIL.toLowerCase() || normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return { tier: "PREMIUM", source: "purchase" };
  }
  if (normalizedId && inMemoryEntitlements.has(normalizedId)) {
    return inMemoryEntitlements.get(normalizedId);
  }
  if (normalizedEmail && inMemoryEntitlements.has(normalizedEmail)) {
    return inMemoryEntitlements.get(normalizedEmail);
  }
  if (userId && adminDb) {
    try {
      const docRef = adminDb.collection("entitlements").doc(userId);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data();
        const tier = data?.tier?.toUpperCase() || "FREE";
        if (tier === "PREMIUM" || tier === "TEST_PREMIUM") {
          const res = {
            tier,
            source: data.source || "default",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            approvedAt: data.approvedAt,
            approvedBy: data.approvedBy,
            paymentReference: data.paymentReference
          };
          inMemoryEntitlements.set(normalizedId, res);
          return res;
        }
      }
    } catch {
    }
  }
  if (normalizedEmail && adminDb) {
    try {
      const emailDocRef = adminDb.collection("entitlements").doc(normalizedEmail);
      const emailSnap = await emailDocRef.get();
      if (emailSnap.exists) {
        const data = emailSnap.data();
        const tier = data?.tier?.toUpperCase() || "FREE";
        if (tier === "PREMIUM" || tier === "TEST_PREMIUM") {
          const res = {
            tier,
            source: data.source || "reviewer_pass",
            createdAt: data.createdAt || data.grantedAt,
            updatedAt: data.updatedAt
          };
          inMemoryEntitlements.set(normalizedEmail, res);
          return res;
        }
      }
    } catch {
    }
  }
  return { tier: "FREE", source: "default" };
}
async function setAuthoritativeEntitlement(userId, entitlement) {
  if (!userId) return;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const normalizedTier = entitlement.tier?.toUpperCase() || "FREE";
  const normalizedId = userId.toLowerCase();
  const fullEntitlement = {
    tier: normalizedTier,
    source: entitlement.source || "default",
    updatedAt: now,
    createdAt: entitlement.createdAt || now
  };
  if (entitlement.approvedAt) fullEntitlement.approvedAt = entitlement.approvedAt;
  if (entitlement.approvedBy) fullEntitlement.approvedBy = entitlement.approvedBy;
  if (entitlement.paymentReference) fullEntitlement.paymentReference = entitlement.paymentReference;
  inMemoryEntitlements.set(normalizedId, fullEntitlement);
  if (adminDb) {
    try {
      const docRef = adminDb.collection("entitlements").doc(userId);
      await docRef.set(fullEntitlement, { merge: true });
    } catch {
    }
    try {
      await adminDb.collection("users").doc(userId).set(
        {
          entitlement: {
            tier: normalizedTier.toLowerCase(),
            source: fullEntitlement.source,
            validUntil: "never",
            grantedAt: now
          },
          updatedAt: now
        },
        { merge: true }
      );
    } catch {
    }
  }
}
var inMemoryAiUsage = /* @__PURE__ */ new Map();
async function checkAiQuota(userId, isPremium) {
  const maxMonthly = isPremium ? 100 : 5;
  const maxDaily = isPremium ? 10 : 5;
  const now = /* @__PURE__ */ new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const currentDay = now.toISOString().slice(0, 10);
  const safeId = userId || "anonymous_user";
  const docId = `${safeId}_${currentMonth}`;
  if (adminDb) {
    try {
      const usageRef = adminDb.collection("aiUsage").doc(docId);
      const snap = await usageRef.get();
      let todayCount2 = 0;
      let monthCount2 = 0;
      if (snap.exists) {
        const data = snap.data() || {};
        const lastDay = data.lastDay || currentDay;
        monthCount2 = typeof data.monthCount === "number" ? data.monthCount : 0;
        todayCount2 = lastDay === currentDay && typeof data.todayCount === "number" ? data.todayCount : 0;
      }
      if (todayCount2 >= maxDaily) {
        return {
          allowed: false,
          reason: "daily_limit",
          message: `You've reached today's fair-use limit (${maxDaily} questions). Local cooking intelligence remains unlimited.`
        };
      }
      if (monthCount2 >= maxMonthly) {
        return {
          allowed: false,
          reason: "monthly_limit",
          message: isPremium ? "You've reached this month's AI Chef fair-use allowance (100 responses)." : "You've used your 5 free AI Chef trial questions. Unlock the World (\u20A62,500 once) for 100 monthly responses!"
        };
      }
      return {
        allowed: true,
        currentUsage: {
          todayCount: todayCount2,
          monthCount: monthCount2,
          remainingMonth: Math.max(0, maxMonthly - monthCount2)
        }
      };
    } catch {
    }
  }
  const memUsage = inMemoryAiUsage.get(docId) || { todayCount: 0, monthCount: 0, lastDay: currentDay };
  const todayCount = memUsage.lastDay === currentDay ? memUsage.todayCount : 0;
  const monthCount = memUsage.monthCount;
  if (todayCount >= maxDaily) {
    return {
      allowed: false,
      reason: "daily_limit",
      message: `You've reached today's fair-use limit (${maxDaily} questions).`
    };
  }
  if (monthCount >= maxMonthly) {
    return {
      allowed: false,
      reason: "monthly_limit",
      message: isPremium ? "You've reached this month's AI Chef fair-use allowance (100 responses)." : "You've used your 5 free AI Chef trial questions. Unlock the World (\u20A62,500 once) for 100 monthly responses!"
    };
  }
  return {
    allowed: true,
    currentUsage: {
      todayCount,
      monthCount,
      remainingMonth: Math.max(0, maxMonthly - monthCount)
    }
  };
}
async function incrementAiUsage(userId, isPremium) {
  const maxMonthly = isPremium ? 100 : 5;
  const now = /* @__PURE__ */ new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const currentDay = now.toISOString().slice(0, 10);
  const safeId = userId || "anonymous_user";
  const docId = `${safeId}_${currentMonth}`;
  if (adminDb) {
    try {
      const usageRef = adminDb.collection("aiUsage").doc(docId);
      return await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(usageRef);
        let todayCount = 0;
        let monthCount = 0;
        let lastDay = currentDay;
        if (snap.exists) {
          const data = snap.data() || {};
          lastDay = data.lastDay || currentDay;
          monthCount = typeof data.monthCount === "number" ? data.monthCount : 0;
          todayCount = lastDay === currentDay && typeof data.todayCount === "number" ? data.todayCount : 0;
        }
        const newToday2 = lastDay === currentDay ? todayCount + 1 : 1;
        const newMonth2 = monthCount + 1;
        tx.set(
          usageRef,
          {
            userId: safeId,
            month: currentMonth,
            lastDay: currentDay,
            todayCount: newToday2,
            monthCount: newMonth2,
            updatedAt: now.toISOString()
          },
          { merge: true }
        );
        inMemoryAiUsage.set(docId, { todayCount: newToday2, monthCount: newMonth2, lastDay: currentDay });
        return {
          todayCount: newToday2,
          monthCount: newMonth2,
          remainingMonth: Math.max(0, maxMonthly - newMonth2)
        };
      });
    } catch {
    }
  }
  const memUsage = inMemoryAiUsage.get(docId) || { todayCount: 0, monthCount: 0, lastDay: currentDay };
  const newToday = memUsage.lastDay === currentDay ? memUsage.todayCount + 1 : 1;
  const newMonth = memUsage.monthCount + 1;
  inMemoryAiUsage.set(docId, { todayCount: newToday, monthCount: newMonth, lastDay: currentDay });
  return {
    todayCount: newToday,
    monthCount: newMonth,
    remainingMonth: Math.max(0, maxMonthly - newMonth)
  };
}
async function recordRecipeQuestionInsight(recipeId, recipeTitle, category, question) {
  const safeRecipeId = recipeId || "global";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (adminDb) {
    try {
      const docRef = adminDb.collection("recipeInsights").doc(safeRecipeId);
      await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        let totalQuestions = 0;
        let questionCategories = {};
        let topQuestions = [];
        if (snap.exists) {
          const data = snap.data() || {};
          totalQuestions = data.totalQuestions || 0;
          questionCategories = data.questionCategories || {};
          topQuestions = data.topQuestions || [];
        }
        totalQuestions++;
        questionCategories[category] = (questionCategories[category] || 0) + 1;
        topQuestions.unshift({
          question: question.slice(0, 140),
          category,
          timestamp: now
        });
        if (topQuestions.length > 15) {
          topQuestions = topQuestions.slice(0, 15);
        }
        tx.set(
          docRef,
          {
            recipeId: safeRecipeId,
            recipeTitle: recipeTitle || "Global Dish",
            totalQuestions,
            questionCategories,
            topQuestions,
            lastUpdated: now
          },
          { merge: true }
        );
      });
    } catch {
    }
  }
}
var PRIMARY_AI_MODEL = "gemini-2.5-flash";
var FALLBACK_AI_MODEL = "gemini-3-flash";
async function generateWithFallback(client, prompt, config) {
  try {
    return await client.models.generateContent({
      model: PRIMARY_AI_MODEL,
      contents: prompt,
      config
    });
  } catch (primaryErr) {
    const errMsg = primaryErr?.message || String(primaryErr);
    const isTransient = errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("ResourceExhausted");
    if (isTransient) {
      try {
        return await client.models.generateContent({
          model: FALLBACK_AI_MODEL,
          contents: prompt,
          config
        });
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw primaryErr;
  }
}
function generateGroundedFallbackResponse(question, recipeContext) {
  if (!recipeContext) {
    return `Here is authentic culinary guidance: Preheat cookware properly, season in gradual layers, and balance rich notes with fresh citrus or acid. You can scale servings and view step-by-step techniques directly in your kitchen!`;
  }
  const qLower = question.toLowerCase();
  if (qLower.includes("substitute") || qLower.includes("replace") || qLower.includes("instead")) {
    if (recipeContext.substitutions && recipeContext.substitutions.length > 0) {
      return `For **${recipeContext.title}**, here are proven culinary substitutions:

${recipeContext.substitutions.map(
        (s) => typeof s === "string" ? `\u2022 ${s}` : `\u2022 **${s.ingredient}**: Use ${s.substitute} (${s.ratio || "1:1 ratio"})`
      ).join("\n")}`;
    }
    return `For **${recipeContext.title}**, adjust aromatics or finish with lemon juice or mild vinegar to preserve culinary balance.`;
  }
  if (qLower.includes("time") || qLower.includes("how long") || qLower.includes("done")) {
    return `For **${recipeContext.title}**, total cooking time is approximately **${recipeContext.totalTime || 30} minutes**. Watch for fragrant aromas and steady bubbling as your primary doneness indicators.`;
  }
  if (recipeContext.cookingTips && recipeContext.cookingTips.length > 0) {
    return `Chef guidance for **${recipeContext.title}** (${recipeContext.country}):

${recipeContext.cookingTips.map((t) => `\u2022 ${t}`).join("\n")}`;
  }
  return `For **${recipeContext.title}** (${recipeContext.country}), maintain steady cooking heat and taste as you season. You can scale servings or start step timers directly in the recipe!`;
}
async function handleAskChef(req, res) {
  try {
    const { userQuestion, recipeId } = req.body;
    if (!userQuestion || typeof userQuestion !== "string" || !userQuestion.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return res.status(401).json({
        error: "auth_required",
        message: "Create an account to use AI Chef."
      });
    }
    const userId = verifiedUser.uid;
    const userEmail = verifiedUser.email || "";
    const entitlement = await getAuthoritativeEntitlement(userId, userEmail);
    const isPremium = entitlement.tier === "PREMIUM" || entitlement.tier === "TEST_PREMIUM";
    const quotaCheck = await checkAiQuota(userId, isPremium);
    if (!quotaCheck.allowed) {
      return res.status(403).json({
        limitReached: true,
        error: quotaCheck.reason,
        message: quotaCheck.message
      });
    }
    let canonicalRecipe = null;
    if (recipeId) {
      canonicalRecipe = ALL_STARTER_RECIPES.find((r) => r.recipeId === recipeId);
      if (!canonicalRecipe) {
        const full = getFullPremiumRecipeById(recipeId);
        if (full) {
          if (isPremium) {
            canonicalRecipe = full;
          } else {
            canonicalRecipe = {
              title: full.title,
              country: full.country,
              cuisine: full.cuisine,
              continent: full.continent,
              description: full.description
            };
          }
        }
      }
    }
    let category = "technique";
    const qLower = userQuestion.toLowerCase();
    if (qLower.includes("substitute") || qLower.includes("replace") || qLower.includes("instead of")) category = "substitutions";
    else if (qLower.includes("hard") || qLower.includes("soft") || qLower.includes("mushy") || qLower.includes("texture")) category = "texture";
    else if (qLower.includes("salt") || qLower.includes("sour") || qLower.includes("acid") || qLower.includes("sweet") || qLower.includes("fix")) category = "troubleshooting";
    else if (qLower.includes("time") || qLower.includes("long") || qLower.includes("done") || qLower.includes("minutes")) category = "cooking_time";
    else if (qLower.includes("spicy") || qLower.includes("pepper") || qLower.includes("hot")) category = "spice_level";
    else if (qLower.includes("oven") || qLower.includes("stove") || qLower.includes("pan") || qLower.includes("pot")) category = "equipment";
    recordRecipeQuestionInsight(
      recipeId || "global",
      canonicalRecipe?.title || "Global Dish",
      category,
      userQuestion
    );
    let replyText = "";
    let geminiSuccess = false;
    if (aiClient) {
      let systemInstruction = `You are the culinary chef mentor of "Palate & Place", an authentic global cookbook and food journal.
Core positioning: "Discover places through food."
Role: Warm, culturally respectful, authoritative, and practical.
Tone: Encouraging, direct, and clear. Avoid fluff. Provide complete culinary advice with clean formatting. Ensure all sentences and thoughts are fully completed.`;
      if (canonicalRecipe) {
        systemInstruction += `

AUTHENTIC CANONICAL DISH CONTEXT:
Title: ${canonicalRecipe.title} (${canonicalRecipe.country}, ${canonicalRecipe.continent || ""})
Servings: ${canonicalRecipe.servings || 4}
Ingredients: ${JSON.stringify(canonicalRecipe.ingredients || [])}
Instructions: ${JSON.stringify(canonicalRecipe.preparationSteps || [])}
Substitutions: ${JSON.stringify(canonicalRecipe.substitutions || [])}
Chef Tips: ${JSON.stringify(canonicalRecipe.cookingTips || [])}
Spice Level: ${canonicalRecipe.spiceLevel || 1} / 5

RULES:
1. Stay strictly anchored to this authentic dish and genuine culinary technique.
2. If troubleshooting an issue, offer practical home kitchen fixes.
3. Finish your response completely.`;
      }
      const prompt = `Cook's question: "${userQuestion}"`;
      try {
        const response = await generateWithFallback(aiClient, prompt, {
          systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 2500
        });
        if (response && response.text && response.text.trim()) {
          replyText = response.text;
          geminiSuccess = true;
        }
      } catch (geminiErr) {
      }
    }
    let finalUsage = quotaCheck.currentUsage;
    if (geminiSuccess && replyText) {
      try {
        finalUsage = await incrementAiUsage(userId, isPremium);
      } catch {
      }
    } else {
      replyText = generateGroundedFallbackResponse(userQuestion, canonicalRecipe);
    }
    return res.json({
      success: true,
      handledByGemini: geminiSuccess,
      category,
      response: replyText,
      usage: finalUsage
    });
  } catch (error) {
    const fallback = generateGroundedFallbackResponse(req.body?.userQuestion || "");
    return res.json({
      success: true,
      handledByGemini: false,
      category: "general",
      response: fallback
    });
  }
}
async function handleSmartSearch(req, res) {
  try {
    const { query, recipes = [] } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required." });
    }
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return res.status(401).json({
        error: "auth_required",
        message: "Sign in to use AI Smart Search."
      });
    }
    const entitlement = await getAuthoritativeEntitlement(verifiedUser.uid, verifiedUser.email);
    const isPremium = entitlement.tier === "PREMIUM" || entitlement.tier === "TEST_PREMIUM";
    const quotaCheck = await checkAiQuota(verifiedUser.uid, isPremium);
    if (!quotaCheck.allowed) {
      return res.status(403).json({
        limitReached: true,
        error: quotaCheck.reason,
        message: quotaCheck.message
      });
    }
    if (!aiClient) {
      return res.status(503).json({ error: "AI client not initialized" });
    }
    const systemInstruction = `You are the culinary search analyzer for Palate & Place.
Analyze the user's culinary query and match the top recipe IDs from the candidate list.
Respond ONLY with JSON:
{
  "matchedRecipeIds": ["string"],
  "intentLabel": "Short tag (e.g. 'Spicy Comfort Foods')",
  "explanation": "1-sentence summary"
}`;
    const prompt = `Query: "${query}"
Candidates: ${JSON.stringify(recipes.slice(0, 50))}`;
    const response = await aiClient.models.generateContent({
      model: PRIMARY_AI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { matchedRecipeIds: [], intentLabel: "Curated Matches" };
    }
    await incrementAiUsage(verifiedUser.uid, isPremium);
    return res.json({
      success: true,
      matchedRecipeIds: parsed.matchedRecipeIds || [],
      intentLabel: parsed.intentLabel || "Curated Selection",
      explanation: parsed.explanation || `Matches for "${query}"`
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to process search" });
  }
}
async function handleGetRecipe(req, res) {
  const urlParts = req.url.split("?");
  const query = new URLSearchParams(urlParts[1] || "");
  const recipeId = query.get("id") || req.params?.id;
  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required." });
  }
  const starter = ALL_STARTER_RECIPES.find((r) => r.recipeId === recipeId);
  if (starter) {
    return res.json({ recipe: starter });
  }
  const recipe = getFullPremiumRecipeById(recipeId);
  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }
  const verifiedUser = await verifyUserToken(req);
  const userId = verifiedUser?.uid || "";
  const userEmail = verifiedUser?.email || "";
  const entitlement = await getAuthoritativeEntitlement(userId, userEmail);
  const isEntitled = entitlement.tier === "PREMIUM" || entitlement.tier === "TEST_PREMIUM";
  if (!isEntitled) {
    return res.status(403).json({
      locked: true,
      recipeId: recipe.recipeId,
      title: recipe.title,
      country: recipe.country,
      description: recipe.description,
      message: "Unlock the World (\u20A62,500 once) for full access to this authentic dish."
    });
  }
  return res.json({ recipe });
}
async function handleDownloadBatch(req, res) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const entitlement = await getAuthoritativeEntitlement(verifiedUser.uid, verifiedUser.email);
  const isEntitled = entitlement.tier === "PREMIUM" || entitlement.tier === "TEST_PREMIUM";
  if (!isEntitled) {
    return res.status(403).json({
      error: "Entitlement required",
      message: "Offline download of the World Collection requires an unlocked account."
    });
  }
  const requestedIds = Array.isArray(req.body?.recipeIds) && req.body.recipeIds.length > 0 ? req.body.recipeIds : getAllFullPremiumRecipes().map((r) => r.recipeId);
  const recipes = getFullPremiumRecipesBatch(requestedIds);
  return res.json({
    success: true,
    count: recipes.length,
    recipes
  });
}
async function handlePaystackInit(req, res) {
  try {
    const verifiedUser = await verifyUserToken(req);
    if (!verifiedUser) {
      return res.status(401).json({
        error: "Please sign in with Google or Email before unlocking so your World Pass is securely linked to your account.",
        authRequired: true
      });
    }
    const email = verifiedUser.email || "customer@palateandplace.app";
    const userId = verifiedUser.uid;
    const reference = `PNP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    let rawKey = (process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "").trim().replace(/^["']|["']$/g, "");
    let keyError = null;
    if (rawKey.startsWith("sk_")) {
      keyError = "Secret Key configured in PAYSTACK_PUBLIC_KEY. Please provide Public Key ('pk_...').";
      rawKey = "";
    }
    const isRealKey = /^(pk_live_|pk_test_)[a-zA-Z0-9]{20,}$/.test(rawKey);
    return res.json({
      success: true,
      amount: 25e4,
      currency: "NGN",
      reference,
      email,
      publicKey: isRealKey ? rawKey : "",
      isLiveKey: isRealKey,
      keyError,
      metadata: {
        userId,
        appName: "Palate & Place",
        plan: "world_unlock_lifetime",
        price: 2500
      }
    });
  } catch (err) {
    console.error("Error in handlePaystackInit:", err);
    return res.status(500).json({
      error: "Could not initiate payment session: " + (err?.message || "Internal server error"),
      message: err?.message
    });
  }
}
async function handlePaystackVerify(req, res) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const { reference } = req.body || {};
  if (!reference) {
    return res.status(400).json({ error: "Missing payment reference" });
  }
  const secretKey = (process.env.PAYSTACK_SECRET_KEY || process.env.VITE_PAYSTACK_SECRET_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!secretKey || secretKey.length < 15 || secretKey.includes("YOUR_PAYSTACK_SECRET_KEY")) {
    return res.status(500).json({
      verified: false,
      error: "Paystack Secret Key not configured on server",
      message: "Server cannot securely verify the transaction with Paystack. Please configure PAYSTACK_SECRET_KEY."
    });
  }
  try {
    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const paystackRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      }
    });
    const data = await paystackRes.json();
    if (!data.status || data.data?.status !== "success") {
      return res.status(400).json({
        verified: false,
        message: data.message || "Payment could not be verified by Paystack"
      });
    }
    const transactionData = data.data;
    if (transactionData.amount !== 25e4 || transactionData.currency !== "NGN") {
      return res.status(400).json({
        verified: false,
        message: "Invalid transaction amount or currency."
      });
    }
    const targetUserId = verifiedUser.uid;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const paymentRecord = {
      userId: targetUserId,
      paystackReference: reference,
      amount: 2500,
      currency: "NGN",
      status: "success",
      createdAt: now,
      verifiedAt: now,
      email: verifiedUser.email || transactionData.customer?.email || ""
    };
    if (adminDb) {
      try {
        await adminDb.collection("payments").doc(reference).set(paymentRecord, { merge: true });
        const premiumEnt = {
          tier: "PREMIUM",
          source: "purchase",
          createdAt: now,
          updatedAt: now,
          paymentReference: reference
        };
        await adminDb.collection("entitlements").doc(targetUserId).set(premiumEnt, { merge: true });
        await adminDb.collection("users").doc(targetUserId).set(
          {
            entitlement: {
              tier: "premium",
              source: "purchase",
              validUntil: "never",
              grantedAt: now
            },
            updatedAt: now
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn("Firestore write warning in handlePaystackVerify:", dbErr);
      }
    }
    return res.json({
      verified: true,
      reference,
      userId: targetUserId,
      entitlement: {
        tier: "premium",
        source: "purchase",
        unlockedAt: now,
        paystackReference: reference
      },
      message: "Palate & Place World Unlock activated!"
    });
  } catch (err) {
    console.error("Paystack verification error:", err);
    return res.status(500).json({
      verified: false,
      message: "Could not communicate with Paystack API: " + err.message
    });
  }
}
async function handlePaystackWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];
  const secretKey = (process.env.PAYSTACK_SECRET_KEY || process.env.VITE_PAYSTACK_SECRET_KEY || "").trim().replace(/^["']|["']$/g, "");
  const rawBody = req.rawBody;
  if (!signature || !secretKey || !rawBody) {
    return res.status(401).json({ error: "Unauthorized: Missing signature or payload" });
  }
  const generatedHash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const hashBuf = Buffer.from(generatedHash);
  if (sigBuf.length !== hashBuf.length || !crypto.timingSafeEqual(sigBuf, hashBuf)) {
    return res.status(401).json({ error: "Unauthorized: Invalid Paystack signature" });
  }
  const event = req.body;
  if (event && event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference;
    const userId = data.metadata?.userId;
    const amount = data.amount;
    if (amount === 25e4 && data.currency === "NGN" && userId) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const paymentRecord = {
        userId,
        paystackReference: reference,
        amount: 2500,
        currency: "NGN",
        status: "success",
        createdAt: now,
        verifiedAt: now,
        email: data.customer?.email || ""
      };
      try {
        if (adminDb) {
          const paymentRef = adminDb.collection("payments").doc(reference);
          await paymentRef.set(paymentRecord, { merge: true });
        }
        await setAuthoritativeEntitlement(userId, {
          tier: "PREMIUM",
          source: "purchase",
          createdAt: now,
          updatedAt: now,
          paymentReference: reference
        });
      } catch (dbErr) {
        console.error("Webhook database persistence error:", dbErr);
      }
    }
  }
  return res.status(200).send("OK");
}
async function handleRequestTestPremium(req, res) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.status(401).json({ error: "Authentication required. Please sign in to submit a reviewer request." });
  }
  const email = (verifiedUser.email || "").trim().toLowerCase();
  const userId = verifiedUser.uid;
  const name = req.body.name || email.split("@")[0] || "Reviewer";
  const requestId = `req-${userId}`;
  const record = {
    id: requestId,
    requestId,
    userId,
    name,
    email,
    requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "PENDING"
  };
  if (adminDb) {
    try {
      await adminDb.collection("premiumRequests").doc(requestId).set(record, { merge: true });
    } catch (err) {
      console.error("Failed to create reviewer request in Firestore:", err);
      return res.status(500).json({ error: "Failed to record reviewer request" });
    }
  }
  return res.json({
    success: true,
    requestId,
    id: requestId,
    message: "Your request to access the World Pass has been submitted to the admin for review"
  });
}
async function handleApproveTestPremium(req, res) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized: Curator credentials required." });
  }
  const requestId = req.body.requestId || req.body.id;
  const email = (req.body.email || "").trim().toLowerCase();
  const targetUserId = req.body.userId || email;
  if (!targetUserId && !email && !requestId) {
    return res.status(400).json({ error: "Target user ID, email, or request ID is missing" });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (adminDb && requestId) {
    try {
      await adminDb.collection("premiumRequests").doc(requestId).set(
        {
          id: requestId,
          requestId,
          status: "APPROVED",
          reviewedAt: now,
          reviewedBy: adminEmail || "curator"
        },
        { merge: true }
      );
    } catch (err) {
      console.debug("Update premiumRequest notice:", err);
    }
  }
  const reviewerEnt = {
    tier: "TEST_PREMIUM",
    source: "reviewer_pass",
    updatedAt: now,
    approvedAt: now,
    approvedBy: adminEmail || "curator"
  };
  if (targetUserId) {
    await setAuthoritativeEntitlement(targetUserId, reviewerEnt);
  }
  if (email && adminDb) {
    try {
      await adminDb.collection("entitlements").doc(email).set(reviewerEnt, { merge: true });
      const userSnap = await adminDb.collection("users").where("email", "==", email).get();
      for (const uDoc of userSnap.docs) {
        await setAuthoritativeEntitlement(uDoc.id, reviewerEnt);
      }
    } catch (err) {
      console.debug("Email entitlement grant notice:", err);
    }
  }
  return res.json({
    success: true,
    message: `Test Premium granted to user ${targetUserId || email}`
  });
}
async function handleRevokeTestPremium(req, res) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized: Curator credentials required." });
  }
  const { requestId, userId } = req.body;
  const targetUserId = userId;
  if (!targetUserId) {
    return res.status(400).json({ error: "Target user ID is missing" });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (adminDb && requestId) {
    try {
      await adminDb.collection("premiumRequests").doc(requestId).set(
        {
          status: "REVOKED",
          reviewedAt: now,
          reviewedBy: adminEmail || "curator"
        },
        { merge: true }
      );
    } catch (err) {
      console.debug("Revoke request notice:", err);
    }
  }
  await setAuthoritativeEntitlement(targetUserId, {
    tier: "FREE",
    source: "revoked",
    updatedAt: now,
    approvedBy: adminEmail || "curator"
  });
  return res.json({
    success: true,
    message: `Test Premium revoked for user ${targetUserId}. Personal history preserved.`
  });
}
async function handleAdminOverview(req, res) {
  const { isAdmin } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized: Curator access required." });
  }
  const requests = [];
  const payments = [];
  const insights = [];
  let totalUsers = 0;
  let premiumUsers = 0;
  let testPremiumUsers = 0;
  let aiTodayTotal = 0;
  let aiMonthTotal = 0;
  const usersNearQuota = [];
  if (adminDb) {
    try {
      const usersSnap = await adminDb.collection("users").get();
      totalUsers = usersSnap.size;
      const requestsSnap = await adminDb.collection("premiumRequests").get();
      requestsSnap.forEach((d) => {
        const data = d.data();
        const safeId = data.id || data.requestId || d.id;
        requests.push({
          ...data,
          id: safeId,
          requestId: safeId
        });
      });
      const paymentsSnap = await adminDb.collection("payments").get();
      paymentsSnap.forEach((d) => {
        payments.push(d.data());
      });
      const entitlementsSnap = await adminDb.collection("entitlements").get();
      entitlementsSnap.forEach((d) => {
        const tier = d.data().tier?.toUpperCase();
        if (tier === "PREMIUM") premiumUsers++;
        if (tier === "TEST_PREMIUM") testPremiumUsers++;
      });
      const insightsSnap = await adminDb.collection("recipeInsights").get();
      insightsSnap.forEach((d) => {
        insights.push(d.data());
      });
      const aiSnap = await adminDb.collection("aiUsage").get();
      aiSnap.forEach((d) => {
        const data = d.data();
        const today = data.todayCount || 0;
        const month = data.monthCount || 0;
        aiTodayTotal += today;
        aiMonthTotal += month;
        if (today >= 8 || month >= 80) {
          usersNearQuota.push({
            userId: data.userId,
            todayCount: today,
            monthCount: month
          });
        }
      });
    } catch (err) {
      console.debug("Admin overview data notice:", err?.message || err);
    }
  }
  const freeUsers = Math.max(totalUsers - premiumUsers - testPremiumUsers, 0);
  return res.json({
    stats: {
      totalUsers: Math.max(totalUsers, premiumUsers + testPremiumUsers + freeUsers),
      freeUsers,
      premiumUsers,
      testPremiumUsers,
      pendingRequests: requests.filter((r) => (r.status || "").toLowerCase() === "pending").length,
      totalPayments: payments.length,
      totalQuestionsLogged: insights.reduce((acc, i) => acc + (i.totalQuestions || 0), 0),
      aiTodayTotal,
      aiMonthTotal,
      usersNearQuotaCount: usersNearQuota.length
    },
    usersNearQuota,
    requests: requests.reverse(),
    payments: payments.reverse(),
    insights
  });
}
async function handleGetEntitlement(req, res) {
  const verifiedUser = await verifyUserToken(req);
  if (!verifiedUser) {
    return res.json({
      entitlement: {
        tier: "free",
        source: "default"
      }
    });
  }
  const entitlement = await getAuthoritativeEntitlement(verifiedUser.uid, verifiedUser.email);
  return res.json({
    entitlement: {
      tier: entitlement.tier.toLowerCase(),
      source: entitlement.source,
      unlockedAt: entitlement.updatedAt,
      paystackReference: entitlement.paymentReference
    }
  });
}
async function handleGetRecipeInsights(req, res) {
  const { isAdmin } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized: Admin access required for raw culinary insights." });
  }
  const insights = [];
  if (adminDb) {
    try {
      const snap = await adminDb.collection("recipeInsights").get();
      snap.forEach((d) => {
        insights.push(d.data());
      });
    } catch (err) {
      console.debug("Recipe insights notice:", err?.message || err);
    }
  }
  return res.json({
    totalInsights: insights.length,
    insights
  });
}
async function handleDevGrantPremium(req, res) {
  const { isAdmin, email: adminEmail } = await verifyAdminToken(req);
  if (!isAdmin) {
    return res.status(403).json({
      error: "Unauthorized",
      message: "Fast dev test access is restricted to verified curator accounts."
    });
  }
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Target userId is required." });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await setAuthoritativeEntitlement(userId, {
    tier: "TEST_PREMIUM",
    source: "dev",
    updatedAt: now,
    approvedAt: now,
    approvedBy: adminEmail || "curator"
  });
  return res.json({
    success: true,
    entitlement: {
      tier: "test_premium",
      source: "dev",
      unlockedAt: now,
      approvedBy: adminEmail || "curator"
    },
    message: `Test Premium activated by administrator ${adminEmail || ""}`
  });
}

// api/serverApp.ts
var app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, x-paystack-signature"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.all(["/api/paystack/initialize", "/paystack/initialize", "*/paystack/initialize"], handlePaystackInit);
app.all(["/api/paystack/verify", "/paystack/verify", "*/paystack/verify"], handlePaystackVerify);
app.all(["/api/paystack/webhook", "/paystack/webhook", "*/paystack/webhook"], handlePaystackWebhook);
app.post(["/api/ai/ask-chef", "/ai/ask-chef", "/api/ask-chef", "/ask-chef", "*/ask-chef"], handleAskChef);
app.post(["/api/chef/smart-search", "/chef/smart-search", "*/smart-search"], handleSmartSearch);
app.get(["/api/recipes", "/recipes", "*/recipes"], handleGetRecipe);
app.post(["/api/recipes/download-batch", "/recipes/download-batch", "*/download-batch"], handleDownloadBatch);
app.get(["/api/entitlements", "/entitlements", "*/entitlements"], handleGetEntitlement);
app.get(["/api/recipe-insights", "/recipe-insights", "*/recipe-insights"], handleGetRecipeInsights);
app.post(["/api/admin/request-test-premium", "/admin/request-test-premium", "*/request-test-premium"], handleRequestTestPremium);
app.post(["/api/admin/approve-test-premium", "/admin/approve-test-premium", "*/approve-test-premium"], handleApproveTestPremium);
app.post(["/api/admin/revoke-test-premium", "/admin/revoke-test-premium", "*/revoke-test-premium"], handleRevokeTestPremium);
app.get(["/api/admin/overview", "/admin/overview", "*/admin/overview"], handleAdminOverview);
app.post(["/api/admin/dev-grant-premium", "/admin/dev-grant-premium", "*/dev-grant-premium"], handleDevGrantPremium);
app.get(["/", "/api", "/api/"], (_req, res) => {
  res.json({
    service: "Palate and Place API",
    status: "online",
    version: "2.0.0",
    endpoints: [
      "/api/paystack/initialize",
      "/api/paystack/verify",
      "/api/paystack/webhook",
      "/api/ai/ask-chef",
      "/api/recipes",
      "/api/entitlements",
      "/api/recipe-insights"
    ]
  });
});
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl || req.url}`,
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl
  });
});
var serverApp_default = app;
export {
  serverApp_default as default
};
