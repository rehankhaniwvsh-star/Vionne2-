import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, ProductReview } from '../../../constants';
import { useCart } from '../../../store/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  Zap, 
  ChevronRight, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ArrowLeft, 
  Maximize2, 
  X as CloseIcon, 
  ChevronLeft as PrevIcon, 
  ChevronRight as NextIcon,
  Star,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  Gift,
  Sparkles,
  HelpCircle,
  Package,
  Sliders,
  Share2,
  Check,
  MapPin,
  Camera,
  MessageSquare
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { INITIAL_PRODUCTS } from '../../../data/mockProducts';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'specs' | 'box' | 'reviews' | 'faqs'>('features');
  
  // Pincode Delivery Estimator
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [deliveryDate, setDeliveryDate] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', location: '', rating: 5, title: '', comment: '' });
  const [customReviews, setCustomReviews] = useState<ProductReview[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const mainCtaRef = useRef<HTMLDivElement>(null);
  const addItem = useCart(state => state.addItem);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const fetchedData = await adminService.getProductById(id);
      if (fetchedData) {
        const p = fetchedData as Product;
        setProduct(p);
        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
      } else {
        const fallback = INITIAL_PRODUCTS.find(item => item.id === id) || INITIAL_PRODUCTS[0];
        setProduct(fallback);
        if (fallback.variants && fallback.variants.length > 0) {
          setSelectedVariant(fallback.variants[0]);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Sticky Buy Bar scroll detector
  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = Array.isArray(product.images) ? [...product.images] : [];
    if (product.image && !images.includes(product.image)) {
      images.unshift(product.image);
    }
    return Array.from(new Set(images.filter(img => img)));
  }, [product]);

  const allReviews = useMemo(() => {
    const defaultReviews = product?.reviews || [];
    return [...customReviews, ...defaultReviews];
  }, [product, customReviews]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price) || 0;
  }, [product]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    return product.originalPrice || Math.round(Number(product.price) * 1.85);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        ...product,
        price: currentPrice
      }, selectedVariant || (product.variants && product.variants[0]) || 'Default');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus('invalid');
      return;
    }
    setPincodeStatus('checking');
    setTimeout(() => {
      const now = new Date();
      now.setDate(now.getDate() + 3);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setDeliveryDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`);
      setPincodeStatus('valid');
    }, 600);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) return;
    const created: ProductReview = {
      id: `rev-${Date.now()}`,
      author: newReview.author,
      location: newReview.location || 'India',
      rating: newReview.rating,
      date: 'Just now',
      title: newReview.title || 'Verified Purchase Review',
      comment: newReview.comment,
      verified: true
    };
    setCustomReviews(prev => [created, ...prev]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setNewReview({ author: '', location: '', rating: 5, title: '', comment: '' });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
        <p className="text-black/60 font-mono tracking-widest text-xs uppercase">Loading High-Conversion Showcase...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex flex-col items-center justify-center space-y-6">
        <p className="text-black/40 uppercase tracking-widest text-xs">Product Not Found</p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </button>
      </div>
    );
  }

  const savingsAmount = originalPrice - currentPrice;
  const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110] p-2 bg-white/10 rounded-full"
            >
              <CloseIcon size={24} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                }}
                className="absolute left-2 md:left-6 text-white/60 hover:text-white transition-colors p-3 bg-white/10 rounded-full"
              >
                <PrevIcon size={32} />
              </button>

              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={allImages[activeImage]} 
                alt={product.title}
                referrerPolicy="no-referrer"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              />

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 md:right-6 text-white/60 hover:text-white transition-colors p-3 bg-white/10 rounded-full"
              >
                <NextIcon size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-8 pt-6 pb-20">
        {/* Breadcrumb & Share */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-8 pb-3 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/')} className="hover:text-black transition-colors font-light">Home</button>
            <ChevronRight size={12} />
            <span className="font-light text-zinc-500">{product.category}</span>
            <ChevronRight size={12} className="hidden sm:inline" />
            <span className="text-zinc-800 font-normal truncate max-w-[240px] hidden sm:inline">{product.title}</span>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center space-x-1.5 text-zinc-500 hover:text-black font-medium text-[11px] transition-colors"
          >
            {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>

        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Gallery - 7 cols on desktop: Multi-Image 2x2 Showcase matching screenshot */}
          <div className="lg:col-span-7">
            {allImages.length >= 4 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {allImages.slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActiveImage(idx);
                      setIsLightboxOpen(true);
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200/70 cursor-zoom-in shadow-2xs hover:border-zinc-400 transition-all duration-300"
                  >
                    <img 
                      src={img} 
                      alt={`${product.title} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Image Caption / Function Tags matching screenshot */}
                    {idx === 0 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-medium tracking-wider text-zinc-800 px-2.5 py-1 rounded shadow-xs">
                        Dual Mode Pour & Spray
                      </div>
                    )}
                    {idx === 1 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-medium tracking-wider text-zinc-800 px-2.5 py-1 rounded shadow-xs">
                        Easy To Use 4-Step Guide
                      </div>
                    )}
                    {idx === 2 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-medium tracking-wider text-zinc-800 px-2.5 py-1 rounded shadow-xs">
                        Leak-Proof Gasket Structure
                      </div>
                    )}
                    {idx === 3 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-medium tracking-wider text-zinc-800 px-2.5 py-1 rounded shadow-xs">
                        Healthy Oil Measuring
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 p-2 bg-white/80 backdrop-blur-xs rounded-full text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 size={14} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col-reverse md:flex-row gap-4">
                {allImages.length > 1 && (
                  <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`aspect-square w-16 md:w-full rounded-xl overflow-hidden bg-zinc-100 border transition-all duration-200 ${
                          activeImage === idx ? 'border-black ring-1 ring-black' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <div 
                  className="flex-1 relative aspect-square sm:aspect-[4/5] rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200/80 cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img src={allImages[activeImage]} alt={product.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-xs rounded-full text-zinc-700">
                    <Maximize2 size={14} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Details & Actions - 5 cols on desktop */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Brand */}
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium block mb-2">
                VIONNE • {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-zinc-900 tracking-tight leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Price Line matching screenshot */}
            <div className="flex items-baseline space-x-3 pb-2 border-b border-zinc-100">
              <span className="text-2xl sm:text-3xl font-normal text-zinc-900">
                Rs. {currentPrice.toLocaleString('en-IN')}.00
              </span>
              {originalPrice > currentPrice && (
                <span className="text-base text-zinc-400 line-through font-light">
                  Rs. {originalPrice.toLocaleString('en-IN')}.00
                </span>
              )}
              {savingsPercent > 0 && (
                <span className="text-[11px] font-medium text-[#7a8c73] bg-[#f0f4ee] px-2.5 py-0.5 rounded-full">
                  Sale ({savingsPercent}% OFF)
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-zinc-700 block">
                  Option: <span className="text-zinc-500 font-light">{selectedVariant}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3.5 py-2 rounded-md text-xs transition-all ${
                        selectedVariant === variant 
                          ? 'bg-zinc-900 text-white border-zinc-900 font-medium' 
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Dual Conversion Action Buttons matching screenshot */}
            <div ref={mainCtaRef} className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Outlined Box */}
                <div className="flex items-center border border-zinc-300 rounded-md bg-white px-2 py-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="p-1 hover:text-black text-zinc-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-medium text-xs text-zinc-900">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="p-1 hover:text-black text-zinc-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart in deep forest/olive green */}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#28402c] hover:bg-[#1e3021] text-white py-3.5 px-5 rounded-md text-xs font-medium tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-xs"
                >
                  <ShoppingBag size={16} strokeWidth={1.8} />
                  <span>Add to cart</span>
                </button>
              </div>

              {/* Buy it now button matching screenshot */}
              <button 
                onClick={handleBuyNow}
                className="w-full bg-[#28402c] hover:bg-[#1e3021] text-white py-3.5 px-6 rounded-md text-xs font-medium tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-xs"
              >
                <span>Buy it now</span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-500 pt-1 font-light">
                <ShieldCheck size={14} className="text-[#28402c]" />
                <span>Guaranteed Safe & Secure Checkout • Cash on Delivery Available</span>
              </div>
            </div>

            {/* Product Description matching the screenshot */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 text-xs text-zinc-700 leading-relaxed font-light">
              <p>
                One glass bottle that pours and sprays — measure roughly 0.15g of oil per spritz for lighter cooking, or tip it to pour for baking and dressings. No more clutter of two separate bottles.
              </p>

              <ul className="space-y-1.5 list-disc pl-4 text-zinc-600">
                <li>2-in-1: switch between a fine spray and a controlled pour</li>
                <li>Each spray measures ~0.15g of oil — easy to track for healthy cooking</li>
                <li>Leak-proof cap keeps your counter and cabinet clean</li>
                <li>Food-grade, BPA-free, lead-free glass — see your oil level at a glance</li>
                <li>Comes with a silicone basting brush and spatula</li>
              </ul>

              {/* Specifications Block */}
              <div className="pt-2">
                <p className="font-medium text-zinc-900 mb-1.5">Specifications</p>
                <div className="space-y-1 text-zinc-600 pl-1">
                  <p><span className="text-zinc-500">Material:</span> Glass, BPA-free</p>
                  <p><span className="text-zinc-500">Capacity:</span> 470 ml</p>
                  <p><span className="text-zinc-500">Dimensions:</span> 10 × 10 × 10 cm</p>
                  <p><span className="text-zinc-500">Origin:</span> India</p>
                </div>
              </div>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-2.5">
              <span className="text-xs font-medium text-zinc-800 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#28402c]" />
                Check Delivery Date & COD Availability
              </span>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    setPincodeStatus('idle');
                  }}
                  placeholder="Enter 6-digit Pincode (e.g. 560001)"
                  className="flex-1 bg-white border border-zinc-300 rounded-md px-3 py-2 text-xs focus:border-zinc-800 outline-none font-mono"
                />
                <button 
                  type="submit" 
                  className="bg-[#28402c] text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-[#1e3021] transition-colors"
                >
                  {pincodeStatus === 'checking' ? 'Checking...' : 'Check'}
                </button>
              </form>
              
              {pincodeStatus === 'valid' && (
                <div className="text-xs text-[#28402c] bg-emerald-50/70 p-2 rounded-md border border-emerald-200/60 font-light">
                  🚚 <strong>Express Delivery:</strong> Delivers by <strong>{deliveryDate}</strong>.<br />
                  💵 Cash on Delivery (COD) & Online Payment both available for {pincode}.
                </div>
              )}
              {pincodeStatus === 'invalid' && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
                  Please enter a valid 6-digit Indian pincode.
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100 text-center">
              <div className="p-3 bg-zinc-50/70 rounded-lg flex flex-col items-center justify-center space-y-1">
                <Truck size={18} className="text-zinc-700" />
                <span className="text-[10px] font-medium text-zinc-800">Free Shipping</span>
                <span className="text-[9px] text-zinc-400">All India orders</span>
              </div>
              <div className="p-3 bg-zinc-50/70 rounded-lg flex flex-col items-center justify-center space-y-1">
                <RotateCcw size={18} className="text-zinc-700" />
                <span className="text-[10px] font-medium text-zinc-800">30-Day Returns</span>
                <span className="text-[9px] text-zinc-400">Hassle-free guarantee</span>
              </div>
              <div className="p-3 bg-zinc-50/70 rounded-lg flex flex-col items-center justify-center space-y-1">
                <ShieldCheck size={18} className="text-zinc-700" />
                <span className="text-[10px] font-medium text-zinc-800">Official Warranty</span>
                <span className="text-[9px] text-zinc-400">Authentic quality seal</span>
              </div>
            </div>
          </div>
        </div>

        {/* "You may also like" Section matching screenshot */}
        <div className="mt-24 pt-12 border-t border-zinc-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-serif font-normal text-zinc-900">
              You may also like
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {INITIAL_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4).map((related) => {
              const relPrice = Number(related.price) || 449;
              const relOrig = related.originalPrice || Math.round(relPrice * 1.6);
              return (
                <div 
                  key={related.id}
                  onClick={() => {
                    navigate(`/product/${related.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-3">
                    <img 
                      src={related.image || (related.images && related.images[0])} 
                      alt={related.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-[#8f9e83] text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
                        Sale
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-400 font-light block">
                      {related.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-normal text-zinc-900 line-clamp-2 leading-snug group-hover:text-zinc-600 transition-colors">
                      {related.title}
                    </h4>
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-xs sm:text-sm font-medium text-zinc-900">
                        Rs. {relPrice.toLocaleString('en-IN')}.00
                      </span>
                      {relOrig > relPrice && (
                        <span className="text-[11px] text-zinc-400 line-through font-light">
                          Rs. {relOrig.toLocaleString('en-IN')}.00
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Tabs Navigation (Specs, Box, Reviews, FAQs) */}
        <div id="details-section" className="mt-20 pt-10 border-t border-zinc-200">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-zinc-200 gap-2 md:gap-4 mb-8">
            {[
              { id: 'features', label: 'Key Features & Benefits', icon: Sparkles },
              { id: 'specs', label: 'Tech Specifications', icon: Sliders },
              { id: 'box', label: "What's in the Box", icon: Package },
              { id: 'reviews', label: `Reviews (${allReviews.length})`, icon: Star },
              { id: 'faqs', label: 'FAQs & Answers', icon: HelpCircle }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                    isActive 
                      ? 'border-black text-black' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Features & Benefits */}
          {activeTab === 'features' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="max-w-3xl prose text-zinc-700 leading-relaxed">
                <p className="text-base font-normal">{product.description}</p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                        0{idx + 1}
                      </div>
                      <h4 className="text-base font-bold text-zinc-950 pt-1">{feat.title}</h4>
                      <p className="text-sm text-zinc-600 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: Specifications Table */}
          {activeTab === 'specs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-200">
                {(product.specs && product.specs.length > 0 ? product.specs : [
                  { label: 'Category', value: product.category },
                  { label: 'Status', value: product.status || 'Active' },
                  { label: 'Standard Warranty', value: '1 Year Full Replacement' },
                  { label: 'Origin', value: 'Crafted & Tested with Premium Standards' }
                ]).map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-4 bg-white hover:bg-zinc-50 transition-colors text-xs">
                    <span className="font-extrabold uppercase text-zinc-500">{spec.label}</span>
                    <span className="col-span-2 font-medium text-zinc-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 3: What's in the Box */}
          {activeTab === 'box' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-4">
              <p className="text-sm text-zinc-600 mb-4">Every order is sealed in original premium retail packaging with quality assurance certification:</p>
              <div className="space-y-3">
                {(product.boxItems && product.boxItems.length > 0 ? product.boxItems : [
                  `1x ${product.title}`,
                  '1x Official Certificate of Authenticity',
                  '1x Quick Start Guide & Instructions Manual',
                  '1x Warranty Card & VIP Support Code'
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 4: Real Reviews */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              {/* Rating Summary Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-5xl font-serif font-black text-zinc-950">4.9</span>
                  <div className="flex text-amber-500 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">Based on {allReviews.length + 1200} customer reviews</span>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2 flex flex-col justify-center">
                  {[
                    { stars: 5, pct: 92 },
                    { stars: 4, pct: 6 },
                    { stars: 3, pct: 2 },
                    { stars: 2, pct: 0 },
                    { stars: 1, pct: 0 }
                  ].map(row => (
                    <div key={row.stars} className="flex items-center space-x-3 text-xs font-semibold">
                      <span className="w-12 text-zinc-700">{row.stars} Stars</span>
                      <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-zinc-500">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Write a review */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold">Verified Customer Feedback</h3>
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare size={14} />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Reviews List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allReviews.map((rev, idx) => (
                  <div key={rev.id || idx} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-1.5 text-amber-500 mb-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                        <h4 className="text-sm font-bold text-zinc-950">{rev.title}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">{rev.date}</span>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>

                    {rev.photo && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 mt-2">
                        <img src={rev.photo} alt="Customer Review" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px]">
                      <span className="font-bold text-zinc-800">{rev.author} <span className="font-normal text-zinc-400">({rev.location})</span></span>
                      {rev.verified && (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          <CheckCircle2 size={11} /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 5: FAQs */}
          {activeTab === 'faqs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-4">
              {(product.faqs && product.faqs.length > 0 ? product.faqs : [
                {
                  q: 'Is Cash on Delivery (COD) available for my location?',
                  a: 'Yes! We ship across 20,000+ pin codes in India with verified Cash on Delivery support.'
                },
                {
                  q: 'How long does delivery take?',
                  a: 'Orders are dispatched within 24 hours. Metro deliveries take 2-3 business days, other locations take 3-5 days.'
                },
                {
                  q: 'What is the return & replacement policy?',
                  a: 'We provide a 100% risk-free 30-Day money back guarantee. If you are not satisfied, contact our support team for an instant doorstep pickup and replacement.'
                }
              ]).map((faq, idx) => (
                <div key={idx} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2">
                  <h4 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">Q</span>
                    {faq.q}
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed pl-7">{faq.a}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Buy Bar (Desktop & Mobile on Scroll) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3.5 shadow-2xl"
          >
            <div className="container mx-auto px-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0 hidden sm:block">
                  <img src={allImages[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-zinc-950 truncate max-w-xs">{product.title}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-serif font-black text-zinc-950">₹{currentPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-zinc-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button 
                  onClick={handleAddToCart}
                  className="hidden md:flex items-center space-x-1.5 bg-white text-zinc-900 border border-zinc-300 py-2.5 px-4 rounded-md text-xs font-medium tracking-wider hover:bg-zinc-50 transition-colors"
                >
                  <ShoppingBag size={14} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="bg-[#28402c] text-white py-2.5 px-6 rounded-md text-xs font-medium tracking-wider hover:bg-[#1e3021] transition-all flex items-center space-x-2 shadow-xs"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-black p-1"
              >
                <CloseIcon size={20} />
              </button>

              <h3 className="text-xl font-serif font-bold mb-1">Write a Review</h3>
              <p className="text-xs text-zinc-500 mb-6">Share your honest experience with this product.</p>

              {reviewSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check size={28} />
                  </div>
                  <h4 className="text-base font-bold text-zinc-900">Thank You!</h4>
                  <p className="text-xs text-zinc-600">Your verified review has been posted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">Rating</label>
                    <div className="flex space-x-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star size={24} fill={newReview.rating >= star ? 'currentColor' : 'none'} stroke="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Rahul Verma"
                      value={newReview.author}
                      onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                      className="w-full border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">City / Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai, MH"
                      value={newReview.location}
                      onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                      className="w-full border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">Review Headline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Best purchase I made this month!"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="w-full border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">Your Detailed Review</label>
                    <textarea 
                      required 
                      rows={3}
                      placeholder="What did you like or dislike about the product?"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs focus:border-black outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
