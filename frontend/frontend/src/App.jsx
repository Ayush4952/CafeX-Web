"use client";

import {
  ArrowRight,
  Check,
  ClipboardList,
  Clock3,
  Coffee,
  Heart,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "./component/Logo";
import { FALLBACK_MENU } from "./data/fallbackMenu";
import { apiRequest } from "./service/Api";

const categoryIcon = {
  coffee: Coffee,
  tea: Leaf,
  bakery: Sparkles,
  breakfast: Store,
  "cold-drinks": Star,
};

function money(value) {
  return `Rs. ${Number(value).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;
}

function readLocalStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default function App() {
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [token, setToken] = useState(() => readLocalStorage("cafex-token", null));
  const [user, setUser] = useState(() => readLocalStorage("cafex-user", null));
  const [items, setItems] = useState(FALLBACK_MENU);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => readLocalStorage("cafex-cart", {}));
  const [favorites, setFavorites] = useState(new Set());
  const [orders, setOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    apiRequest("/menu")
      .then((data) => setItems(data.items))
      .catch(() => setItems(FALLBACK_MENU))
      .finally(() => setLoadingMenu(false));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cafex-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!token || view !== "orders") return;
    apiRequest("/orders", {}, token)
      .then((data) => setOrders(data.orders))
      .catch((error) => setToast(error.message));
  }, [token, view]);

  useEffect(() => {
    if (!token || user?.role !== "admin" || view !== "admin") return;
    apiRequest("/dashboard", {}, token)
      .then(setDashboardData)
      .catch((error) => setToast(error.message));
  }, [token, user, view]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const categoryMatch = category === "all" || item.categorySlug === category;
    const text = `${item.name} ${item.description}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  }), [items, category, query]);

  const categories = useMemo(() => [
    { slug: "all", name: "All favorites" },
    ...Array.from(new Map(items.map((item) => [item.categorySlug, { slug: item.categorySlug, name: item.category }])).values()),
  ], [items]);

  const cartLines = useMemo(() => Object.entries(cart).flatMap(([id, quantity]) => {
    const item = items.find((entry) => entry.id === Number(id));
    return item ? [{ item, quantity }] : [];
  }), [cart, items]);
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const tax = Number((subtotal * 0.13).toFixed(2));

  function navigate(next) {
    if ((next === "dashboard" || next === "orders") && !user) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    if (next === "admin" && user?.role !== "admin") return;
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCart(id, delta) {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[id] ?? 0) + delta);
      const next = { ...current };
      if (nextQuantity) next[id] = nextQuantity;
      else delete next[id];
      return next;
    });
  }

  async function toggleFavorite(id) {
    if (!token) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    const nextFavorite = !favorites.has(id);
    setFavorites((current) => {
      const next = new Set(current);
      if (nextFavorite) next.add(id);
      else next.delete(id);
      return next;
    });
    try {
      await apiRequest(`/menu/${id}/favorite`, { method: nextFavorite ? "POST" : "DELETE" }, token);
    } catch (error) {
      setToast(error.message);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthBusy(true);
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setToken(data.token);
      setUser(data.user);
      window.localStorage.setItem("cafex-token", data.token);
      window.localStorage.setItem("cafex-user", JSON.stringify(data.user));
      setAuthOpen(false);
      setToast(`Welcome${authMode === "register" ? " to CafeX" : " back"}, ${data.user.fullName.split(" ")[0]}.`);
      navigate(data.user.role === "admin" ? "admin" : "dashboard");
    } catch (error) {
      setToast(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem("cafex-token");
    window.localStorage.removeItem("cafex-user");
    setView("home");
    setToast("You have been signed out.");
  }

  async function checkout() {
    if (!token) {
      setCartOpen(false);
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    try {
      const data = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartLines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })),
          fulfillment: "pickup",
        }),
      }, token);
      setCart({});
      setCartOpen(false);
      setToast(`Order ${data.order.orderNumber} is confirmed.`);
      navigate("orders");
    } catch (error) {
      setToast(error.message);
    }
  }

  async function toggleAvailability(item) {
    try {
      const data = await apiRequest(`/menu/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      }, token);
      setItems((current) => current.map((entry) => entry.id === item.id ? data.item : entry));
      setToast(`${item.name} is now ${data.item.isAvailable ? "available" : "unavailable"}.`);
    } catch (error) {
      setToast(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="logo-button" onClick={() => navigate("home")} aria-label="CafeX home"><Logo /></button>
        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Primary navigation">
          <button className={view === "home" ? "active" : ""} onClick={() => navigate("home")}>Home</button>
          <button className={view === "menu" ? "active" : ""} onClick={() => navigate("menu")}>Our menu</button>
          {user && <button className={view === "orders" ? "active" : ""} onClick={() => navigate("orders")}>Orders</button>}
          {user && <button className={view === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>My CafeX</button>}
          {user?.role === "admin" && <button className={view === "admin" ? "active" : ""} onClick={() => navigate("admin")}>Admin</button>}
        </nav>
        <div className="header-actions">
          <button className="icon-button cart-button" onClick={() => setCartOpen(true)} aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag size={20} />{cartCount > 0 && <span>{cartCount}</span>}
          </button>
          {user ? (
            <button className="profile-chip" onClick={() => navigate(user.role === "admin" ? "admin" : "dashboard")}>
              <span>{user.fullName.charAt(0)}</span><b>{user.fullName.split(" ")[0]}</b>
            </button>
          ) : (
            <button className="button button-small" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>Sign in</button>
          )}
          <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        {view === "home" && (
          <>
            <section className="hero">
              <div className="hero-overlay" />
              <div className="hero-copy">
                <span className="eyebrow"><Sparkles size={15} /> Thoughtfully roasted in Kathmandu</span>
                <h1>Slow mornings.<br /><em>Remarkable coffee.</em></h1>
                <p>From Himalayan honey lattes to flaky morning bakes, every CafeX order is crafted to make your day feel a little more special.</p>
                <div className="hero-actions">
                  <button className="button" onClick={() => navigate("menu")}>Explore the menu <ArrowRight size={18} /></button>
                  <button className="text-button" onClick={() => navigate("menu")}><span>●</span> Open today · 7:00–21:00</button>
                </div>
              </div>
              <div className="hero-card">
                <Logo compact />
                <div><span>Today&apos;s ritual</span><strong>Himalayan Honey Latte</strong><small>Sweet, balanced, unmistakably CafeX.</small></div>
                <button onClick={() => { updateCart(1, 1); setCartOpen(true); }} aria-label="Add Himalayan Honey Latte"><Plus /></button>
              </div>
            </section>

            <section className="trust-strip">
              <div><Coffee /><span><strong>Small-batch roasted</strong><small>Fresh beans, every week</small></span></div>
              <div><Leaf /><span><strong>Local ingredients</strong><small>From makers we know</small></span></div>
              <div><Clock3 /><span><strong>Ready in minutes</strong><small>Order ahead, skip the wait</small></span></div>
              <div><Star /><span><strong>4.9 community rating</strong><small>Loved across Kathmandu</small></span></div>
            </section>

            <section className="section featured-section">
              <div className="section-heading">
                <div><span className="eyebrow">CafeX signatures</span><h2>Your next favorite is waiting.</h2></div>
                <button className="text-link" onClick={() => navigate("menu")}>See full menu <ArrowRight size={17} /></button>
              </div>
              <div className="menu-grid featured-grid">
                {items.filter((item) => item.isFeatured).slice(0, 3).map((item) => (
                  <MenuCard key={item.id} item={item} quantity={cart[item.id] ?? 0} favorite={favorites.has(item.id)} onFavorite={toggleFavorite} onAdd={(id) => updateCart(id, 1)} />
                ))}
              </div>
            </section>

            <section className="story-section">
              <div className="story-mark">X</div>
              <div><span className="eyebrow">More than a coffee stop</span><h2>A neighborhood café,<br />built around your rhythm.</h2></div>
              <div><p>CafeX brings specialty coffee and easy technology together—so you can linger when you have time, or order ahead when you do not.</p><button className="text-link" onClick={() => navigate("menu")}>Find your ritual <ArrowRight size={17} /></button></div>
            </section>
          </>
        )}

        {view === "menu" && (
          <section className="page-section menu-page">
            <div className="page-intro">
              <div><span className="eyebrow">Made for every mood</span><h1>The CafeX menu</h1><p>Specialty coffee, Nepali classics, and fresh food—made to order.</p></div>
              <div className="menu-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coffee, tea or food" aria-label="Search menu" /></div>
            </div>
            <div className="category-tabs" role="tablist">
              {categories.map((entry) => {
                const Icon = categoryIcon[entry.slug] ?? Sparkles;
                return <button key={entry.slug} className={category === entry.slug ? "active" : ""} onClick={() => setCategory(entry.slug)}><Icon size={17} />{entry.name}</button>;
              })}
            </div>
            {loadingMenu ? <div className="loading-state"><LoaderCircle className="spin" /> Preparing the menu…</div> : (
              <div className="menu-grid">
                {filteredItems.map((item) => <MenuCard key={item.id} item={item} quantity={cart[item.id] ?? 0} favorite={favorites.has(item.id)} onFavorite={toggleFavorite} onAdd={(id) => updateCart(id, 1)} />)}
              </div>
            )}
          </section>
        )}

        {view === "dashboard" && user && (
          <section className="page-section dashboard-page">
            <div className="dashboard-welcome">
              <div><span className="eyebrow">Your CafeX</span><h1>Good to see you, {user.fullName.split(" ")[0]}.</h1><p>Your favorites, recent orders, and next coffee are all here.</p></div>
              <button className="button" onClick={() => navigate("menu")}>Order something good <ArrowRight size={18} /></button>
            </div>
            <div className="account-grid">
              <article className="account-card loyalty-card"><span className="card-label">CafeX rewards</span><strong>120 <small>beans</small></strong><p>80 more beans until your next drink is on us.</p><div className="progress"><span style={{ width: "60%" }} /></div></article>
              <article className="account-card"><Heart /><span className="card-label">Saved favorites</span><strong>{favorites.size}</strong><button onClick={() => navigate("menu")}>Browse menu <ArrowRight size={16} /></button></article>
              <article className="account-card"><ShoppingBag /><span className="card-label">Active cart</span><strong>{cartCount}</strong><button onClick={() => setCartOpen(true)}>Review cart <ArrowRight size={16} /></button></article>
            </div>
            <div className="dashboard-panels">
              <article className="panel"><div className="panel-heading"><div><span className="eyebrow">Made for you</span><h2>Order it again</h2></div></div><div className="compact-items">{items.slice(0, 3).map((item) => <div key={item.id}><img src={item.imageUrl} alt="" /><span><strong>{item.name}</strong><small>{money(item.price)}</small></span><button onClick={() => updateCart(item.id, 1)}><Plus /></button></div>)}</div></article>
              <article className="panel profile-panel"><div className="avatar-large">{user.fullName.charAt(0)}</div><h2>{user.fullName}</h2><p>{user.email}</p><div><span>Member since</span><strong>2026</strong></div><div><span>Favorite pickup</span><strong>Thamel café</strong></div><button className="outline-button" onClick={logout}><LogOut size={16} /> Sign out</button></article>
            </div>
          </section>
        )}

        {view === "orders" && user && (
          <section className="page-section orders-page">
            <div className="page-intro"><div><span className="eyebrow">Order history</span><h1>Your CafeX orders</h1><p>Track what is brewing and revisit old favorites.</p></div><button className="button" onClick={() => navigate("menu")}>New order <Plus size={18} /></button></div>
            <div className="orders-list">
              {orders.length ? orders.map((order) => <article className="order-row" key={order.id}><div className="order-icon"><Coffee /></div><div><small>{order.orderNumber}</small><strong>{order.fulfillment.replace("_", " ")}</strong><span>{new Date(order.createdAt).toLocaleString()}</span></div><div><span className={`status status-${order.status}`}>{order.status}</span><strong>{money(order.total)}</strong></div></article>) : <div className="empty-state"><ClipboardList /><h2>No orders yet</h2><p>Your first CafeX order will appear here.</p><button className="button" onClick={() => navigate("menu")}>Browse the menu</button></div>}
            </div>
          </section>
        )}

        {view === "admin" && user?.role === "admin" && (
          <section className="page-section admin-page">
            <div className="admin-header"><div><span className="eyebrow">Cafe operations</span><h1>Command center</h1><p>A live view of your menu, orders, and customer activity.</p></div><div className="live-pill"><span /> Live</div></div>
            <div className="metric-grid">
              <Metric icon={ClipboardList} label="Orders today" value={dashboardData?.summary.ordersToday ?? 0} note="Across all channels" />
              <Metric icon={TrendingUp} label="Revenue today" value={money(dashboardData?.summary.revenueToday ?? 0)} note="Excludes cancelled" />
              <Metric icon={Coffee} label="Menu available" value={`${dashboardData?.summary.availableItems ?? items.filter((item) => item.isAvailable).length}/${dashboardData?.summary.menuItems ?? items.length}`} note="Ready to order" />
              <Metric icon={Users} label="Customers" value={dashboardData?.summary.customers ?? 0} note="Registered members" />
            </div>
            <div className="admin-grid">
              <article className="panel menu-management"><div className="panel-heading"><div><span className="eyebrow">Menu control</span><h2>Availability</h2></div><button className="outline-button"><Plus size={16} /> Add item</button></div><div className="manage-list">{items.map((item) => <div key={item.id}><img src={item.imageUrl} alt="" /><span><strong>{item.name}</strong><small>{item.category} · {money(item.price)}</small></span><button className={item.isAvailable ? "availability on" : "availability"} onClick={() => toggleAvailability(item)}><span />{item.isAvailable ? "Available" : "Paused"}</button></div>)}</div></article>
              <article className="panel"><div className="panel-heading"><div><span className="eyebrow">Latest activity</span><h2>Recent orders</h2></div></div><div className="recent-orders">{(dashboardData?.recentOrders ?? []).map((order) => <div key={order.id}><span><strong>{order.orderNumber}</strong><small>{order.customerName}</small></span><span className={`status status-${order.status}`}>{order.status}</span><b>{money(order.total)}</b></div>)}{!dashboardData?.recentOrders.length && <div className="soft-empty">Orders will appear when MySQL is connected.</div>}</div></article>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer"><Logo /><p>Specialty coffee, thoughtfully made in Kathmandu.</p><div><button onClick={() => navigate("menu")}>Menu</button><button onClick={() => navigate("home")}>Our story</button><span>© 2026 CafeX</span></div></footer>

      {cartOpen && <CartDrawer lines={cartLines} subtotal={subtotal} tax={tax} onClose={() => setCartOpen(false)} onUpdate={updateCart} onCheckout={checkout} />}
      {authOpen && <AuthDialog mode={authMode} form={authForm} busy={authBusy} onMode={setAuthMode} onChange={setAuthForm} onClose={() => setAuthOpen(false)} onSubmit={submitAuth} />}
      {toast && <div className="toast"><Check size={18} />{toast}<button onClick={() => setToast(null)} aria-label="Dismiss"><X size={16} /></button></div>}
    </div>
  );
}

function MenuCard({ item, quantity, favorite, onFavorite, onAdd }) {
  return <article className={`menu-card ${!item.isAvailable ? "unavailable" : ""}`}><div className="menu-image"><img src={item.imageUrl} alt={item.name} />{item.badge && <span className="item-badge">{item.badge}</span>}<button className={favorite ? "favorite-button active" : "favorite-button"} onClick={() => onFavorite(item.id)} aria-label={`Favorite ${item.name}`}><Heart size={18} fill={favorite ? "currentColor" : "none"} /></button></div><div className="menu-card-body"><div><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p></div><div className="card-meta"><span><Clock3 size={14} /> {item.prepMinutes} min</span><strong>{money(item.price)}</strong></div><button className="add-button" disabled={!item.isAvailable} onClick={() => onAdd(item.id)}>{item.isAvailable ? <>{quantity > 0 ? `${quantity} in cart` : "Add to order"}<Plus size={17} /></> : "Unavailable"}</button></div></article>;
}

function Metric({ icon: Icon, label, value, note }) {
  return <article className="metric-card"><div><Icon /></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function CartDrawer({ lines, subtotal, tax, onClose, onUpdate, onCheckout }) {
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Your cart"><button className="drawer-backdrop" onClick={onClose} aria-label="Close cart" /><aside className="cart-drawer"><div className="drawer-heading"><div><span className="eyebrow">Your order</span><h2>Something good is coming.</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="cart-lines">{lines.length ? lines.map(({ item, quantity }) => <div className="cart-line" key={item.id}><img src={item.imageUrl} alt="" /><span><strong>{item.name}</strong><small>{money(item.price)}</small></span><div className="quantity"><button onClick={() => onUpdate(item.id, -1)}><Minus /></button><b>{quantity}</b><button onClick={() => onUpdate(item.id, 1)}><Plus /></button></div></div>) : <div className="empty-cart"><ShoppingBag /><h3>Your cart is empty</h3><p>Choose something from the menu to get started.</p><button className="outline-button" onClick={onClose}>Keep browsing</button></div>}</div>{lines.length > 0 && <div className="cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Tax</span><strong>{money(tax)}</strong></div><div className="cart-total"><span>Total</span><strong>{money(subtotal + tax)}</strong></div><button className="button checkout-button" onClick={onCheckout}>Confirm pickup order <ArrowRight size={18} /></button><small>Secure checkout · Pay at the café</small></div>}</aside></div>;
}

function AuthDialog({ mode, form, busy, onMode, onChange, onClose, onSubmit }) {
  return <div className="auth-layer" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Sign in" : "Create account"}><div className="auth-visual"><div className="auth-shade" /><Logo compact /><div><span className="eyebrow">Welcome to CafeX</span><h2>Great coffee<br />starts here.</h2><p>Order ahead, save your favorites, and make every visit feel effortless.</p></div></div><div className="auth-panel"><button className="auth-close" onClick={onClose}><X /></button><div className="auth-copy"><span className="eyebrow">{mode === "login" ? "Welcome back" : "Join the neighborhood"}</span><h2>{mode === "login" ? "Sign in to CafeX" : "Create your account"}</h2><p>{mode === "login" ? "Your favorites and order history are waiting." : "Start earning beans with your very first order."}</p></div><form onSubmit={onSubmit}>{mode === "register" && <label>Full name<input required minLength={2} value={form.fullName} onChange={(event) => onChange({ ...form, fullName: event.target.value })} placeholder="Your name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>{mode === "register" && <label>Phone <span>Optional</span><input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} placeholder="98XXXXXXXX" /></label>}<label>Password<input required type="password" minLength={mode === "register" ? 8 : 1} value={form.password} onChange={(event) => onChange({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label><button className="button auth-submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" /> Please wait</> : <>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={18} /></>}</button></form><div className="auth-switch">{mode === "login" ? "New to CafeX?" : "Already a member?"}<button onClick={() => onMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Sign in"}</button></div></div></div>;
}
