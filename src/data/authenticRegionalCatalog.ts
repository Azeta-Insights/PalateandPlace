import { RegionalDishData } from './recipesAfrica.js';
import { AFRICA_DISHES } from './recipesAfrica.js';

export const AUTHENTIC_GLOBAL_CATALOG: Record<string, RegionalDishData[]> = {
  ...AFRICA_DISHES,

  // SOUTH AFRICA
  ZA: [
    {
      title: 'Durban Bunny Chow',
      alternateName: 'Curry in a Bread Loaf',
      type: 'curry',
      mealType: 'Lunch',
      prepTime: 20,
      cookTime: 40,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 4,
      description: 'Hollowed-out half loaf of crusty white bread filled to the brim with fiery Durban lamb and potato curry, topped with bread "virgin" stopper and sambal.',
      culturalBackground: 'Created by Indian indentured laborers in KwaZulu-Natal as a portable, bowl-free lunch during apartheid, now an iconic South African fast food.',
      ingredients: [
        { name: 'Loaf of unsliced white bread (halved and hollowed)', amount: 2, unit: 'loaves' },
        { name: 'Bone-in lamb shoulder (cubed)', amount: 700, unit: 'g' },
        { name: 'Durban curry powder & garam masala', amount: 3, unit: 'tbsp' },
        { name: 'Potatoes (halved)', amount: 3, unit: 'potatoes' },
        { name: 'Curry leaves & fresh coriander', amount: 2, unit: 'tbsp' },
        { name: 'Tomato & grated carrot sambals', amount: 1, unit: 'cup' }
      ],
      steps: [
        { instruction: 'Sauté onions, garlic, ginger, and curry leaves in oil until golden brown.', timerMinutes: 5 },
        { instruction: 'Add Durban curry powder and brown the lamb cubes on high heat.', timerMinutes: 5 },
        { instruction: 'Add water and simmer covered for 25 minutes until lamb is almost tender.', timerMinutes: 25 },
        { instruction: 'Add halved potatoes; simmer until potatoes are meltingly soft and gravy is thick (15 mins).', timerMinutes: 15 },
        { instruction: 'Hollow out bread loaves, ladle piping hot curry inside, cap with the bread piece (virgin), and serve with spicy grated carrot sambal.' }
      ],
      substitutions: [{ ingredient: 'Lamb', substitute: 'Sugar beans (for vegetarian Bunny Chow) or beef chuck' }],
      tips: ['Eat authentic Bunny Chow purely with your fingers by tearing pieces of the bread wall and dipping into the rich gravy.']
    },
    {
      title: 'Cape Malay Pickled Fish',
      alternateName: 'Kaapse Kerrievis',
      type: 'seafood',
      mealType: 'Lunch',
      prepTime: 20,
      cookTime: 20,
      servings: 6,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Golden fried firm white fish pickled in a tangy, sweet-sour aromatic spiced curry and onion vinegar brine with bay leaves and allspice.',
      culturalBackground: 'A beloved Cape Malay Easter tradition dating back over 300 years to the Dutch East India Company era.',
      ingredients: [
        { name: 'Firm white fish fillets (kingklip or cod)', amount: 800, unit: 'g' },
        { name: 'Yellow onions (sliced into rings)', amount: 4, unit: 'onions' },
        { name: 'White vinegar', amount: 2, unit: 'cups' },
        { name: 'Brown sugar', amount: 0.75, unit: 'cup' },
        { name: 'Turmeric, curry powder, coriander, and allspice berries', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Dust seasoned fish fillets in flour and fry in shallow oil for 3 minutes per side until golden; place in deep ceramic dish.', timerMinutes: 6 },
        { instruction: 'In a saucepan, boil vinegar, sugar, turmeric, curry powder, and whole spices for 5 minutes.', timerMinutes: 5 },
        { instruction: 'Add sliced onion rings to the vinegar brine; cook for 5 minutes until tender yet retaining slight crunch.', timerMinutes: 5 },
        { instruction: 'Pour hot spiced pickling liquid and onions over fried fish; let cool and refrigerate for 24-48 hours before serving with crusty buttered bread.' }
      ],
      substitutions: [{ ingredient: 'Kingklip', substitute: 'Haddock, halibut, or sea bass' }],
      tips: ['Letting the pickled fish steep in the fridge for 2 full days intensifies the sweet-sour aromatic flavor profile.']
    },
    {
      title: 'Chakalaka & Creamy Pap',
      alternateName: 'Spicy Vegetable Relish with Maize Porridge',
      type: 'salad',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Zesty braai relish made with grated carrots, bell peppers, baked beans, chillies, and curry powder served over steaming fluffy white maize meal pap.',
      culturalBackground: 'Originated in the townships of Johannesburg by gold miners, now an indispensable staple of any authentic South African braai barbecue.',
      ingredients: [
        { name: 'White maize meal (Mielie meal)', amount: 2, unit: 'cups' },
        { name: 'Carrots (coarsely grated)', amount: 3, unit: 'carrots' },
        { name: 'Baked beans in tomato sauce', amount: 1, unit: 'can (400g)' },
        { name: 'Green & red bell peppers (diced)', amount: 2, unit: 'peppers' },
        { name: 'Curry powder & crushed red chillies', amount: 1.5, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Bring salted water to boil; slowly whisk in maize meal and stir vigorously to avoid lumps. Cover and steam pap for 20 minutes.', timerMinutes: 20 },
        { instruction: 'In a skillet, sauté onions, garlic, and curry powder in oil until aromatic.', timerMinutes: 3 },
        { instruction: 'Add grated carrots and peppers; sauté for 8 minutes until softened.', timerMinutes: 8 },
        { instruction: 'Fold in baked beans and seasonings; simmer 5 minutes and serve warm alongside buttery pap.' }
      ],
      substitutions: [{ ingredient: 'Maize meal', substitute: 'Coarse white polenta' }],
      tips: ['Add a tablespoon of butter to the steaming pap at the end for extra silkiness.']
    },
    {
      title: 'Traditional Malva Pudding with Warm Custard',
      alternateName: 'Lekker Malvapoeding',
      type: 'dessert',
      mealType: 'Dessert',
      prepTime: 15,
      cookTime: 35,
      servings: 8,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Spongy, caramelized apricot jam cake soaked while piping hot in a rich, buttery vanilla cream sauce, served with velvety custard.',
      culturalBackground: 'Dutch Cape heritage dessert, famed for its deep toffee interior created by the chemical reaction of vinegar and baking soda.',
      ingredients: [
        { name: 'Smooth apricot jam', amount: 2, unit: 'tbsp' },
        { name: 'Sugar and all-purpose flour', amount: 1, unit: 'cup', notes: 'Each' },
        { name: 'Baking soda & white vinegar', amount: 1, unit: 'tsp', notes: 'Each' },
        { name: 'Heavy cream & butter (for soaking sauce)', amount: 1, unit: 'cup', notes: 'Simmered with 1/2 cup sugar and vanilla' },
        { name: 'Warm vanilla custard', amount: 2, unit: 'cups' }
      ],
      steps: [
        { instruction: 'Beat egg and sugar until fluffy; fold in apricot jam, melted butter, vinegar, and flour with dissolved baking soda.', timerMinutes: 5 },
        { instruction: 'Pour batter into greased baking dish; bake at 180°C (350°F) for 30 minutes until golden and springy.', timerMinutes: 30 },
        { instruction: 'While cake bakes, boil cream, butter, sugar, and vanilla in a saucepan for 3 minutes.', timerMinutes: 3 },
        { instruction: 'Poke holes all over hot baked pudding with a skewer and immediately pour the warm buttery sauce over to absorb completely.', timerMinutes: 5 },
        { instruction: 'Serve warm draped in rich yellow custard.' }
      ],
      substitutions: [{ ingredient: 'Apricot jam', substitute: 'Marmalade or peach preserves' }],
      tips: ['Pour the sauce over the pudding the exact second it comes out of the oven so the porous cake drinks in every drop.']
    },
    {
      title: 'Braai Boerewors with Onion-Tomato Sheba',
      alternateName: 'Farmers Sausage with Braai Relish',
      type: 'grill',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Coarse beef and pork spiral sausage spiced with toasted coriander seed, clove, and nutmeg, grilled over open wood embers with rich tomato sheba gravy.',
      culturalBackground: 'South Africa’s premier national barbecue sausage, strictly regulated by law to contain over 90% prime meat with no offal.',
      ingredients: [
        { name: 'Traditional Boerewors sausage spiral', amount: 800, unit: 'g' },
        { name: 'Crushed toasted coriander seeds & cloves', amount: 1, unit: 'tbsp' },
        { name: 'Ripe tomatoes (chopped)', amount: 4, unit: 'tomatoes' },
        { name: 'Yellow onions & garlic', amount: 2, unit: 'onions' },
        { name: 'Braai broodjies (cheese & tomato grilled sandwiches)', amount: 4, unit: 'sandwiches' }
      ],
      steps: [
        { instruction: 'Place whole coiled boerewors over moderate charcoal embers on the braai grill.', timerMinutes: 5 },
        { instruction: 'Turn once gently using braai tongs (never pierce the casing with a fork); grill for 12-15 minutes until juicy with a smoky snap.', timerMinutes: 15 },
        { instruction: 'Simmer chopped tomatoes, onions, garlic, and brown sugar in a cast-iron potjie over coals for 15 minutes to make sheba sauce.', timerMinutes: 15 },
        { instruction: 'Slice boerewors into sections and serve smothered in hot sheba gravy with braaied roosterkoek or broodjies.' }
      ],
      substitutions: [{ ingredient: 'Boerewors', substitute: 'Coriander-spiced beef bratwurst' }],
      tips: ['Never prick boerewors while cooking; keeping the casing intact preserves the natural juices and spiced fat.']
    }
  ],

  // SENEGAL
  SN: [
    {
      title: 'Poulet Yassa (Senegalese Lemon Caramelized Onion Chicken)',
      alternateName: 'Yassa Guinar',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 40,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Succulent chicken marinated in loads of fresh lemon juice, Dijon mustard, and habanero, braised with mounds of sweet caramelized onions and green olives.',
      culturalBackground: 'Hailing from the Casamance region of southern Senegal, celebrated for its bold citrus tang and peppery sweetness.',
      ingredients: [
        { name: 'Bone-in chicken thighs and drumsticks', amount: 1, unit: 'kg' },
        { name: 'Yellow onions (thinly sliced)', amount: 6, unit: 'large onions' },
        { name: 'Fresh lemon juice', amount: 0.75, unit: 'cup' },
        { name: 'Dijon mustard', amount: 3, unit: 'tbsp' },
        { name: 'Green pitted olives', amount: 0.5, unit: 'cup' },
        { name: 'Habenero / Scotch bonnet pepper', amount: 1, unit: 'pepper', notes: 'Whole pierced' }
      ],
      steps: [
        { instruction: 'Marinate chicken and sliced onions in lemon juice, Dijon mustard, garlic, and oil for at least 2 hours.', timerMinutes: 10 },
        { instruction: 'Remove chicken from marinade and sear or broil for 8 minutes until golden and charred.', timerMinutes: 8 },
        { instruction: 'In a heavy Dutch oven, sauté marinated onions over medium heat for 20 minutes until meltingly caramelized and golden.', timerMinutes: 20 },
        { instruction: 'Add seared chicken, remaining marinade juices, green olives, and whole scotch bonnet; cover and simmer for 25 minutes.', timerMinutes: 25 },
        { instruction: 'Serve over fluffy white jasmine rice with lemon wedges.' }
      ],
      substitutions: [{ ingredient: 'Dijon mustard', substitute: 'Stone-ground whole grain mustard' }],
      tips: ['Caramelizing the onions slowly brings out their natural sugars to balance the sharp lemon acidity.']
    },
    {
      title: 'Mafé (Senegalese Peanut Stew with Beef)',
      alternateName: 'Tigadèguèna',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 50,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Velvety rich ground peanut paste stew simmered with tender beef chuck, sweet potatoes, cabbage, and smoked fish in a savoury tomato broth.',
      culturalBackground: 'A beloved West African staple adopted across the Sahel, combining roasted peanut butter with root vegetables.',
      ingredients: [
        { name: 'Beef chuck roast (cut into 1.5-inch cubes)', amount: 700, unit: 'g' },
        { name: 'Natural smooth roasted peanut butter (100% peanuts)', amount: 1, unit: 'cup' },
        { name: 'Tomato paste', amount: 3, unit: 'tbsp' },
        { name: 'Sweet potato & carrots (cubed)', amount: 2, unit: 'cups' },
        { name: 'Cabbage wedges', amount: 0.5, unit: 'head' }
      ],
      steps: [
        { instruction: 'Brown beef cubes in oil with onions and garlic in a Dutch oven.', timerMinutes: 8 },
        { instruction: 'Stir in tomato paste and fry for 3 minutes until darkened.', timerMinutes: 3 },
        { instruction: 'Whisk peanut butter with 2 cups warm broth until smooth; pour into the pot and bring to a simmer.', timerMinutes: 5 },
        { instruction: 'Add root vegetables, cabbage wedges, and scotch bonnet; cover and simmer on low for 35 minutes until beef is tender and oil floats to top.', timerMinutes: 35 },
        { instruction: 'Serve piping hot over fragrant white rice.' }
      ],
      substitutions: [{ ingredient: 'Peanut butter', substitute: 'Sunflower seed butter or almond butter' }],
      tips: ['Whisking the peanut paste with warm broth before adding ensures a velvety, lump-free sauce.']
    },
    {
      title: 'Pastels de Poisson (Senegalese Fish Hand Pies with Spicy Sauce)',
      alternateName: 'Senegalese Fish Empanadas',
      type: 'pastry',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 20,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 3,
      description: 'Flaky golden hand-pie turnovers stuffed with spiced flaked white fish, garlic, and fresh parsley, served with fiery tomato-onion dipping sauce (sauce pastels).',
      culturalBackground: 'A staple street food and party appetizer across Dakar influenced by Portuguese maritime trade.',
      ingredients: [
        { name: 'All-purpose flour & cold butter (for pastry dough)', amount: 2.5, unit: 'cups' },
        { name: 'Cooked white fish (flaked)', amount: 350, unit: 'g' },
        { name: 'Fresh parsley & garlic (minced)', amount: 3, unit: 'tbsp' },
        { name: 'Sauce pastels (cooked spicy tomato-onion relish)', amount: 1, unit: 'cup' }
      ],
      steps: [
        { instruction: 'Mix flour, butter, egg, and ice water into a tender pastry dough; rest for 20 minutes.', timerMinutes: 20 },
        { instruction: 'Sauté flaked fish with garlic, parsley, onions, and scotch bonnet for the filling.', timerMinutes: 5 },
        { instruction: 'Roll out dough, cut into circles, spoon filling inside, and crimp edges tightly with a fork.', timerMinutes: 10 },
        { instruction: 'Deep fry pastels in oil at 180°C for 4-5 minutes until golden and crisp; drain and serve with hot sauce pastels.', timerMinutes: 5 }
      ],
      substitutions: [{ ingredient: 'Flaked fish', substitute: 'Ground spiced beef or tuna' }],
      tips: ['Seal edges firmly with water and crimp with fork tines so the savory fish filling stays sealed during frying.']
    },
    {
      title: 'Dibi Lamb (Senegalese Street Barbecue with Mustard & Onions)',
      alternateName: 'Dibi Dakar',
      type: 'grill',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Wood-grilled lamb chops cut into bite-sized pieces, tossed in coarse sea salt, ground mustard, bouillon, and mounds of caramelized sliced onions.',
      culturalBackground: 'The ultimate late-night street food ritual in Dakar, served piping hot on brown butcher paper straight from the dibiterie wood grill.',
      ingredients: [
        { name: 'Bone-in lamb shoulder chops or cutlets', amount: 800, unit: 'g' },
        { name: 'Dijon mustard & Maggi aroma', amount: 2, unit: 'tbsp' },
        { name: 'Coarse sea salt & black pepper', amount: 1, unit: 'tbsp' },
        { name: 'Yellow onions (thickly sliced)', amount: 3, unit: 'onions' }
      ],
      steps: [
        { instruction: 'Grill lamb chops over blazing wood embers for 12-15 minutes until charred and cooked through.', timerMinutes: 15 },
        { instruction: 'Transfer hot lamb onto a cutting board and chop into bite-sized bone-in morsels with a heavy cleaver.', timerMinutes: 3 },
        { instruction: 'Toss lamb with sliced onions, mustard, salt, and black pepper on butcher paper; wrap tightly to let steam soften onions for 5 minutes.', timerMinutes: 5 },
        { instruction: 'Unwrap and eat hot with crusty baguette.' }
      ],
      substitutions: [{ ingredient: 'Lamb', substitute: 'Goat meat or beef sirloin' }],
      tips: ['Wrapping the hot sliced meat and raw onions in butcher paper allows the steam to soften the onions into a savory relish.']
    },
    {
      title: 'Ceebu Yapp (Senegalese Spiced Meat & Broken Rice)',
      alternateName: 'Red Rice with Braised Beef',
      type: 'rice',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 50,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Fragrant broken jasmine rice cooked in deeply browned beef and onion gravy with mustard seeds, pumpkin, cassava, and green chillies.',
      culturalBackground: 'A companion to Ceebu Jën (fish rice), Ceebu Yapp is prepared for festive ceremonies and family Sunday lunches.',
      ingredients: [
        { name: 'Broken jasmine rice (riz brisé)', amount: 3, unit: 'cups' },
        { name: 'Beef stew meat & marrow bone', amount: 700, unit: 'g' },
        { name: 'Dijon mustard & black pepper', amount: 2, unit: 'tbsp' },
        { name: 'Cassava and butternut squash chunks', amount: 2, unit: 'cups' }
      ],
      steps: [
        { instruction: 'Brown beef chunks deeply in peanut oil until caramelized; add onions and fry until dark brown.', timerMinutes: 12 },
        { instruction: 'Add water, root vegetables, and seasonings; simmer 25 minutes until meat is tender.', timerMinutes: 25 },
        { instruction: 'Remove vegetables and meat; stir rinsed broken rice into the bubbling rich meat stock.', timerMinutes: 3 },
        { instruction: 'Cover tightly and steam on very low heat for 20 minutes until rice has absorbed all broth and is tender and fluffy.', timerMinutes: 20 },
        { instruction: 'Spread savory rice on a grand platter, arrange beef and vegetables on top.' }
      ],
      substitutions: [{ ingredient: 'Broken rice', substitute: 'Standard long grain jasmine rice' }],
      tips: ['Broken rice absorbs the beef pan drippings better than standard long grain rice.']
    }
  ],

  // ETHIOPIA
  ET: [
    {
      title: 'Misir Wat (Spiced Red Lentil Stew)',
      alternateName: 'Ethiopian Spicy Red Lentils',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Red split lentils slow-simmered in rich berbere spice blend, garlic, ginger, and niter kibbeh spiced clarified butter until creamy.',
      culturalBackground: 'The cornerstone of Ethiopian vegetarian fasting cuisine (Ye’tsom), enjoyed during religious fasting periods.',
      ingredients: [
        { name: 'Red split lentils (rinsed)', amount: 2, unit: 'cups' },
        { name: 'Berbere spice blend', amount: 3, unit: 'tbsp' },
        { name: 'Red onions (finely pureed)', amount: 2, unit: 'onions' },
        { name: 'Niter Kibbeh (Ethiopian spiced butter)', amount: 3, unit: 'tbsp' },
        { name: 'Garlic and ginger paste', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Dry-sweat pureed onions in a heavy pot without oil for 8 minutes until moisture evaporates and onions sweeten.', timerMinutes: 8 },
        { instruction: 'Add niter kibbeh, garlic-ginger paste, and berbere; fry gently for 5 minutes until intensely fragrant.', timerMinutes: 5 },
        { instruction: 'Add rinsed red lentils and 4 cups warm water; simmer on low heat for 25 minutes, stirring occasionally until lentils break down into a creamy stew.', timerMinutes: 25 },
        { instruction: 'Finish with a dollop of niter kibbeh and serve warm atop injera flatbread.' }
      ],
      substitutions: [{ ingredient: 'Niter Kibbeh', substitute: 'Ghee with pinch of cardamom, fenugreek, and cumin' }],
      tips: ['Dry sweating onions before adding fat is the secret to rich, deep Ethiopian wat flavor without raw onion bite.']
    },
    {
      title: 'Gomen Wat (Braised Ethiopian Collard Greens)',
      alternateName: 'Ethiopian Spiced Greens',
      type: 'salad',
      mealType: 'Lunch',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Tender shredded collard greens simmered with sweet onions, garlic, ginger, cardamom, and aromatic niter kibbeh.',
      culturalBackground: 'A mild and comforting green vegetable dish served on the communal mesob basket to balance fiery wats.',
      ingredients: [
        { name: 'Fresh collard greens (stems removed, shredded)', amount: 500, unit: 'g' },
        { name: 'Niter kibbeh (spiced butter)', amount: 2, unit: 'tbsp' },
        { name: 'Yellow onions and garlic', amount: 1, unit: 'onion' },
        { name: 'Ground korarima (Ethiopian cardamom)', amount: 0.5, unit: 'tsp' }
      ],
      steps: [
        { instruction: 'Boil shredded collard greens in salted water for 8 minutes; drain well.', timerMinutes: 8 },
        { instruction: 'Sauté chopped onions and garlic in niter kibbeh until soft.', timerMinutes: 4 },
        { instruction: 'Add drained greens and ground cardamom; sauté for 10 minutes until tender and flavorful.', timerMinutes: 10 },
        { instruction: 'Serve warm as part of a traditional vegetarian platter.' }
      ],
      substitutions: [{ ingredient: 'Collard greens', substitute: 'Kale or Swiss chard' }],
      tips: ['Draining the boiled greens well prevents the finished sauté from becoming soupy.']
    },
    {
      title: 'Shiro Tegamino (Clay-Pot Chickpea Flour Stew)',
      alternateName: 'Creamy Chickpea Stew',
      type: 'curry',
      mealType: 'Lunch',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Silky, bubbling stew made from roasted spiced chickpea powder (shiro mitted), onions, garlic, and niter kibbeh served piping hot in an earthenware dish.',
      culturalBackground: 'A beloved everyday staple in Ethiopian homes, celebrated for its silky texture and rich umami depth.',
      ingredients: [
        { name: 'Shiro powder (spiced chickpea flour)', amount: 1, unit: 'cup' },
        { name: 'Pureed red onions', amount: 1, unit: 'cup' },
        { name: 'Niter kibbeh or olive oil', amount: 3, unit: 'tbsp' },
        { name: 'Garlic and jalapeno peppers', amount: 2, unit: 'cloves' }
      ],
      steps: [
        { instruction: 'Dry-fry onions in an earthenware pot until softened.', timerMinutes: 5 },
        { instruction: 'Add spiced butter and garlic; fry for 2 minutes.', timerMinutes: 2 },
        { instruction: 'Whisk shiro powder with warm water and pour into pot; simmer gently while stirring continuously for 12 minutes until thick and bubbling like lava.', timerMinutes: 12 },
        { instruction: 'Garnish with sliced green jalapenos and scoop up with warm injera.' }
      ],
      substitutions: [{ ingredient: 'Shiro powder', substitute: 'Besan (gram flour) seasoned with berbere and garlic powder' }],
      tips: ['Stir continuously while adding shiro powder to avoid any clumps forming.']
    },
    {
      title: 'Tibs (Ethiopian Sautéed Spiced Beef)',
      alternateName: 'Derek Tibs',
      type: 'beef',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Tender beef tenderloin cubes seared over searing heat with rosemary sprigs, red onions, tomatoes, and berbere butter.',
      culturalBackground: 'Ethiopia’s most popular social restaurant dish, served on a charcoal-warmed mini brazier.',
      ingredients: [
        { name: 'Beef sirloin or tenderloin (cubed)', amount: 600, unit: 'g' },
        { name: 'Niter kibbeh spiced butter', amount: 3, unit: 'tbsp' },
        { name: 'Fresh rosemary sprigs', amount: 3, unit: 'sprigs' },
        { name: 'Red onions & jalapenos (thickly sliced)', amount: 2, unit: 'onions' },
        { name: 'Berbere spice blend', amount: 1, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Heat a heavy skillet until smoking hot; melt niter kibbeh.', timerMinutes: 2 },
        { instruction: 'Add beef cubes and sear at high heat for 4 minutes until deeply browned.', timerMinutes: 4 },
        { instruction: 'Toss in sliced onions, jalapenos, fresh rosemary, and berbere; sauté for 4 minutes until vegetables are crisp-tender.', timerMinutes: 4 },
        { instruction: 'Serve immediately with injera flatbread and awaze dipping sauce.' }
      ],
      substitutions: [{ ingredient: 'Beef tenderloin', substitute: 'Lamb loin or portobello mushrooms' }],
      tips: ['Keep the skillet scorching hot so the beef sears quickly without losing its internal juices.']
    },
    {
      title: 'Injera (Authentic Teff Sourdough Flatbread)',
      alternateName: 'Ethiopian Sourdough Crepe',
      type: 'pastry',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 20,
      servings: 6,
      difficulty: 'Advanced',
      spiceLevel: 0,
      description: 'Spongy, tart sourdough flatbread made from fermented ancient teff grain, dotted with signature honeycomb steam holes (eyes).',
      culturalBackground: 'The foundational utensil and base of all Ethiopian dining, used to tear and scoop all stews communally.',
      ingredients: [
        { name: 'Brown or ivory Teff flour', amount: 3, unit: 'cups' },
        { name: 'Water (for 3-day fermentation)', amount: 3.5, unit: 'cups' },
        { name: 'Active sourdough starter', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Mix teff flour with water and starter; cover and ferment at room temperature for 3 days until bubbly and sour.', timerMinutes: 10 },
        { instruction: 'Boil 1/2 cup batter with water into a thick paste (ersho/absit); whisk back into batter to activate rising.', timerMinutes: 5 },
        { instruction: 'Pour batter in a spiral onto a preheated non-stick griddle or mitad.', timerMinutes: 1 },
        { instruction: 'When bubbles form all across the surface, cover with lid and steam for 2 minutes until cooked through without flipping.', timerMinutes: 2 },
        { instruction: 'Cool on straw mats before stacking.' }
      ],
      substitutions: [{ ingredient: 'Teff flour', substitute: 'Blend of teff and buckwheat flour' }],
      tips: ['The ersho activation step creates the distinctive airy honeycomb eyes (ayen) that scoop up rich sauces.']
    }
  ],

  // THAILAND
  TH: [
    {
      title: 'Tom Yum Goong (Spicy & Sour Prawn Soup)',
      alternateName: 'ต้มยำกุ้ง',
      type: 'soup',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 4,
      description: 'Iconic clear, fiery broth infused with bruised lemongrass, kaffir lime leaves, galangal, fresh juicy king prawns, and straw mushrooms.',
      culturalBackground: 'The global ambassador of Thai culinary mastery, balancing sour lime, salty fish sauce, spicy bird’s eye chilies, and aromatic herbs.',
      ingredients: [
        { name: 'Jumbo king prawns (head-on)', amount: 500, unit: 'g' },
        { name: 'Lemongrass stalks (bruised & cut into 2-inch batons)', amount: 3, unit: 'stalks' },
        { name: 'Galangal (sliced)', amount: 6, unit: 'slices' },
        { name: 'Kaffir lime leaves (torn)', amount: 5, unit: 'leaves' },
        { name: 'Thai bird’s eye chilies (crushed)', amount: 4, unit: 'chilies' },
        { name: 'Thai roasted chili paste (Nam Prik Pao)', amount: 2, unit: 'tbsp' },
        { name: 'Fish sauce and fresh lime juice', amount: 3, unit: 'tbsp', notes: 'Each' }
      ],
      steps: [
        { instruction: 'Simmer shrimp shells and heads in water for 5 minutes to create a flavorful seafood base; strain.', timerMinutes: 5 },
        { instruction: 'Add bruised lemongrass, galangal, kaffir lime leaves, and roasted chili paste; bring to a rolling aromatic boil.', timerMinutes: 3 },
        { instruction: 'Add straw mushrooms and king prawns; cook for 3 minutes until prawns turn pink and curl into a C-shape.', timerMinutes: 3 },
        { instruction: 'Turn off the heat; season with fish sauce and freshly squeezed lime juice. Garnish with cilantro and serve immediately.', timerMinutes: 1 }
      ],
      substitutions: [{ ingredient: 'Galangal', substitute: 'Fresh ginger with a squeeze of lime' }],
      tips: ['Always add fresh lime juice AFTER turning off the heat; boiling lime juice turns the delicate broth bitter.']
    },
    {
      title: 'Pad Kra Pao (Thai Holy Basil Minced Pork)',
      alternateName: 'ผัดกะเพราหมูสับ',
      type: 'beef',
      mealType: 'Lunch',
      prepTime: 10,
      cookTime: 8,
      servings: 2,
      difficulty: 'Easy',
      spiceLevel: 4,
      description: 'Wok-seared minced pork stir-fried with fragrant holy basil, garlic, and fiery bird’s eye chilies, crowned with a crispy-edged fried egg.',
      culturalBackground: 'Thailand’s quintessential street food fast lunch, ordered across roadside wok stalls by millions daily.',
      ingredients: [
        { name: 'Ground pork or minced chicken', amount: 350, unit: 'g' },
        { name: 'Fresh Thai holy basil leaves (or Thai sweet basil)', amount: 1.5, unit: 'cups' },
        { name: 'Thai bird’s eye chilies & garlic (pounded together in mortar)', amount: 2, unit: 'tbsp' },
        { name: 'Oyster sauce, soy sauce, and fish sauce', amount: 1, unit: 'tbsp', notes: 'Each' },
        { name: 'Crispy fried egg with runny yolk (Khai Dao)', amount: 2, unit: 'eggs' }
      ],
      steps: [
        { instruction: 'Heat oil in a smoking hot wok; fry the pounded garlic and chilies for 30 seconds until intensely aromatic.', timerMinutes: 1 },
        { instruction: 'Add minced pork, breaking it apart with a spatula on high heat for 3 minutes until browned.', timerMinutes: 3 },
        { instruction: 'Drizzle in oyster sauce, fish sauce, soy sauce, and a pinch of sugar; toss for 1 minute.', timerMinutes: 1 },
        { instruction: 'Turn off heat, toss in holy basil leaves, and let residual wok heat wilt the fragrant leaves (30 seconds).', timerMinutes: 1 },
        { instruction: 'Serve over steaming jasmine rice topped with a crispy golden fried egg.' }
      ],
      substitutions: [{ ingredient: 'Holy basil', substitute: 'Thai sweet basil or Italian sweet basil' }],
      tips: ['Pounding garlic and chilies in a mortar releases their natural essential oils for superior wok fragrance.']
    },
    {
      title: 'Green Chicken Curry (Gaeng Keow Wan Gai)',
      alternateName: 'แกงเขียวหวานไก่',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Silky, aromatic green coconut curry with sliced chicken breast, Thai eggplants, bamboo shoots, and fresh sweet basil.',
      culturalBackground: 'Named for its vibrant jade hue derived from freshly pounded green bird’s eye chilies, lemongrass, and cilantro roots.',
      ingredients: [
        { name: 'Chicken breast or thighs (sliced)', amount: 500, unit: 'g' },
        { name: 'Authentic green curry paste', amount: 3, unit: 'tbsp' },
        { name: 'Coconut cream & coconut milk', amount: 2, unit: 'cups' },
        { name: 'Thai round green eggplants (quartered)', amount: 1, unit: 'cup' },
        { name: 'Bamboo shoots & Thai basil leaves', amount: 1, unit: 'cup' },
        { name: 'Fish sauce and palm sugar', amount: 1.5, unit: 'tbsp', notes: 'Each' }
      ],
      steps: [
        { instruction: 'Heat 1/2 cup coconut cream in a pot until it separates and oil cracks on the surface (4 mins).', timerMinutes: 4 },
        { instruction: 'Add green curry paste and fry in the coconut oil for 3 minutes until fragrant.', timerMinutes: 3 },
        { instruction: 'Add sliced chicken; toss for 2 minutes to coat in curry paste.', timerMinutes: 2 },
        { instruction: 'Pour in remaining coconut milk, eggplants, and bamboo shoots; simmer for 10 minutes until chicken and eggplants are tender.', timerMinutes: 10 },
        { instruction: 'Season with fish sauce and palm sugar; stir in sweet basil and torn kaffir lime leaves before serving over jasmine rice.' }
      ],
      substitutions: [{ ingredient: 'Thai eggplants', substitute: 'Baby zucchini or Japanese eggplant' }],
      tips: ['Frying curry paste in reduced coconut cream until it "breaks" into fragrant oil creates genuine restaurant silkiness.']
    },
    {
      title: 'Mango Sticky Rice (Khao Niew Mamuang)',
      alternateName: 'ข้าวเหนียวมะม่วง',
      type: 'dessert',
      mealType: 'Dessert',
      prepTime: 20,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Sweet glutinous sticky rice infused with warm salted coconut cream, served with luscious slices of ripe golden honey mango and toasted mung beans.',
      culturalBackground: 'Thailand’s most beloved seasonal dessert, celebrated worldwide for the heavenly pairing of warm creamy rice and chilled sweet mango.',
      ingredients: [
        { name: 'Thai glutinous sticky rice (soaked 4 hours)', amount: 1.5, unit: 'cups' },
        { name: 'Ripe sweet honey mangoes (Nam Dok Mai)', amount: 2, unit: 'mangoes', notes: 'Peeled and sliced' },
        { name: 'Coconut cream', amount: 1.5, unit: 'cups' },
        { name: 'Palm sugar or white sugar', amount: 0.5, unit: 'cup' },
        { name: 'Sea salt (crucial for balance)', amount: 0.75, unit: 'tsp' },
        { name: 'Crispy toasted yellow mung beans', amount: 1, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Steam soaked sticky rice in a bamboo steamer or cheesecloth-lined basket for 20 minutes until translucent and chewy.', timerMinutes: 20 },
        { instruction: 'Warm coconut cream with sugar and salt in a saucepan until dissolved (do not boil).', timerMinutes: 3 },
        { instruction: 'Transfer hot steamed rice to a bowl, pour 3/4 of warm coconut cream over, cover with plastic wrap, and rest 15 minutes to absorb liquid.', timerMinutes: 15 },
        { instruction: 'Plate warm coconut sticky rice beside chilled sliced mangoes, drizzle with reserved salted coconut cream, and top with crunchy mung beans.' }
      ],
      substitutions: [{ ingredient: 'Thai mango', substitute: 'Ripe Ataulfo / Champagne mango' }],
      tips: ['A generous pinch of salt in the coconut cream is vital to elevate the rich sweetness of the mango.']
    },
    {
      title: 'Som Tum (Spicy Green Papaya Salad)',
      alternateName: 'ส้มตำไทย',
      type: 'salad',
      mealType: 'Lunch',
      prepTime: 15,
      cookTime: 0,
      servings: 2,
      difficulty: 'Easy',
      spiceLevel: 4,
      description: 'Crisp shredded unripe green papaya bruised in a clay mortar with garlic, bird’s eye chilies, long beans, cherry tomatoes, lime juice, peanuts, and dried shrimp.',
      culturalBackground: 'From Isan in Northeastern Thailand, celebrated for its electrifying punch of crunchy, sour, sweet, spicy, and umami.',
      ingredients: [
        { name: 'Unripe green papaya (shredded into long thin ribbons)', amount: 3, unit: 'cups' },
        { name: 'Thai bird’s eye chilies & garlic cloves', amount: 3, unit: 'pieces', notes: 'Each' },
        { name: 'Roasted peanuts', amount: 3, unit: 'tbsp' },
        { name: 'Cherry tomatoes & snake beans (cut into 1-inch lengths)', amount: 1, unit: 'cup' },
        { name: 'Fish sauce, lime juice, and palm sugar', amount: 2, unit: 'tbsp', notes: 'Each' },
        { name: 'Dried shrimp', amount: 1, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Pound garlic, chilies, and dried shrimp lightly in a wooden or clay mortar with pestle.', timerMinutes: 1 },
        { instruction: 'Add palm sugar, fish sauce, and fresh lime juice; muddle with pestle until sugar dissolves.', timerMinutes: 1 },
        { instruction: 'Toss in sliced tomatoes, green beans, and half the roasted peanuts; bruise gently.', timerMinutes: 1 },
        { instruction: 'Add shredded green papaya; pound lightly while turning with a spoon for 1 minute until papaya absorbs dressing.', timerMinutes: 1 },
        { instruction: 'Serve crisp with sticky rice and grilled chicken (Gai Yang).' }
      ],
      substitutions: [{ ingredient: 'Green papaya', substitute: 'Shredded crisp kohlrabi, cucumber, or green apples' }],
      tips: ['Bruise the papaya gently with the pestle rather than crushing it completely so it retains its refreshing crunch.']
    }
  ]
};
