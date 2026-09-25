import { RegionalDishData } from './recipesAfrica.js';
import { AFRICA_DISHES } from './recipesAfrica.js';
import { AUTHENTIC_GLOBAL_CATALOG } from './authenticRegionalCatalog.js';

// Additional authentic dishes covering Asia, Europe, Americas, and Oceania
export const AUTHENTIC_WORLD_DISHES: Record<string, RegionalDishData[]> = {
  ...AUTHENTIC_GLOBAL_CATALOG,

  // INDIA
  IN: [
    {
      title: 'Butter Chicken (Murgh Makhani)',
      alternateName: 'मुर्ग मक्खनी',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 30,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Charred tandoori chicken pieces simmered in a velvety, buttery spiced tomato, cashew nut, and cream sauce with dried fenugreek leaves (kasuri methi).',
      culturalBackground: 'Invented by Kundan Lal Gujral at Moti Mahal in Delhi during the 1950s to repurpose leftover tandoori chicken in rich gravy.',
      ingredients: [
        { name: 'Boneless chicken thighs (marinated in yogurt & spices)', amount: 600, unit: 'g' },
        { name: 'Canned San Marzano or plum tomatoes (pureed)', amount: 2, unit: 'cups' },
        { name: 'Butter and heavy cream', amount: 0.5, unit: 'cup', notes: 'Each' },
        { name: 'Cashew paste', amount: 3, unit: 'tbsp' },
        { name: 'Kasuri Methi (dried fenugreek leaves)', amount: 1, unit: 'tbsp', notes: 'Crushed' },
        { name: 'Garam masala and Kashmiri chili powder', amount: 1, unit: 'tbsp', notes: 'Each' }
      ],
      steps: [
        { instruction: 'Sear marinated chicken on high heat or under broiler for 8 minutes until charred; set aside.', timerMinutes: 8 },
        { instruction: 'Cook tomato puree with ginger, garlic, Kashmiri chili, and cashew paste for 15 minutes until glossy and reduced.', timerMinutes: 15 },
        { instruction: 'Stir in butter, heavy cream, garam masala, and seared chicken pieces; simmer gently for 8 minutes.', timerMinutes: 8 },
        { instruction: 'Crush kasuri methi between your palms into the sauce; stir and serve with garlic naan or basmati rice.', timerMinutes: 2 }
      ],
      substitutions: [{ ingredient: 'Kasuri Methi', substitute: 'A pinch of celery leaves or maple aroma' }],
      tips: ['Kashmiri chili gives the signature ruby red color without adding overpowering fire.']
    },
    {
      title: 'Hyderabadi Chicken Dum Biryani',
      alternateName: 'حیدرآبادی بریانی',
      type: 'rice',
      mealType: 'Dinner',
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      difficulty: 'Advanced',
      spiceLevel: 3,
      description: 'Royal layered biryani of fragrant aged basmati rice, saffron milk, caramelized fried onions (birista), and mint-marinated chicken slow-cooked under steam seal (dum).',
      culturalBackground: 'Originated in the royal kitchens of the Nizam of Hyderabad, marrying Mughal grandeur with spicy Telugu flavors.',
      ingredients: [
        { name: 'Aged Basmati rice (soaked 30 mins)', amount: 3, unit: 'cups' },
        { name: 'Bone-in chicken (marinated in spiced yogurt & mint)', amount: 800, unit: 'g' },
        { name: 'Birista (crispy fried golden onions)', amount: 1.5, unit: 'cups' },
        { name: 'Saffron threads soaked in warm milk', amount: 3, unit: 'tbsp' },
        { name: 'Whole spices (green cardamom, cloves, star anise, shahi jeera)', amount: 1, unit: 'tbsp' },
        { name: 'Pure desi ghee', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Parboil basmati rice with whole spices until 70% cooked (6 mins); drain.', timerMinutes: 6 },
        { instruction: 'Place marinated chicken at the bottom of a heavy pot; layer 70% cooked rice over chicken.', timerMinutes: 5 },
        { instruction: 'Scatter crispy fried onions, chopped fresh mint, cilantro, saffron milk, and dollops of ghee on top.', timerMinutes: 3 },
        { instruction: 'Seal pot tightly with a dough ring or foil lid; cook on medium-high for 10 mins, then lowest heat on a tawa griddle for 25 mins (dum).', timerMinutes: 25 },
        { instruction: 'Gently fluff rice layers with a flat spatula and serve with cucumber raita and mirchi ka salan.' }
      ],
      substitutions: [{ ingredient: 'Chicken', substitute: 'Lamb shoulder or paneer and vegetables' }],
      tips: ['Never stir the biryani while cooking; the steam trapped in dum infuses the rice with intense aromatics.']
    },
    {
      title: 'Palak Paneer (Spinach Cottage Cheese Curry)',
      alternateName: 'पालक पनीर',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Lush, emerald-green pureed spinach gravy simmered with ginger, garlic, garam masala, and golden-pan-fried Indian paneer cheese cubes.',
      culturalBackground: 'A Punjabi vegetarian classic loved across the subcontinent for its creamy texture and healthy greens.',
      ingredients: [
        { name: 'Fresh baby spinach leaves', amount: 500, unit: 'g', notes: 'Blanched in ice water' },
        { name: 'Paneer cheese cubes', amount: 300, unit: 'g' },
        { name: 'Heavy cream & butter', amount: 3, unit: 'tbsp', notes: 'Each' },
        { name: 'Ginger-garlic paste', amount: 1.5, unit: 'tbsp' },
        { name: 'Garam masala and ground cumin', amount: 1, unit: 'tsp', notes: 'Each' }
      ],
      steps: [
        { instruction: 'Blanch spinach in boiling water for 2 minutes, then plunge immediately into an ice bath to lock in vibrant green color; puree smoothly.', timerMinutes: 3 },
        { instruction: 'Pan-fry paneer cubes in ghee for 2 minutes until lightly golden; soak in warm water to stay soft.', timerMinutes: 3 },
        { instruction: 'Sauté cumin seeds, ginger-garlic paste, and green chili in butter; stir in spinach puree and simmer for 6 minutes.', timerMinutes: 6 },
        { instruction: 'Add paneer cubes, heavy cream, and garam masala; gently warm through for 2 minutes and serve with roti.', timerMinutes: 2 }
      ],
      substitutions: [{ ingredient: 'Paneer', substitute: 'Firm tofu cubes or halloumi' }],
      tips: ['Shocking blanched spinach in ice water preserves that vivid jewel-green color.']
    },
    {
      title: 'Chana Masala (Spiced Chickpea Curry)',
      alternateName: 'चना मसाला',
      type: 'curry',
      mealType: 'Lunch',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Tender chickpeas cooked in a tangy, dark spiced onion-tomato gravy flavored with dried mango powder (amchur), pomegranate seeds, and ginger.',
      culturalBackground: 'North India’s most iconic street food dish, famously served alongside giant puffy fried bhature breads.',
      ingredients: [
        { name: 'Cooked chickpeas', amount: 3, unit: 'cups' },
        { name: 'Onions and tomatoes', amount: 2, unit: 'each', notes: 'Finely chopped' },
        { name: 'Chana masala spice blend (with amchur & anardana)', amount: 2, unit: 'tbsp' },
        { name: 'Fresh ginger julienne and green chilies', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Sauté onions in ghee or oil until deep caramelized brown (10 mins).', timerMinutes: 10 },
        { instruction: 'Add ginger-garlic, tomatoes, and chana masala spices; cook until oil releases from tomato masala.', timerMinutes: 6 },
        { instruction: 'Add chickpeas with their cooking broth; lightly mash some chickpeas with a spoon to thicken the gravy and simmer for 10 minutes.', timerMinutes: 10 },
        { instruction: 'Garnish with fresh ginger juliennes and cilantro; serve hot with steamed basmati rice or bhature.' }
      ],
      substitutions: [{ ingredient: 'Amchur', substitute: 'Fresh lemon juice' }],
      tips: ['Mashing a small handful of chickpeas against the side of the pot creates a naturally luscious, thick gravy.']
    },
    {
      title: 'Crispy Samosas with Mint & Tamarind Chutney',
      alternateName: 'समोसा',
      type: 'pastry',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 20,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 2,
      description: 'Flaky, pyramid-shaped ajwain-spiced pastry crust filled with steaming spiced potatoes, sweet green peas, toasted cashews, and coriander seeds.',
      culturalBackground: 'The supreme tea-time snack across India, served at every street corner with sweet tamarind and spicy mint-cilantro chutneys.',
      ingredients: [
        { name: 'All-purpose flour with ajwain carom seeds (maida)', amount: 2, unit: 'cups' },
        { name: 'Potatoes (boiled and roughly crushed)', amount: 4, unit: 'medium' },
        { name: 'Green peas & crushed coriander seeds', amount: 0.5, unit: 'cup' },
        { name: 'Garam masala and amchur mango powder', amount: 1, unit: 'tbsp' },
        { name: 'Ghee (shortening for dough)', amount: 4, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Rub cold ghee into flour and ajwain seeds until breadcrumb texture; knead into a stiff dough and rest 20 mins.', timerMinutes: 20 },
        { instruction: 'Sauté cumin, coriander seeds, ginger, green peas, and crushed boiled potatoes with spices; cool filling.', timerMinutes: 5 },
        { instruction: 'Roll dough into ovals, cut in half, form into cones, pack with spiced potato filling, and seal base with water.', timerMinutes: 10 },
        { instruction: 'Deep fry samosas in oil on low-medium heat (150°C) for 12-15 minutes until golden brown and super flaky.', timerMinutes: 15 },
        { instruction: 'Serve crisp with sweet tamarind and fresh mint chutneys.' }
      ],
      substitutions: [{ ingredient: 'Ajwain seeds', substitute: 'Dried thyme leaves' }],
      tips: ['Frying samosas on low heat slowly creates an ultra-crispy, blister-free pastry shell.']
    }
  ],

  // CHINA
  CN: [
    {
      title: 'Sichuan Kung Pao Chicken',
      alternateName: '宫保鸡丁',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 3,
      description: 'Wok-seared marinated chicken breast tossed with crunchy roasted peanuts, dried Sichuan chilies, numbing Sichuan peppercorns, and sweet-tangy sauce.',
      culturalBackground: 'Named after Ding Baozhen, a Qing dynasty governor of Sichuan Province, renowned for its balance of spicy, numbing, sweet, and sour (húlà味).',
      ingredients: [
        { name: 'Chicken breast or thighs (diced into 1/2-inch cubes)', amount: 450, unit: 'g' },
        { name: 'Roasted unsalted peanuts', amount: 0.5, unit: 'cup' },
        { name: 'Dried red Sichuan chilies (snipped & seeded)', amount: 10, unit: 'chilies' },
        { name: 'Sichuan peppercorns', amount: 1, unit: 'tsp' },
        { name: 'Kung pao sauce (Chinkiang black vinegar, soy sauce, sugar, cornstarch)', amount: 0.3, unit: 'cup' },
        { name: 'Scallion white batons', amount: 3, unit: 'stalks' }
      ],
      steps: [
        { instruction: 'Marinate diced chicken with Shaoxing wine, soy sauce, and cornstarch for 15 minutes.', timerMinutes: 15 },
        { instruction: 'Heat oil in a hot wok; fry dried chilies and Sichuan peppercorns for 20 seconds until fragrant and darkened.', timerMinutes: 1 },
        { instruction: 'Add chicken cubes; stir-fry vigorously on high heat for 3 minutes until seared on all sides.', timerMinutes: 3 },
        { instruction: 'Pour in Kung Pao sauce and scallion batons; toss for 1 minute until sauce glazes the chicken with a glossy sheen.', timerMinutes: 1 },
        { instruction: 'Stir in roasted peanuts and serve immediately with jasmine rice.' }
      ],
      substitutions: [{ ingredient: 'Chinkiang vinegar', substitute: 'Balsamic vinegar mixed with rice vinegar' }],
      tips: ['Adding peanuts at the very last second before plating keeps them delightfully crunchy.']
    },
    {
      title: 'Sichuan Mapo Tofu',
      alternateName: '麻婆豆腐',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 4,
      description: 'Silken tofu cubes simmered in a fiery, numbing Sichuan fermented broad bean paste (pixian doubanjiang) sauce with minced beef and ground green peppercorns.',
      culturalBackground: 'Created in Chengdu in the late 19th century by Mrs. Chen ("Pockmarked Old Lady Chen"), famed for the 7 characteristics of Sichuan cooking.',
      ingredients: [
        { name: 'Silken or soft tofu (cut into 3/4-inch cubes)', amount: 400, unit: 'g' },
        { name: 'Minced beef or pork', amount: 150, unit: 'g' },
        { name: 'Pixian fermented broad bean paste (Doubanjiang)', amount: 2.5, unit: 'tbsp' },
        { name: 'Fermented black beans (douchi) & garlic', amount: 1, unit: 'tbsp', notes: 'Minced' },
        { name: 'Ground roasted Sichuan peppercorn powder', amount: 1, unit: 'tsp' },
        { name: 'Cornstarch slurry', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Gently simmer tofu cubes in salted water for 2 minutes to firm up texture; drain.', timerMinutes: 2 },
        { instruction: 'Crisp minced beef in oil until dark and crunchy (3 mins); push aside.', timerMinutes: 3 },
        { instruction: 'Fry Pixian doubanjiang and garlic in oil until the oil turns brilliant ruby red.', timerMinutes: 2 },
        { instruction: 'Add chicken stock and drained tofu cubes; simmer gently for 5 minutes for tofu to absorb sauce.', timerMinutes: 5 },
        { instruction: 'Stir in cornstarch slurry in three stages to create a silky, glossy coating; plate and dust top with roasted numbing peppercorn powder.' }
      ],
      substitutions: [{ ingredient: 'Doubanjiang', substitute: 'Chili bean sauce with a dash of soy sauce' }],
      tips: ['Dusting fresh roasted Sichuan peppercorn powder right before eating gives that signature electric numbing sensation (málà).']
    },
    {
      title: 'Hand-Pulled Biang Biang Noodles with Chili Oil',
      alternateName: '油泼扯面',
      type: 'noodles',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 5,
      servings: 2,
      difficulty: 'Medium',
      spiceLevel: 3,
      description: 'Wide, belt-like hand-pulled wheat noodles dressed in minced garlic, scallions, and coarse chili flakes scalded with smoking hot sizzling oil.',
      culturalBackground: 'From Shaanxi province, named for the rhythmic "biang biang" clapping sound made as dough is slapped against the wooden counter.',
      ingredients: [
        { name: 'Hand-pulled broad belt wheat noodles', amount: 350, unit: 'g' },
        { name: 'Coarse red chili powder (Shaanxi chili)', amount: 2, unit: 'tbsp' },
        { name: 'Garlic and scallions (finely minced)', amount: 3, unit: 'tbsp' },
        { name: 'Chinkiang black vinegar & light soy sauce', amount: 1.5, unit: 'tbsp', notes: 'Each' },
        { name: 'Smoking hot peanut or vegetable oil', amount: 4, unit: 'tbsp' },
        { name: 'Bok choy leaves', amount: 4, unit: 'leaves', notes: 'Blanched' }
      ],
      steps: [
        { instruction: 'Pull and slap noodle dough into wide belt strips; boil in water with bok choy for 2 minutes; drain into serving bowls.', timerMinutes: 2 },
        { instruction: 'Season noodles with black vinegar and soy sauce.', timerMinutes: 1 },
        { instruction: 'Mound minced garlic, scallions, and coarse chili flakes on top of noodles.', timerMinutes: 1 },
        { instruction: 'Heat oil in a ladle until smoking hot; pour directly over the chili and garlic mound so it crackles and releases fragrant aromatics.', timerMinutes: 1 },
        { instruction: 'Toss noodles vigorously with chopsticks and enjoy piping hot.' }
      ],
      substitutions: [{ ingredient: 'Hand-pulled noodles', substitute: 'Wide dried knife-cut wheat noodles' }],
      tips: ['Pouring genuinely smoking hot oil over the raw chili and garlic activates their fragrant essential oils in seconds.']
    },
    {
      title: 'Cantonese Char Siu (Honey Glazed BBQ Pork)',
      alternateName: '蜜汁叉烧',
      type: 'beef',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Tender pork shoulder strips marinated in fermented red bean curd, five spice, hoisin, and soy sauce, roasted and basted in honey glaze.',
      culturalBackground: 'The crown jewel of Cantonese Siu Mei rotisserie restaurants in Hong Kong and Guangzhou.',
      ingredients: [
        { name: 'Pork shoulder or pork collar (cut into long strips)', amount: 700, unit: 'g' },
        { name: 'Hoisin sauce and Shaoxing wine', amount: 2, unit: 'tbsp', notes: 'Each' },
        { name: 'Fermented red bean curd (nanru) & five-spice powder', amount: 1, unit: 'tbsp' },
        { name: 'Maltose or honey (for lustrous basting glaze)', amount: 3, unit: 'tbsp' },
        { name: 'Soy sauce and brown sugar', amount: 2, unit: 'tbsp', notes: 'Each' }
      ],
      steps: [
        { instruction: 'Marinate pork strips in hoisin, red bean curd, five-spice, soy sauce, and Shaoxing wine for at least 4 hours.', timerMinutes: 10 },
        { instruction: 'Place pork strips on a roasting wire rack over a foil-lined baking sheet filled with 1/2 inch water.', timerMinutes: 5 },
        { instruction: 'Roast at 200°C (400°F) for 25 minutes, flipping once.', timerMinutes: 25 },
        { instruction: 'Brush liberally with honey glaze; broil for 3-4 minutes until caramelized with charred edges.', timerMinutes: 4 },
        { instruction: 'Rest 5 minutes, slice into succulent pieces, and serve over rice.' }
      ],
      substitutions: [{ ingredient: 'Red bean curd', substitute: 'A drop of natural beet juice for color and extra soy sauce' }],
      tips: ['Basting with honey during the final broil produces that glass-like sweet lacquered crust.']
    },
    {
      title: 'Steamed Cantonese Dim Sum Har Gow (Crystal Prawn Dumplings)',
      alternateName: '水晶虾饺',
      type: 'seafood',
      mealType: 'Breakfast',
      prepTime: 35,
      cookTime: 6,
      servings: 4,
      difficulty: 'Advanced',
      spiceLevel: 0,
      description: 'Translucent, pleated crystal wheat-starch dumpling pockets filled with plump fresh prawns, bamboo shoots, and sesame oil.',
      culturalBackground: 'The gold standard benchmark of a Cantonese dim sum master chef’s knife and pleating skills.',
      ingredients: [
        { name: 'Wheat starch & tapioca starch (for crystal skins)', amount: 1, unit: 'cup', notes: 'Mixed with boiling water' },
        { name: 'Fresh king prawns (coarsely chopped)', amount: 350, unit: 'g' },
        { name: 'Bamboo shoots (finely minced)', amount: 3, unit: 'tbsp' },
        { name: 'Pork lard or sesame oil', amount: 1, unit: 'tbsp' },
        { name: 'White pepper and sea salt', amount: 0.5, unit: 'tsp' }
      ],
      steps: [
        { instruction: 'Scald wheat and tapioca starches with rolling boiling water; knead with lard into smooth crystal dough; rest 10 mins.', timerMinutes: 10 },
        { instruction: 'Flatten dough balls with the oiled blade of a cleaver into paper-thin translucent rounds.', timerMinutes: 10 },
        { instruction: 'Place prawn filling in center and pleat 7 to 9 delicate folds to seal the crescent pouch.', timerMinutes: 10 },
        { instruction: 'Steam in a bamboo basket over high heat for 6 minutes until crystal skins turn glass-clear.', timerMinutes: 6 },
        { instruction: 'Serve immediately with chili oil and hot tea.' }
      ],
      substitutions: [{ ingredient: 'Wheat starch', substitute: 'Ready-made crystal dumpling wrappers' }],
      tips: ['Water used for making crystal wrapper dough MUST be boiling hot to properly gelatinize the starches.']
    }
  ],

  // VIETNAM
  VN: [
    {
      title: 'Hanoi Beef Pho (Phở Bò)',
      alternateName: 'Phở Bò Hà Nội',
      type: 'noodles',
      mealType: 'Breakfast',
      prepTime: 25,
      cookTime: 120,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Crystal-clear aromatic beef bone broth simmered for hours with charred ginger, star anise, and cinnamon, served over flat rice noodles and thin slices of rare beef.',
      culturalBackground: 'The national soul food of Vietnam, perfected in northern Hanoi with clean, pure beef aromatics.',
      ingredients: [
        { name: 'Beef marrow bones & brisket', amount: 1.2, unit: 'kg' },
        { name: 'Flat Pho rice noodles (bánh phở)', amount: 400, unit: 'g' },
        { name: 'Charred yellow onions and fresh ginger', amount: 2, unit: 'pieces' },
        { name: 'Whole spices (star anise, cinnamon, black cardamom, cloves, coriander seeds)', amount: 2, unit: 'tbsp', notes: 'Toasted' },
        { name: 'Beef sirloin (sliced paper-thin)', amount: 200, unit: 'g' },
        { name: 'Fish sauce (Nước mắm) & rock sugar', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Blanch beef bones in boiling water for 10 minutes; rinse clean to ensure crystal-clear broth.', timerMinutes: 10 },
        { instruction: 'Simmer clean bones with charred onions, ginger, toasted spices, and rock sugar gently for 2 hours; skim impurities.', timerMinutes: 120 },
        { instruction: 'Strain golden fragrant broth and season with premium fish sauce.', timerMinutes: 5 },
        { instruction: 'Place cooked rice noodles in bowls, arrange paper-thin raw sirloin slices and sliced scallions on top.', timerMinutes: 3 },
        { instruction: 'Ladle boiling hot broth directly over raw beef to flash-cook it in the bowl; serve with lime wedges, Thai basil, and chilies.' }
      ],
      substitutions: [{ ingredient: 'Beef bones', substitute: 'Rich roasted beef stock' }],
      tips: ['Blanching and scrubbing the bones before simmering is essential to achieve that pristine, crystal-clear consommé clarity.']
    },
    {
      title: 'Bún Chả Hanoi (Grilled Pork Patties with Rice Vermicelli)',
      alternateName: 'Bún Chả Hà Nội',
      type: 'grill',
      mealType: 'Lunch',
      prepTime: 25,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Caramelized charcoal-grilled minced pork patties and pork belly bathed in warm tangy nước chấm dipping sauce with green papaya and rice vermicelli.',
      culturalBackground: 'Hanoi’s quintessential lunch experience, famously shared by Anthony Bourdain and President Barack Obama in Hanoi.',
      ingredients: [
        { name: 'Ground pork & pork belly slices', amount: 600, unit: 'g' },
        { name: 'Caramel sauce (Nước màu)', amount: 1.5, unit: 'tbsp' },
        { name: 'Shallots, garlic, and fish sauce', amount: 2, unit: 'tbsp', notes: 'Each' },
        { name: 'Rice vermicelli noodles (bún)', amount: 350, unit: 'g' },
        { name: 'Dipping sauce (fish sauce, lime, sugar, water, garlic, chili, pickled green papaya)', amount: 2, unit: 'cups' }
      ],
      steps: [
        { instruction: 'Marinate pork patties and belly with shallots, fish sauce, and caramel cooking sauce for 30 minutes.', timerMinutes: 30 },
        { instruction: 'Grill pork patties over charcoal or broil for 10 minutes until charred and deeply caramelized.', timerMinutes: 10 },
        { instruction: 'Whisk warm nước chấm sauce with lime juice, fish sauce, garlic, and sliced pickled green papaya in small bowls.', timerMinutes: 5 },
        { instruction: 'Drop hot grilled patties straight into the warm bowls of dipping sauce.', timerMinutes: 2 },
        { instruction: 'Serve with plates of cool vermicelli noodles and fresh herbs (mint, perilla, cilantro).' }
      ],
      substitutions: [{ ingredient: 'Pork belly', substitute: 'Pork shoulder' }],
      tips: ['Dropping sizzling grilled pork patties directly into the warm dipping sauce infuses the broth with smoky pork juices.']
    },
    {
      title: 'Crispy Vietnamese Spring Rolls (Chả Giò / Nem Rán)',
      alternateName: 'Chả Giò Giòn Rụm',
      type: 'pastry',
      mealType: 'Lunch',
      prepTime: 30,
      cookTime: 15,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Shatteringly crispy fried rice paper rolls stuffed with minced pork, wood ear mushrooms, glass noodles, and carrots, wrapped in fresh lettuce.',
      culturalBackground: 'A cornerstone of Vietnamese banquets and New Year (Tết) celebrations, wrapped in delicate rice paper.',
      ingredients: [
        { name: 'Vietnamese rice paper sheets (Bánh tráng)', amount: 16, unit: 'sheets' },
        { name: 'Ground pork & crab meat or shrimp', amount: 350, unit: 'g' },
        { name: 'Rehydrated wood ear mushrooms & glass noodles', amount: 1, unit: 'cup' },
        { name: 'Carrots and shallots (shredded)', amount: 1, unit: 'cup' },
        { name: 'Egg yolk & fish sauce', amount: 1, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Mix ground pork, mushrooms, softened noodles, carrots, and seasonings for the savory filling.', timerMinutes: 10 },
        { instruction: 'Dampen rice paper lightly with beer or sugar water, add filling, tuck sides, and roll tightly.', timerMinutes: 10 },
        { instruction: 'Double fry: first fry at 160°C for 6 mins, then rest and flash fry at 190°C for 3 mins until ultra-crisp and golden.', timerMinutes: 10 },
        { instruction: 'Wrap crispy rolls in crisp butter lettuce leaves with fresh herbs, dip in nước chấm sauce, and enjoy.' }
      ],
      substitutions: [{ ingredient: 'Rice paper', substitute: 'Spring roll pastry wrappers' }],
      tips: ['Dabbing rice paper with a touch of beer or sugar water before frying makes the crust blister into golden crispness.']
    },
    {
      title: 'Vietnamese Bánh Mì Sandwich with Crispy Pork & Pâté',
      alternateName: 'Bánh Mì Thịt Nguội',
      type: 'beef',
      mealType: 'Lunch',
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Airy, shatteringly crisp French-Vietnamese baguette spread with rich pork liver pâté, Vietnamese mayonnaise, sliced roast pork, pickled daikon & carrot (đồ chua), fresh cucumber, cilantro, and jalapeno.',
      culturalBackground: 'The supreme culinary synthesis of French colonial baking and vibrant Vietnamese street condiments.',
      ingredients: [
        { name: 'Crispy Vietnamese baguettes (light and airy crumb)', amount: 2, unit: 'baguettes' },
        { name: 'Pork liver pâté', amount: 4, unit: 'tbsp' },
        { name: 'Vietnamese egg-yolk mayonnaise', amount: 2, unit: 'tbsp' },
        { name: 'Roasted pork or Vietnamese ham (Chả lụa)', amount: 200, unit: 'g' },
        { name: 'Pickled daikon and carrots (Đồ chua)', amount: 0.5, unit: 'cup' },
        { name: 'Fresh cilantro sprigs, cucumber spears, and sliced bird’s eye chili', amount: 1, unit: 'bunch' },
        { name: 'Maggi liquid seasoning', amount: 1, unit: 'tsp' }
      ],
      steps: [
        { instruction: 'Warm baguette in a hot oven for 3 minutes until exterior is paper-thin and crackly.', timerMinutes: 3 },
        { instruction: 'Slice baguette lengthwise; spread rich pâté generously on one side and egg mayonnaise on the other.', timerMinutes: 2 },
        { instruction: 'Layer sliced roasted pork and Vietnamese ham along the center.', timerMinutes: 2 },
        { instruction: 'Stuff with crunchy pickled daikon and carrots, cucumber spears, and fresh cilantro sprigs.', timerMinutes: 2 },
        { instruction: 'Dash with Maggi seasoning, add fresh chili slices, and press gently to serve.' }
      ],
      substitutions: [{ ingredient: 'Pork liver pâté', substitute: 'Chicken liver mousse or vegetarian mushroom pâté' }],
      tips: ['Warming the bread produces the signature airy crunch that shatters on your first bite without being tough.']
    },
    {
      title: 'Cà Phê Trứng (Hanoi Egg Coffee)',
      alternateName: 'Hanoi Egg Coffee',
      type: 'dessert',
      mealType: 'Breakfast',
      prepTime: 10,
      cookTime: 5,
      servings: 2,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Intense, dark Robusta drip coffee topped with a thick, frothy, meringue-like custard cream whipped from fresh egg yolks and sweetened condensed milk.',
      culturalBackground: 'Invented in 1946 by Mr. Nguyen Van Giang at the Sofitel Legend Metropole Hanoi when fresh dairy milk was scarce during the war.',
      ingredients: [
        { name: 'Dark roasted Vietnamese Robusta coffee grounds', amount: 4, unit: 'tbsp', notes: 'Brewed through a phin metal filter' },
        { name: 'Fresh egg yolks', amount: 2, unit: 'yolks' },
        { name: 'Sweetened condensed milk', amount: 3, unit: 'tbsp' },
        { name: 'Pure vanilla extract', amount: 0.5, unit: 'tsp' }
      ],
      steps: [
        { instruction: 'Brew hot strong coffee using a traditional Vietnamese phin metal drip filter into heatproof glasses.', timerMinutes: 4 },
        { instruction: 'In a bowl, whip egg yolks, sweetened condensed milk, and vanilla with an electric frother for 4-5 minutes until pale, thick, and pillowy.', timerMinutes: 5 },
        { instruction: 'Gently float the dense, sweet golden egg cream over the top of the dark hot coffee.', timerMinutes: 1 },
        { instruction: 'Nestle glass in a small bowl of hot water to keep warm; sip coffee through the luscious custard foam.' }
      ],
      substitutions: [{ ingredient: 'Phin filter', substitute: 'Dark French press coffee or double espresso' }],
      tips: ['Whipping the egg yolks until truly light and voluminous creates a velvety texture reminiscent of tiramisu cream.']
    }
  ]
};
