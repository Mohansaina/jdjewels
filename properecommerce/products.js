const PRODUCTS = [
  {
    id: 1,
    title: "Custom VVS Diamond Pendant",
    category: "pendants",
    material: "18k Gold & VVS Diamonds",
    price: 4500,
    rating: 4.9,
    reviewsCount: 48,
    image: "./assets/images/pendant_vvs_custom.png",
    thumbnails: [
      "./assets/images/pendant_vvs_custom.png"
    ],
    description: "A custom-molded masterpiece crafted in-house. This VVS Diamond Pendant features hand-set, brilliant-cut VVS clarity diamonds encrusted on a stunning crowned skull motif, cast from solid 18k yellow gold. Each piece is polished to a mirror shine.",
    specs: {
      metal: "Solid 18k Yellow Gold",
      stone: "Clarity VVS1, Color D-F Natural Diamonds (Total 4.5 Carats)",
      setting: "Hand-set Micro Pave",
      size: "55mm x 35mm"
    },
    care: "Avoid chemical cleaners. Clean using warm water, mild dish soap, and a very soft toothbrush. Dry thoroughly with a microfiber cloth.",
    reviews: [
      { author: "Evelyn K.", rating: 5, date: "May 12, 2026", comment: "Breathtaking quality. The VVS diamonds sparkle like crazy under any light. The gold has a nice heavy weight." },
      { author: "Marcus T.", rating: 5, date: "April 28, 2026", comment: "Custom work is outstanding. The setting is flawless and the detail is insane. Definitely coming back for more." }
    ]
  },
  {
    id: 2,
    title: "18k Miami Cuban Link Chain",
    category: "chains",
    material: "18k Solid Yellow Gold",
    price: 3200,
    rating: 4.9,
    reviewsCount: 37,
    image: "./assets/images/chain_cuban_gold.png",
    thumbnails: [
      "./assets/images/chain_cuban_gold.png"
    ],
    description: "The gold standard of luxury streetwear. Our 18k Miami Cuban Link Chain is crafted from solid yellow gold links, hand-polished and fitted with a sleek, heavy-duty custom box lock with dual safety latches.",
    specs: {
      metal: "Solid 18k Yellow Gold",
      width: "12mm",
      length: "22 inches",
      lock: "Custom fold-over box lock with safety latches"
    },
    care: "Store flat in a fabric-lined box. Clean with a gold polishing cloth to maintain the high-gloss mirror finish.",
    reviews: [
      { author: "Sarah H.", rating: 5, date: "June 02, 2026", comment: "Super solid weight and the lock feels extremely secure. Perfect thickness for daily wear." },
      { author: "Chloe L.", rating: 5, date: "May 19, 2026", comment: "Exceeded my expectations. The link alignment is perfect and it feels extremely high-quality." }
    ]
  },
  {
    id: 3,
    title: "Custom 18k Gold Grillz",
    category: "grillz",
    material: "18k Gold (Set of 6)",
    price: 1850,
    rating: 4.8,
    reviewsCount: 29,
    image: "./assets/images/grillz_gold_custom.png",
    thumbnails: [
      "./assets/images/grillz_gold_custom.png"
    ],
    description: "Custom molded upper or lower set of 6 teeth grillz. Hand-crafted from premium solid 18k yellow gold, meticulously polished to deliver a blinding gold shine. Includes custom molding kit and step-by-step instructions for a perfect fit.",
    specs: {
      metal: "Solid 18k Yellow Gold",
      fit: "Custom molded (includes dental impression kit)",
      teethCount: "Set of 6 teeth (Upper or Lower)",
      finish: "High-Polish Mirror Finish"
    },
    care: "Remove before eating, drinking, or sleeping. Wash with warm water and dry immediately. Do not use abrasive toothpaste.",
    reviews: [
      { author: "Liam J.", rating: 5, date: "May 30, 2026", comment: "Fit is absolutely perfect after using the impression kit. The shine is incredible." },
      { author: "Elena R.", rating: 4, date: "April 15, 2026", comment: "Got the upper set and they look amazing. Real solid gold, nice and heavy!" }
    ]
  },
  {
    id: 4,
    title: "Iced Out Royal Chronograph",
    category: "watches",
    material: "Moissanite & Stainless Steel",
    price: 9500,
    rating: 4.9,
    reviewsCount: 16,
    image: "./assets/images/watch_royal_iced.png",
    thumbnails: [
      "./assets/images/watch_royal_iced.png"
    ],
    description: "Make a statement that cannot be ignored. The Royal Chronograph features a custom iced-out bezel and integrated bracelet, fully hand-paved with high-dispersion VVS Moissanite stones that pass thermal diamond testers. Fitted with a precise Japanese automatic movement.",
    specs: {
      movement: "Japanese Automatic Chronograph (42 Hour Power Reserve)",
      stone: "VVS1 Moissanite Diamonds (Total 18.5 Carats)",
      case: "316L Stainless Steel (41mm Diameter)",
      waterResistance: "50 Meters (5 ATM)"
    },
    care: "Gently wipe with a damp microfiber cloth. Ensure the crown is fully screwed down before cleaning.",
    reviews: [
      { author: "Daniel S.", rating: 5, date: "May 10, 2026", comment: "This watch is a masterpiece. The moissanite catches the light in a rainbow fire that is brighter than natural diamonds. Automatic movement is very smooth." }
    ]
  },
  {
    id: 5,
    title: "VVS Diamond Tennis Bracelet",
    category: "bracelets",
    material: "14k White Gold & Diamonds",
    price: 3800,
    rating: 4.9,
    reviewsCount: 22,
    image: "./assets/images/bracelet_tennis_diamond.png",
    thumbnails: [
      "./assets/images/bracelet_tennis_diamond.png"
    ],
    description: "A timeless classic modernized. Our VVS Diamond Tennis Bracelet is composed of a continuous, fluid line of matched round brilliant-cut VVS diamonds prong-set in solid 14k white gold. Seamless double-latch safety clasp.",
    specs: {
      metal: "Solid 14k White Gold",
      stone: "Matched Round Brilliant VVS2 Diamonds (Total 5.5 Carats)",
      length: "7.25 inches",
      closure: "Seamless double-latch safety lock"
    },
    care: "Clean regularly using a jewelry cleaning solution. Avoid contact with chlorine and abrasive surfaces.",
    reviews: [
      { author: "Jessica M.", rating: 5, date: "June 05, 2026", comment: "The sparkle is incredible, and the white gold setting is very sleek and sturdy. A beautiful daily luxury." }
    ]
  },
  {
    id: 6,
    title: "Iced Out Custom Nameplate",
    category: "pendants",
    material: "14k Yellow Gold & VVS Diamonds",
    price: 2400,
    rating: 4.8,
    reviewsCount: 31,
    image: "./assets/images/nameplate_custom_iced.png",
    thumbnails: [
      "./assets/images/nameplate_custom_iced.png"
    ],
    description: "Represent your name in style. Our Custom Iced Out Nameplate features custom 3D script lettering paved with brilliant-cut VVS diamonds, framed with a high-polish solid 14k yellow gold border. Fits up to 8 characters.",
    specs: {
      metal: "Solid 14k Yellow Gold",
      stone: "VVS Clarity Diamonds (approx. 2.8 Carats depending on letters)",
      lettering: "Custom 3D Script Font (up to 8 characters)",
      bail: "Fits up to 10mm chains"
    },
    care: "Clean gently with warm, soapy water. Avoid pulling on the letters when cleaning.",
    reviews: [
      { author: "Grace T.", rating: 5, date: "May 24, 2026", comment: "Amazing detail! The 3D effect of the lettering makes it pop. The diamonds are super clean." }
    ]
  }
];

// If using ES modules in browser or standard scripts, we can expose it globally
window.PRODUCTS = PRODUCTS;
