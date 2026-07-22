USE cafex;

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Coffee', 'coffee', 'coffee', 1),
  ('Tea', 'tea', 'leaf', 2),
  ('Bakery', 'bakery', 'croissant', 3),
  ('Breakfast', 'breakfast', 'sunrise', 4),
  ('Cold Drinks', 'cold-drinks', 'glass-water', 5)
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
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=85', 'Brunch', 12, TRUE, TRUE
FROM categories WHERE slug = 'breakfast'
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  price = VALUES(price),
  image_url = VALUES(image_url),
  badge = VALUES(badge),
  prep_minutes = VALUES(prep_minutes),
  is_available = VALUES(is_available),
  is_featured = VALUES(is_featured);
