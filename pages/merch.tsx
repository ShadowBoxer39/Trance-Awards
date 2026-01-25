// pages/merch.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import SEO from '@/components/SEO';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PRODUCTS = {
  tshirt: { name: 'חולצת טי', image: '/images/merch/tshirt.jpeg', price: 100 },
  hoodie: { name: 'קפוצ׳ון', image: '/images/merch/hoodie.jpeg', price: 180 },
};

type ProductKey = keyof typeof PRODUCTS;
type Inventory = Record<string, Record<string, number>>;
type CartItem = { product: ProductKey; size: string; quantity: number; price: number };

export default function MerchPage() {
  const [inventory, setInventory] = useState<Inventory>({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Set RTL
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // Fetch inventory
  useEffect(() => {
    fetch('/api/merch/get-inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(data.inventory || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStock = (product: ProductKey, size: string) => {
    return inventory[product]?.[size] ?? 0;
  };

  const getCartQuantity = (product: ProductKey, size: string) => {
    const item = cart.find(i => i.product === product && i.size === size);
    return item?.quantity || 0;
  };

  const getProductCartTotal = (product: ProductKey) => {
    return cart.filter(i => i.product === product).reduce((sum, i) => sum + i.quantity, 0);
  };

  const addToCart = (product: ProductKey, size: string) => {
    const stock = getStock(product, size);
    const inCart = getCartQuantity(product, size);
    
    if (inCart >= stock) return;

    setCart(prev => {
      const existing = prev.find(i => i.product === product && i.size === size);
      if (existing) {
        return prev.map(i => 
          i.product === product && i.size === size 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, size, quantity: 1, price: PRODUCTS[product].price }];
    });
  };

  const removeFromCart = (product: ProductKey, size: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product === product && i.size === size);
      if (existing && existing.quantity > 1) {
        return prev.map(i => 
          i.product === product && i.size === size 
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter(i => !(i.product === product && i.size === size));
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/merch/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          items: cart,
          deliveryNotes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בשליחת ההזמנה');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <>
      <SEO title="ההזמנה התקבלה! | יוצאים לטראק" description="ההזמנה שלך התקבלה בהצלחה" />
        <div className="trance-backdrop min-h-screen text-gray-100">
          <Navigation currentPage="merch" />
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold mb-4">ההזמנה התקבלה!</h1>
            <p className="text-xl text-gray-400 mb-8">
              ניצור איתך קשר בוואטסאפ לתיאום התשלום (ביט) והמשלוח.
              <br />
              <span className="text-purple-400">תודה שאתם חלק מהמשפחה! 💜</span>
            </p>
            <Link href="/" className="btn-primary px-8 py-4 rounded-xl font-semibold inline-block text-lg">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="מרצ׳ במהדורה מוגבלת | יוצאים לטראק" 
        description="מרצ׳ בלעדי של יוצאים לטראק מהמפגש הקהילתי - חולצות וקפוצ׳ונים במהדורה מוגבלת!"
      />
      
      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="merch" />

        <div className="max-w-6xl mx-auto px-6 py-12">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              <span className="text-sm font-medium text-yellow-400">מהדורה מוגבלת!</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                מרצ׳ יוצאים לטראק
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              פריטים בלעדיים מהמפגש הקהילתי האחרון
              <br />
              <span className="text-gray-500">כמות מוגבלת - מי שמזמין ראשון, מקבל ראשון!</span>
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Products */}
              <div className="space-y-8 mb-16">
                {(Object.keys(PRODUCTS) as ProductKey[]).map(productKey => {
                  const product = PRODUCTS[productKey];
                  const productTotal = getProductCartTotal(productKey);
                  
                  return (
                    <div 
                      key={productKey} 
                      className={`glass-card rounded-3xl overflow-hidden border-2 transition-all ${
                        productTotal > 0 ? 'border-purple-500/50' : 'border-white/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        
                        {/* Large Product Image */}
                        <div className="w-full md:w-80 h-64 md:h-auto md:min-h-[400px] bg-gradient-to-br from-purple-900/60 to-pink-900/60 flex items-center justify-center relative">
                          <Image 
  src={product.image} 
  alt={product.name}
  fill
  className="object-contain p-4"
/>
                          
                          {/* Badge if in cart */}
                          {productTotal > 0 && (
                            <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                              {productTotal} בסל
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 p-8 md:p-10">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h2 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h2>
                              <p className="text-3xl font-bold text-green-400">₪{product.price}</p>
                            </div>
                          </div>

                          {/* Size Selection */}
                          <div>
                            <p className="text-gray-400 mb-4 text-lg">בחרו מידה:</p>
                            <div className="flex flex-wrap gap-3">
                              {SIZES.map(size => {
                                const stock = getStock(productKey, size);
                                const inCart = getCartQuantity(productKey, size);
                                const available = stock - inCart;
                                const isDisabled = stock === 0;

                                return (
                                  <div key={size} className="flex flex-col items-center">
                                    <div className="flex items-center bg-gray-800/50 rounded-xl overflow-hidden">
                                      {/* Remove button - only show if in cart */}
                                      {inCart > 0 && (
                                        <button
                                          onClick={() => removeFromCart(productKey, size)}
                                          className="w-10 h-14 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition text-xl font-bold"
                                        >
                                          −
                                        </button>
                                      )}
                                      
                                      {/* Size button */}
                                      <button
                                        onClick={() => addToCart(productKey, size)}
                                        disabled={isDisabled || available <= 0}
                                        className={`h-14 px-5 flex flex-col items-center justify-center transition font-bold ${
                                          isDisabled 
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                            : inCart > 0 
                                              ? 'bg-purple-600 text-white' 
                                              : 'bg-gray-700 text-white hover:bg-purple-600'
                                        }`}
                                      >
                                        <span className="text-lg">{size}</span>
                                        {inCart > 0 && (
                                          <span className="text-xs -mt-0.5">×{inCart}</span>
                                        )}
                                      </button>

                                      {/* Add button - only show if in cart */}
                                      {inCart > 0 && available > 0 && (
                                        <button
                                          onClick={() => addToCart(productKey, size)}
                                          className="w-10 h-14 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition text-xl font-bold"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                    
                                    {/* Stock indicator */}
                                    <span className={`text-xs mt-2 ${
                                      stock === 0 ? 'text-red-400' : stock <= 2 ? 'text-yellow-400' : 'text-gray-500'
                                    }`}>
                                      {stock === 0 ? 'אזל המלאי' : `נשארו ${available}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Form - Full Width */}
              <div className="glass-card rounded-3xl p-8 md:p-10 border-2 border-white/10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  🛒 סיום הזמנה
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">👆</div>
                    <p className="text-xl text-gray-400">
                      בחרו מוצרים למעלה כדי להתחיל
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Cart Summary */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">הפריטים שלך:</h4>
                      <div className="space-y-3 mb-6">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
                            <span className="text-lg">
                              {PRODUCTS[item.product].name} - מידה {item.size}
                              {item.quantity > 1 && <span className="text-purple-400"> ×{item.quantity}</span>}
                            </span>
                            <span className="text-green-400 font-bold text-lg">₪{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-2xl font-bold border-t border-white/10 pt-4">
                        <span>סה״כ</span>
                        <span className="text-green-400">₪{totalPrice}</span>
                      </div>

                      {/* Info boxes */}
                      <div className="mt-6 space-y-3">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <p className="text-blue-400 font-medium mb-1">🚚 משלוח</p>
                          <p className="text-gray-400 text-sm">
                            מרכז - איסוף מהסטודיו או משלוח אישי | פריפריה - דואר (בתוספת תשלום)
                          </p>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                          <p className="text-green-400 font-medium mb-1">💳תשלום בביט או במזומן</p>
                          <p className="text-gray-400 text-sm">
                            ניצור איתכם קשר בוואטסאפ לתיאום
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-gray-400 mb-2">שם מלא *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition text-lg"
                          placeholder="ישראל ישראלי"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-2">טלפון (לוואטסאפ) *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition text-lg"
                          placeholder="050-1234567"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-2">אימייל (לא חובה)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition text-lg"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-2">איפה אתם גרים? הערות</label>
                        <textarea
                          value={deliveryNotes}
                          onChange={e => setDeliveryNotes(e.target.value)}
                          rows={3}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition resize-none text-lg"
                          placeholder="למשל: גר בתל אביב, אשמח לאיסוף עצמי..."
                        />
                      </div>

                      {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting || cart.length === 0}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'שולח...' : `שליחת הזמנה • ₪${totalPrice}`}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}