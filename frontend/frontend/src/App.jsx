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
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "./component/Logo";
import { apiRequest, FALLBACK_MENU } from "./service/Api";

const categoryIcon = {
  coffee: Coffee,
  tea: Leaf,
  bakery: Sparkles,
  breakfast: Store,
  "cold-drinks": Star,
};

const TABLE_NUMBERS = Array.from({ length: 15 }, (_, index) => index + 1);

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

function landingViewForRole(role) {
  if (role === "admin") return "admin";
  if (role === "staff") return "staff";
  return "dashboard";
}

function canManageOrders(role) {
  return role === "staff" || role === "admin";
}

export default function App() {
  const [view, setView] = useState(() => {
    const savedUser = readLocalStorage("cafex-user", null);
    if (!savedUser) return "home";
    return landingViewForRole(savedUser.role);
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [clearOrdersBusy, setClearOrdersBusy] = useState(false);
  const [staffBusyOrder, setStaffBusyOrder] = useState(null);
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [token, setToken] = useState(() => readLocalStorage("cafex-token", null));
  const [user, setUser] = useState(() => readLocalStorage("cafex-user", null));
  const [items, setItems] = useState(FALLBACK_MENU);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => readLocalStorage("cafex-cart", {}));
  const [tableNumber, setTableNumber] = useState("");
  const [favorites, setFavorites] = useState(() => new Set(readLocalStorage("cafex-favorites", [])));
  const [orders, setOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(() => readLocalStorage("cafex-active-order", null));
  const [clock, setClock] = useState(() => activeOrder
    ? Number(activeOrder.readyAt) - Number(activeOrder.estimatedPrepMinutes) * 60000
    : 0);

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
    window.localStorage.setItem("cafex-favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    if (!token) return;
    let stopped = false;
    apiRequest("/menu/favorites", {}, token)
      .then((data) => {
        if (!stopped) setFavorites(new Set(data.items.map((item) => Number(item.id))));
      })
      .catch((error) => {
        if (!stopped) setToast(error.message);
      });
    return () => {
      stopped = true;
    };
  }, [token]);

  useEffect(() => {
    if (activeOrder) {
      window.localStorage.setItem("cafex-active-order", JSON.stringify(activeOrder));
    } else {
      window.localStorage.removeItem("cafex-active-order");
    }
  }, [activeOrder]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!token || (view !== "orders" && view !== "staff")) return;
    let stopped = false;
    let reportedError = false;

    async function syncOrders() {
      try {
        const data = await apiRequest("/orders", {}, token);
        if (stopped) return;
        setOrders(data.orders);
        if (view !== "orders") return;
        setActiveOrder((current) => {
          if (!current) return current;
          const latest = data.orders.find((order) => order.id === current.id);
          if (!latest) return current;
          if (["completed", "cancelled"].includes(latest.status)) return null;
          const shouldHydrateItems = !current.items?.length && latest.items?.length;
          const shouldHydrateDetails = !current.fulfillment || (!current.tableNumber && latest.tableNumber);
          if (latest.status === current.status && !shouldHydrateItems && !shouldHydrateDetails) return current;
          return {
            ...current,
            status: latest.status,
            items: shouldHydrateItems ? latest.items : current.items,
            fulfillment: current.fulfillment ?? latest.fulfillment,
            tableNumber: current.tableNumber ?? latest.tableNumber,
          };
        });
      } catch (error) {
        if (!stopped && !reportedError) {
          reportedError = true;
          setToast(error.message);
        }
      }
    }

    syncOrders();
    const timer = window.setInterval(syncOrders, view === "staff" ? 8000 : 15000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [token, view]);

  useEffect(() => {
    if (!activeOrder || view !== "orders") return;
    const initialTimer = window.setTimeout(() => setClock(Date.now()), 0);
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [activeOrder, view]);

  useEffect(() => {
    if (!token || user?.role !== "admin" || view !== "admin") return;
    apiRequest("/dashboard", {}, token)
      .then(setDashboardData)
      .catch((error) => setToast(error.message));
  }, [token, user, view]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const categoryMatch = category === "all"
      ? favorites.has(item.id)
      : item.categorySlug === category;
    const text = `${item.name} ${item.description}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  }), [items, category, favorites, query]);

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
  const activeMinutesRemaining = activeOrder
    ? Math.max(0, Math.ceil((Number(activeOrder.readyAt) - clock) / 60000))
    : 0;
  const staffOrders = useMemo(() => [...orders].sort((left, right) => {
    const statusRank = { ready: 0, preparing: 1, pending: 2, completed: 3, cancelled: 4 };
    const rankDifference = statusRank[left.status] - statusRank[right.status];
    if (rankDifference) return rankDifference;
    return new Date(left.createdAt) - new Date(right.createdAt);
  }), [orders]);
  const activeStaffOrders = staffOrders.filter((order) => !["completed", "cancelled"].includes(order.status));
  const finishedStaffOrders = staffOrders.filter((order) => ["completed", "cancelled"].includes(order.status));

  function navigate(next) {
    if ((next === "dashboard" || next === "orders" || next === "staff") && !user) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    if (next === "staff" && !canManageOrders(user?.role)) return;
    if (next === "admin" && user?.role !== "admin") return;
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDashboard(authenticatedUser) {
    setView(landingViewForRole(authenticatedUser.role));
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
      setFavorites((current) => {
        const next = new Set(current);
        if (nextFavorite) next.delete(id);
        else next.add(id);
        return next;
      });
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
      openDashboard(data.user);
    } catch (error) {
      setToast(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    setActiveOrder(null);
    setConfirmedOrder(null);
    setFavorites(new Set());
    setOrders([]);
    window.localStorage.removeItem("cafex-token");
    window.localStorage.removeItem("cafex-user");
    window.localStorage.removeItem("cafex-favorites");
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
    if (!tableNumber) {
      setToast("Choose a table number from 1 to 15.");
      return;
    }
    try {
      const data = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartLines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })),
          fulfillment: "dine_in",
          tableNumber: Number(tableNumber),
        }),
      }, token);
      const longestItem = Math.max(...cartLines.map((line) => Number(line.item.prepMinutes) || 10), 10);
      const quantityBuffer = Math.ceil(Math.max(0, cartCount - 1) / 2);
      const estimatedPrepMinutes = Number(data.order.estimatedPrepMinutes)
        || longestItem + quantityBuffer + Math.floor(Math.random() * 4);
      const nextActiveOrder = {
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        status: data.order.status ?? "preparing",
        fulfillment: "dine_in",
        tableNumber,
        estimatedPrepMinutes,
        readyAt: Date.now() + estimatedPrepMinutes * 60000,
        items: data.order.items?.length ? data.order.items : cartLines.map(({ item, quantity }) => ({
          menuItemId: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          quantity,
        })),
      };
      setCart({});
      setTableNumber("");
      setCartOpen(false);
      setActiveOrder(nextActiveOrder);
      setConfirmedOrder(nextActiveOrder);
      setClock(Date.now());
      navigate("orders");
    } catch (error) {
      setToast(error.message);
    }
  }

  async function clearOrderHistory() {
    if (!token || clearOrdersBusy) return;
    const confirmed = window.confirm("Clear your complete order history? This cannot be undone.");
    if (!confirmed) return;

    setClearOrdersBusy(true);
    try {
      const data = await apiRequest("/orders", { method: "DELETE" }, token);
      setOrders([]);
      setActiveOrder(null);
      setConfirmedOrder(null);
      setClock(0);
      setToast(data.message);
    } catch (error) {
      setToast(error.message);
    } finally {
      setClearOrdersBusy(false);
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

  async function updateStaffOrder(order, status) {
    if (!token || !canManageOrders(user?.role) || staffBusyOrder) return;
    setStaffBusyOrder(order.id);
    try {
      const data = await apiRequest(`/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      setOrders((current) => current.map((entry) => (
        entry.id === order.id ? { ...entry, status: data.status } : entry
      )));
      setToast(`${order.orderNumber} marked ${data.status}.`);
    } catch (error) {
      setToast(error.message);
    } finally {
      setStaffBusyOrder(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="logo-button" onClick={() => navigate("home")} aria-label="CafeX home"><Logo /></button>
        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Primary navigation">
          <button className={view === "home" ? "active" : ""} onClick={() => navigate("home")}>Home</button>
          <button className={view === "menu" ? "active" : ""} onClick={() => navigate("menu")}>Our menu</button>
          {user?.role === "customer" && <button className={view === "orders" ? "active" : ""} onClick={() => navigate("orders")}>Orders</button>}
          {user?.role === "customer" && <button className={view === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>My CafeX</button>}
          {canManageOrders(user?.role) && <button className={view === "staff" ? "active" : ""} onClick={() => navigate("staff")}>Staff orders</button>}
          {user?.role === "admin" && <button className={view === "admin" ? "active" : ""} onClick={() => navigate("admin")}>Admin</button>}
        </nav>
        <div className="header-actions">
          {!canManageOrders(user?.role) && <button className="icon-button cart-button" onClick={() => setCartOpen(true)} aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag size={20} />{cartCount > 0 && <span>{cartCount}</span>}
          </button>}
          {user ? (
            <button className="profile-chip" onClick={() => navigate(landingViewForRole(user.role))}>
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
            {loadingMenu ? <div className="loading-state"><LoaderCircle className="spin" /> Preparing the menu…</div> : filteredItems.length ? (
              <div className="menu-grid">
                {filteredItems.map((item) => <MenuCard key={item.id} item={item} quantity={cart[item.id] ?? 0} favorite={favorites.has(item.id)} onFavorite={toggleFavorite} onAdd={(id) => updateCart(id, 1)} />)}
              </div>
            ) : category === "all" ? <div className="empty-state menu-empty"><Heart /><h2>No favorites yet</h2><p>Choose a category and tap the heart on anything you love.</p><button className="button" onClick={() => setCategory("coffee")}>Browse the menu</button></div> : <div className="empty-state menu-empty"><Search /><h2>No menu items found</h2><p>Try another category or search phrase.</p></div>}
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
              <article className="panel profile-panel"><div className="avatar-large">{user.fullName.charAt(0)}</div><h2>{user.fullName}</h2><p>{user.email}</p><div><span>Member since</span><strong>2026</strong></div><button className="outline-button" onClick={logout}><LogOut size={16} /> Sign out</button></article>
            </div>
          </section>
        )}

        {view === "orders" && user && (
          <section className="page-section orders-page">
            <div className="page-intro"><div><span className="eyebrow">Order history</span><h1>Your CafeX orders</h1><p>Track what is brewing and revisit old favorites.</p></div><div className="order-page-actions">{user.role !== "admin" && (orders.length > 0 || activeOrder) && <button className="outline-button clear-orders-button" disabled={clearOrdersBusy} onClick={clearOrderHistory}><Trash2 size={16} /> {clearOrdersBusy ? "Clearing…" : "Clear history"}</button>}<button className="button" onClick={() => navigate("menu")}>New order <Plus size={18} /></button></div></div>
            {activeOrder && <LiveOrderNotice order={activeOrder} remainingMinutes={activeMinutesRemaining} />}
            <div className="orders-list">
              {orders.length ? orders.map((order) => <article className="order-row" key={order.id}><OrderImages items={order.items} /><div><small>{order.orderNumber}</small><strong>{order.fulfillment.replace("_", " ")}{order.tableNumber ? ` · Table ${order.tableNumber}` : ""}</strong>{order.items?.length > 0 && <span className="order-item-summary">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</span>}<span>{new Date(order.createdAt).toLocaleString()}</span></div><div><span className={`status status-${order.status}`}>{order.status}</span><strong>{money(order.total)}</strong></div></article>) : <div className="empty-state"><ClipboardList /><h2>No orders yet</h2><p>Your first CafeX order will appear here.</p><button className="button" onClick={() => navigate("menu")}>Browse the menu</button></div>}
            </div>
          </section>
        )}

        {view === "staff" && canManageOrders(user?.role) && (
          <section className="page-section staff-page">
            <div className="staff-header">
              <div><span className="eyebrow">Staff only · live service</span><h1>Table order queue</h1><p>Prepare each order, call it ready, and close it once it reaches the table.</p></div>
              <div className="staff-header-actions"><div className="live-pill"><span /> Refreshes live</div><button className="outline-button" onClick={logout}><LogOut size={16} /> Sign out</button></div>
            </div>
            <div className="staff-metrics">
              <Metric icon={Clock3} label="Preparing" value={orders.filter((order) => ["pending", "preparing"].includes(order.status)).length} note="In the kitchen" />
              <Metric icon={Check} label="Ready" value={orders.filter((order) => order.status === "ready").length} note="Waiting for service" />
              <Metric icon={Store} label="Active tables" value={new Set(activeStaffOrders.map((order) => order.tableNumber).filter(Boolean)).size} note="Dine-in orders" />
            </div>
            <div className="staff-section-heading"><div><span className="eyebrow">Kitchen queue</span><h2>Active orders</h2></div><strong>{activeStaffOrders.length} open</strong></div>
            <div className="staff-order-grid">
              {activeStaffOrders.length ? activeStaffOrders.map((order) => (
                <StaffOrderCard key={order.id} order={order} busy={staffBusyOrder === order.id} onStatus={updateStaffOrder} />
              )) : <div className="empty-state staff-empty"><Check /><h2>All caught up</h2><p>New table orders will appear here automatically.</p></div>}
            </div>
            {finishedStaffOrders.length > 0 && <div className="staff-completed"><div className="staff-section-heading"><div><span className="eyebrow">Recently closed</span><h2>Completed orders</h2></div></div><div className="staff-completed-list">{finishedStaffOrders.slice(0, 8).map((order) => <article key={order.id}><OrderImages items={order.items} /><span><strong>{order.orderNumber}</strong><small>{order.tableNumber ? `Table ${order.tableNumber}` : "Dine in"} · {order.customerName}</small></span><span className={`status status-${order.status}`}>{order.status}</span><b>{money(order.total)}</b></article>)}</div></div>}
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

      {cartOpen && <CartDrawer lines={cartLines} subtotal={subtotal} tax={tax} tableNumber={tableNumber} onTableNumber={setTableNumber} onClose={() => setCartOpen(false)} onUpdate={updateCart} onCheckout={checkout} />}
      {authOpen && <AuthDialog mode={authMode} form={authForm} busy={authBusy} onMode={setAuthMode} onChange={setAuthForm} onClose={() => setAuthOpen(false)} onSubmit={submitAuth} />}
      {confirmedOrder && <OrderConfirmation order={confirmedOrder} onClose={() => setConfirmedOrder(null)} onTrack={() => { setConfirmedOrder(null); navigate("orders"); }} onMenu={() => { setConfirmedOrder(null); navigate("menu"); }} />}
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

function StaffOrderCard({ order, busy, onStatus }) {
  const nextAction = order.status === "ready"
    ? { status: "completed", label: "Complete order" }
    : order.status === "pending"
      ? { status: "preparing", label: "Start preparing" }
      : { status: "ready", label: "Mark ready" };

  return <article className={`staff-order-card staff-order-${order.status}`}><div className="staff-order-top"><div><span className={`status status-${order.status}`}>{order.status}</span><small>{order.orderNumber}</small></div><strong>{order.tableNumber ? `Table ${order.tableNumber}` : "Dine in"}</strong></div><div className="staff-customer"><OrderImages items={order.items} /><span><strong>{order.customerName}</strong><small>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {money(order.total)}</small></span></div><div className="staff-item-list">{order.items?.map((item) => <div key={`${order.id}-${item.menuItemId ?? item.name}`}><b>{item.quantity}×</b><span>{item.name}</span></div>)}</div><button className="button staff-status-button" disabled={busy} onClick={() => onStatus(order, nextAction.status)}>{busy ? <><LoaderCircle className="spin" /> Updating…</> : <>{nextAction.label} <ArrowRight size={17} /></>}</button></article>;
}

function LiveOrderNotice({ order, remainingMinutes }) {
  const ready = order.status === "ready";
  const almostReady = !ready && remainingMinutes === 0;
  const itemSummary = order.items?.map((item) => `${item.quantity}× ${item.name}`).join(", ");
  const destination = order.fulfillment === "dine_in" && order.tableNumber
    ? `We will bring it to Table ${order.tableNumber}.`
    : "Collect it from the CafeX pickup counter.";

  return <article className={`live-order-notice ${ready ? "is-ready" : ""}`}><div><span className="live-pill"><span /> Live order · {order.orderNumber}</span><h2>{ready ? "Your order is ready." : "Your order is being prepared."}</h2><p>{ready ? destination : almostReady ? `The kitchen is adding the finishing touches. ${destination}` : `This estimate is based on the food and drinks in your order. ${destination}`}</p>{order.items?.length > 0 && <div className="live-order-products"><OrderImages items={order.items} large /><span>{itemSummary}</span></div>}</div><div className="prep-estimate"><Clock3 /><strong>{ready ? "Ready" : almostReady ? "Soon" : `${remainingMinutes} min`}</strong><small>{ready ? order.tableNumber ? `table ${order.tableNumber}` : "for pickup" : "estimated time"}</small></div></article>;
}

function OrderImages({ items = [], large = false }) {
  const visibleItems = items.filter((item) => item.imageUrl).slice(0, large ? 4 : 3);
  if (!visibleItems.length) return <div className="order-icon"><Coffee /></div>;

  return <div className={`order-images ${large ? "order-images-large" : ""}`} aria-label="Items in this order">{visibleItems.map((item, index) => <img key={`${item.menuItemId ?? item.name}-${index}`} src={item.imageUrl} alt={item.name} />)}{items.length > visibleItems.length && <span>+{items.length - visibleItems.length}</span>}</div>;
}

function OrderConfirmation({ order, onClose, onTrack, onMenu }) {
  const itemSummary = order.items?.map((item) => `${item.quantity}× ${item.name}`).join(", ");

  return <div className="confirmation-layer" role="dialog" aria-modal="true" aria-label="Order confirmed"><button className="confirmation-backdrop" onClick={onClose} aria-label="Close confirmation" /><article className="confirmation-card"><button className="confirmation-close" onClick={onClose} aria-label="Close"><X /></button><div className="confirmation-check"><Check /></div><span className="eyebrow">Sent to the kitchen</span><h2>Order confirmed!</h2><p>Your order is now being prepared and will be brought to your table.</p><div className="confirmation-details"><div><small>Order number</small><strong>{order.orderNumber}</strong></div><div><small>Your table</small><strong>Table {order.tableNumber}</strong></div><div><small>Estimated time</small><strong>{order.estimatedPrepMinutes} min</strong></div></div>{order.items?.length > 0 && <div className="confirmation-items"><OrderImages items={order.items} large /><span>{itemSummary}</span></div>}<button className="button confirmation-primary" onClick={onTrack}>Track live order <ArrowRight size={18} /></button><button className="confirmation-menu" onClick={onMenu}>Continue browsing menu</button></article></div>;
}

function CartDrawer({ lines, subtotal, tax, tableNumber, onTableNumber, onClose, onUpdate, onCheckout }) {
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Your cart"><button className="drawer-backdrop" onClick={onClose} aria-label="Close cart" /><aside className="cart-drawer"><div className="drawer-heading"><div><span className="eyebrow">Your order</span><h2>Something good is coming.</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="cart-lines">{lines.length ? lines.map(({ item, quantity }) => <div className="cart-line" key={item.id}><img src={item.imageUrl} alt="" /><span><strong>{item.name}</strong><small>{money(item.price)}</small></span><div className="quantity"><button onClick={() => onUpdate(item.id, -1)}><Minus /></button><b>{quantity}</b><button onClick={() => onUpdate(item.id, 1)}><Plus /></button></div></div>) : <div className="empty-cart"><ShoppingBag /><h3>Your cart is empty</h3><p>Choose something from the menu to get started.</p><button className="outline-button" onClick={onClose}>Keep browsing</button></div>}</div>{lines.length > 0 && <div className="cart-summary"><div className="order-preferences"><span>Dine-in table</span><label className="table-picker"><span>Choose table</span><select required value={tableNumber} onChange={(event) => onTableNumber(event.target.value)}><option value="">Select table 1–15</option>{TABLE_NUMBERS.map((number) => <option key={number} value={number}>Table {number}</option>)}</select></label></div><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Tax</span><strong>{money(tax)}</strong></div><div className="cart-total"><span>Total</span><strong>{money(subtotal + tax)}</strong></div><button className="button checkout-button" onClick={onCheckout}>{`Confirm${tableNumber ? ` Table ${tableNumber}` : " dine-in"} order`} <ArrowRight size={18} /></button><small>Secure checkout · Pay at the café</small></div>}</aside></div>;
}

function AuthDialog({ mode, form, busy, onMode, onChange, onClose, onSubmit }) {
  return <div className="auth-layer" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Sign in" : "Create account"}><div className="auth-visual"><div className="auth-shade" /><Logo compact /><div><span className="eyebrow">Welcome to CafeX</span><h2>Great coffee<br />starts here.</h2><p>Order ahead, save your favorites, and make every visit feel effortless.</p></div></div><div className="auth-panel"><button className="auth-close" onClick={onClose}><X /></button><div className="auth-copy"><span className="eyebrow">{mode === "login" ? "Welcome back" : "Join the neighborhood"}</span><h2>{mode === "login" ? "Sign in to CafeX" : "Create your account"}</h2><p>{mode === "login" ? "Your favorites and order history are waiting." : "Start earning beans with your very first order."}</p></div><form onSubmit={onSubmit}>{mode === "register" && <label>Full name<input required minLength={2} value={form.fullName} onChange={(event) => onChange({ ...form, fullName: event.target.value })} placeholder="Your name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>{mode === "register" && <label>Phone <span>Optional</span><input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} placeholder="98XXXXXXXX" /></label>}<label>Password<input required type="password" minLength={mode === "register" ? 8 : 1} value={form.password} onChange={(event) => onChange({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label><button className="button auth-submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" /> Please wait</> : <>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={18} /></>}</button></form><div className="auth-switch">{mode === "login" ? "New to CafeX?" : "Already a member?"}<button onClick={() => onMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Sign in"}</button></div></div></div>;
}
