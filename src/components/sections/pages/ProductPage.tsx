import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../../../constants';
import { useCart } from '../../../store/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, ShoppingBag, ChevronRight, Truck, RotateCcw, ShieldCheck, ArrowLeft } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart(state => state.addItem);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
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
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, selectedVariant);
    navigate('/checkout');
  };

  const allImages = React.useMemo(() => {
    if (!product) return [];
    const images = Array.isArray(product.images) ? [...product.images] : [];
    if (product.image && !images.includes(product.image)) {
      images.unshift(product.image);
    }
    // Ensure unique images and filter out empty strings
    return Array.from(new Set(images.filter(img => img)));
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen pt-10 pb-24 flex items-center justify-center">
        <p className="text-black/40 animate-pulse uppercase tracking-widest text-xs">Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-10 pb-24 flex flex-col items-center justify-center space-y-6">
        <p className="text-black/40 uppercase tracking-widest text-xs">Product Not Found</p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest border-b border-black pb-1"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-black/40 mb-12">
          <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
          <ChevronRight size={10} />
          <span className="text-black">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] overflow-hidden bg-[#F5F5F0]">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={allImages[activeImage] || 'https://picsum.photos/seed/placeholder/400/500'} 
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square overflow-hidden bg-[#F5F5F0] border-2 transition-colors ${activeImage === idx ? 'border-black' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight">{product.title}</h1>
              <p className="text-2xl font-light">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
            </div>

            <div 
              className="text-black/60 leading-relaxed max-w-lg prose prose-sm"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">Select Option</span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(variant => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 text-xs uppercase tracking-widest border transition-all ${
                        selectedVariant === variant 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-black/10 hover:border-black'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center border border-black/10 px-4 py-3 justify-between sm:justify-start">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-black/50">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-black/50">
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex flex-1 gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white text-black border border-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-all flex items-center justify-center space-x-3"
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span>In Stock — Ready to ship</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-black/5">
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck size={20} className="text-black/60" />
                <span className="text-[9px] uppercase tracking-widest font-bold">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <RotateCcw size={20} className="text-black/60" />
                <span className="text-[9px] uppercase tracking-widest font-bold">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck size={20} className="text-black/60" />
                <span className="text-[9px] uppercase tracking-widest font-bold">Secure Checkout</span>
              </div>
            </div>

            {/* Expandable Details (Simplified) */}
            <div className="space-y-4 pt-10">
              <div className="border-t border-black/5 pt-4">
                <button className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span>Product Details</span>
                  <Plus size={14} />
                </button>
              </div>
              <div className="border-t border-black/5 pt-4">
                <button className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span>Shipping & Returns</span>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
