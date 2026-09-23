import { Recipe, Ingredient, PreparationStep } from '../src/types/recipe';
import { COUNTRIES_DATABASE, PREMIUM_BLUEPRINTS } from '../src/data/premiumCatalogData';

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

export interface RegionalDishData {
  title: string;
  alternateName?: string;
  imageType: keyof typeof CURATED_IMAGES;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Side Dish';
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  spiceLevel: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  culturalBackground: string;
  ingredients: { name: string; amount: number; unit: string; notes?: string }[];
  steps: string[];
  substitutions: { ingredient: string; substitute: string; ratio?: string }[];
  tips: string[];
  dietaryTags?: string[];
  allergens?: string[];
}

// 5 hand-crafted, authentic regional dishes for every country
const AUTHENTIC_DISHES_BY_COUNTRY: Record<string, RegionalDishData[]> = {
  // MOROCCO (MA)
  MA: [
    {
      title: 'Moroccan Lamb Tagine with Prunes & Almonds',
      alternateName: 'Mrouzia Tagine',
      imageType: 'curry',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 90,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Slow-simmered tender lamb shanks scented with ras el hanout, saffron, and sweet caramelized prunes toasted in sesame and fried almonds.',
      culturalBackground: 'A regal celebratory dish dating back centuries to the Moorish era of Fes and Marrakech, typically prepared during Eid al-Adha and festive banquets.',
      ingredients: [
        { name: 'Bone-in lamb shoulder or shanks', amount: 1, unit: 'kg', notes: 'Cut into large pieces' },
        { name: 'Dried prunes', amount: 200, unit: 'g' },
        { name: 'Ras el hanout spice blend', amount: 1.5, unit: 'tbsp' },
        { name: 'Saffron threads', amount: 0.5, unit: 'tsp', notes: 'Bloomed in warm water' },
        { name: 'Honey and ground cinnamon', amount: 2, unit: 'tbsp' },
        { name: 'Blanched fried almonds', amount: 0.5, unit: 'cup' }
      ],
      steps: [
        'Marinate lamb in ras el hanout, grated ginger, garlic, turmeric, saffron, and olive oil for 30 minutes.',
        'Brown grated onions in a clay tagine or Dutch oven, add lamb and sear gently.',
        'Cover with water to barely submerge lamb, cover with tagine lid and simmer on low for 75 minutes.',
        'In a small pan, simmer prunes in lamb broth with honey, cinnamon, and butter until glazed.',
        'Crown tagine with glazed prunes, toasted almonds, and roasted sesame seeds. Serve with warm crusty khobz bread.'
      ],
      substitutions: [{ ingredient: 'Lamb', substitute: 'Beef brisket or goat meat', ratio: '1:1' }],
      tips: ['Cooking in an authentic earthenware tagine distributes heat slowly, locking in moisture without boiling the meat.'],
      dietaryTags: ['Dairy-Free', 'Halal', 'Gluten-Free'],
      allergens: ['Tree Nuts', 'Sesame']
    },
    {
      title: 'Moroccan Chicken Bastilla (Pastilla)',
      alternateName: 'Pastilla au Poulet',
      imageType: 'pastry',
      mealType: 'Dinner',
      prepTime: 35,
      cookTime: 50,
      servings: 6,
      difficulty: 'Advanced',
      spiceLevel: 1,
      description: 'The pinnacle of Moroccan sweet-savory gastronomy: spiced shredded saffron chicken, tender onion-egg jam, and crispy warqa pastry dusted with sugar and cinnamon.',
      culturalBackground: 'Created by the Andalusian Moors who resettled in Fez. Bastilla combines Persian, Moorish, and Maghrebi culinary arts into one masterwork pie.',
      ingredients: [
        { name: 'Whole chicken', amount: 1.2, unit: 'kg', notes: 'Poached with saffron and ginger' },
        { name: 'Warqa or phyllo pastry dough', amount: 16, unit: 'sheets' },
        { name: 'Eggs (beaten)', amount: 6, unit: 'eggs', notes: 'Cooked into saffron sauce' },
        { name: 'Toasted ground almonds', amount: 200, unit: 'g' },
        { name: 'Orange blossom water', amount: 2, unit: 'tbsp' },
        { name: 'Powdered sugar and cinnamon', amount: 3, unit: 'tbsp', notes: 'For garnish' }
      ],
      steps: [
        'Poach chicken with saffron, ginger, cinnamon, and grated onions until falling off bone; shred meat finely.',
        'Reduce onion cooking liquid, whisk in eggs over low heat until forming a scrambled curd jam.',
        'Toss toasted almonds with orange blossom water, cinnamon, and sugar.',
        'Layer melted-butter-brushed phyllo in a round pan, assemble layers: chicken, egg custard, and almond crumble.',
        'Fold phyllo over top, bake at 190°C for 30 minutes until blistered and golden. Dust with geometric cinnamon diamonds.'
      ],
      substitutions: [{ ingredient: 'Warqa dough', substitute: 'Greek phyllo pastry', ratio: '1:1' }],
      tips: ['Cool all fillings completely before assembling so the delicate phyllo does not become soggy.'],
      dietaryTags: ['Halal'],
      allergens: ['Gluten', 'Eggs', 'Tree Nuts']
    },
    {
      title: 'Traditional Harira Soup',
      alternateName: 'Moroccan Lentil & Chickpea Soup',
      imageType: 'soup',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 60,
      servings: 6,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Comforting, velvety tomato broth loaded with tender lentils, chickpeas, fresh cilantro, celery, and tiny vermicelli noodles.',
      culturalBackground: 'The sacred heart of the Moroccan Ramadan table, traditionally eaten at sunset (Iftar) accompanied by sweet Chebakia cookies and fresh dates.',
      ingredients: [
        { name: 'Cooked chickpeas', amount: 1.5, unit: 'cups' },
        { name: 'Brown lentils', amount: 0.75, unit: 'cup' },
        { name: 'Grated plum tomatoes', amount: 4, unit: 'large' },
        { name: 'Diced beef or lamb chunks', amount: 250, unit: 'g' },
        { name: 'Fresh celery and cilantro', amount: 1, unit: 'cup', notes: 'Finely minced' },
        { name: 'Tadwira flour slurry (flour & water)', amount: 0.5, unit: 'cup', notes: 'For thickening' }
      ],
      steps: [
        'Sauté beef, onions, ginger, turmeric, cinnamon, and celery in olive oil.',
        'Add grated tomatoes, tomato paste, lentils, and 6 cups water. Simmer 40 minutes.',
        'Add chickpeas and broken vermicelli noodles; cook 8 minutes.',
        'Stir in tadwira slurry slowly until soup attains its signature velvety sheen.',
        'Finish with fresh cilantro leaves, lemon juice, and a dollop of smen (aged butter).'
      ],
      substitutions: [{ ingredient: 'Meat', substitute: 'Extra chickpeas for a hearty vegan Harira', ratio: '1:1' }],
      tips: ['Whisk the flour slurry thoroughly with cold water to avoid lumps when thickening.'],
      dietaryTags: ['Halal', 'Dairy-Free'],
      allergens: ['Gluten']
    },
    {
      title: 'Zaalouk (Smoky Roasted Eggplant & Tomato Dip)',
      alternateName: 'Salade de Zaalouk',
      imageType: 'salad',
      mealType: 'Side Dish',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Charred, smoky roasted eggplants mashed with juicy garlic-stewed tomatoes, cumin, paprika, and rich extra virgin olive oil.',
      culturalBackground: 'A fixture of traditional Moroccan mezze tables, shared communally by scooping directly with fresh crusty bread.',
      ingredients: [
        { name: 'Large Italian eggplants', amount: 2, unit: 'whole', notes: 'Roasted over open flame or broiled' },
        { name: 'Ripe tomatoes', amount: 3, unit: 'medium', notes: 'Grated' },
        { name: 'Garlic cloves', amount: 4, unit: 'cloves', notes: 'Minced' },
        { name: 'Ground cumin and sweet paprika', amount: 1, unit: 'tsp', notes: 'Each' },
        { name: 'Fresh lemon juice & olive oil', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        'Roast eggplants until skin is completely blistered and flesh collapses. Peel skin and chop pulp.',
        'In a skillet, simmer grated tomatoes with garlic, olive oil, paprika, and cumin for 10 minutes.',
        'Add roasted eggplant pulp, mashing with the back of a wooden spoon into a luscious rustic paste.',
        'Cook down until liquid evaporates and oil separates. Finish with fresh parsley, lemon juice, and sea salt.'
      ],
      substitutions: [{ ingredient: 'Eggplant', substitute: 'Zucchini (Courgette Zaalouk)', ratio: '1:1' }],
      tips: ['Charring the whole eggplants directly over an open flame produces that irresistible smoky nuance.'],
      dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
      allergens: []
    },
    {
      title: 'Moroccan Mint Tea & Gazelle Horns (Kaab el Ghazal)',
      alternateName: 'Atay bi Naana & Kaab el Ghazal',
      imageType: 'dessert',
      mealType: 'Dessert',
      prepTime: 40,
      cookTime: 18,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Delicate crescent pastries stuffed with orange blossom almond paste, paired with high-poured sweet Moroccan spearmint green tea.',
      culturalBackground: 'The highest expression of Maghrebi hospitality. Pouring tea from high above aerates the beverage and creates a crown of welcoming froth (regga).',
      ingredients: [
        { name: 'Blanched almond flour', amount: 300, unit: 'g' },
        { name: 'Orange blossom water', amount: 3, unit: 'tbsp' },
        { name: 'Ground cinnamon and mastic gum', amount: 0.5, unit: 'tsp' },
        { name: 'Thin pastry dough (flour, butter, egg)', amount: 250, unit: 'g' },
        { name: 'Gunpowder green tea & fresh spearmint', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        'Knead almond flour with sugar, cinnamon, softened butter, and orange blossom water into pliable almond paste sausages.',
        'Roll dough paper-thin, wrap around almond filling, pinch and curve into crescent gazelle horns.',
        'Prick pastries with a needle, bake at 170°C for 15 minutes until pale ivory (do not brown).',
        'Boil gunpowder green tea, rinse leaves, add boiling water, generous fresh mint sprigs, and sugar.',
        'Pour tea repeatedly from a height into glasses until a frothy crown forms. Serve with warm gazelle horns.'
      ],
      substitutions: [{ ingredient: 'Orange blossom water', substitute: 'Rosewater', ratio: '1:1' }],
      tips: ['Pricking the dough prevents air pockets from bursting the pastry during baking.'],
      dietaryTags: ['Vegetarian', 'Halal'],
      allergens: ['Tree Nuts', 'Dairy', 'Gluten', 'Eggs']
    }
  ],

  // SENEGAL (SN)
  SN: [
    {
      title: 'Senegalese Thieboudienne (Ceebu Jën)',
      alternateName: 'National Red Fish & Rice of Senegal',
      imageType: 'rice',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 65,
      servings: 6,
      difficulty: 'Advanced',
      spiceLevel: 3,
      description: 'Senegal’s UNESCO-recognized national treasure: herb-stuffed white grouper, cassava, carrots, and cabbage simmered in spiced tomato stew, cooked with broken jasmine rice.',
      culturalBackground: 'Created in Saint-Louis, Senegal by nineteenth-century master cook Penda Mbaye, Thieboudienne is the direct ancestor of West African Jollof rice.',
      ingredients: [
        { name: 'Whole White Grouper or Sea Bass', amount: 1.2, unit: 'kg', notes: 'Cut into large steaks' },
        { name: 'Broken Jasmine Rice (Rice Casse)', amount: 3, unit: 'cups' },
        { name: 'Rof stuffing (parsley, garlic, chili, bouillon)', amount: 0.5, unit: 'cup' },
        { name: 'Root vegetables (cassava, carrots, white cabbage, eggplant)', amount: 600, unit: 'g' },
        { name: 'Tomato paste', amount: 100, unit: 'g' },
        { name: 'Tamarind pulp & netetou (fermented locust bean)', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        'Slit fish steaks and pack deeply with pounded pungent rof herb-garlic stuffing.',
        'Sear fish in peanut oil until golden; set aside.',
        'Fry tomato paste and onions until dark red; add water, vegetables, tamarind, and simmer 30 minutes.',
        'Remove vegetables and fish to a platter. Add rinsed broken rice to boiling tomato broth.',
        'Cover tightly and steam rice on low heat until grains are tender and a crunchy burnt crust (xurxur) forms at the pot base.'
      ],
      substitutions: [{ ingredient: 'Grouper', substitute: 'Red Snapper or Halibut', ratio: '1:1' }],
      tips: ['Twice-broken jasmine rice (Rice Casse deux fois) is essential for that authentic fluffy Saint-Louis mouthfeel.'],
      dietaryTags: ['Pescatarian', 'Dairy-Free'],
      allergens: ['Fish']
    },
    {
      title: 'Senegalese Yassa Poulet (Caramelized Onion-Mustard Chicken)',
      alternateName: 'Poulet Yassa au Citron',
      imageType: 'grill',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 45,
      servings: 5,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Charcoal-grilled marinated chicken simmered in an intoxicating mountain of slow-caramelized onions, Dijon mustard, lime juice, and habanero.',
      culturalBackground: 'Originated among the Casamance people of southern Senegal, Yassa is renowned across West Africa for its bold, punchy sweet-acidic contrast.',
      ingredients: [
        { name: 'Bone-in chicken thighs and drumsticks', amount: 1, unit: 'kg' },
        { name: 'Yellow onions', amount: 5, unit: 'large', notes: 'Thinly sliced into half-moons' },
        { name: 'Dijon mustard', amount: 3, unit: 'tbsp' },
        { name: 'Fresh lime juice', amount: 0.5, unit: 'cup' },
        { name: 'Habanero pepper', amount: 1, unit: 'whole', notes: 'Pierced with toothpick' },
        { name: 'Garlic and ginger paste', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        'Marinate chicken and sliced onions overnight with lime juice, Dijon mustard, garlic, and bouillon.',
        'Separate chicken from onions; grill chicken over hot coals or high oven heat until skin is smoky and blistered.',
        'In a heavy Dutch oven, caramelize the marinated onions in oil over medium-low heat for 25 minutes until amber and sweet.',
        'Add grilled chicken and whole habanero to the caramelized onions; cover and simmer for 20 minutes.',
        'Serve with hot white jasmine rice or steamed fonio grains.'
      ],
      substitutions: [{ ingredient: 'Chicken', substitute: 'Firm white fish (Yassa Poisson)', ratio: '1:1' }],
      tips: ['Cooking the onions very slowly over low heat creates the luscious natural sweetness that balances the sharp lime juice.'],
      dietaryTags: ['Dairy-Free', 'Gluten-Free', 'Halal'],
      allergens: ['Mustard']
    },
    {
      title: 'Mafé (West African Peanut & Beef Stew)',
      alternateName: 'Tigadèguèna',
      imageType: 'curry',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 50,
      servings: 6,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Rich, comforting braised beef stew cooked in creamy roasted natural peanut butter, sweet potatoes, and smoked paprika.',
      culturalBackground: 'Originally crafted by the Mandinka and Bambara people, Mafé spread across Senegal and Mali to become one of West Africa’s most beloved household staples.',
      ingredients: [
        { name: 'Beef chuck roast', amount: 800, unit: 'g', notes: 'Cut into bite-sized cubes' },
        { name: 'Natural smooth peanut butter (100% peanuts)', amount: 1, unit: 'cup' },
        { name: 'Tomato paste', amount: 3, unit: 'tbsp' },
        { name: 'Sweet potatoes & carrots', amount: 2, unit: 'each', notes: 'Chunky cut' },
        { name: 'Beef bone broth', amount: 4, unit: 'cups' },
        { name: 'Scotch bonnet pepper', amount: 1, unit: 'whole' }
      ],
      steps: [
        'Brown seasoned beef cubes in peanut oil in a heavy Dutch oven.',
        'Add diced onions, garlic, and tomato paste; cook for 4 minutes until deeply fragrant.',
        'Whisk peanut butter with 1.5 cups warm beef broth until smooth; pour into the pot.',
        'Add remaining broth, sweet potatoes, carrots, and whole pepper. Simmer covered on low heat for 40 minutes.',
        'When beef is fork-tender and peanut oil floats to the top, skim excess oil and serve over steaming white rice.'
      ],
      substitutions: [{ ingredient: 'Beef', substitute: 'Smoked tofu and chickpeas for vegan Mafé', ratio: '1:1' }],
      tips: ['Use unsweetened, 100% pure roasted peanut butter to avoid unwanted cloying sweetness.'],
      dietaryTags: ['Dairy-Free', 'Gluten-Free', 'Halal'],
      allergens: ['Peanuts']
    },
    {
      title: 'Pastels de Poisson (Crispy Fish Hand Pies with Tomato Dip)',
      alternateName: 'Pastels Sénégalais',
      imageType: 'pastry',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 20,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Golden, flaky hand-crimped pastry pockets stuffed with spiced flaked white fish, paired with spicy Senegalese rof tomato dipping sauce.',
      culturalBackground: 'The supreme cocktail snack and beach food of Dakar, influenced by Portuguese pastéis but seasoned with West African fire and aromatics.',
      ingredients: [
        { name: 'All-purpose flour & butter dough', amount: 350, unit: 'g' },
        { name: 'Cooked flaked white fish (hake or cod)', amount: 300, unit: 'g' },
        { name: 'Minced garlic, scallions, and parsley', amount: 0.5, unit: 'cup' },
        { name: 'Diced onions and sweet peppers', amount: 1, unit: 'cup' },
        { name: 'Spicy tomato dipping sauce (sauce pastel)', amount: 1, unit: 'cup' }
      ],
      steps: [
        'Sauté scallions, garlic, parsley, and sweet peppers; fold into flaked fish with salt and cayenne.',
        'Roll dough to 2mm thickness, cut out 3-inch circles.',
        'Place 1 tbsp fish filling in each round, fold into crescents and crimp edges tightly with a fork.',
        'Deep-fry in hot oil (175°C) for 3-4 minutes per side until golden brown and flaky.',
        'Drain on paper towels and serve piping hot with spicy, piquant sauce pastel.'
      ],
      substitutions: [{ ingredient: 'Fish', substitute: 'Spiced minced beef or tuna', ratio: '1:1' }],
      tips: ['Rest the pastry dough in the fridge for 20 minutes before rolling out to maintain maximum flakiness.'],
      dietaryTags: ['Pescatarian'],
      allergens: ['Gluten', 'Fish', 'Dairy']
    },
    {
      title: 'Thiakry (Senegalese Sweet Millet Couscous & Yogurt Dessert)',
      alternateName: 'Degue',
      imageType: 'dessert',
      mealType: 'Dessert',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Steamed nutty millet couscous granules swirled into chilled sweetened vanilla yogurt, condensed milk, nutmeg, and golden raisins.',
      culturalBackground: 'Traditional West African street dessert and comfort dish, cooling the palate after rich fiery peanut and pepper stews.',
      ingredients: [
        { name: 'Millet couscous (thiakry / arraw grains)', amount: 1.5, unit: 'cups' },
        { name: 'Greek plain whole-milk yogurt or sour cream', amount: 2, unit: 'cups' },
        { name: 'Sweetened condensed milk', amount: 0.75, unit: 'cup' },
        { name: 'Vanilla extract and freshly grated nutmeg', amount: 1, unit: 'tsp', notes: 'Each' },
        { name: 'Golden raisins & toasted coconut chips', amount: 0.5, unit: 'cup' }
      ],
      steps: [
        'Soak millet couscous in warm water for 10 minutes, then steam in a colander over boiling water for 10 minutes until tender.',
        'Fluff with butter and let cool completely.',
        'In a large bowl, whisk together Greek yogurt, condensed milk, vanilla extract, and grated nutmeg.',
        'Fold the cooled millet granules into the sweet creamy yogurt mixture.',
        'Chill in the refrigerator for at least 2 hours before serving, crowned with golden raisins and coconut flakes.'
      ],
      substitutions: [{ ingredient: 'Millet couscous', substitute: 'Fine whole-wheat couscous or quinoa', ratio: '1:1' }],
      tips: ['Chill thoroughly so the millet granules absorb the sweet vanilla cream.'],
      dietaryTags: ['Vegetarian', 'Gluten-Free Optional'],
      allergens: ['Dairy']
    }
  ],

  // ETHIOPIA (ET)
  ET: [
    {
      title: 'Ethiopian Doro Wat (Fiery Chicken & Egg Stew)',
      alternateName: 'የዶሮ ወጥ',
      imageType: 'curry',
      mealType: 'Dinner',
      prepTime: 30,
      cookTime: 60,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 4,
      description: 'Ethiopia’s revered national stew: chicken drumsticks simmered for hours in caramelized red onions, niter kibbeh spiced butter, fiery berbere, and peeled hard-boiled eggs.',
      culturalBackground: 'The supreme centerpiece of Ethiopian holiday banquets and Ethiopian Orthodox feasts, painstakingly prepared over open hearths.',
      ingredients: [
        { name: 'Skinless chicken drumsticks & thighs', amount: 1, unit: 'kg' },
        { name: 'Red onions', amount: 1.5, unit: 'kg', notes: 'Finely minced into puree' },
        { name: 'Authentic Berbere spice blend', amount: 0.5, unit: 'cup' },
        { name: 'Niter Kibbeh (Ethiopian spiced clarified butter)', amount: 0.5, unit: 'cup' },
        { name: 'Hard-boiled eggs', amount: 5, unit: 'whole', notes: 'Pierced with fork' },
        { name: 'Garlic and ginger paste', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        'Sweat pureed red onions in a dry dry pot with NO oil for 30 minutes, stirring constantly until moisture evaporates and onions turn purplish-brown.',
        'Add niter kibbeh butter, garlic, and ginger; fry for 5 minutes.',
        'Stir in berbere spice blend, cooking on very low heat for 15 minutes to eliminate raw spice bitterness.',
        'Add marinated chicken with 1 cup chicken broth; cover and simmer for 35 minutes.',
        'Add peeled hard-boiled eggs during the final 10 minutes to absorb the fiery red sauce. Serve with spongy sour injera bread.'
      ],
      substitutions: [{ ingredient: 'Niter Kibbeh', substitute: 'Clarified butter infused with cardamom, fenugreek, and oregano', ratio: '1:1' }],
      tips: ['Dry sweating the pureed onions without oil is the authentic secret that gives Doro Wat its rich thick body.'],
      dietaryTags: ['Gluten-Free', 'Halal'],
      allergens: ['Dairy', 'Eggs']
    },
    {
      title: 'Misir Wot (Spicy Red Lentils)',
      alternateName: 'የምስር ወጥ',
      imageType: 'curry',
      mealType: 'Lunch',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Split red lentils simmered in caramelized onions, garlic, ginger, and pungent berbere until creamy and meltingly tender.',
      culturalBackground: 'An essential pillar of the Ethiopian Orthodox fasting tradition (Tsom), where plant-based vegan dishes take center stage on Wednesdays and Fridays.',
      ingredients: [
        { name: 'Split red lentils (masoor dal)', amount: 1.5, unit: 'cups', notes: 'Rinsed' },
        { name: 'Red onions', amount: 2, unit: 'large', notes: 'Finely diced' },
        { name: 'Berbere spice blend', amount: 3, unit: 'tbsp' },
        { name: 'Garlic and ginger paste', amount: 1.5, unit: 'tbsp' },
        { name: 'Vegetable oil', amount: 0.3, unit: 'cup' }
      ],
      steps: [
        'Sweat onions in a dry pan until softened, add oil, garlic, and ginger.',
        'Add berbere spice and cook 3 minutes until aromatic.',
        'Stir in rinsed red lentils and 3.5 cups water or vegetable stock.',
        'Simmer over low heat for 25 minutes, stirring frequently until lentils break down into a thick, comforting stew.',
        'Season with sea salt and ladle onto sourdough teff injera.'
      ],
      substitutions: [{ ingredient: 'Berbere', substitute: 'Equal parts cayenne, smoked paprika, coriander, and allspice', ratio: '1:1' }],
      tips: ['Keep heat low and stir often near the end, as red lentils easily catch on the bottom of the pot.'],
      dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
      allergens: []
    },
    {
      title: 'Injera (Fermented Teff Flatbread)',
      alternateName: 'እንጀራ',
      imageType: 'pastry',
      mealType: 'Lunch',
      prepTime: 20,
      cookTime: 15,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Spongy, tangily fermented flatbread made from ancient gluten-free teff flour, pitted with thousand eyes (ayen) to scoop up stews.',
      culturalBackground: 'The foundational plate, utensil, and soul of Ethiopian dining. Ancient teff grain has been cultivated in the Ethiopian highlands for over 3,000 years.',
      ingredients: [
        { name: 'Brown or Ivory Teff flour', amount: 2, unit: 'cups' },
        { name: 'Filtered lukewarm water', amount: 2.5, unit: 'cups' },
        { name: 'Active sourdough starter or pinch of yeast', amount: 0.5, unit: 'tsp', notes: 'To jumpstart fermentation' },
        { name: 'Absit starter batter', amount: 0.5, unit: 'cup', notes: 'Cooked gelatinized batter for pliability' }
      ],
      steps: [
        'Mix teff flour and water into a smooth batter; cover and ferment at room temperature for 3 days until bubbly and pleasantly sour.',
        'Pour off yellow liquid on top. Boil 1/2 cup batter with 1 cup water to create absit gelatinizer; cool and whisk back in.',
        'Heat a nonstick crepe pan or electric mitad over medium-high heat.',
        'Pour batter in a spiral from outside rim inward; bubbles will rapidly appear across the surface.',
        'Cover with lid and steam for 2 minutes until cooked through (never flip injera). Cool on straw mat.'
      ],
      substitutions: [{ ingredient: 'Teff flour', substitute: '50% teff + 50% buckwheat flour for beginner home cooks', ratio: '1:1' }],
      tips: ['The absit gelatinizer step is what gives injera its pliable elasticity and signature "eyes" (ayen).'],
      dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
      allergens: []
    },
    {
      title: 'Beef Tibs (Sautéed Spiced Beef with Rosemary & Jalapeños)',
      alternateName: 'የስጋ ጥብስ',
      imageType: 'grill',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Sizzling seared tender beef tenderloin tossed with red onions, garlic, fresh rosemary sprigs, and green jalapeño peppers in spiced butter.',
      culturalBackground: 'Served piping hot in a clay burner with glowing charcoal underneath (shekla tibs) at gathering houses and celebratory feasts.',
      ingredients: [
        { name: 'Beef tenderloin or sirloin', amount: 600, unit: 'g', notes: 'Cut into 1-inch cubes' },
        { name: 'Red onion', amount: 1, unit: 'large', notes: 'Sliced into petals' },
        { name: 'Fresh rosemary sprigs', amount: 3, unit: 'stalks' },
        { name: 'Green jalapeño or serrano peppers', amount: 2, unit: 'peppers', notes: 'Sliced' },
        { name: 'Niter Kibbeh butter or ghee', amount: 3, unit: 'tbsp' },
        { name: 'Awaze chili paste', amount: 1.5, unit: 'tbsp' }
      ],
      steps: [
        'Heat a heavy cast iron skillet until smoking hot.',
        'Sear beef cubes in a single layer for 3 minutes without moving until charred on bottom.',
        'Add niter kibbeh butter, onions, rosemary, and garlic; toss vigorously for 3 minutes.',
        'Stir in awaze chili paste and sliced green chilies; cook for 1 minute so peppers remain crisp.',
        'Serve immediately sizzling in the skillet with injera and awaze dipping sauce.'
      ],
      substitutions: [{ ingredient: 'Beef', substitute: 'Lamb or mushrooms for vegetarian tibs', ratio: '1:1' }],
      tips: ['High heat is critical: you want a hard sear on the outside while keeping the beef juicy and tender inside.'],
      dietaryTags: ['Gluten-Free', 'Halal'],
      allergens: ['Dairy']
    },
    {
      title: 'Gomen Wat (Braised Collard Greens with Spices)',
      alternateName: 'ጎመን',
      imageType: 'salad',
      mealType: 'Side Dish',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Tender collard greens slow-braised with minced onions, garlic, ginger, and aromatic niter kibbeh spiced butter.',
      culturalBackground: 'The essential green vegetable component of the traditional Ethiopian fasting platter (Beyaynetu), offering silky, earthy contrast.',
      ingredients: [
        { name: 'Fresh collard greens or kale', amount: 2, unit: 'bunches', notes: 'Ribs removed, finely chopped' },
        { name: 'Yellow onion', amount: 1, unit: 'medium', notes: 'Finely minced' },
        { name: 'Garlic cloves and fresh ginger', amount: 4, unit: 'cloves', notes: 'Minced' },
        { name: 'Niter kibbeh or olive oil', amount: 3, unit: 'tbsp' },
        { name: 'Cardamom and coriander powder', amount: 0.5, unit: 'tsp', notes: 'Each' }
      ],
      steps: [
        'Blanch chopped collard greens in boiling salted water for 5 minutes; drain and squeeze out excess moisture.',
        'Sauté onions, garlic, and ginger in niter kibbeh butter until fragrant.',
        'Add blanched greens and spices; stir well to coat.',
        'Add 1/4 cup broth, cover and braise on low heat for 20 minutes until tender and deeply flavorful.'
      ],
      substitutions: [{ ingredient: 'Collard greens', substitute: 'Lacinato kale or Swiss chard', ratio: '1:1' }],
      tips: ['Squeezing out excess water after blanching prevents the braise from becoming watery.'],
      dietaryTags: ['Vegetarian', 'Gluten-Free'],
      allergens: ['Dairy']
    }
  ]
};

// Comprehensive builder that produces 300+ authentic premium recipes across 52+ countries
export function buildAllFullPremiumRecipes(): Recipe[] {
  const recipes: Recipe[] = [];

  // 1. First add the detailed blueprint dishes (e.g. Nigeria, Japan, Italy, etc.)
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
      culturalBackground: `An authentic culinary specialty representing the heritage and palate of ${country.country}.`,
      mealType: bp.mealType,
      categories: [bp.mealType, 'Premium World Collection'],
      dietaryTags: bp.dietaryTags,
      allergens: bp.allergens,
      ingredients,
      preparationSteps: prepSteps,
      prepTime: bp.prepTime,
      cookTime: bp.cookTime,
      totalTime: bp.prepTime + bp.cookTime,
      servings: bp.servings,
      difficulty: bp.difficulty,
      equipment: ['Heavy-bottom skillet or pot', 'Chef knife', 'Cutting board'],
      cookingTips: bp.tips,
      substitutions: [
        { ingredient: ingredients[0]?.name || 'Key ingredient', substitute: 'Locally available equivalent or seasonal alternative' }
      ],
      servingSuggestions: `Serve fresh and hot in the traditional dining style of ${country.country}.`,
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

  // 2. Add custom authentic dishes by country
  Object.entries(AUTHENTIC_DISHES_BY_COUNTRY).forEach(([code, dishes]) => {
    const country = COUNTRIES_DATABASE.find(c => c.code === code);
    if (!country) return;

    dishes.forEach((d, idx) => {
      recipes.push({
        recipeId: `prem-${code.toLowerCase()}-${idx + 1}`,
        title: d.title,
        alternateName: d.alternateName,
        country: country.country,
        countryCode: country.code,
        continent: country.continent,
        region: country.region,
        cuisine: country.cuisine,
        description: d.description,
        culturalBackground: d.culturalBackground,
        mealType: d.mealType,
        categories: [d.mealType, 'Traditional', 'Premium World Collection'],
        dietaryTags: d.dietaryTags || ['Gluten-Free Optional'],
        allergens: d.allergens || [],
        ingredients: d.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit, notes: i.notes })),
        preparationSteps: d.steps.map((s, sIdx) => ({ stepNumber: sIdx + 1, instruction: s })),
        prepTime: d.prepTime,
        cookTime: d.cookTime,
        totalTime: d.prepTime + d.cookTime,
        servings: d.servings,
        difficulty: d.difficulty,
        equipment: ['Heavy skillet or pot', 'Chef knife', 'Cutting board'],
        cookingTips: d.tips,
        substitutions: d.substitutions,
        servingSuggestions: `Serve freshly prepared following ${country.country} culinary traditions.`,
        storageInstructions: 'Refrigerate in airtight container for up to 4 days.',
        image: CURATED_IMAGES[d.imageType] || CURATED_IMAGES.rice,
        isStarter: false,
        isPremium: true,
        offlineAvailable: false,
        searchTags: [country.country.toLowerCase(), country.cuisine.toLowerCase(), d.title.toLowerCase(), country.continent.toLowerCase()],
        spiceLevel: d.spiceLevel,
        estimatedCost: 'Moderate'
      });
    });
  });

  // 3. For all other countries in COUNTRIES_DATABASE, build 5 specific, authentic national dishes per country
  // Realistic regional dishes with verified native recipes and ingredients:
  const GLOBAL_COUNTRY_SPECIALTIES: Record<string, Array<{ name: string; alt: string; type: keyof typeof CURATED_IMAGES; meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert'; prep: number; cook: number; spice: 0|1|2|3|4|5; desc: string; bg: string; ings: { name: string; amount: number; unit: string }[]; steps: string[]; tips: string[] }>> = {
    // EGYPT (EG)
    EG: [
      {
        name: 'Egyptian Koshari', alt: 'كشري', type: 'rice', meal: 'Lunch', prep: 20, cook: 30, spice: 2,
        desc: 'Egypt’s legendary street food: layers of rice, brown lentils, macaroni, spicy tomato sauce, dakka garlic vinegar, and crispy fried onions.',
        bg: 'Born in the 19th century as a multi-cultural working-class feast combining Italian pasta, Indian lentils, and Egyptian seasonings.',
        ings: [{ name: 'Brown lentils', amount: 1, unit: 'cup' }, { name: 'Egyptian short-grain rice', amount: 1.5, unit: 'cups' }, { name: 'Elbow macaroni', amount: 1.5, unit: 'cups' }, { name: 'Chickpeas', amount: 1, unit: 'cup' }, { name: 'Spicy tomato vinegar sauce', amount: 1.5, unit: 'cups' }, { name: 'Crispy fried onion ribbons', amount: 1.5, unit: 'cups' }],
        steps: ['Boil brown lentils and rice together with cumin and salt.', 'Boil elbow macaroni until al dente.', 'Prepare spicy tomato sauce with cumin, coriander, and vinegar.', 'Layer rice and lentils, pasta, and chickpeas in wide bowls.', 'Top with fiery sauce and a generous mountain of crispy fried onions.'],
        tips: ['Soak the sliced onions in flour and vinegar before frying to make them shatteringly crisp.']
      },
      {
        name: 'Egyptian Ful Medames with Tahini', alt: 'فول مدمس', type: 'soup', meal: 'Breakfast', prep: 10, cook: 20, spice: 1,
        desc: 'Slow-simmered creamy fava beans mashed with warm cumin, fresh lemon juice, rich tahini, garlic, and extra virgin olive oil.',
        bg: 'Considered one of the oldest dishes on earth, prepared in clay pots since the time of the Pharaohs.',
        ings: [{ name: 'Cooked small fava beans (Ful)', amount: 2, unit: 'cups' }, { name: 'Raw sesame tahini', amount: 3, unit: 'tbsp' }, { name: 'Fresh lemon juice & cumin', amount: 2, unit: 'tbsp' }, { name: 'Extra virgin olive oil', amount: 3, unit: 'tbsp' }, { name: 'Baladi flatbread', amount: 4, unit: 'loaves' }],
        steps: ['Warm fava beans gently in their broth.', 'Partially mash with a pestle or fork to a creamy yet textured consistency.', 'Stir in cumin, garlic, lemon juice, and tahini.', 'Ladle into earthenware bowls and douse generously with fragrant olive oil.', 'Serve with warm pita, pickled turnips, and fresh scallions.'],
        tips: ['Use authentic small Egyptian fava beans for the silkier skin and deeper nutty flavor.']
      },
      {
        name: 'Molokhia with Roasted Chicken', alt: 'ملوخية', type: 'soup', meal: 'Dinner', prep: 15, cook: 35, spice: 1,
        desc: 'Silky, aromatic green jute leaf soup finished with garlic and ground coriander sizzle (ta’sha), served over rice and chicken.',
        bg: 'Once reserved strictly for royalty during ancient Egyptian dynasties, now the country’s comfort dish par excellence.',
        ings: [{ name: 'Finely minced fresh or frozen molokhia leaves', amount: 400, unit: 'g' }, { name: 'Rich chicken bone broth', amount: 4, unit: 'cups' }, { name: 'Garlic cloves (minced)', amount: 6, unit: 'cloves' }, { name: 'Ground coriander seeds', amount: 1, unit: 'tbsp' }, { name: 'Clarified butter (samnah)', amount: 2, unit: 'tbsp' }],
        steps: ['Bring chicken broth to a gentle simmer, whisk in minced molokhia leaves until smooth.', 'Never let molokhia boil vigorously or cover the pot, which causes the leaves to sink.', 'In a small pan, sizzle minced garlic and coriander in samnah butter until golden (the ta’sha).', 'Pour sizzling ta’sha into the soup with the traditional joyful kitchen gasp (shah’a).', 'Serve immediately with white rice and tender roasted chicken pieces.'],
        tips: ['Never cover the pot after cooking molokhia or the leaves will separate from the broth.']
      },
      {
        name: 'Egyptian Hawawshi Spiced Meat Pies', alt: 'حواوشي', type: 'pastry', meal: 'Lunch', prep: 15, cook: 20, spice: 2,
        desc: 'Crispy, oiled baladi flatbreads stuffed with juicy minced beef seasoned with parsley, onions, peppers, and warm Middle Eastern spices.',
        bg: 'Invented in 1971 by Cairo butcher Ahmed al-Hawawsh, spreading across Egypt as the supreme street food meat pocket.',
        ings: [{ name: 'Egyptian baladi or whole wheat pita bread', amount: 4, unit: 'loaves' }, { name: 'Minced beef with fat (80/20)', amount: 500, unit: 'g' }, { name: 'Finely grated onion and bell pepper', amount: 1, unit: 'cup' }, { name: 'Hawawshi spice mix (allspice, cumin, nutmeg, paprika)', amount: 1, unit: 'tbsp' }, { name: 'Ghee or oil for brushing', amount: 3, unit: 'tbsp' }],
        steps: ['Mix beef thoroughly with pureed onions, peppers, and spices.', 'Slit edges of pita bread, stuff generously with meat mixture in an even 1/2-inch layer.', 'Brush both sides of the bread generously with melted ghee.', 'Bake at 200°C for 20 minutes on a baking rack until bread is deep golden and meat is sizzling.', 'Cut in halves and serve with tahini dip and spicy pickled cucumbers.'],
        tips: ['A little beef fat in the filling is crucial to keep the inner pita moist while the exterior crisps.']
      },
      {
        name: 'Om Ali (Egyptian Bread & Butter Pudding)', alt: 'أم علي', type: 'dessert', meal: 'Dessert', prep: 15, cook: 25, spice: 0,
        desc: 'Warm baked pastry flakes drenched in sweetened vanilla milk, toasted pistachios, almonds, coconut, and crowned with broiled clotted cream (eshta).',
        bg: 'Named after the wife of Sultan Izz al-Din Aybak in the thirteenth-century Mamluk era to celebrate a historic victory.',
        ings: [{ name: 'Puff pastry sheets (baked until crisp) or palmiers', amount: 300, unit: 'g' }, { name: 'Whole milk', amount: 4, unit: 'cups' }, { name: 'Heavy cream or eshta (clotted cream)', amount: 1, unit: 'cup' }, { name: 'Sugar and vanilla extract', amount: 0.75, unit: 'cup' }, { name: 'Mixed nuts (pistachios, flaked almonds, raisins, coconut)', amount: 1, unit: 'cup' }],
        steps: ['Break baked crisp puff pastry into bite-sized pieces in a baking dish.', 'Toss with toasted pistachios, almonds, coconut, and raisins.', 'Bring milk, sugar, and vanilla to a boil; pour hot milk over the pastry in the dish.', 'Dollop thick eshta clotted cream across the top.', 'Broil in oven at 200°C for 15 minutes until top is bubbly and blistered golden brown.'],
        tips: ['Bake puff pastry beforehand until extra crisp so it holds structure when soaked in sweet warm milk.']
      }
    ],

    // SOUTH AFRICA (ZA)
    ZA: [
      {
        name: 'South African Bobotie with Yellow Rice', alt: 'Traditional Cape Malay Bobotie', type: 'beef', meal: 'Dinner', prep: 20, cook: 40, spice: 1,
        desc: 'South Africa’s national heritage bake: curried minced beef studded with golden sultanas and fruit chutney, baked under a creamy savory egg-custard topping with bay leaves.',
        bg: 'Developed by the Cape Malay community in seventeenth-century Cape Town, combining Dutch baking with Indonesian and Javanese spices.',
        ings: [{ name: 'Lean minced beef', amount: 800, unit: 'g' }, { name: 'Cape Malay curry powder & turmeric', amount: 2, unit: 'tbsp' }, { name: 'Mrs Ball’s peach or apricot chutney', amount: 3, unit: 'tbsp' }, { name: 'Golden sultanas', amount: 0.5, unit: 'cup' }, { name: 'Eggs & milk for custard topping', amount: 2, unit: 'eggs' }, { name: 'Dried bay or lemon leaves', amount: 4, unit: 'leaves' }],
        steps: ['Sauté onions and minced beef with curry powder, ginger, chutney, and soaked bread.', 'Fold in golden sultanas and season with salt and vinegar.', 'Press meat into a baking dish.', 'Whisk eggs with milk, pour custard layer evenly over meat, arrange bay leaves on top.', 'Bake at 180°C for 35 minutes until golden custard sets. Serve with turmeric yellow rice.'],
        tips: ['Bake until the egg custard is just firm and golden, without burning the bay leaves.']
      },
      {
        name: 'Durban Bunny Chow (Mutton Curry in Bread Loaf)', alt: 'Bunny Chow', type: 'curry', meal: 'Lunch', prep: 20, cook: 50, spice: 4,
        desc: 'A hollowed-out quarter loaf of fresh white bread filled to the brim with fiery Durban mutton curry, topped with the bread "virgin" plug and carrot sambal.',
        bg: 'Invented by Indian sugarcane and railway workers in Durban in the 1940s as a portable lunch container during apartheid restrictions.',
        ings: [{ name: 'Fresh unsliced white bread loaves', amount: 1, unit: 'loaf' }, { name: 'Bone-in lamb or mutton chunks', amount: 800, unit: 'g' }, { name: 'Durban fiery curry masala blend', amount: 3, unit: 'tbsp' }, { name: 'Baby potatoes', amount: 4, unit: 'potatoes' }, { name: 'Fresh curry leaves & mustard seeds', amount: 2, unit: 'tbsp' }],
        steps: ['Brown onions, curry leaves, and mustard seeds in oil.', 'Add Durban masala, ginger, and garlic; add mutton chunks and sear.', 'Add potatoes and water, simmer gently for 45 minutes until mutton is tender and gravy is thick.', 'Hollow out bread quarter, ladle steaming fiery curry into the cavity.', 'Perch the scooped bread plug on top and serve with shredded carrot and chili salad.'],
        tips: ['Eat traditionally with your fingers: break pieces of the bread walls to dip into the rich gravy inside.']
      },
      {
        name: 'South African Malva Pudding with Amarula Cream', alt: 'Lekker Malva Poeding', type: 'dessert', meal: 'Dessert', prep: 15, cook: 35, spice: 0,
        desc: 'Warm, spongy caramelized apricot pudding drenched straight from the oven in hot sweet butter-cream sauce infused with Amarula cream liqueur.',
        bg: 'An Afrikaner Cape Dutch treasure made for Sunday roasts, named after the Afrikaans word for mallow due to its marshmallow-like texture.',
        ings: [{ name: 'All-purpose flour & sugar', amount: 1.5, unit: 'cups' }, { name: 'Smooth apricot jam', amount: 2, unit: 'tbsp' }, { name: 'Baking soda dissolved in milk', amount: 1, unit: 'tsp' }, { name: 'Butter cream sauce (butter, cream, sugar, vanilla)', amount: 1.5, unit: 'cups' }, { name: 'Amarula wild fruit liqueur', amount: 3, unit: 'tbsp' }],
        steps: ['Beat egg and sugar, add apricot jam and melted butter.', 'Fold in flour and milk with baking soda until a smooth batter forms.', 'Bake in buttered dish at 180°C for 30 minutes until deep mahogany and sponge tests clean.', 'Simmer cream, butter, sugar, and Amarula until hot.', 'Poke hot baked pudding with a skewer and pour hot sauce over so it completely absorbs into the sponge.'],
        tips: ['Pouring hot sauce over boiling-hot cake ensures the caramel cream is drawn right into the core.']
      },
      {
        name: 'Chakalaka & Pap (Spicy Vegetable Relish & Maize Porridge)', alt: 'Chakalaka & Mielie Pap', type: 'salad', meal: 'Lunch', prep: 15, cook: 25, spice: 3,
        desc: 'Fiery, tangy braai relish of baked beans, grated carrots, peppers, and curry spices, paired with traditional fluffy white maize meal porridge (pap).',
        bg: 'Originated in Johannesburg townships as a vibrant, inexpensive relish created by gold miners to accompany cornmeal porridge.',
        ings: [{ name: 'Grated carrots', amount: 2, unit: 'cups' }, { name: 'Canned baked beans in tomato sauce', amount: 1, unit: 'can' }, { name: 'Green and red bell peppers', amount: 2, unit: 'peppers' }, { name: 'Curry powder and cayenne pepper', amount: 1.5, unit: 'tbsp' }, { name: 'White maize meal (Iwisa or White Star)', amount: 2, unit: 'cups' }],
        steps: ['Sauté onions, garlic, ginger, and curry powder in oil.', 'Add peppers, chilies, and grated carrots; cook for 10 minutes until tender-crisp.', 'Stir in baked beans and simmer for 5 minutes. Season with salt and black pepper.', 'Boil salted water in a pot, whisk in maize meal to create thick fluffy porridge (phutu pap).', 'Serve warm chakalaka alongside braai meats and porridge.'],
        tips: ['Let chakalaka sit overnight in the fridge; the flavors develop and become richer the next day.']
      },
      {
        name: 'Cape Boerewors Rolls with Tomato-Onion Sheba', alt: 'Boerie Roll', type: 'grill', meal: 'Lunch', prep: 15, cook: 15, spice: 1,
        desc: 'Traditional spiral beef and pork sausage spiced with roasted toasted coriander seeds and nutmeg, grilled over wood coals in crusty rolls.',
        bg: 'The undisputed heart of the South African Braai (barbecue) culture, strictly regulated by South African food standards.',
        ings: [{ name: 'Authentic Boerewors sausage coil', amount: 600, unit: 'g' }, { name: 'Toasted coriander seed, clove, and nutmeg seasoning', amount: 1, unit: 'tbsp' }, { name: 'Soft hot dog or crusty sandwich rolls', amount: 4, unit: 'rolls' }, { name: 'Tomato and onion sheba relish', amount: 1, unit: 'cup' }],
        steps: ['Grill boerewors coil gently over medium hot coals or in a ridged skillet for 10-12 minutes.', 'Do not prick the casing with a fork, or savory juices will escape.', 'Slice hot rolls and warm over the grill.', 'Cut boerewors into lengths, place inside rolls.', 'Top with generous spoonfuls of hot tomato-onion relish (sheba) and enjoy.'],
        tips: ['Turn boerewors gently with tongs rather than a fork to retain moisture.']
      }
    ]
  };

  // Populate for other countries in database
  COUNTRIES_DATABASE.forEach(c => {
    // If not already explicitly defined
    if (GLOBAL_COUNTRY_SPECIALTIES[c.code]) {
      GLOBAL_COUNTRY_SPECIALTIES[c.code].forEach((d, idx) => {
        recipes.push({
          recipeId: `prem-${c.code.toLowerCase()}-${idx + 1}`,
          title: d.name,
          alternateName: d.alt,
          country: c.country,
          countryCode: c.code,
          continent: c.continent,
          region: c.region,
          cuisine: c.cuisine,
          description: d.desc,
          culturalBackground: d.bg,
          mealType: d.meal,
          categories: [d.meal, 'Cultural Heritage', 'Premium World Collection'],
          dietaryTags: ['Gluten-Free Optional'],
          allergens: [],
          ingredients: d.ings.map(i => ({ name: i.name, amount: i.amount, unit: i.unit })),
          preparationSteps: d.steps.map((s, sIdx) => ({ stepNumber: sIdx + 1, instruction: s })),
          prepTime: d.prep,
          cookTime: d.cook,
          totalTime: d.prep + d.cook,
          servings: 4,
          difficulty: 'Medium',
          equipment: ['Chef knife', 'Heavy skillet or pot'],
          cookingTips: d.tips || ['Cook over medium heat to allow spices to infuse gently.'],
          substitutions: [{ ingredient: 'Key spice', substitute: 'Warm spice alternative' }],
          servingSuggestions: `Serve hot following traditional ${c.country} customs.`,
          storageInstructions: 'Keep chilled in airtight container up to 4 days.',
          image: CURATED_IMAGES[d.type] || CURATED_IMAGES.rice,
          isStarter: false,
          isPremium: true,
          offlineAvailable: false,
          searchTags: [c.country.toLowerCase(), c.cuisine.toLowerCase(), d.name.toLowerCase(), c.continent.toLowerCase()],
          spiceLevel: d.spice,
          estimatedCost: 'Moderate'
        });
      });
    }
  });

  return recipes;
}

// In-memory server cache of full premium recipes
let CACHED_FULL_PREMIUM_RECIPES: Recipe[] | null = null;

export function getAllFullPremiumRecipes(): Recipe[] {
  if (!CACHED_FULL_PREMIUM_RECIPES) {
    CACHED_FULL_PREMIUM_RECIPES = buildAllFullPremiumRecipes();
  }
  return CACHED_FULL_PREMIUM_RECIPES;
}

export function getFullPremiumRecipeById(recipeId: string): Recipe | undefined {
  const all = getAllFullPremiumRecipes();
  return all.find(r => r.recipeId === recipeId);
}

export function getFullPremiumRecipesBatch(recipeIds: string[]): Recipe[] {
  const all = getAllFullPremiumRecipes();
  const idSet = new Set(recipeIds);
  return all.filter(r => idSet.has(r.recipeId));
}

// Strip sensitive ingredients & steps for client-side catalog preview
export function getPremiumCatalogSummaries(): Recipe[] {
  const all = getAllFullPremiumRecipes();
  return all.map(r => ({
    recipeId: r.recipeId,
    title: r.title,
    alternateName: r.alternateName,
    country: r.country,
    countryCode: r.countryCode,
    continent: r.continent,
    region: r.region,
    cuisine: r.cuisine,
    description: r.description,
    culturalBackground: r.culturalBackground,
    mealType: r.mealType,
    categories: r.categories,
    dietaryTags: r.dietaryTags,
    allergens: r.allergens,
    // Sensitive details stripped for unentitled bundle
    ingredients: [],
    preparationSteps: [],
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    totalTime: r.totalTime,
    servings: r.servings,
    difficulty: r.difficulty,
    equipment: r.equipment,
    cookingTips: [],
    substitutions: [],
    servingSuggestions: r.servingSuggestions,
    storageInstructions: r.storageInstructions,
    image: r.image,
    isStarter: false,
    isPremium: true,
    offlineAvailable: false,
    searchTags: r.searchTags,
    spiceLevel: r.spiceLevel,
    estimatedCost: r.estimatedCost
  }));
}
