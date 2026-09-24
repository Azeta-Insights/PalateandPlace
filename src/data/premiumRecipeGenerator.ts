import { Recipe, Ingredient, PreparationStep } from '../types/recipe';
import { COUNTRIES_DATABASE, PREMIUM_BLUEPRINTS } from './premiumCatalogData';

// High-quality food images mapped by dish type / cuisine aesthetic
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

interface RegionalDishDefinition {
  title: string;
  alternateName?: string;
  type: keyof typeof CURATED_IMAGES;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Side Dish';
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  spiceLevel: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  culturalBackground: string;
  dietaryTags: string[];
  allergens: string[];
  ingredients: { name: string; amount: number; unit: string; notes?: string }[];
  steps: string[];
  substitutions: { ingredient: string; substitute: string }[];
  tips: string[];
}

// Master authentic regional dishes catalog covering 52 countries
const AUTHENTIC_COUNTRY_DISHES: Record<string, RegionalDishDefinition[]> = {
  // BRAZIL
  BR: [
    {
      title: 'Traditional Feijoada Completa',
      alternateName: 'Brazilian Black Bean & Smoked Pork Stew',
      type: 'soup',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 120,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Slow-simmered black beans with cured pork ribs, smoked sausage, carne seca, and bay leaves served with toasted farofa, garlicky collard greens, and orange slices.',
      culturalBackground: 'Celebrated as Brazil’s national dish, traditionally prepared on Saturday afternoons for lively family gatherings and samba celebrations.',
      dietaryTags: ['Gluten-Free', 'Dairy-Free'],
      allergens: [],
      ingredients: [
        { name: 'Dried black beans', amount: 500, unit: 'g' },
        { name: 'Smoked calabresa or linguiça sausage', amount: 250, unit: 'g' },
        { name: 'Smoked pork ribs or bacon', amount: 350, unit: 'g' },
        { name: 'Onion and minced garlic', amount: 1, unit: 'cup' },
        { name: 'Bay leaves and fresh orange', amount: 3, unit: 'leaves' }
      ],
      steps: [
        'Soak black beans overnight in cool water.',
        'Sear smoked meats in a large heavy pot until caramelized.',
        'Add drained beans, aromatics, bay leaves, and water to cover by 3 inches.',
        'Simmer gently on low for 2 hours until beans are tender and broth is deeply rich and creamy.',
        'Serve with hot white rice, toasted cassava farofa, and sliced oranges.'
      ],
      substitutions: [{ ingredient: 'Calabresa sausage', substitute: 'Kielbasa or smoked chorizo' }],
      tips: ['The acid in fresh orange slices cuts through the rich, savory depth of the smoked pork broth.']
    },
    {
      title: 'Bahian Moqueca de Peixe',
      alternateName: 'Coconut & Dendê Seafood Stew',
      type: 'seafood',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Tender white fish fillets simmered in aromatic dendê red palm oil, rich coconut milk, bell peppers, tomatoes, and fresh cilantro.',
      culturalBackground: 'From the northeastern coast of Bahia, reflecting Afro-Brazilian culinary traditions cooked in handmade clay pots.',
      dietaryTags: ['Pescatarian', 'Gluten-Free', 'Dairy-Free'],
      allergens: ['Fish'],
      ingredients: [
        { name: 'Firm white fish (cod or halibut)', amount: 600, unit: 'g' },
        { name: 'Full-fat coconut milk', amount: 1, unit: 'can' },
        { name: 'Dendê (red palm) oil', amount: 2, unit: 'tbsp' },
        { name: 'Bell peppers and ripe tomatoes', amount: 2, unit: 'each' },
        { name: 'Fresh cilantro and lime juice', amount: 0.5, unit: 'cup' }
      ],
      steps: [
        'Marinate fish in lime juice, crushed garlic, and sea salt for 15 minutes.',
        'Layer sliced onions, peppers, and tomatoes in a wide skillet.',
        'Place marinated fish over the vegetable bed.',
        'Pour coconut milk and dendê oil over the fish.',
        'Cover and simmer gently for 20 minutes until fish flakes tenderly.'
      ],
      substitutions: [{ ingredient: 'Dendê oil', substitute: 'Olive oil with a pinch of smoked paprika' }],
      tips: ['Avoid boiling aggressively; a gentle simmer preserves the delicate texture of the fish.']
    },
    {
      title: 'Pão de Queijo (Brazilian Cheese Bread)',
      alternateName: 'Manioc Cassava Cheese Puffs',
      type: 'pastry',
      mealType: 'Breakfast',
      prepTime: 15,
      cookTime: 20,
      servings: 6,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Crisp-shelled, chewy and airy cheese buns made naturally gluten-free with sour tapioca starch and aged cheese.',
      culturalBackground: 'Originating in Minas Gerais during the 18th century, eaten hot out of the oven alongside morning espresso.',
      dietaryTags: ['Vegetarian', 'Gluten-Free'],
      allergens: ['Dairy', 'Eggs'],
      ingredients: [
        { name: 'Sour or sweet tapioca starch (polvilho)', amount: 2, unit: 'cups' },
        { name: 'Whole milk and butter', amount: 0.75, unit: 'cup' },
        { name: 'Grated Minas or Parmesan cheese', amount: 1.5, unit: 'cups' },
        { name: 'Large eggs', amount: 2, unit: 'eggs' }
      ],
      steps: [
        'Scald milk, oil, and salt in a saucepan, then pour over tapioca starch to hydrate.',
        'Let dough cool slightly, then knead in eggs and grated cheese until smooth.',
        'Roll into golf-ball sized rounds and place on parchment lined sheet.',
        'Bake at 200°C (400°F) for 20 minutes until puffed and golden.'
      ],
      substitutions: [{ ingredient: 'Minas cheese', substitute: 'Gruyère or aged sharp white cheddar' }],
      tips: ['Using authentic tapioca flour creates the signature elastic, stretchy crumb.']
    }
  ],

  // PERU
  PE: [
    {
      title: 'Classic Peruvian Ceviche Mixto',
      alternateName: 'Ceviche with Leche de Tigre',
      type: 'seafood',
      mealType: 'Lunch',
      prepTime: 20,
      cookTime: 0,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Fresh sea bass and calamari quickly cured in freshly squeezed lime juice, ají limo chili, red onion, served with boiled sweet potato and giant choclo corn.',
      culturalBackground: 'Recognized as Peru’s cultural heritage, celebrated along the Pacific coastline for centuries.',
      dietaryTags: ['Pescatarian', 'Gluten-Free', 'Dairy-Free'],
      allergens: ['Fish', 'Shellfish'],
      ingredients: [
        { name: 'Fresh sea bass or corvina fillets', amount: 500, unit: 'g' },
        { name: 'Fresh lime juice', amount: 0.75, unit: 'cup' },
        { name: 'Ají limo or habanero chili', amount: 1, unit: 'pepper' },
        { name: 'Red onion thinly sliced', amount: 1, unit: 'medium' },
        { name: 'Boiled sweet potato & choclo corn', amount: 1, unit: 'each' }
      ],
      steps: [
        'Cut chilled fresh fish into uniform 1/2-inch cubes.',
        'Toss fish with minced ají limo, salt, and freshly squeezed lime juice.',
        'Let cure for just 3 to 5 minutes until edges turn opaque.',
        'Fold in crisp sliced red onions and fresh cilantro.',
        'Serve immediately alongside sweet potato and corn.'
      ],
      substitutions: [{ ingredient: 'Ají limo', substitute: 'Red habanero or serrano pepper' }],
      tips: ['Squeeze limes gently by hand without twisting to avoid bitter rind oils.']
    },
    {
      title: 'Lomo Saltado',
      alternateName: 'Peruvian-Chinese Wok-Seared Beef',
      type: 'beef',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Tender beef tenderloin strips stir-fried over high flame with red onions, tomatoes, ají amarillo paste, soy sauce, and crispy french fries.',
      culturalBackground: 'The crown jewel of Chifa cuisine, marrying 19th-century Chinese Cantonese wok techniques with native Peruvian ingredients.',
      dietaryTags: ['Dairy-Free'],
      allergens: ['Soy'],
      ingredients: [
        { name: 'Beef tenderloin or sirloin strips', amount: 500, unit: 'g' },
        { name: 'Ají amarillo chili paste', amount: 1.5, unit: 'tbsp' },
        { name: 'Soy sauce and red wine vinegar', amount: 3, unit: 'tbsp' },
        { name: 'Red onion and plum tomatoes wedged', amount: 2, unit: 'each' },
        { name: 'Crisp fried potatoes', amount: 2, unit: 'cups' }
      ],
      steps: [
        'Heat a wok or heavy cast iron skillet until smoking hot with high-heat oil.',
        'Sear seasoned beef in batches for 90 seconds to create charred wok-hei flavor.',
        'Toss in onions, ají amarillo, and tomatoes; stir-fry for 1 minute.',
        'Deglaze with soy sauce and red wine vinegar.',
        'Toss in crispy french fries and chopped cilantro; serve over steamed rice.'
      ],
      substitutions: [{ ingredient: 'Ají amarillo', substitute: 'Yellow bell pepper blended with a pinch of cayenne' }],
      tips: ['High pan heat is essential to achieve the smoky wok-char characteristic of authentic Chifa.']
    }
  ],

  // VIETNAM
  VN: [
    {
      title: 'Traditional Hanoi Phở Bò',
      alternateName: 'Aromatic Vietnamese Beef Noodle Soup',
      type: 'noodles',
      mealType: 'Breakfast',
      prepTime: 25,
      cookTime: 90,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Fragrant beef bone broth infused with charred ginger, star anise, black cardamom, and cinnamon, poured over flat rice noodles and rare sirloin slices.',
      culturalBackground: 'Born in northern Vietnam in the early 20th century, enjoyed as a nourishing morning ritual on low sidewalk stools.',
      dietaryTags: ['Gluten-Free', 'Dairy-Free'],
      allergens: ['Fish'],
      ingredients: [
        { name: 'Beef marrow bones & brisket', amount: 1, unit: 'kg' },
        { name: 'Charred ginger and shallots', amount: 1, unit: 'cup' },
        { name: 'Whole spices (star anise, cinnamon, cardamom, coriander)', amount: 2, unit: 'tbsp' },
        { name: 'Flat phở rice noodles', amount: 400, unit: 'g' },
        { name: 'Thinly sliced raw beef sirloin', amount: 200, unit: 'g' },
        { name: 'Fish sauce and fresh herbs', amount: 0.25, unit: 'cup' }
      ],
      steps: [
        'Parboil beef bones for 10 minutes, then rinse clean under cold water.',
        'Simmer bones with charred aromatics and toasted whole spices for 90 minutes.',
        'Season broth with high-grade fish sauce and yellow rock sugar.',
        'Layer cooked rice noodles, brisket, and thin raw sirloin in deep bowls.',
        'Ladle boiling clear broth over the beef to cook it instantly; garnish with scallions and culantro.'
      ],
      substitutions: [{ ingredient: 'Black cardamom', substitute: 'Green cardamom pod with a drop of smoke' }],
      tips: ['Charring the whole ginger and onions over an open flame imparts the broth’s signature amber sweetness.']
    },
    {
      title: 'Hanoi Bún Chả (Grilled Pork & Noodles)',
      alternateName: 'Hanoi Char-Grilled Pork Patties',
      type: 'grill',
      mealType: 'Lunch',
      prepTime: 25,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Caramelized pork patties and sliced pork belly grilled over coals, served in warm sweet-and-sour nước chấm dipping broth with rice vermicelli.',
      culturalBackground: 'Hanoi’s quintessential lunch specialty famously shared by Anthony Bourdain and President Obama.',
      dietaryTags: ['Dairy-Free'],
      allergens: ['Fish'],
      ingredients: [
        { name: 'Ground pork shoulder & pork belly', amount: 600, unit: 'g' },
        { name: 'Shallots, garlic, and fish sauce', amount: 3, unit: 'tbsp' },
        { name: 'Caramel cooking syrup (nước màu)', amount: 1, unit: 'tbsp' },
        { name: 'Rice vermicelli (bún)', amount: 300, unit: 'g' },
        { name: 'Pickled green papaya and fresh herbs', amount: 1, unit: 'cup' }
      ],
      steps: [
        'Season ground pork with shallots, fish sauce, and caramel sauce; shape into small patties.',
        'Grill patties and sliced belly until smoky, charred, and juicy.',
        'Whisk warm water, fish sauce, lime juice, sugar, and garlic for the dipping broth.',
        'Drop hot grilled meats and pickled papaya into the warm dipping broth.',
        'Serve with plates of fresh vermicelli noodles, perilla leaves, and mint.'
      ],
      substitutions: [{ ingredient: 'Green papaya', substitute: 'Crisp kohlrabi or daikon radish' }],
      tips: ['Caramel sauce provides the rich glossy sheen and deep mahogany grill marks.']
    }
  ],

  // INDONESIA
  ID: [
    {
      title: 'Minangkabau Beef Rendang',
      alternateName: 'Slow-Caramelized Dry Spiced Beef',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 30,
      cookTime: 150,
      servings: 6,
      difficulty: 'Advanced',
      spiceLevel: 4,
      description: 'Beef chuck slow-cooked in rich coconut milk and bumbu paste until liquid evaporates and meat caramelizes in its own fragrant spiced oils.',
      culturalBackground: 'Originated by the Minangkabau people of West Sumatra, celebrated globally as one of the world’s most flavorful dishes.',
      dietaryTags: ['Gluten-Free', 'Dairy-Free', 'Halal'],
      allergens: [],
      ingredients: [
        { name: 'Beef chuck or shank cut into cubes', amount: 800, unit: 'g' },
        { name: 'Fresh coconut milk & toasted grated coconut (kerisik)', amount: 3, unit: 'cups' },
        { name: 'Lemongrass, galangal, turmeric, and shallots paste', amount: 1, unit: 'cup' },
        { name: 'Kaffir lime leaves & turmeric leaf', amount: 4, unit: 'leaves' },
        { name: 'Dried asam keping or tamarind', amount: 2, unit: 'pieces' }
      ],
      steps: [
        'Blend fresh chilies, shallots, garlic, galangal, and ginger into a smooth bumbu paste.',
        'Combine coconut milk, paste, bruised lemongrass, and lime leaves in a heavy wok.',
        'Bring to a boil, then add beef cubes.',
        'Simmer uncovered on medium-low for 2 hours until the sauce reduces into thick brown gravy.',
        'Turn heat to low and stir constantly as the coconut oil separates and fries the beef until dark and caramelized.'
      ],
      substitutions: [{ ingredient: 'Galangal', substitute: 'Fresh ginger with a squeeze of lime juice' }],
      tips: ['Patience during the final oil-frying stage develops the iconic deep mahogany color and complex flavor.']
    }
  ],

  // GREECE
  GR: [
    {
      title: 'Authentic Greek Moussaka',
      alternateName: 'Layered Eggplant & Spiced Lamb Bake',
      type: 'pasta',
      mealType: 'Dinner',
      prepTime: 35,
      cookTime: 50,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Golden roasted eggplant and potato layers topped with cinnamon-spiced ground lamb ragù and a silky, thick egg-enriched béchamel crust.',
      culturalBackground: 'Modernized in early 20th-century Athens by chef Nikolaos Tselementes, a staple across Hellenic tavernas.',
      dietaryTags: [],
      allergens: ['Dairy', 'Eggs', 'Wheat'],
      ingredients: [
        { name: 'Large globe eggplants', amount: 2, unit: 'eggplants' },
        { name: 'Ground lamb or lean beef', amount: 600, unit: 'g' },
        { name: 'Plum tomatoes, cinnamon stick, and allspice', amount: 1, unit: 'can' },
        { name: 'Butter, flour, milk for rich béchamel', amount: 3, unit: 'cups' },
        { name: 'Grated Kefalotyri or Parmesan cheese', amount: 1, unit: 'cup' }
      ],
      steps: [
        'Slice eggplants, salt to drain excess moisture, then brush with olive oil and roast until tender.',
        'Simmer ground lamb with red wine, crushed tomatoes, onions, garlic, and cinnamon for 25 mins.',
        'Whisk a golden roux with milk until thick and velvety, then stir in egg yolks and grated cheese.',
        'Layer roasted potatoes and eggplants in baking dish, cover with spiced meat sauce, and top with thick béchamel.',
        'Bake at 180°C (350°F) for 45 minutes until golden brown on top. Rest 20 mins before slicing.'
      ],
      substitutions: [{ ingredient: 'Kefalotyri cheese', substitute: 'Aged Pecorino Romano or Parmesan' }],
      tips: ['Resting the baked moussaka for 20 minutes allows the béchamel to set into clean, picture-perfect slices.']
    }
  ]
};

// Generates the comprehensive, authentic recipe collection
export function generatePremiumRecipes(): Recipe[] {
  const recipes: Recipe[] = [];

  // 1. First, convert curated blueprints into full recipes
  for (let i = 0; i < PREMIUM_BLUEPRINTS.length; i++) {
    const bp = PREMIUM_BLUEPRINTS[i];
    const country = COUNTRIES_DATABASE.find(c => c.code === bp.countryCode) || COUNTRIES_DATABASE[0];

    const prepSteps: PreparationStep[] = bp.steps.map((text, idx) => ({
      stepNumber: idx + 1,
      instruction: text,
      tip: idx === 0 ? bp.tips[0] : undefined
    }));

    const ingredients: Ingredient[] = bp.keyIngredients.map(k => ({
      name: k.name,
      amount: k.amount,
      unit: k.unit,
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
      culturalBackground: `An authentic, beloved dish representing the rich culinary heritage of ${country.country}.`,
      mealType: bp.mealType,
      categories: [bp.mealType, 'Traditional', 'World Collection'],
      dietaryTags: bp.dietaryTags || ['Gluten-Free Optional'],
      allergens: bp.allergens || [],
      ingredients,
      preparationSteps: prepSteps,
      prepTime: bp.prepTime,
      cookTime: bp.cookTime,
      totalTime: bp.prepTime + bp.cookTime,
      servings: bp.servings,
      difficulty: bp.difficulty,
      equipment: ['Heavy skillet or pot', 'Chef knife', 'Cutting board'],
      cookingTips: bp.tips,
      substitutions: [
        { ingredient: ingredients[0]?.name || 'Primary ingredient', substitute: 'Suitable local or seasonal alternative' }
      ],
      servingSuggestions: `Serve freshly prepared following ${country.country} culinary traditions.`,
      storageInstructions: 'Refrigerate in airtight container for up to 4 days.',
      image: bp.image,
      isStarter: false,
      isPremium: true,
      offlineAvailable: false,
      searchTags: [country.country.toLowerCase(), country.cuisine.toLowerCase(), bp.title.toLowerCase(), country.continent.toLowerCase()],
      spiceLevel: bp.spiceLevel,
      estimatedCost: 'Moderate'
    });
  }

  // 2. Add rich regional dishes for each country
  COUNTRIES_DATABASE.forEach((c) => {
    const customDishes = AUTHENTIC_COUNTRY_DISHES[c.code];
    if (customDishes) {
      customDishes.forEach((d, dIdx) => {
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
          mealType: d.mealType as any,
          categories: [d.mealType, 'Cultural Heritage', 'World Collection'],
          dietaryTags: d.dietaryTags,
          allergens: d.allergens,
          ingredients: d.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit, notes: i.notes })),
          preparationSteps: d.steps.map((s, idx) => ({ stepNumber: idx + 1, instruction: s, tip: idx === 0 ? d.tips[0] : undefined })),
          prepTime: d.prepTime,
          cookTime: d.cookTime,
          totalTime: d.prepTime + d.cookTime,
          servings: d.servings,
          difficulty: d.difficulty,
          equipment: ['Chef knife', 'Heavy skillet or Dutch oven', 'Cutting board'],
          cookingTips: d.tips,
          substitutions: d.substitutions,
          servingSuggestions: `Serve hot and fresh with traditional accompaniments popular in ${c.country}.`,
          storageInstructions: 'Keep chilled in airtight container for up to 4 days.',
          image: CURATED_IMAGES[d.type] || CURATED_IMAGES.curry,
          isStarter: false,
          isPremium: true,
          offlineAvailable: false,
          searchTags: [c.country.toLowerCase(), c.cuisine.toLowerCase(), d.title.toLowerCase(), c.continent.toLowerCase()],
          spiceLevel: d.spiceLevel,
          estimatedCost: 'Moderate'
        });
      });
    }
  });

  return recipes;
}
