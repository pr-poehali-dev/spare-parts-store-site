import { useState, useMemo, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";

const SEARCH_PARTS_URL = "https://functions.poehali.dev/40f9974a-61dd-4720-92e4-9eef1c3d8050";
const SEND_ORDER_URL = "https://functions.poehali.dev/e6abb2e5-7bbc-46f2-9846-ec4d49654c4f";
const HERO_IMG = "https://cdn.poehali.dev/projects/e988edd9-026d-4559-84e8-494aaee012e3/files/d0bbbb62-2557-4dc6-b72a-b5e4fbb26c9f.jpg";
const PARTS_IMG = "https://cdn.poehali.dev/projects/e988edd9-026d-4559-84e8-494aaee012e3/files/92681ebc-0cd5-477a-b6d2-900be8f5ba1e.jpg";

type Page = "home" | "catalog" | "about" | "delivery" | "contacts" | "cart";

interface Product {
  id: number;
  name: string;
  article: string;
  brand: string;
  type: string;
  price: number;
  oldPrice?: number;
  img: string;
  inStock: boolean;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Тормозные колодки передние", article: "TRW-GDB1234", brand: "Toyota", type: "Тормоза", price: 2890, oldPrice: 3400, img: PARTS_IMG, inStock: true },
  { id: 2, name: "Масляный фильтр", article: "MANN-W712", brand: "BMW", type: "Фильтры", price: 650, img: PARTS_IMG, inStock: true },
  { id: 3, name: "Свеча зажигания (к-т 4шт)", article: "NGK-BKR6E", brand: "Volkswagen", type: "Двигатель", price: 1200, img: PARTS_IMG, inStock: true },
  { id: 4, name: "Ремень ГРМ", article: "GATES-K015577XS", brand: "Ford", type: "Двигатель", price: 4500, oldPrice: 5200, img: PARTS_IMG, inStock: false },
  { id: 5, name: "Воздушный фильтр", article: "FILTRON-AP149", brand: "Hyundai", type: "Фильтры", price: 890, img: PARTS_IMG, inStock: true },
  { id: 6, name: "Амортизатор передний", article: "SACHS-313573", brand: "Toyota", type: "Подвеска", price: 7200, img: PARTS_IMG, inStock: true },
  { id: 7, name: "Тормозной диск", article: "BREMBO-09.A356", brand: "BMW", type: "Тормоза", price: 5600, oldPrice: 6800, img: PARTS_IMG, inStock: true },
  { id: 8, name: "Подшипник ступицы", article: "SKF-VKBD1043", brand: "Volkswagen", type: "Подвеска", price: 3100, img: PARTS_IMG, inStock: false },
  { id: 9, name: "Топливный фильтр", article: "BOSCH-F026402004", brand: "Ford", type: "Фильтры", price: 1450, img: PARTS_IMG, inStock: true },
  { id: 10, name: "Шаровая опора", article: "LEMFORDER-25609", brand: "Hyundai", type: "Подвеска", price: 2300, img: PARTS_IMG, inStock: true },
  { id: 11, name: "Генератор", article: "VALEO-200011", brand: "Toyota", type: "Электрика", price: 14500, img: PARTS_IMG, inStock: true },
  { id: 12, name: "Стартер", article: "DENSO-DSN926", brand: "BMW", type: "Электрика", price: 11200, oldPrice: 13000, img: PARTS_IMG, inStock: false },
];

const BRANDS = ["Все", "Toyota", "BMW", "Volkswagen", "Ford", "Hyundai"];
const TYPES = ["Все", "Тормоза", "Фильтры", "Двигатель", "Подвеска", "Электрика"];

const NAV_ITEMS: { label: string; page: Page; icon: string }[] = [
  { label: "Главная", page: "home", icon: "Home" },
  { label: "Каталог", page: "catalog", icon: "Grid3x3" },
  { label: "О нас", page: "about", icon: "Info" },
  { label: "Доставка", page: "delivery", icon: "Truck" },
  { label: "Контакты", page: "contacts", icon: "Phone" },
];

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filterBrand, setFilterBrand] = useState("Все");
  const [filterType, setFilterType] = useState("Все");
  const [filterArticle, setFilterArticle] = useState("");
  const [filterPrice, setFilterPrice] = useState<[number, number]>([0, 15000]);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const cartTotal = cart.reduce((a, c) => a + c.product.price * c.qty, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id));
  const changeQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (filterBrand !== "Все" && p.brand !== filterBrand) return false;
      if (filterType !== "Все" && p.type !== filterType) return false;
      if (filterArticle && !p.article.toLowerCase().includes(filterArticle.toLowerCase())) return false;
      if (p.price < filterPrice[0] || p.price > filterPrice[1]) return false;
      return true;
    });
  }, [filterBrand, filterType, filterArticle, filterPrice]);

  const navigate = (p: Page) => { setPage(p); setMobileMenuOpen(false); window.scrollTo(0, 0); };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("home")} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground flex items-center justify-center">
                <span className="text-white text-xs font-display font-bold">АЗ</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground tracking-wide">
                АВТО<span className="text-[hsl(var(--accent))]">ЗАПЧАСТИ</span>
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-[hsl(var(--accent))] ${page === item.page ? "text-[hsl(var(--accent))]" : "text-muted-foreground"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("cart")}
                className="relative flex items-center gap-2 bg-foreground text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Icon name="ShoppingCart" size={16} />
                <span className="hidden sm:inline">Корзина</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[hsl(var(--accent))] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(v => !v)}>
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white animate-fade-in">
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${page === item.page ? "bg-foreground text-white" : "hover:bg-muted"}`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {page === "home" && <HomePage navigate={navigate} addToCart={addToCart} />}
      {page === "catalog" && (
        <CatalogPage
          products={filteredProducts}
          filterBrand={filterBrand} setFilterBrand={setFilterBrand}
          filterType={filterType} setFilterType={setFilterType}
          filterArticle={filterArticle} setFilterArticle={setFilterArticle}
          filterPrice={filterPrice} setFilterPrice={setFilterPrice}
          addToCart={addToCart}
        />
      )}
      {page === "about" && <AboutPage />}
      {page === "delivery" && <DeliveryPage />}
      {page === "contacts" && <ContactsPage />}
      {page === "cart" && <CartPage cart={cart} total={cartTotal} removeFromCart={removeFromCart} changeQty={changeQty} navigate={navigate} />}

      {/* Footer */}
      <footer className="bg-foreground text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="font-display text-lg font-bold tracking-wide mb-3">
                АВТО<span className="text-[hsl(var(--accent))]">ЗАПЧАСТИ</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Качественные запчасти для всех марок. Работаем с 2010 года.</p>
            </div>
            <div>
              <div className="font-display font-semibold text-xs tracking-widest text-gray-400 uppercase mb-3">Навигация</div>
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map(i => (
                  <button key={i.page} onClick={() => navigate(i.page)} className="text-sm text-gray-300 hover:text-white text-left transition-colors">{i.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-display font-semibold text-xs tracking-widest text-gray-400 uppercase mb-3">Контакты</div>
              <div className="flex flex-col gap-2 text-sm text-gray-300">
                <span>+7 (951) 913-76-40</span>
                <span>zayavka@avtozapnn.ru</span>
                <span>Пн–Сб: 09:00–19:00</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-xs text-gray-500">
            © 2024 АвтоЗапчасти. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ========== ARTICLE SEARCH ========== */
interface PartResult {
  article: string;
  name: string;
  price: number;
  in_stock: boolean;
  brand: string;
}

function ArticleSearch({ addToCart }: { addToCart: (p: Product) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (r: PartResult) => {
    const product: Product = {
      id: Math.abs(r.article.split("").reduce((a, c) => a + c.charCodeAt(0), 0)),
      name: r.name,
      article: r.article,
      brand: r.brand,
      type: "Из поиска",
      price: r.price,
      img: PARTS_IMG,
      inStock: r.in_stock,
    };
    addToCart(product);
    setAdded(prev => ({ ...prev, [r.article]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [r.article]: false })), 1500);
  };

  const search = async () => {
    const q = query.trim();
    if (!q) { setError("Введите артикул"); return; }
    setError("");
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${SEARCH_PARTS_URL}?article=${encodeURIComponent(q)}`);
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setResults(parsed.results ?? []);
    } catch {
      setError("Ошибка соединения. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 w-full">
      <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-2">Поиск по артикулу</div>
      <h3 className="font-display text-lg font-bold text-white mb-4 tracking-wide">НАЙДИТЕ ДЕТАЛЬ БЫСТРО</h3>
      <div className="flex gap-2 mb-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Введите артикул, напр. NGK-BKR6E"
          className="flex-1 bg-white/10 border border-white/30 text-white placeholder:text-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
        />
        <button
          onClick={search}
          disabled={loading}
          className="bg-[hsl(var(--accent))] text-white px-4 py-2.5 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
        >
          {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
        </button>
      </div>
      {error && <p className="text-red-300 text-xs mt-1">{error}</p>}

      {results !== null && (
        <div className="mt-4 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Артикул не найден в базе</p>
          ) : results.map(r => (
            <div key={r.article} className="bg-white/10 border border-white/10 px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm font-medium leading-snug truncate">{r.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">{r.article} · {r.brand}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[hsl(var(--accent))] font-bold text-sm">{r.price.toLocaleString("ru")} ₽</span>
                  <span className={`text-xs ${r.in_stock ? "text-green-400" : "text-yellow-400"}`}>
                    {r.in_stock ? "В наличии" : "Под заказ"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleAdd(r)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${added[r.article] ? "bg-green-500 text-white" : "bg-[hsl(var(--accent))] text-white hover:opacity-90"}`}
              >
                <Icon name={added[r.article] ? "Check" : "ShoppingCart"} size={13} />
                {added[r.article] ? "Добавлено" : "В корзину"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== HOME ========== */
function HomePage({ navigate, addToCart }: { navigate: (p: Page) => void; addToCart: (p: Product) => void }) {
  const featured = PRODUCTS.filter(p => p.oldPrice).slice(0, 4);

  return (
    <main>
      <section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Запчасти" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-[hsl(var(--accent))] text-white text-xs font-body font-semibold tracking-widest uppercase px-3 py-1 mb-6 animate-fade-in">
                Оригинальные запчасти
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight tracking-wide mb-6 animate-fade-in delay-1">
                НАДЁЖНЫЕ<br />
                <span className="text-[hsl(var(--accent))]">ЗАПЧАСТИ</span><br />
                ДЛЯ ВАШЕГО АВТО
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed animate-fade-in delay-2">
                Более 50 000 позиций в наличии. Доставка по всей России. Гарантия качества.
              </p>
              <div className="flex flex-wrap gap-3 animate-fade-in delay-3">
                <button
                  onClick={() => navigate("catalog")}
                  className="bg-[hsl(var(--accent))] text-white px-8 py-3.5 font-body font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
                >
                  Перейти в каталог
                </button>
                <button
                  onClick={() => navigate("contacts")}
                  className="border border-white text-white px-8 py-3.5 font-body font-semibold text-sm tracking-wide hover:bg-white hover:text-foreground transition-colors"
                >
                  Связаться с нами
                </button>
              </div>
            </div>
            <div className="animate-fade-in delay-2">
              <ArticleSearch addToCart={addToCart} />
            </div>
          </div>
        </div>
        <div className="relative border-t border-gray-700 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "50 000+", label: "Позиций в каталоге" },
                { value: "14 лет", label: "На рынке" },
                { value: "98%", label: "Довольных клиентов" },
                { value: "1–3 дня", label: "Срок доставки" },
              ].map((s, i) => (
                <div key={i} className={`animate-fade-in delay-${i + 1}`}>
                  <div className="font-display text-2xl font-bold text-[hsl(var(--accent))]">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Каталог</div>
            <h2 className="font-display text-3xl font-bold tracking-wide">КАТЕГОРИИ ЗАПЧАСТЕЙ</h2>
          </div>
          <button onClick={() => navigate("catalog")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            Все <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: "Disc", label: "Тормоза" },
            { icon: "Filter", label: "Фильтры" },
            { icon: "Settings", label: "Двигатель" },
            { icon: "Gauge", label: "Подвеска" },
            { icon: "Zap", label: "Электрика" },
            { icon: "Wind", label: "Кузов" },
          ].map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => navigate("catalog")}
              className={`group flex flex-col items-center gap-3 p-5 border border-border hover:border-foreground hover:bg-foreground hover:text-white transition-all animate-fade-in delay-${Math.min(i + 1, 6)}`}
            >
              <Icon name={cat.icon} size={24} />
              <span className="text-xs font-semibold tracking-wide">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-muted py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Скидки</div>
              <h2 className="font-display text-3xl font-bold tracking-wide">АКЦИИ И СПЕЦПРЕДЛОЖЕНИЯ</h2>
            </div>
            <button onClick={() => navigate("catalog")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Все <Icon name="ArrowRight" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} addToCart={addToCart} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Преимущества</div>
          <h2 className="font-display text-3xl font-bold tracking-wide">ПОЧЕМУ ВЫБИРАЮТ НАС</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "ShieldCheck", title: "Гарантия качества", desc: "Все запчасти сертифицированы. Гарантия от 6 месяцев на каждую позицию." },
            { icon: "Truck", title: "Быстрая доставка", desc: "Доставка по России от 1 дня. Самовывоз из нашего склада." },
            { icon: "Tag", title: "Честные цены", desc: "Работаем напрямую с производителями — без лишних наценок." },
            { icon: "Headphones", title: "Поддержка 7 дней", desc: "Наши специалисты помогут подобрать нужную запчасть по VIN." },
          ].map((f, i) => (
            <div key={i} className={`p-6 border border-border animate-fade-in delay-${i + 1}`}>
              <div className="w-10 h-10 bg-foreground flex items-center justify-center mb-4">
                <Icon name={f.icon} size={18} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-base tracking-wide mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ========== PRODUCT CARD ========== */
function ProductCard({ product, addToCart, delay = 1 }: { product: Product; addToCart: (p: Product) => void; delay?: number }) {
  return (
    <div className={`bg-white border border-border group hover:border-foreground transition-all flex flex-col animate-fade-in delay-${delay}`}>
      <div className="relative overflow-hidden bg-muted aspect-square">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.oldPrice && (
          <div className="absolute top-2 left-2 bg-[hsl(var(--accent))] text-white text-xs font-bold px-2 py-0.5">
            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-muted-foreground">Нет в наличии</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground mb-1">{product.article}</div>
        <h3 className="font-body font-medium text-sm leading-snug mb-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display font-bold text-lg">{product.price.toLocaleString("ru")} ₽</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{product.oldPrice.toLocaleString("ru")} ₽</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${product.inStock ? "text-green-600" : "text-muted-foreground"}`}>
            {product.inStock ? "В наличии" : "Под заказ"}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="bg-foreground text-white text-xs font-semibold px-3 py-1.5 hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== CATALOG ========== */
function CatalogPage({
  products, filterBrand, setFilterBrand, filterType, setFilterType,
  filterArticle, setFilterArticle, filterPrice, setFilterPrice, addToCart
}: {
  products: Product[];
  filterBrand: string; setFilterBrand: (v: string) => void;
  filterType: string; setFilterType: (v: string) => void;
  filterArticle: string; setFilterArticle: (v: string) => void;
  filterPrice: [number, number]; setFilterPrice: (v: [number, number]) => void;
  addToCart: (p: Product) => void;
}) {
  const resetFilters = () => {
    setFilterBrand("Все"); setFilterType("Все"); setFilterArticle(""); setFilterPrice([0, 15000]);
  };
  const hasFilters = filterBrand !== "Все" || filterType !== "Все" || filterArticle !== "" || filterPrice[0] !== 0 || filterPrice[1] !== 15000;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Магазин</div>
        <h1 className="font-display text-4xl font-bold tracking-wide">КАТАЛОГ ЗАПЧАСТЕЙ</h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="border border-border p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-bold text-sm tracking-wide uppercase">Фильтры</span>
              {hasFilters && (
                <button onClick={resetFilters} className="text-xs text-[hsl(var(--accent))] hover:underline">Сбросить</button>
              )}
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Артикул</label>
              <input
                type="text" value={filterArticle}
                onChange={e => setFilterArticle(e.target.value)}
                placeholder="Введите артикул..."
                className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Марка авто</label>
              <div className="flex flex-col gap-1">
                {BRANDS.map(b => (
                  <button key={b} onClick={() => setFilterBrand(b)}
                    className={`text-left text-sm px-3 py-1.5 transition-colors ${filterBrand === b ? "bg-foreground text-white" : "hover:bg-muted"}`}
                  >{b}</button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Тип запчасти</label>
              <div className="flex flex-col gap-1">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`text-left text-sm px-3 py-1.5 transition-colors ${filterType === t ? "bg-foreground text-white" : "hover:bg-muted"}`}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Цена, ₽</label>
              <div className="flex justify-between text-sm mb-3">
                <span>{filterPrice[0].toLocaleString("ru")} ₽</span>
                <span>{filterPrice[1].toLocaleString("ru")} ₽</span>
              </div>
              <Slider min={0} max={15000} step={100} value={filterPrice}
                onValueChange={v => setFilterPrice(v as [number, number])} className="w-full" />
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Найдено: <strong className="text-foreground">{products.length}</strong> товаров</span>
          </div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="SearchX" size={40} className="text-muted-foreground mb-4" />
              <div className="font-display text-xl font-bold mb-2">Ничего не найдено</div>
              <p className="text-sm text-muted-foreground mb-4">Попробуйте изменить параметры фильтра</p>
              <button onClick={resetFilters} className="bg-foreground text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} delay={Math.min((i % 6) + 1, 6)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ========== ABOUT ========== */
function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Компания</div>
        <h1 className="font-display text-4xl font-bold tracking-wide">О НАС</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
        <div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Мы работаем с 2010 года и за это время стали одним из ведущих поставщиков автозапчастей в России.
            Наш склад располагает более чем 50 000 наименований оригинальных и аналоговых запчастей для автомобилей всех популярных марок.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Мы работаем напрямую с крупнейшими производителями и дистрибьюторами — Bosch, NGK, SKF, MANN, Gates, Sachs —
            что позволяет нам предлагать честные цены и гарантировать подлинность товара.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Наша команда — это опытные специалисты, которые помогут подобрать нужную запчасть по VIN-коду, марке, модели и году выпуска вашего автомобиля.
          </p>
        </div>
        <div className="relative">
          <img src={HERO_IMG} alt="О нас" className="w-full aspect-video object-cover" />
          <div className="absolute bottom-4 left-4 bg-foreground text-white p-4">
            <div className="font-display text-2xl font-bold text-[hsl(var(--accent))]">14</div>
            <div className="text-xs text-gray-300">лет на рынке</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {[
          { value: "50 000+", label: "Позиций" },
          { value: "120+", label: "Брендов" },
          { value: "15 000+", label: "Клиентов" },
          { value: "98%", label: "Довольных" },
        ].map((s, i) => (
          <div key={i} className="border border-border p-6 text-center">
            <div className="font-display text-3xl font-bold text-[hsl(var(--accent))] mb-1">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-wide mb-6">НАШИ ПАРТНЁРЫ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {["Bosch", "NGK", "SKF", "MANN", "Gates", "Sachs", "Brembo", "TRW", "Valeo", "Denso", "Filtron", "Lemförder"].map(b => (
            <div key={b} className="border border-border p-4 flex items-center justify-center text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
              {b}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ========== DELIVERY ========== */
function DeliveryPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Логистика</div>
        <h1 className="font-display text-4xl font-bold tracking-wide">ДОСТАВКА</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: "Package", title: "Самовывоз", price: "Бесплатно", desc: "Заберите заказ самостоятельно со склада. Режим работы: Пн–Сб с 09:00 до 19:00." },
          { icon: "Truck", title: "Доставка по городу", price: "от 300 ₽", desc: "Доставим заказ курьером в течение 1–2 рабочих дней. При заказе от 3 000 ₽ — бесплатно." },
          { icon: "Globe", title: "По всей России", price: "от 500 ₽", desc: "Отправляем CDEK, Почтой России и транспортными компаниями. Срок: 2–7 дней." },
        ].map((d, i) => (
          <div key={i} className="border border-border p-6">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center mb-4">
              <Icon name={d.icon} size={18} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-lg tracking-wide mb-1">{d.title}</h3>
            <div className="font-bold text-[hsl(var(--accent))] text-lg mb-3">{d.price}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-foreground text-white p-8 mb-10">
        <h2 className="font-display text-2xl font-bold tracking-wide mb-6">КАК РАБОТАЕТ ДОСТАВКА</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Оформите заказ", desc: "Добавьте товары в корзину и укажите адрес доставки" },
            { step: "02", title: "Подтверждение", desc: "Мы свяжемся с вами и подтвердим наличие и сроки" },
            { step: "03", title: "Упаковка", desc: "Тщательно упакуем запчасти для безопасной транспортировки" },
            { step: "04", title: "Получение", desc: "Вы получите трек-номер и сможете отслеживать доставку" },
          ].map(s => (
            <div key={s.step}>
              <div className="font-display text-4xl font-bold text-[hsl(var(--accent))] mb-2">{s.step}</div>
              <h3 className="font-display font-bold text-base tracking-wide mb-1">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-border p-6">
        <h2 className="font-display text-xl font-bold tracking-wide mb-4">УСЛОВИЯ ВОЗВРАТА</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          {[
            "Возврат товара надлежащего качества в течение 14 дней с момента получения",
            "Товар должен быть в оригинальной упаковке и не устанавливался на автомобиль",
            "При обнаружении брака — замена или возврат средств в течение 3 рабочих дней",
            "Гарантийный срок на все запчасти — от 6 до 24 месяцев в зависимости от производителя",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ========== CONTACTS ========== */
function ContactsPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Связь</div>
        <h1 className="font-display text-4xl font-bold tracking-wide">КОНТАКТЫ</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide mb-6">НАПИШИТЕ НАМ</h2>
          {sent ? (
            <div className="border border-green-200 bg-green-50 p-6 animate-scale-in">
              <Icon name="CheckCircle" size={24} className="text-green-600 mb-3" />
              <div className="font-semibold mb-1">Сообщение отправлено!</div>
              <p className="text-sm text-muted-foreground">Мы свяжемся с вами в течение 30 минут в рабочее время.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Ваше имя *</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="Иван Иванов" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Телефон *</label>
                <input type="tel" required value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="+7 (___) ___-__-__" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Сообщение</label>
                <textarea value={form.message} rows={4}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                  placeholder="Опишите, какая запчасть нужна..." />
              </div>
              <button type="submit" className="bg-foreground text-white py-3 font-semibold text-sm tracking-wide hover:bg-[hsl(var(--accent))] transition-colors">
                Отправить сообщение
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-xl font-bold tracking-wide">НАШИ КОНТАКТЫ</h2>
          {[
            { icon: "Phone", label: "Телефон", value: "+7 (123) 456-78-90", sub: "Звонки принимаем в рабочее время" },
            { icon: "Mail", label: "Email", value: "zakaz@avtozapnn.ru", sub: "Ответ в течение 30 минут" },
            { icon: "MapPin", label: "Адрес", value: "ул. Автозаводская, 10, склад 5", sub: "Нижний Новгород" },
            { icon: "Clock", label: "Режим работы", value: "Пн–Сб: 09:00–19:00", sub: "Вс: выходной" },
          ].map(c => (
            <div key={c.label} className="flex items-start gap-4 border-b border-border pb-5">
              <div className="w-10 h-10 bg-foreground flex items-center justify-center flex-shrink-0">
                <Icon name={c.icon} size={16} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{c.label}</div>
                <div className="font-semibold text-sm">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ========== CART ========== */
function CartPage({
  cart, total, removeFromCart, changeQty, navigate
}: {
  cart: { product: Product; qty: number }[];
  total: number;
  removeFromCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  navigate: (p: Page) => void;
}) {
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", comment: "" });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError("");
    try {
      await fetch(SEND_ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: form,
          items: cart.map(({ product, qty }) => ({ name: product.name, qty, price: product.price * qty })),
          total,
        }),
      });
      setStep("done");
    } catch {
      setSendError("Не удалось отправить заказ. Позвоните нам: +7 (123) 456-78-90");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="text-xs text-[hsl(var(--accent))] font-semibold tracking-widest uppercase mb-1">Покупки</div>
        <h1 className="font-display text-4xl font-bold tracking-wide">
          {step === "cart" ? "КОРЗИНА" : step === "form" ? "ОФОРМЛЕНИЕ ЗАКАЗА" : "ЗАКАЗ ПРИНЯТ"}
        </h1>
      </div>

      {step === "done" && (
        <div className="max-w-lg mx-auto text-center py-16 animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="CheckCircle" size={32} className="text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Заказ оформлен!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Спасибо, <strong>{form.name}</strong>! Мы получили ваш заказ и свяжемся с вами по номеру <strong>{form.phone}</strong> в течение 30 минут.
          </p>
          <p className="text-muted-foreground text-sm mb-8">Сумма заказа: <strong className="text-foreground">{total.toLocaleString("ru")} ₽</strong></p>
          <button onClick={() => navigate("catalog")} className="bg-foreground text-white px-8 py-3 font-semibold text-sm hover:bg-[hsl(var(--accent))] transition-colors">
            Продолжить покупки
          </button>
        </div>
      )}

      {step === "cart" && cart.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="ShoppingCart" size={48} className="text-muted-foreground mb-4" />
          <div className="font-display text-2xl font-bold mb-2">Корзина пуста</div>
          <p className="text-sm text-muted-foreground mb-6">Добавьте товары из каталога</p>
          <button onClick={() => navigate("catalog")} className="bg-foreground text-white px-6 py-3 font-semibold text-sm hover:bg-[hsl(var(--accent))] transition-colors">
            Перейти в каталог
          </button>
        </div>
      )}

      {step === "cart" && cart.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-3">
            {cart.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-4 border border-border p-4 animate-fade-in">
                <img src={product.img} alt={product.name} className="w-16 h-16 object-cover bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-0.5">{product.article}</div>
                  <div className="font-medium text-sm leading-snug mb-1">{product.name}</div>
                  <div className="font-display font-bold">{product.price.toLocaleString("ru")} ₽</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => changeQty(product.id, -1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold">−</button>
                  <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => changeQty(product.id, 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold">+</button>
                </div>
                <div className="font-display font-bold text-sm min-w-[80px] text-right flex-shrink-0">
                  {(product.price * qty).toLocaleString("ru")} ₽
                </div>
                <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors flex-shrink-0 ml-1">
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="border border-border p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg tracking-wide mb-5">ИТОГО</h2>
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Товаров</span>
                  <span>{cart.reduce((a, c) => a + c.qty, 0)} шт.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка</span>
                  <span className="text-green-600">Рассчитывается</span>
                </div>
              </div>
              <div className="flex justify-between font-display font-bold text-xl border-t border-border pt-4 mb-5">
                <span>Сумма</span>
                <span>{total.toLocaleString("ru")} ₽</span>
              </div>
              <button onClick={() => setStep("form")} className="w-full bg-[hsl(var(--accent))] text-white py-3.5 font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity mb-3">
                Оформить заказ
              </button>
              <button onClick={() => navigate("catalog")} className="w-full border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                Продолжить покупки
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "form" && (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="border-b border-border pb-5 mb-1">
                <h2 className="font-display font-bold text-base tracking-wide mb-4">КОНТАКТНЫЕ ДАННЫЕ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Имя *</label>
                    <input required type="text" value={form.name} onChange={f("name")}
                      placeholder="Иван Иванов"
                      className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Телефон *</label>
                    <input required type="tel" value={form.phone} onChange={f("phone")}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={f("email")}
                      placeholder="example@mail.ru"
                      className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-5 mb-1">
                <h2 className="font-display font-bold text-base tracking-wide mb-4">ДОСТАВКА</h2>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Адрес доставки</label>
                  <input type="text" value={form.address} onChange={f("address")}
                    placeholder="Город, улица, дом, квартира"
                    className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors" />
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-base tracking-wide mb-4">КОММЕНТАРИЙ</h2>
                <textarea value={form.comment} onChange={f("comment")} rows={3}
                  placeholder="Пожелания к заказу, удобное время для связи..."
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none" />
              </div>

              {sendError && (
                <p className="text-red-600 text-sm border border-red-200 bg-red-50 px-4 py-3">{sendError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep("cart")} disabled={sending}
                  className="border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50">
                  <Icon name="ArrowLeft" size={14} /> Назад
                </button>
                <button type="submit" disabled={sending}
                  className="flex-1 bg-[hsl(var(--accent))] text-white py-3 font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {sending ? <><Icon name="Loader2" size={16} className="animate-spin" /> Отправляем...</> : "Подтвердить заказ"}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="border border-border p-5 sticky top-24">
              <h2 className="font-display font-bold text-sm tracking-wide mb-4 uppercase">Ваш заказ</h2>
              <div className="flex flex-col gap-3 mb-4">
                {cart.map(({ product, qty }) => (
                  <div key={product.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground leading-snug min-w-0 truncate">{product.name} × {qty}</span>
                    <span className="font-semibold flex-shrink-0">{(product.price * qty).toLocaleString("ru")} ₽</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-display font-bold text-lg border-t border-border pt-3">
                <span>Итого</span>
                <span>{total.toLocaleString("ru")} ₽</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}