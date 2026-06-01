import React, { useState, useCallback, useEffect } from 'react';
import {
  DriverProvider, useScrewQuery, useScrewMutation, useScrewDevtools, ScrewDevtools,
  createFetchAdapter, useScrewBatch, useScrewWorkflow,
} from 'reactscrew';

/* ═══════════════════════════════════════════════
   1. Mock API — Cart, Orders, Comments, Suppliers
   ═══════════════════════════════════════════════ */

interface CartItem {
  id: number; productId: number; title: string; price: number; image: string; quantity: number;
}
interface OrderData {
  id: number; items: CartItem[]; total: number; status: string;
  shippingAddress: string; createdAt: string;
  tracking: { status: string; date: string; description: string }[];
}
interface CommentData { id: number; productId: number; text: string; author: string; rating: number; date: string; }

let cartNextId = 1;
const _cart: CartItem[] = [];
let orderNextId = 1;
const _orders: OrderData[] = [];

const _comments: Record<number, CommentData[]> = {};
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach((pid) => {
  _comments[pid] = [
    { id: 1, productId: pid, text: 'Produit excellent, livraison rapide !', author: 'Sophie M.', rating: 5, date: '2025-03-10' },
    { id: 2, productId: pid, text: 'Rapport qualité/prix imbattable', author: 'Thomas L.', rating: 4, date: '2025-03-05' },
    { id: 3, productId: pid, text: 'Conforme à la description, je recommande', author: 'Marie D.', rating: 5, date: '2025-02-28' },
  ];
});

const _suppliers: Record<string, { name: string; logo: string; rating: number; contactEmail: string; country: string; since: number; description: string }> = {
  electronics: { name: 'TechVision Inc.', logo: '🔬', rating: 4.8, contactEmail: 'support@techvision.io', country: 'Japon', since: 2012, description: 'Leader mondial des composants électroniques et gadgets connectés. Certifié ISO 9001.' },
  jewelery: { name: 'LuxAtelier', logo: '💎', rating: 4.9, contactEmail: 'hello@luxatelier.com', country: 'Italie', since: 2005, description: 'Artisans joailliers depuis 2005. Or 18k, pierres précieuses certifiées.' },
  "men's clothing": { name: 'UrbanGear Co.', logo: '👔', rating: 4.6, contactEmail: 'sales@urbangear.com', country: 'Portugal', since: 2015, description: 'Mode masculine contemporaine. Tissus biologiques et production éthique.' },
  "women's clothing": { name: 'Elegance Studio', logo: '👗', rating: 4.7, contactEmail: 'info@elegance.studio', country: 'France', since: 2010, description: 'Haute couture accessible. Chaque pièce est confectionnée à Paris.' },
};

const matchUrl = (url: string, pattern: string): string[] | null => {
  const regex = new RegExp('^' + pattern.replace(/\/\{[^}]+\}/g, '/([^/]+)') + '$');
  const m = url.match(regex);
  return m ? m.slice(1) : null;
};

const ordersApi = async (config: { method: string; url: string; data?: unknown; headers?: Record<string, string> }) => {
  const { method, url, data } = config;
  await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));
  const json = (d: unknown) => JSON.parse(JSON.stringify(d));

  // GET /cart
  if (method === 'GET' && url === '/cart') {
    const total = _cart.reduce((s, i) => s + i.price * i.quantity, 0);
    return { data: { id: 1, items: json(_cart), total }, status: 200, headers: {} };
  }
  // POST /cart { productId, title, price, image, quantity }
  if (method === 'POST' && url === '/cart') {
    const body = data as any;
    const existing = _cart.find((i) => i.productId === body.productId);
    if (existing) {
      existing.quantity += body.quantity || 1;
    } else {
      _cart.push({ id: cartNextId++, productId: body.productId, title: body.title, price: body.price, image: body.image, quantity: body.quantity || 1 });
    }
    const total = _cart.reduce((s, i) => s + i.price * i.quantity, 0);
    return { data: { id: 1, items: json(_cart), total }, status: 201, headers: {} };
  }
  // DELETE /cart/{itemId}
  if (method === 'DELETE') {
    const m = matchUrl(url, '/cart/{itemId}');
    if (m) {
      const idx = _cart.findIndex((i) => i.id === Number(m[0]));
      if (idx !== -1) _cart.splice(idx, 1);
      return { data: null, status: 204, headers: {} };
    }
  }
  // PATCH /cart/{itemId} { quantity }
  if (method === 'PATCH') {
    const m = matchUrl(url, '/cart/{itemId}');
    if (m) {
      const item = _cart.find((i) => i.id === Number(m[0]));
      if (item) { item.quantity = (data as any)?.quantity ?? item.quantity; }
      const total = _cart.reduce((s, i) => s + i.price * i.quantity, 0);
      return { data: { id: 1, items: json(_cart), total }, status: 200, headers: {} };
    }
  }

  // GET /orders
  if (method === 'GET' && url === '/orders') {
    return { data: json(_orders), status: 200, headers: {} };
  }
  // POST /orders { shippingAddress }
  if (method === 'POST' && url === '/orders') {
    const body = data as any;
    const items = json(_cart);
    const total = items.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
    const order: OrderData = {
      id: orderNextId++, items, total, status: 'confirmed',
      shippingAddress: body?.shippingAddress || '',
      createdAt: new Date().toISOString(),
      tracking: [
        { status: 'confirmed', date: new Date().toISOString(), description: 'Commande confirmée' },
      ],
    };
    _orders.unshift(order);
    _cart.length = 0; // clear cart
    return { data: json(order), status: 201, headers: {} };
  }
  // GET /orders/{id}
  {
    const m = matchUrl(url, '/orders/{orderId}');
    if (method === 'GET' && m) {
      const order = _orders.find((o) => o.id === Number(m[0]));
      return { data: order ? json(order) : null, status: order ? 200 : 404, headers: {} };
    }
  }
  // GET /delivery/{orderId}
  {
    const m = matchUrl(url, '/delivery/{orderId}');
    if (method === 'GET' && m) {
      const order = _orders.find((o) => o.id === Number(m[0]));
      if (!order) return { data: null, status: 404, headers: {} };
      // simulate delivery progression
      if (order.tracking.length <= 1) {
        order.tracking.push(
          { status: 'preparing', date: new Date(Date.now() - 3600000).toISOString(), description: 'Préparation en cours dans notre entrepôt' },
          { status: 'shipped', date: new Date(Date.now() - 1800000).toISOString(), description: 'Colis expédié via DHL Express' },
          { status: 'in_transit', date: new Date(Date.now() - 600000).toISOString(), description: 'En transit — centre de tri régional' },
          { status: 'out_for_delivery', date: new Date().toISOString(), description: 'En cours de livraison' },
        );
        order.status = 'shipped';
      }
      return { data: json(order), status: 200, headers: {} };
    }
  }
  // GET /suppliers/{category}
  {
    const m = matchUrl(url, '/suppliers/{category}');
    if (method === 'GET' && m) {
      const supplier = _suppliers[m[0]];
      return { data: supplier ? json(supplier) : null, status: supplier ? 200 : 404, headers: {} };
    }
  }
  // GET /comments/{productId}
  {
    const m = matchUrl(url, '/comments/{productId}');
    if (method === 'GET' && m) {
      return { data: json(_comments[Number(m[0])] || []), status: 200, headers: {} };
    }
  }
  // POST /comments { productId, text, author, rating }
  if (method === 'POST' && url === '/comments') {
    const body = data as any;
    const pid = body?.productId;
    if (!_comments[pid]) _comments[pid] = [];
    const comment: CommentData = { id: Date.now(), productId: pid, text: body?.text || '', author: body?.author || 'Anonyme', rating: body?.rating || 5, date: new Date().toISOString().slice(0, 10) };
    _comments[pid].push(comment);
    return { data: json(comment), status: 201, headers: {} };
  }

  return { data: null, status: 404, headers: {} };
};

/* ═══════════════════════════════════════════════
   2. Backend definitions
   ═══════════════════════════════════════════════ */

const productsApi = createFetchAdapter('https://fakestoreapi.com');
const usersApi = createFetchAdapter('https://jsonplaceholder.typicode.com');

const backends = {
  products: {
    apiInstance: productsApi,
    screws: {
      products: {
        name: 'products',
        methods: {
          list: { type: 'query' as const, route: '/products', httpMethod: 'GET' as const },
          get: { type: 'query' as const, route: (p: { id: number }) => `/products/${p.id}`, httpMethod: 'GET' as const },
        },
      },
      categories: {
        name: 'categories',
        methods: {
          list: { type: 'query' as const, route: '/products/categories', httpMethod: 'GET' as const },
        },
      },
    },
  },
  users: {
    apiInstance: usersApi,
    screws: {
      users: {
        name: 'users',
        methods: {
          list: { type: 'query' as const, route: '/users', httpMethod: 'GET' as const },
          get: { type: 'query' as const, route: (p: { id: number }) => `/users/${p.id}`, httpMethod: 'GET' as const },
        },
      },
    },
  },
  orders: {
    apiInstance: ordersApi,
    screws: {
      cart: {
        name: 'cart',
        methods: {
          get: { type: 'query' as const, route: '/cart', httpMethod: 'GET' as const },
          add: { type: 'mutation' as const, route: '/cart', httpMethod: 'POST' as const, invalidateQueries: [{ screwName: 'cart', methodName: 'get' }] },
          remove: { type: 'mutation' as const, route: (p: { itemId: number }) => `/cart/${p.itemId}`, httpMethod: 'DELETE' as const, invalidateQueries: [{ screwName: 'cart', methodName: 'get' }] },
          update: { type: 'mutation' as const, route: (p: { itemId: number }) => `/cart/${p.itemId}`, httpMethod: 'PATCH' as const, invalidateQueries: [{ screwName: 'cart', methodName: 'get' }] },
        },
      },
      orders: {
        name: 'orders',
        methods: {
          list: { type: 'query' as const, route: '/orders', httpMethod: 'GET' as const },
          checkout: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const, invalidateQueries: [{ screwName: 'orders', methodName: 'list' }, { screwName: 'cart', methodName: 'get' }] },
          get: { type: 'query' as const, route: (p: { orderId: number }) => `/orders/${p.orderId}`, httpMethod: 'GET' as const },
        },
      },
      delivery: {
        name: 'delivery',
        methods: {
          track: { type: 'query' as const, route: (p: { orderId: number }) => `/delivery/${p.orderId}`, httpMethod: 'GET' as const },
        },
      },
      suppliers: {
        name: 'suppliers',
        methods: {
          get: { type: 'query' as const, route: (p: { category: string }) => `/suppliers/${encodeURIComponent(p.category)}`, httpMethod: 'GET' as const },
        },
      },
      comments: {
        name: 'comments',
        methods: {
          list: { type: 'query' as const, route: (p: { productId: number }) => `/comments/${p.productId}`, httpMethod: 'GET' as const },
          submit: { type: 'mutation' as const, route: '/comments', httpMethod: 'POST' as const, invalidateQueries: [{ screwName: 'comments', methodName: 'list' }] },
        },
      },
    },
  },
};

/* ═══════════════════════════════════════════════
   3. Types
   ═══════════════════════════════════════════════ */

type Page =
  | { name: 'home' }
  | { name: 'product'; id: number }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'orders' }
  | { name: 'order'; id: number }
  | { name: 'supplier'; category: string };

/* ═══════════════════════════════════════════════
   4. Helpers
   ═══════════════════════════════════════════════ */

const StarRating = ({ rating }: { rating: number }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`star${i <= Math.floor(rating) ? ' filled' : ''}${i - 0.5 === rating ? ' half' : ''}`}>
        ★
      </span>
    ))}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const labels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', preparing: 'Préparation', shipped: 'Expédiée', in_transit: 'En transit', out_for_delivery: 'Livraison', delivered: 'Livrée' };
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
};

const Toast = ({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast toast-${type}`}>{type === 'success' ? '✓' : '✗'} {message}</div>;
};

const useToast = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
};

/* ═══════════════════════════════════════════════
   5. Pages
   ═══════════════════════════════════════════════ */

/* ─── Home / Product List ─── */
const HomePage = ({ onNavigate, onAddToast }: { onNavigate: (p: Page) => void; onAddToast: (m: string, t: 'success' | 'error') => void }) => {
  const { data: products, isLoading } = useScrewQuery<any[]>('products', 'list');
  const { data: categories } = useScrewQuery<string[]>('categories', 'list');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = (products || []).filter((p: any) => {
    if (category && p.category !== category) return false;
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="filter-bar">
        <input type="text" placeholder="🔍 Rechercher un article…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className={`filter-chip${!category ? ' active' : ''}`} onClick={() => setCategory('')}>Tout</button>
        {(categories || []).map((cat: string) => (
          <button key={cat} className={`filter-chip${category === cat ? ' active' : ''}`} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card"><div className="product-card-img"><div className="skeleton" style={{ width: 120, height: 120 }} /></div><div className="product-card-body"><div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} /><div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 12 }} /><div className="skeleton" style={{ height: 20, width: '30%' }} /></div></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">Aucun article trouvé</div>
          <div className="empty-state-sub">Essayez de modifier vos filtres</div>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product: any) => (
            <div key={product.id} className="product-card" onClick={() => onNavigate({ name: 'product', id: product.id })}>
              <div className="product-card-img">
                <img src={product.image} alt={product.title} loading="lazy" />
              </div>
              <div className="product-card-body">
                <div className="product-card-category">{product.category}</div>
                <div className="product-card-title">{product.title}</div>
                <div className="product-card-footer">
                  <span className="product-card-price">{product.price?.toFixed(2)}</span>
                  <StarRating rating={product.rating?.rate || 0} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Product Detail ─── */
const ProductDetail = ({ id, onNavigate, onAddToast }: { id: number; onNavigate: (p: Page) => void; onAddToast: (m: string, t: 'success' | 'error') => void }) => {
  const { data: product, isLoading } = useScrewQuery<any>('products', 'get', { args: [{ id }] });
  const { data: supplier } = useScrewQuery<any>('suppliers', 'get', { args: [{ category: product?.category || '' }], enabled: !!product?.category });
  const { data: comments, refetch: refetchComments } = useScrewQuery<any[]>('comments', 'list', { args: [{ productId: id }] });
  const addToCart = useScrewMutation('cart', 'add');
  const submitComment = useScrewMutation('comments', 'submit');
  const [tab, setTab] = useState<'description' | 'comments' | 'supplier'>('description');
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentRating, setCommentRating] = useState(5);

  if (isLoading || !product) {
    return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">Chargement…</div></div>;
  }

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({ productId: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
      onAddToast('Ajouté au panier ✓', 'success');
    } catch { onAddToast('Erreur lors de l\'ajout', 'error'); }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await submitComment.mutateAsync({ productId: id, text: commentText, author: commentAuthor || 'Anonyme', rating: commentRating });
      setCommentText('');
      onAddToast('Commentaire publié ✓', 'success');
    } catch { onAddToast('Erreur lors de l\'envoi', 'error'); }
  };

  return (
    <div>
      <button className="back-btn" onClick={() => onNavigate({ name: 'home' })}>← Retour au catalogue</button>
      <div className="detail-layout">
        <div className="detail-image">
          <img src={product.image} alt={product.title} />
        </div>
        <div>
          <div className="detail-category">{product.category}</div>
          <h1 className="detail-title">{product.title}</h1>
          <div className="detail-price">{product.price?.toFixed(2)}</div>
          <div className="detail-rating">
            <StarRating rating={product.rating?.rate || 0} />
            <span className="detail-rating-value">{product.rating?.rate}</span>
            <span className="detail-rating-count">({product.rating?.count} avis)</span>
          </div>
          <div className="detail-description">{product.description}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={addToCart.isPending}>
              {addToCart.isPending ? '⏳ Ajout…' : '🛒 Ajouter au panier'}
            </button>
            {supplier && (
              <button className="btn btn-outline" onClick={() => onNavigate({ name: 'supplier', category: product.category })}>
                Voir le fournisseur
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className="tab-bar">
            <button className={`tab-btn${tab === 'description' ? ' active' : ''}`} onClick={() => setTab('description')}>Description</button>
            <button className={`tab-btn${tab === 'comments' ? ' active' : ''}`} onClick={() => setTab('comments')}>Avis ({comments?.length || 0})</button>
            <button className={`tab-btn${tab === 'supplier' ? ' active' : ''}`} onClick={() => setTab('supplier')}>Fournisseur</button>
          </div>

          {tab === 'description' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '.95rem' }}>{product.description}</p>
              {product.rating && (
                <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                  <div><span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{product.rating?.rate}</span><span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>/5</span></div>
                  <div><span style={{ fontWeight: 600 }}>{product.rating?.count}</span><span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>avis clients</span></div>
                </div>
              )}
            </div>
          )}

          {tab === 'comments' && (
            <div>
              {(comments || []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun avis pour le moment. Soyez le premier !</p>
              ) : (
                (comments || []).map((c, i) => (
                  <div key={i} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{c.author}</span>
                      <span className="comment-date">{c.date}</span>
                    </div>
                    <StarRating rating={c.rating} />
                    <div className="comment-text" style={{ marginTop: 6 }}>{c.text}</div>
                  </div>
                ))
              )}
              <div className="comment-form">
                <h4 style={{ fontSize: '.95rem', fontWeight: 600, marginTop: 8 }}>Laisser un avis</h4>
                <div className="comment-form-row">
                  <input placeholder="Votre nom" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} />
                  <select value={commentRating} onChange={(e) => setCommentRating(Number(e.target.value))} style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '.9rem' }}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</option>)}
                  </select>
                </div>
                <textarea placeholder="Partagez votre expérience…" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                <button className="btn btn-primary" onClick={handleSubmitComment} disabled={submitComment.isPending || !commentText.trim()} style={{ alignSelf: 'flex-start' }}>
                  {submitComment.isPending ? '⏳…' : 'Publier'}
                </button>
              </div>
            </div>
          )}

          {tab === 'supplier' && supplier && (
            <div className="supplier-card">
              <div className="supplier-logo">{supplier.logo}</div>
              <div>
                <div className="supplier-name">{supplier.name}</div>
                <div className="supplier-meta">
                  <span>⭐ {supplier.rating}</span>
                  <span>{supplier.country}</span>
                  <span>Depuis {supplier.since}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginTop: 8 }}>{supplier.description}</p>
                <p style={{ fontSize: '.85rem', marginTop: 6 }}>📧 {supplier.contactEmail}</p>
                <button className="btn btn-sm btn-outline" style={{ marginTop: 12 }} onClick={() => onNavigate({ name: 'supplier', category: product.category })}>
                  Voir la fiche fournisseur
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Cart ─── */
const CartPage = ({ onNavigate, onAddToast }: { onNavigate: (p: Page) => void; onAddToast: (m: string, t: 'success' | 'error') => void }) => {
  const { data: cart, isLoading, refetch } = useScrewQuery<any>('cart', 'get');
  const removeItem = useScrewMutation('cart', 'remove');
  const updateItem = useScrewMutation('cart', 'update');

  const handleRemove = async (itemId: number) => {
    try { await removeItem.mutateAsync(undefined, { itemId }); onAddToast('Retiré du panier', 'success'); } catch { onAddToast('Erreur', 'error'); }
  };
  const handleQty = async (itemId: number, delta: number) => {
    const item = cart?.items?.find((i: any) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) { await handleRemove(itemId); return; }
    try { await updateItem.mutateAsync({ quantity: newQty }, { itemId }); } catch { onAddToast('Erreur', 'error'); }
  };

  if (isLoading) return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">Chargement du panier…</div></div>;

  const items = cart?.items || [];
  const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-text">Votre panier est vide</div>
          <div className="empty-state-sub">Découvrez notre catalogue et ajoutez vos premiers articles</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => onNavigate({ name: 'home' })}>Découvrir le catalogue</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🛒 Mon panier</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{items.length} article{items.length > 1 ? 's' : ''}</span>
      </div>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item: any) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img"><img src={item.image} alt={item.title} /></div>
              <div className="cart-item-info">
                <div className="cart-item-title">{item.title}</div>
                <div className="cart-item-price">${item.price?.toFixed(2)} / unité</div>
              </div>
              <div className="cart-item-actions">
                <button className="qty-btn" onClick={() => handleQty(item.id, -1)}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => handleQty(item.id, 1)}>+</button>
              </div>
              <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
              <button className="btn btn-sm btn-danger" onClick={() => handleRemove(item.id)}>✕</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Récapitulatif</h3>
          {items.map((item: any) => (
            <div key={item.id} className="summary-row">
              <span>{item.title.slice(0, 30)}… ×{item.quantity}</span>
              <span className="summary-value">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span className="summary-value">${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={() => onNavigate({ name: 'checkout' })}>
            Commander → {total.toFixed(2)} $
          </button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={() => onNavigate({ name: 'home' })}>
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Checkout ─── */
const CheckoutPage = ({ onNavigate, onAddToast }: { onNavigate: (p: Page) => void; onAddToast: (m: string, t: 'success' | 'error') => void }) => {
  const { data: cart } = useScrewQuery<any>('cart', 'get');
  const checkout = useScrewMutation('orders', 'checkout');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  const items = cart?.items || [];
  const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (!address.trim() || !city.trim()) { onAddToast('Veuillez remplir les champs obligatoires', 'error'); return; }
    try {
      await checkout.mutateAsync({ shippingAddress: `${address}, ${city} ${zip}` });
      onAddToast('Commande confirmée ! 🎉', 'success');
      onNavigate({ name: 'orders' });
    } catch { onAddToast('Erreur lors de la commande', 'error'); }
  };

  if (items.length === 0) {
    return <div className="empty-state"><div className="empty-state-icon">🛒</div><div className="empty-state-text">Votre panier est vide</div></div>;
  }

  return (
    <div>
      <button className="back-btn" onClick={() => onNavigate({ name: 'cart' })}>← Retour au panier</button>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>📋 Finaliser la commande</h2>
      <div className="checkout-layout">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Adresse de livraison</h3>
          <div className="form-group">
            <label>Adresse *</label>
            <input placeholder="123 rue de la Paix" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Ville *</label>
              <input placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Code postal</label>
              <input placeholder="75001" value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 16px' }}>Mode de paiement</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {['Carte bancaire', 'PayPal', 'Apple Pay'].map((m) => (
              <label key={m} style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'center', fontSize: '.85rem', fontWeight: 500 }}>
                <input type="radio" name="payment" defaultChecked={m === 'Carte bancaire'} style={{ marginRight: 6 }} /> {m}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Récapitulatif</h3>
            {items.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '.85rem' }}>
                <span style={{ flex: 1 }}>{item.title.slice(0, 25)}… ×{item.quantity}</span>
                <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={handleCheckout} disabled={checkout.isPending}>
            {checkout.isPending ? '⏳ Traitement…' : `💰 Payer ${total.toFixed(2)} $`}
          </button>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>🔒 Paiement sécurisé — SSL 256-bit</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Orders ─── */
const OrdersPage = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const { data: orders, isLoading } = useScrewQuery<any[]>('orders', 'list');

  if (isLoading) return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">Chargement des commandes…</div></div>;

  if (!orders || orders.length === 0) {
    return (
      <div>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">Aucune commande</div>
          <div className="empty-state-sub">Passez votre première commande !</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => onNavigate({ name: 'home' })}>Découvrir le catalogue</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>📋 Mes commandes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map((order: any) => (
          <div key={order.id} className="order-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate({ name: 'order', id: order.id })}>
            <div className="order-header">
              <div>
                <span className="order-id">Commande #{order.id}</span>
                <span className="order-date" style={{ marginLeft: 12 }}>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}</span>
              <span className="order-total">${order.total?.toFixed(2)}</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); onNavigate({ name: 'order', id: order.id }); }}>
                Suivre la livraison
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Order Detail / Delivery Tracking ─── */
const OrderDetail = ({ id, onNavigate }: { id: number; onNavigate: (p: Page) => void }) => {
  const { data: order, isLoading } = useScrewQuery<any>('orders', 'get', { args: [{ orderId: id }] });
  const { data: delivery, isLoading: loadingDelivery } = useScrewQuery<any>('delivery', 'track', { args: [{ orderId: id }], enabled: !!order && order.status !== 'delivered' });

  if (isLoading) return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">Chargement…</div></div>;
  if (!order) return <div className="empty-state"><div className="empty-state-icon">❌</div><div className="empty-state-text">Commande introuvable</div></div>;

  const tracking = (delivery?.tracking || order.tracking || []);
  const currentStatus = delivery?.status || order.status;

  return (
    <div>
      <button className="back-btn" onClick={() => onNavigate({ name: 'orders' })}>← Mes commandes</button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Commande #{order.id}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={currentStatus} />
          <div style={{ fontWeight: 700, fontSize: '1.3rem', marginTop: 4 }}>${order.total?.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📦 Suivi de livraison</h3>
          <div className="timeline">
            {tracking.map((t: any, i: number) => {
              const isActive = t.status === currentStatus || (tracking.length - 1 === i && currentStatus === 'delivered');
              const isLast = i === tracking.length - 1;
              return (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot${isActive ? ' active' : ''}${isLast && currentStatus !== 'delivered' ? ' current' : ''}`} />
                  <div className="timeline-status">{t.description}</div>
                  <div className="timeline-date">{new Date(t.date).toLocaleString('fr-FR')}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Articles</h3>
          {order.items?.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 48, height: 48, flexShrink: 0, background: '#fafafa', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.image} alt="" style={{ maxWidth: 40, maxHeight: 40 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{item.title}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>×{item.quantity} · ${item.price?.toFixed(2)}</div>
              </div>
              <div style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--border)' }}>
            <span>Total</span>
            <span>${order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Supplier Page ─── */
const SupplierPage = ({ category, onNavigate }: { category: string; onNavigate: (p: Page) => void }) => {
  const { data: supplier, isLoading } = useScrewQuery<any>('suppliers', 'get', { args: [{ category }] });
  const { data: products } = useScrewQuery<any[]>('products', 'list');

  if (isLoading) return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">Chargement…</div></div>;
  if (!supplier) return <div className="empty-state"><div className="empty-state-icon">❌</div><div className="empty-state-text">Fournisseur introuvable</div></div>;

  const categoryProducts = (products || []).filter((p: any) => p.category === category);

  return (
    <div>
      <button className="back-btn" onClick={() => onNavigate({ name: 'home' })}>← Retour au catalogue</button>
      <div className="supplier-hero">
        <div className="supplier-hero-logo">{supplier.logo}</div>
        <div>
          <div className="supplier-hero-name">{supplier.name}</div>
          <div className="supplier-hero-since">⭐ {supplier.rating} · {supplier.country} · Partenaire depuis {supplier.since}</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>À propos</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{supplier.description}</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div><span style={{ fontWeight: 600 }}>📧</span> {supplier.contactEmail}</div>
          <div><span style={{ fontWeight: 600 }}>🌍</span> {supplier.country}</div>
          <div><span style={{ fontWeight: 600 }}>📅</span> Depuis {supplier.since}</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 16px' }}>
        Produits de cette gamme ({categoryProducts.length})
      </h3>
      <div className="product-grid">
        {categoryProducts.map((product: any) => (
          <div key={product.id} className="product-card" onClick={() => onNavigate({ name: 'product', id: product.id })}>
            <div className="product-card-img"><img src={product.image} alt={product.title} loading="lazy" /></div>
            <div className="product-card-body">
              <div className="product-card-category">{product.category}</div>
              <div className="product-card-title">{product.title}</div>
              <div className="product-card-footer">
                <span className="product-card-price">{product.price?.toFixed(2)}</span>
                <StarRating rating={product.rating?.rate || 0} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   6. Main App
   ═══════════════════════════════════════════════ */

const AppContent = () => {
  const [page, setPage] = useState<Page>({ name: 'home' });
  const [showDevtools, setShowDevtools] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const { data: cart } = useScrewQuery<any>('cart', 'get');
  const cartCount = cart?.items?.length || 0;

  const pages: Record<string, string> = {
    home: 'Accueil', product: 'Détail', cart: 'Panier', checkout: 'Commande',
    orders: 'Commandes', order: 'Commande', supplier: 'Fournisseur',
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <button className="navbar-logo" onClick={() => setPage({ name: 'home' })}>
            <span>reactscrew</span> <span style={{ fontSize: '.9rem', fontWeight: 500, WebkitTextFillColor: 'var(--text-muted)', background: 'none' }}>Shop</span>
          </button>
          <div className="nav-links">
            <button className={`nav-btn${page.name === 'home' ? ' active' : ''}`} onClick={() => setPage({ name: 'home' })}>
              <span>🏪</span><span className="nav-label">Catalogue</span>
            </button>
            <button className={`nav-btn${page.name === 'cart' ? ' active' : ''}`} onClick={() => setPage({ name: 'cart' })}>
              <span>🛒</span><span className="nav-label">Panier</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className={`nav-btn${page.name === 'orders' || page.name === 'order' ? ' active' : ''}`} onClick={() => setPage({ name: 'orders' })}>
              <span>📋</span><span className="nav-label">Commandes</span>
            </button>
            <button className="nav-btn" onClick={() => setShowDevtools(!showDevtools)} style={{ color: showDevtools ? 'var(--primary)' : undefined }}>
              ⚡ Devtools
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '.85rem', color: 'var(--text-muted)' }}>
          <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setPage({ name: 'home' })}>🏪</button>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{pages[page.name]}</span>
        </div>

        {page.name === 'home' && <HomePage onNavigate={setPage} onAddToast={addToast} />}
        {page.name === 'product' && <ProductDetail id={page.id} onNavigate={setPage} onAddToast={addToast} />}
        {page.name === 'cart' && <CartPage onNavigate={setPage} onAddToast={addToast} />}
        {page.name === 'checkout' && <CheckoutPage onNavigate={setPage} onAddToast={addToast} />}
        {page.name === 'orders' && <OrdersPage onNavigate={setPage} />}
        {page.name === 'order' && <OrderDetail id={page.id} onNavigate={setPage} />}
        {page.name === 'supplier' && <SupplierPage category={page.category} onNavigate={setPage} />}
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Devtools toggle */}
      {showDevtools && <ScrewDevtools defaultOpen />}
    </>
  );
};

export const App = () => (
  <DriverProvider backends={backends}>
    <AppContent />
  </DriverProvider>
);
