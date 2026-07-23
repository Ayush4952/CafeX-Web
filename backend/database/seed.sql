USE cafex;

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Fast Service', 'fast-service', 'clock', 1),
  ('Coffee', 'coffee', 'coffee', 2),
  ('Tea', 'tea', 'leaf', 3),
  ('Bakery', 'bakery', 'croissant', 4),
  ('Breakfast', 'breakfast', 'sunrise', 5),
  ('Cold Drinks', 'cold-drinks', 'glass-water', 6)
ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), sort_order = VALUES(sort_order);

INSERT INTO menu_items
  (category_id, name, description, price, image_url, badge, prep_minutes, is_available, is_featured)
SELECT id, 'Himalayan Honey Latte', 'Double espresso, steamed milk and wild Himalayan honey.', 280.00,
  'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=85', 'CafeX favorite', 8, TRUE, TRUE
FROM categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Classic Cappuccino', 'Silky microfoam over rich espresso with a cocoa finish.', 220.00,
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=85', NULL, 7, TRUE, TRUE
FROM categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Caramel Cold Brew', 'Slow-steeped coffee, caramel cream and a touch of sea salt.', 260.00,
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85', 'Cold', 5, TRUE, TRUE
FROM categories WHERE slug = 'cold-drinks'
UNION ALL
SELECT id, 'Masala Chiya', 'Nepali milk tea brewed with cardamom, ginger and warm spices.', 120.00,
  'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=85', 'Local', 8, TRUE, TRUE
FROM categories WHERE slug = 'tea'
UNION ALL
SELECT id, 'Butter Croissant', 'Flaky, golden layers baked fresh every morning.', 180.00,
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85', 'Fresh baked', 4, TRUE, TRUE
FROM categories WHERE slug = 'bakery'
UNION ALL
SELECT id, 'Avocado Toast', 'Sourdough, smashed avocado, tomatoes, herbs and soft egg.', 360.00,
  '/avocado-toast.jpg', 'Brunch', 12, TRUE, TRUE
FROM categories WHERE slug = 'breakfast'
UNION ALL
SELECT id, 'Kathmandu Mocha', 'Espresso, dark chocolate and steamed milk with a cocoa dusting.', 290.00,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85', 'Chocolate', 8, TRUE, FALSE
FROM categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Velvet Flat White', 'A smooth double ristretto finished with a thin layer of microfoam.', 240.00,
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85', NULL, 7, TRUE, FALSE
FROM categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Cafe Americano', 'Fresh espresso lengthened with hot water for a clean, bold cup.', 180.00,
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85', NULL, 5, TRUE, FALSE
FROM categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Express Espresso', 'A rich double espresso pulled to order and ready in two minutes.', 150.00,
  'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=900&q=85', 'Fast service', 2, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Espresso Macchiato', 'Double espresso finished with a small spoon of silky milk foam.', 170.00,
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85', '2 min', 2, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Nitro Cold Brew', 'Chilled cold brew poured from the tap with a smooth cascading finish.', 220.00,
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85', '1 min', 1, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Iced Espresso Tonic', 'Bright espresso poured over tonic water and ice.', 210.00,
  '/iced-americano.png', '2 min', 2, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Mineral Water', 'Chilled bottled mineral water, ready to take to your table.', 80.00,
  'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=900&q=85', '1 min', 1, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Sparkling Lemon Water', 'Sparkling water served cold with a fresh lemon slice.', 120.00,
  '/strawberry-lemonade.jpg', '1 min', 1, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Banana Bread Slice', 'A ready-to-serve slice of house-baked banana walnut bread.', 170.00,
  '/banana-bread.jpg', '1 min', 1, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Blueberry Muffin To Go', 'A fresh blueberry muffin packed for a quick café stop.', 190.00,
  'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=85', '1 min', 1, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Butter Croissant To Go', 'A flaky butter croissant warmed and packed for quick service.', 180.00,
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85', '2 min', 2, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Granola Yogurt Cup', 'Creamy yogurt layered with granola and Himalayan honey.', 200.00,
  'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85', '2 min', 2, TRUE, FALSE
FROM categories WHERE slug = 'fast-service'
UNION ALL
SELECT id, 'Himalayan Black Tea', 'Bright high-grown black tea with honeyed malt and floral notes.', 140.00,
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85', 'Nepal grown', 6, TRUE, FALSE
FROM categories WHERE slug = 'tea'
UNION ALL
SELECT id, 'Lemon Ginger Tea', 'Fresh ginger, lemon and honey steeped into a warming herbal cup.', 150.00,
  'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=900&q=85', 'Caffeine free', 7, TRUE, FALSE
FROM categories WHERE slug = 'tea'
UNION ALL
SELECT id, 'Matcha Latte', 'Ceremonial-style matcha whisked with lightly sweetened steamed milk.', 260.00,
  'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=900&q=85', NULL, 8, TRUE, FALSE
FROM categories WHERE slug = 'tea'
UNION ALL
SELECT id, 'Mint Green Tea', 'Delicate green tea infused with cooling garden mint.', 140.00,
  'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=85', 'Refreshing', 6, TRUE, FALSE
FROM categories WHERE slug = 'tea'
UNION ALL
SELECT id, 'Chocolate Croissant', 'Buttery laminated pastry wrapped around rich dark chocolate.', 220.00,
  'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=900&q=85', NULL, 4, TRUE, FALSE
FROM categories WHERE slug = 'bakery'
UNION ALL
SELECT id, 'Cinnamon Roll', 'Soft brioche swirled with cinnamon sugar and vanilla glaze.', 210.00,
  'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85', 'Sweet', 5, TRUE, FALSE
FROM categories WHERE slug = 'bakery'
UNION ALL
SELECT id, 'Blueberry Muffin', 'Tender vanilla muffin packed with blueberries and a crisp top.', 190.00,
  'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=85', NULL, 3, TRUE, FALSE
FROM categories WHERE slug = 'bakery'
UNION ALL
SELECT id, 'Banana Bread', 'Moist banana loaf with toasted walnuts and a hint of cinnamon.', 170.00,
  '/banana-bread.jpg', 'House baked', 3, TRUE, FALSE
FROM categories WHERE slug = 'bakery'
UNION ALL
SELECT id, 'CafeX Breakfast Plate', 'Eggs, toast, breakfast potatoes, greens and grilled tomato.', 480.00,
  'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=85', 'Hearty', 16, TRUE, FALSE
FROM categories WHERE slug = 'breakfast'
UNION ALL
SELECT id, 'Eggs Benedict', 'Poached eggs and hollandaise over toasted English muffins.', 420.00,
  'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=900&q=85', NULL, 15, TRUE, FALSE
FROM categories WHERE slug = 'breakfast'
UNION ALL
SELECT id, 'Pancake Stack', 'Fluffy pancakes with seasonal fruit, butter and maple syrup.', 340.00,
  'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85', 'Weekend favorite', 14, TRUE, FALSE
FROM categories WHERE slug = 'breakfast'
UNION ALL
SELECT id, 'Granola Yogurt Bowl', 'Creamy yogurt, house granola, fresh fruit and Himalayan honey.', 300.00,
  'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85', 'Light', 6, TRUE, FALSE
FROM categories WHERE slug = 'breakfast'
UNION ALL
SELECT id, 'Iced Americano', 'Double espresso poured over cold water and ice.', 190.00,
  '/iced-americano.png', NULL, 4, TRUE, FALSE
FROM categories WHERE slug = 'cold-drinks'
UNION ALL
SELECT id, 'Mango Lassi', 'Ripe mango blended with yogurt, cardamom and a touch of honey.', 250.00,
  '/mango-lassi.png', 'Seasonal', 5, TRUE, FALSE
FROM categories WHERE slug = 'cold-drinks'
UNION ALL
SELECT id, 'Strawberry Lemonade', 'Fresh strawberry, lemon and sparkling water over ice.', 220.00,
  '/strawberry-lemonade.jpg', 'Sparkling', 5, TRUE, FALSE
FROM categories WHERE slug = 'cold-drinks'
UNION ALL
SELECT id, 'Iced Matcha', 'Whisked matcha, cold milk and vanilla served over ice.', 270.00,
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=85', NULL, 6, TRUE, FALSE
FROM categories WHERE slug = 'cold-drinks'
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  description = VALUES(description),
  price = VALUES(price),
  image_url = VALUES(image_url),
  badge = VALUES(badge),
  prep_minutes = VALUES(prep_minutes),
  is_available = VALUES(is_available),
  is_featured = VALUES(is_featured);
