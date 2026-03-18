import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const newProducts = [
  {
    handle: "revolutionize-your-shower-the-silicone-back-scrubber",
    title: "Revolutionize Your Shower: The Silicone Back Scrubber",
    description: `<p>Upgrade your bath routine with the Silicone Back Scrubber, the ultimate 2-in-1 tool. This Silicone Back Scrubber combines gentle cleansing and invigorating exfoliation. The ergonomic design of this Silicone Back Scrubber makes reaching your entire back effortless.</p>
<p>Why You’ll Love the Silicone Back Scrubber:</p>
<p>✨ Dual-Action Design: Clean &amp; Exfoliate</p>
<p>This Silicone Back Scrubber has a front side with soft bristles for a deep, gentle clean.  </p>
<p>The back side of the Silicone Back Scrubber features larger nubs for stimulating massage.</p>
<p>🌎 Eco-Friendly, Durable &amp; Long-Lasting</p>
<p>Built from high-quality silicone, this Silicone Back Scrubber won't stretch or deform. This durable Silicone Back Scrubber is a reusable and sustainable choice over disposable alternatives. Save money and reduce waste with the Silicone Back Scrubber.</p>
<p>🎁 Great Value Multi-Pack</p>
<p>Get a fantastic value with this pack of 3 Silicone Back Scrubbers (Green, Blue, and Pink). Share a Silicone Back Scrubber with your family or have a fresh Silicone Back Scrubber ready for travel.</p>`,
    vendor: "Vionne",
    category: "Health & Beauty > Personal Care > Cosmetics > Bath & Body > Bath Brushes",
    price: 299.00,
    inventory: 0,
    status: "Active",
    image: "https://cdn.shopify.com/s/files/1/0794/5247/1529/files/ms_5uhyf_512_676142213_2.jpg?v=1773598784",
    createdAt: Timestamp.now()
  },
  {
    handle: "led-drawing-tracing-board-perfect-for-kids-artists-glow-light-pad-for-sketching-drawing-diy-art-projects",
    title: "LED Drawing & Tracing Board – Perfect for Kids & Artists | Glow Light Pad for Sketching, Drawing, & DIY Art Projects",
    description: `<p>Brighten up your child’s study time and creativity with this Personalized LED Name Erase Board! Designed for both fun and learning, this stylish table lamp doubles as a glow message board where kids can write, draw, and express their imagination freely.</p>
<p><br></p>
<p>Perfect for study tables, bedrooms, and gifting, this LED board encourages kids to learn through play — making it an ideal choice for parents and gift-givers alike!</p>
<p><br></p>
<p><br></p>
<p><br></p>
<p>💡 Key Features:</p>
<p><br></p>
<p>✅ Personalized with Your Name: Add a special touch that makes it unique and meaningful.</p>
<p>✅ Dual Function Design: Works as a night lamp + erasable writing board.</p>
<p>✅ Educational &amp; Fun: Helps kids practice writing, drawing, and spelling in a creative way.</p>
<p>✅ 13 Vibrant Pens Included: Comes with colorful markers for endless fun and learning.</p>
<p>✅ Perfect Gift Choice: Ideal for birthdays, return gifts, or study table décor.</p>
<p>✅ Compact &amp; Durable: Size – 15×15×1 cm; perfect for desks, nightstands, and classrooms.</p>
<p>✅ Easy to Clean: Simply wipe off and start fresh anytime!</p>
<p><br></p>
<p><br></p>
<p><br></p>
<p>🎁 Perfect For:</p>
<p><br></p>
<p>Kids’ birthdays or study gifts</p>
<p><br></p>
<p>Teachers and students</p>
<p><br></p>
<p>Home, school, or office desk décor</p>
<p><br></p>
<p>Personalized gifts for loved ones</p>
<p><br></p>
<p><br></p>
<p><br></p>
<p>🔋 Specifications:</p>
<p><br></p>
<p>Material: Acrylic Board with LED Base</p>
<p><br></p>
<p>Light Type: Soft Glow LED</p>
<p><br></p>
<p>Size: 15×15×1 cm</p>
<p><br></p>
<p>Includes: 13 Erasable Pens + Stand</p>
<p><br></p>
<p>Power: USB or Battery Operated </p>
<p>₹ 1099</p>`,
    vendor: "Vionne",
    category: "Toys & Games > Toys > Art & Drawing Toys > Toy Drawing Tablets",
    price: 1099.00,
    inventory: 0,
    status: "Archived",
    image: "https://cdn.shopify.com/s/files/1/0794/5247/1529/files/LEDDrawing_TracingBoard_PerfectforKids_Artists_GlowLightPadforSketching_Drawing_DIYArtProjects__2.jpg?v=1770991007",
    createdAt: Timestamp.now()
  },
  {
    handle: "color-changing-crystal-lamp-touch-remote-control-for-perfect-ambience",
    title: "Color-Changing Crystal Lamp – Touch & Remote Control for Perfect Ambience",
    description: `<p>This stunning Crystal Touch Lamp combines luxury design with smart lighting. With 16 vibrant RGB colors, 6 brightness levels, and a wireless remote, you can easily switch between cozy warm light or colorful ambient glow — perfect for bedrooms, desks, or romantic evenings.</p>
<p><br></p>
<p>🔹 Features &amp; Benefits:</p>
<p><br></p>
<p>💎 Elegant Crystal Design – Adds a touch of luxury to any space</p>
<p><br></p>
<p>🌈 16 Color Changing Modes – Match your mood or décor instantly</p>
<p><br></p>
<p>🎛️ Touch &amp; Remote Control – Simple, convenient operation from anywhere</p>
<p><br></p>
<p>🔋 USB Rechargeable – Energy-efficient and cable-free convenience</p>
<p><br></p>
<p>🌙 Perfect for Gifting – Ideal for birthdays, anniversaries, or home décor lovers</p>
<p><br></p>
<p><br></p>
<p>✨ Create the perfect atmosphere for relaxation, romance, or creativity — all with a single touch.</p>`,
    vendor: "Vionne",
    category: "Home & Garden > Lighting > Lamps > Table Lamps",
    price: 1099.00,
    inventory: 0,
    status: "Archived",
    image: "https://cdn.shopify.com/s/files/1/0794/5247/1529/files/1770989050122.png?v=1770990454",
    createdAt: Timestamp.now()
  },
  {
    handle: "pet-hair-remover-brush-double-sided-self-cleaning-lint-brush-for-dog-cat-hair-reusable-fur-remover-for-clothes-car-seats",
    title: "Pet Hair Remover Brush | Double-Sided Self-Cleaning Lint Brush for Dog & Cat Hair | Reusable Fur Remover for Clothes,Car Seats",
    description: `<p>Remove pet hair instantly with this double-sided self-cleaning lint brush. Reusable, durable, and perfect for clothes, furniture, carpets, and car seats.</p>
<p><br></p>
<p>✨ KEY FEATURE </p>
<p><br></p>
<p>🔄 Double-Sided Lint Brush</p>
<p><br></p>
<p>Cleans fur twice as fast with a double-sided brushing surface for quick results.</p>
<p><br></p>
<p>🧼 Self-Cleaning Base</p>
<p><br></p>
<p>Simply dip the brush into the self-cleaning base to remove collected fur instantly—no need for sticky tape or refills.</p>
<p><br></p>
<p>💪 Durable ABS Plastic Body</p>
<p><br></p>
<p>Made from high-quality ABS plastic for long-lasting performance and comfortable grip.</p>
<p><br></p>
<p>🔧 Detachable Head</p>
<p><br></p>
<p>Easy-to-remove brush head for fast cleaning and convenient storage.</p>
<p><br></p>
<p>🐕🐈 Suitable for Dogs &amp; Cats</p>
<p><br></p>
<p>Perfect for pets with long hair—removes loose fur, lint, dust, and dander.</p>
<p><br></p>
<p>🏠 Multi-Surface Cleaning</p>
<p><br></p>
<p>Works effectively on:</p>
<p>✔ Couches &amp; sofas</p>
<p>✔ Clothes</p>
<p>✔ Carpets &amp; rugs</p>
<p>✔ Car seats</p>
<p>✔ Pet beds</p>
<p>✔ Upholstery</p>
<p><br></p>
<p>👜 Travel-Friendly &amp; Lightweight</p>
<p><br></p>
<p>Compact (Size M) and easy to carry in purses, backpacks, or car compartments.</p>
<p><br></p>
<p>♻️ Reusable &amp; Eco-Friendly</p>
<p><br></p>
<p>No batteries or sticky sheets required—use it again and again.</p>
<p><br></p>
<p>🌍 Country of Origin: China</p>
<p><br></p>
<p>Premium build quality, made with durable materials.</p>`,
    vendor: "Vionne",
    category: "Uncategorized",
    price: 499.00,
    inventory: 0,
    status: "Active",
    image: "https://cdn.shopify.com/s/files/1/0794/5247/1529/files/PetHairRemoverBrush_Double-SidedSelf-CleaningLintBrushforDog_CatHair_ReusableFurRemoverforClothes_CarSeats.webp?v=1770988565",
    createdAt: Timestamp.now()
  },
  {
    handle: "3-in-1-pet-steam-brush-self-cleaning-dog-cat-grooming-comb-steaming-pet-hair-brush-for-all-coat-types",
    title: "3 in 1 Pet Steam Brush | Self-Cleaning Dog & Cat Grooming Comb | Steaming Pet Hair Brush for All Coat Types",
    description: `<p>Give your pet a smooth, shiny and tangle-free coat with the 🌬️ Steam + 🧼 Clean + 💆 Massage grooming brush.</p>
<p>The anti-static steam spray reduces flying hair, while soft silicone teeth gently remove loose fur and knots.</p>
<p>Suitable for all dogs &amp; cats, long or short hair.</p>
<p><br></p>
<p>🌟 Key Features:</p>
<p>🔥 3-in-1: Steam + Detangle + Massage</p>
<p>🌬️ Anti-static steam spray reduces flyaway hair</p>
<p>🔋 USB Rechargeable – long battery life</p>
<p>🧴 Works with water or conditioner</p>
<p>🐾 Safe soft silicone teeth</p>
<p>🌟 Suitable for all coat types</p>
<p>🧼 Self-cleaning button</p>
<p>🔄 Dual-sided detachable head</p>
<p>💠 Made from durable AB</p>
<p> </p>
<p>📦 Specifications:</p>
<p> </p>
<p>🧱 Body Material: ABS</p>
<p>🦷 Teeth: Silicone</p>
<p>🔧 Detachable Head: Yes</p>
<p>🔄 Double Sided: Yes</p>
<p>🔋 Rechargeable: USB</p>
<p>🐶🐱 Suitable For: Dogs</p>
<p>&amp; Cats</p>
<p>🇮🇳 Country of Origin: India</p>`,
    vendor: "Vionne",
    category: "Uncategorized",
    price: 699.00,
    inventory: 0,
    status: "Archived",
    image: "https://cdn.shopify.com/s/files/1/0794/5247/1529/files/3in1PetSteamBrush_Self-CleaningDog_CatGroomingComb_SteamingPetHairBrushforAllCoatTypes.webp?v=1770987464",
    createdAt: Timestamp.now()
  },
  {
    handle: "wooden-money-saving-box-with-counter-1-lakh-challenge-reusable-hundi-piggy-bank-for-adults-kids-eco-friendly-cash-vault",
    title: "Wooden Money Saving Box with Counter (₹1 Lakh Challenge) – Reusable Hundi / Piggy Bank for Adults & Kids – Eco-Friendly Cash Vault",
    description: `<p>Turn small change into Big Savings! 🚀 Meet the ultimate Money Saving Box that helps you save ₹1,00,000 without the stress.</p>
<p>✅ Gamify Your Savings: Cross off the numbers as you drop in cash.</p>
<p>✅ Stay Motivated: See your progress visually every day.</p>
<p>✅ Aesthetic Look: Beautiful wooden finish that looks great on any desk or shelf.</p>
<p>Stop spending, start saving today! The perfect motivation for your next vacation, gadget, or emergency fund. 💸 #SavingsChallenge #MoneyBox #Gullak #FinancialFreedom #1LakhChallenge</p>
<p>     Key points:</p>
<p>      1: ACHIEVE ₹1 LAKH GOAL: A systematic way to save a large amount through small, manageable deposits.</p>
<p>      2: INTERACTIVE TRACKER: Tick-box system keeps you motivated and accountable.</p>
<p>      3:NO-OPENING DISCIPLINE: Designed to discourage taking money out until the goal is reached (unlike zipper wallets).</p>
<p>      4: EDUCATIONAL TOOL: Excellent for teaching teenagers and kids about financial discipline and math.</p>
<p>     5:STURDY &amp; STYLISH: Durable wooden build that looks premium compared to plastic alternatives.</p>`,
    vendor: "Vionne",
    category: "Home & Garden > Decor > Piggy Banks & Money Jars > Piggy Banks",
    price: 280.00,
    inventory: 0,
    status: "Archived",
    image: "https://cdn.shopify.com/s/files/1/0794/5247/1529/files/1770985006272_2.jpg?v=1770985374",
    createdAt: Timestamp.now()
  }
];

const seed = async () => {
  console.log('Seeding new products to project:', firebaseConfig.projectId);
  for (const product of newProducts) {
    try {
      await addDoc(collection(db, 'products'), product);
      console.log('Added:', product.title);
    } catch (e) {
      console.error('Error adding', product.title, e);
    }
  }
  console.log('Seeding complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
