import { Recipe } from '../types/recipe';
import { COUNTRIES_DATABASE, PREMIUM_BLUEPRINTS } from './premiumCatalogData';

const CURATED_IMAGES: Record<string, string> = {
  rice: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  curry: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
  beef: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
  tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
  pastry: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
  grill: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
};

// Generates public metadata summaries for browsing/searching without exposing proprietary recipes in initial JS bundle
export function generatePremiumSummaries(): Recipe[] {
  const summaries: Recipe[] = [];

  // 1. Blueprints summaries
  for (let i = 0; i < PREMIUM_BLUEPRINTS.length; i++) {
    const bp = PREMIUM_BLUEPRINTS[i];
    const country = COUNTRIES_DATABASE.find(c => c.code === bp.countryCode) || COUNTRIES_DATABASE[0];

    summaries.push({
      recipeId: `prem-bp-${i}-${bp.countryCode.toLowerCase()}`,
      title: bp.title,
      alternateName: bp.alternateName,
      country: country.country,
      countryCode: country.code,
      continent: country.continent,
      region: country.region,
      cuisine: country.cuisine,
      description: bp.description,
      culturalBackground: `An authentic culinary specialty representing the heritage and palate of ${country.country}.`,
      mealType: bp.mealType,
      categories: [bp.mealType, 'Premium World Collection'],
      dietaryTags: bp.dietaryTags,
      allergens: bp.allergens,
      // Ingredients & steps are protected behind entitlement verification
      ingredients: [],
      preparationSteps: [],
      prepTime: bp.prepTime,
      cookTime: bp.cookTime,
      totalTime: bp.prepTime + bp.cookTime,
      servings: bp.servings,
      difficulty: bp.difficulty,
      equipment: ['Heavy skillet or pot', 'Chef knife'],
      cookingTips: [],
      substitutions: [],
      servingSuggestions: `Serve freshly prepared following ${country.country} customs.`,
      storageInstructions: 'Refrigerate in airtight container up to 4 days.',
      image: bp.image,
      isStarter: false,
      isPremium: true,
      offlineAvailable: false,
      searchTags: [country.country.toLowerCase(), country.cuisine.toLowerCase(), bp.title.toLowerCase(), country.continent.toLowerCase()],
      spiceLevel: bp.spiceLevel,
      estimatedCost: 'Moderate'
    });
  }

  // 2. Curated country specialties summaries
  const CURATED_LIST: Array<{ code: string; title: string; alt?: string; type: keyof typeof CURATED_IMAGES; meal: any; prep: number; cook: number; spice: any; desc: string }> = [
    // Morocco
    { code: 'MA', title: 'Moroccan Lamb Tagine with Prunes & Almonds', alt: 'Mrouzia Tagine', type: 'curry', meal: 'Dinner', prep: 25, cook: 90, spice: 2, desc: 'Slow-simmered tender lamb shanks scented with ras el hanout, saffron, and sweet caramelized prunes toasted in sesame.' },
    { code: 'MA', title: 'Moroccan Chicken Bastilla (Pastilla)', alt: 'Pastilla au Poulet', type: 'pastry', meal: 'Dinner', prep: 35, cook: 50, spice: 1, desc: 'Spiced shredded saffron chicken, tender onion-egg jam, and crispy warqa pastry dusted with sugar and cinnamon.' },
    { code: 'MA', title: 'Traditional Harira Soup', alt: 'Moroccan Lentil & Chickpea Soup', type: 'soup', meal: 'Dinner', prep: 20, cook: 60, spice: 1, desc: 'Comforting, velvety tomato broth loaded with tender lentils, chickpeas, fresh cilantro, celery, and tiny vermicelli.' },
    { code: 'MA', title: 'Zaalouk Roasted Eggplant & Tomato Dip', alt: 'Salade de Zaalouk', type: 'salad', meal: 'Side Dish', prep: 15, cook: 25, spice: 2, desc: 'Charred, smoky roasted eggplants mashed with juicy garlic-stewed tomatoes, cumin, and extra virgin olive oil.' },
    { code: 'MA', title: 'Moroccan Mint Tea & Gazelle Horns', alt: 'Kaab el Ghazal', type: 'dessert', meal: 'Dessert', prep: 40, cook: 18, spice: 0, desc: 'Delicate crescent pastries stuffed with orange blossom almond paste, paired with fresh spearmint green tea.' },

    // Senegal
    { code: 'SN', title: 'Senegalese Thieboudienne (Ceebu Jën)', alt: 'National Red Fish & Rice', type: 'rice', meal: 'Lunch', prep: 30, cook: 65, spice: 3, desc: 'UNESCO-recognized national treasure: herb-stuffed white grouper, cassava, and vegetables in spiced tomato broken jasmine rice.' },
    { code: 'SN', title: 'Senegalese Yassa Poulet (Onion-Mustard Chicken)', alt: 'Poulet Yassa', type: 'grill', meal: 'Dinner', prep: 25, cook: 45, spice: 2, desc: 'Charcoal-grilled chicken simmered in a mountain of caramelized onions, Dijon mustard, lime juice, and habanero.' },
    { code: 'SN', title: 'Mafé (West African Peanut & Beef Stew)', alt: 'Tigadèguèna', type: 'curry', meal: 'Dinner', prep: 20, cook: 50, spice: 2, desc: 'Rich, comforting braised beef stew cooked in creamy roasted natural peanut butter, sweet potatoes, and smoked paprika.' },
    { code: 'SN', title: 'Pastels de Poisson (Crispy Fish Hand Pies)', alt: 'Pastels Sénégalais', type: 'pastry', meal: 'Lunch', prep: 30, cook: 20, spice: 2, desc: 'Golden, flaky pastry pockets stuffed with spiced flaked white fish, paired with spicy Senegalese rof tomato dipping sauce.' },
    { code: 'SN', title: 'Thiakry (Sweet Millet Couscous & Yogurt Dessert)', alt: 'Degue', type: 'dessert', meal: 'Dessert', prep: 15, cook: 10, spice: 0, desc: 'Steamed nutty millet couscous granules swirled into chilled sweetened vanilla yogurt, condensed milk, and nutmeg.' },

    // Ethiopia
    { code: 'ET', title: 'Ethiopian Doro Wat (Fiery Chicken & Egg Stew)', alt: 'የዶሮ ወጥ', type: 'curry', meal: 'Dinner', prep: 30, cook: 60, spice: 4, desc: 'Ethiopia’s revered national stew: chicken drumsticks simmered in caramelized onions, niter kibbeh spiced butter, and berbere.' },
    { code: 'ET', title: 'Misir Wot (Spicy Red Lentils)', alt: 'የምስር ወጥ', type: 'curry', meal: 'Lunch', prep: 10, cook: 30, spice: 3, desc: 'Split red lentils simmered in caramelized onions, garlic, ginger, and pungent berbere until creamy and tender.' },
    { code: 'ET', title: 'Injera (Fermented Teff Flatbread)', alt: 'እንጀራ', type: 'pastry', meal: 'Lunch', prep: 20, cook: 15, spice: 0, desc: 'Spongy, tangily fermented flatbread made from ancient teff flour, pitted with thousand eyes (ayen) to scoop stews.' },
    { code: 'ET', title: 'Beef Tibs (Sautéed Beef with Rosemary & Jalapeños)', alt: 'የስጋ ጥብስ', type: 'grill', meal: 'Dinner', prep: 15, cook: 12, spice: 2, desc: 'Sizzling seared tender beef tenderloin tossed with red onions, garlic, fresh rosemary sprigs, and green jalapeños in spiced butter.' },
    { code: 'ET', title: 'Gomen Wat (Braised Collard Greens with Spices)', alt: 'ጎመን', type: 'salad', meal: 'Side Dish', prep: 15, cook: 30, spice: 1, desc: 'Tender collard greens slow-braised with minced onions, garlic, ginger, and aromatic niter kibbeh spiced butter.' },

    // Egypt
    { code: 'EG', title: 'Egyptian Koshari', alt: 'كشري', type: 'rice', meal: 'Lunch', prep: 20, cook: 30, spice: 2, desc: 'Egypt’s legendary street food: layers of rice, brown lentils, macaroni, spicy tomato sauce, garlic vinegar, and crispy fried onions.' },
    { code: 'EG', title: 'Egyptian Ful Medames with Tahini', alt: 'فول مدمس', type: 'soup', meal: 'Breakfast', prep: 10, cook: 20, spice: 1, desc: 'Slow-simmered creamy fava beans mashed with warm cumin, fresh lemon juice, rich tahini, garlic, and extra virgin olive oil.' },
    { code: 'EG', title: 'Molokhia with Roasted Chicken', alt: 'ملوخية', type: 'soup', meal: 'Dinner', prep: 15, cook: 35, spice: 1, desc: 'Silky, aromatic green jute leaf soup finished with garlic and ground coriander sizzle (ta’sha), served over rice and chicken.' },
    { code: 'EG', title: 'Egyptian Hawawshi Spiced Meat Pies', alt: 'حواوشي', type: 'pastry', meal: 'Lunch', prep: 15, cook: 20, spice: 2, desc: 'Crispy, oiled baladi flatbreads stuffed with juicy minced beef seasoned with parsley, onions, peppers, and warm spices.' },
    { code: 'EG', title: 'Om Ali (Egyptian Bread & Butter Pudding)', alt: 'أم علي', type: 'dessert', meal: 'Dessert', prep: 15, cook: 25, spice: 0, desc: 'Warm baked pastry flakes drenched in sweetened vanilla milk, toasted pistachios, almonds, and broiled clotted cream.' },

    // South Africa
    { code: 'ZA', title: 'South African Bobotie with Yellow Rice', alt: 'Traditional Bobotie', type: 'beef', meal: 'Dinner', prep: 20, cook: 40, spice: 1, desc: 'Curried minced beef studded with golden sultanas and fruit chutney, baked under a creamy savory egg-custard topping with bay leaves.' },
    { code: 'ZA', title: 'Durban Bunny Chow (Mutton Curry in Bread Loaf)', alt: 'Bunny Chow', type: 'curry', meal: 'Lunch', prep: 20, cook: 50, spice: 4, desc: 'Hollowed-out quarter loaf of fresh white bread filled with fiery Durban mutton curry and carrot sambal.' },
    { code: 'ZA', title: 'South African Malva Pudding with Amarula Cream', alt: 'Malva Poeding', type: 'dessert', meal: 'Dessert', prep: 15, cook: 35, spice: 0, desc: 'Warm, spongy caramelized apricot pudding drenched in sweet butter-cream sauce infused with Amarula cream liqueur.' },
    { code: 'ZA', title: 'Chakalaka & Pap (Spicy Vegetable Relish & Maize Porridge)', alt: 'Chakalaka & Mielie Pap', type: 'salad', meal: 'Lunch', prep: 15, cook: 25, spice: 3, desc: 'Fiery, tangy braai relish of baked beans, grated carrots, peppers, and curry spices, paired with traditional fluffy white maize meal.' },
    { code: 'ZA', title: 'Cape Boerewors Rolls with Tomato-Onion Sheba', alt: 'Boerie Roll', type: 'grill', meal: 'Lunch', prep: 15, cook: 15, spice: 1, desc: 'Traditional spiral beef and pork sausage spiced with roasted coriander seeds and nutmeg, grilled over coals.' }
  ];

  CURATED_LIST.forEach((d, idx) => {
    const country = COUNTRIES_DATABASE.find(c => c.code === d.code);
    if (!country) return;

    summaries.push({
      recipeId: `prem-${d.code.toLowerCase()}-${idx + 1}`,
      title: d.title,
      alternateName: d.alt,
      country: country.country,
      countryCode: country.code,
      continent: country.continent,
      region: country.region,
      cuisine: country.cuisine,
      description: d.desc,
      culturalBackground: `Authentic traditional specialty representing the culinary culture of ${country.country}.`,
      mealType: d.meal,
      categories: [d.meal, 'Cultural Heritage', 'Premium World Collection'],
      dietaryTags: ['Gluten-Free Optional'],
      allergens: [],
      ingredients: [],
      preparationSteps: [],
      prepTime: d.prep,
      cookTime: d.cook,
      totalTime: d.prep + d.cook,
      servings: 4,
      difficulty: 'Medium',
      equipment: ['Heavy skillet or pot', 'Chef knife'],
      cookingTips: [],
      substitutions: [],
      servingSuggestions: `Serve hot following traditional ${country.country} customs.`,
      storageInstructions: 'Refrigerate in airtight container up to 4 days.',
      image: CURATED_IMAGES[d.type] || CURATED_IMAGES.rice,
      isStarter: false,
      isPremium: true,
      offlineAvailable: false,
      searchTags: [country.country.toLowerCase(), country.cuisine.toLowerCase(), d.title.toLowerCase(), country.continent.toLowerCase()],
      spiceLevel: d.spice,
      estimatedCost: 'Moderate'
    });
  });

  return summaries;
}
