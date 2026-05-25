import { Product } from "./types";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "teema-1",
    name: "Regal Floral Wrap Top",
    price: 8500,
    description: "An effortlessly elegant wrap silhouette styled in soft floral breathable fabric. Features balloon sleeves and an adjustable waist belt to define your shape beautifully. A handpicked vintage gem from London UK.",
    category: "Tops",
    image: "https://res.cloudinary.com/dqbdcvsmr/image/upload/IMG_4328_yf7ce0.jpg",
    secondaryImages: [
      "https://res.cloudinary.com/dqbdcvsmr/image/upload/IMG_4328_yf7ce0.jpg",
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(2).jpeg"
    ],
    status: "Available",
    rating: 4.8,
    reviewsCount: 16,
    sizes: ["S", "M", "L"],
    colors: ["Lavender Mist", "Blush Pink", "Sage Floral"],
    quantityAvailable: 4
  },
  {
    id: "teema-2",
    name: "Elite Satin Cami Top",
    price: 4500,
    description: "A gorgeous curated satin top with delicate adjustable spaghetti straps. Features a draped cowl neck that introduces a touch of minimal sophistication to everyday denim or luxury trousers. Lightweight, premium feel.",
    category: "Tops",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(2).jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(2).jpeg",
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(3).jpeg"
    ],
    status: "Available",
    rating: 4.9,
    reviewsCount: 22,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Champagne Gold", "Midnight Onyx", "Emerald Green"],
    quantityAvailable: 6
  },
  {
    id: "teema-3",
    name: "High-Waist Pleated Royal Skirt",
    price: 6500,
    description: "Feminine pleated maxi skirt structured to gracefully glide as you walk. Fitted comfortable elasticated back, perfect for royalty looking to balance form and maximum daily comfort. Hand-styled import from New York.",
    category: "Skirts",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg",
      "https://res.cloudinary.com/dqbdcvsmr/image/upload/IMG_4328_yf7ce0.jpg"
    ],
    status: "Available",
    rating: 4.7,
    reviewsCount: 12,
    sizes: ["M", "L", "XL"],
    colors: ["Plum Wine", "Deep Amethyst", "Soft Lavender"],
    quantityAvailable: 3
  },
  {
    id: "teema-4",
    name: "Classic Wide-Leg Emperor Trousers",
    price: 11500,
    description: "Boss energy in every single stitch. High waist tailored trousers with front pleats and side pockets. Extremely flattering silhouette to elevate confidence and command attention at corporate or casual boards.",
    category: "Trousers",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.43.jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.43.jpeg"
    ],
    status: "Available",
    rating: 5.0,
    reviewsCount: 31,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Ivory White", "Camel", "Chocolate", "Onyx Black"],
    quantityAvailable: 5
  },
  {
    id: "teema-5",
    name: "Velvet Evening Queen Gown",
    price: 14800,
    description: "Exquisite heavyweight velvet material displaying a premium, deep royal drape. Fitted torso with a dramatic flowing thigh-high slit. Absolute statement dress for evening galas, red carpets, or high-society occasions.",
    category: "Dresses",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44.jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44.jpeg",
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg"
    ],
    status: "Available",
    rating: 4.9,
    reviewsCount: 45,
    sizes: ["S", "M", "L"],
    colors: ["Imperial Purple", "Ruby Red", "Emerald Velvet"],
    quantityAvailable: 2
  },
  {
    id: "teema-6",
    name: "Regal Silk Slip Wrap Dress",
    price: 14500,
    description: "Indulgently smooth silk-satin blend dress focusing on simplicity and supreme touch. Adjustable self-tie fastening creates an incredibly feminine, secure custom contour. Fluid hem gracefully finishes mid-calf.",
    category: "Dresses",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44.jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44.jpeg"
    ],
    status: "Available",
    rating: 4.6,
    reviewsCount: 19,
    sizes: ["XS", "S", "M"],
    colors: ["Royal Indigo", "Rosewood Pink", "Gold Rush"],
    quantityAvailable: 4
  },
  {
    id: "teema-7",
    name: "Soft Linen Oversized Holiday Top",
    price: 5800,
    description: "Made in premium authentic linen. Designed as a relaxed utility cut for breezy comfort during holiday retreats or warm weekends. Naturally breathable yarn, structured with tortoiseshell accent buttons.",
    category: "Tops",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(3).jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(3).jpeg"
    ],
    status: "Available",
    rating: 4.5,
    reviewsCount: 8,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Sandy Beige", "Sea Salt White", "Breeze Olive"],
    quantityAvailable: 7
  },
  {
    id: "teema-8",
    name: "Royalty Gold Silk Slit Skirt",
    price: 9200,
    description: "Premium washed heavy gold silk midi skirt. Features clean bias cutting to contour waistlines effortlessly and fall to a gorgeous fluid drape. Concealed side zipper closure. True high-end aesthetic value.",
    category: "Skirts",
    image: "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg",
    secondaryImages: [
      "https://teemahscollection.netlify.app/WhatsApp%20Image%202026-04-13%20at%2011.51.44%20(4).jpeg"
    ],
    status: "Available",
    rating: 4.9,
    reviewsCount: 14,
    sizes: ["S", "M", "L"],
    colors: ["Tuscan Gold", "Mocha Silver", "Deep Violet"],
    quantityAvailable: 3
  }
];

export function getInitialProducts(): Product[] {
  const local = localStorage.getItem("teema_store_products");
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }
  localStorage.setItem("teema_store_products", JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}
