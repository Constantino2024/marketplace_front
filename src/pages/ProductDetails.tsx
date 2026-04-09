import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  Store,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Send,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productsService, Product, ProductImage } from '../services/products';
import { extractIdFromSlug, createProductSlug } from '../utils/slug';


// Interfaces
interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
  likes: number;
  dislikes: number;
  images?: string[];
}

interface Question {
  id: number;
  user: {
    id: number;
    name: string;
  };
  question: string;
  answer?: {
    text: string;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  };
  created_at: string;
  likes: number;
}

interface ProductSpecs {
  [key: string]: string;
}

// Componente de Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
     type === 'error' ? <AlertCircle className="w-5 h-5" /> :
     <AlertCircle className="w-5 h-5" />}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">
      <span className="text-xl">&times;</span>
    </button>
  </motion.div>
);

// Componente de Zoom de Imagem
const ImageZoom = ({ 
  image, 
  onClose 
}: { 
  image: ProductImage; 
  onClose: () => void;
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Imagem principal */}
        <div className="relative max-w-5xl max-h-[90vh]">
          <img
            src={image.url}
            alt="Zoom"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Galeria com Zoom
const ImageGallery = ({ images, productName }: { images: ProductImage[]; productName: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  // Encontrar o índice da imagem principal
  useEffect(() => {
    const primaryIndex = images.findIndex(img => img.is_primary);
    if (primaryIndex !== -1) {
      setActiveIndex(primaryIndex);
    }
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !lensRef.current) return;
    
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const lensWidth = 100; // Largura da lente em pixels
    const lensHeight = 100; // Altura da lente em pixels
    
    let x = e.clientX - left - lensWidth / 2;
    let y = e.clientY - top - lensHeight / 2;
    
    // Limitar a posição da lente dentro da imagem
    x = Math.max(0, Math.min(x, width - lensWidth));
    y = Math.max(0, Math.min(y, height - lensHeight));
    
    setMousePosition({ x, y });
    
    // Calcular posição percentual para o zoom
    const percentX = (x / (width - lensWidth)) * 100;
    const percentY = (y / (height - lensHeight)) * 100;
    
    if (lensRef.current) {
      lensRef.current.style.backgroundPosition = `${percentX}% ${percentY}%`;
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center">
        <Package className="w-24 h-24 text-gray-300" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Imagem Principal com Zoom */}
        <div 
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group cursor-zoom-in"
          ref={imgRef}
          onMouseEnter={() => setShowLens(true)}
          onMouseLeave={() => setShowLens(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsZoomOpen(true)}
        >
          <img 
            src={images[activeIndex].url} 
            alt={`${productName} - Imagem ${activeIndex + 1}`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-150"
            referrerPolicy="no-referrer"
            style={{
              transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`
            }}
          />
          
          {/* Lente de Zoom */}
          {showLens && (
            <div
              ref={lensRef}
              className="absolute w-24 h-24 border-2 border-white rounded-full pointer-events-none shadow-lg"
              style={{
                left: mousePosition.x,
                top: mousePosition.y,
                backgroundImage: `url(${images[activeIndex].url})`,
                backgroundSize: '300%',
                backgroundRepeat: 'no-repeat',
                transform: 'translate(0, 0)'
              }}
            />
          )}

          {/* Botão de Zoom */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsZoomOpen(true); }}
            className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
          >
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Indicador de posição */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex 
                      ? 'bg-primary w-4' 
                      : 'bg-white/50 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeIndex === index 
                    ? 'border-primary shadow-md' 
                    : 'border-gray-100 opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={img.url} 
                  alt={`Miniatura ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Zoom */}
      <AnimatePresence>
        {isZoomOpen && (
          <ImageZoom
            image={images[activeIndex]}
            onClose={() => setIsZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Componente de Avaliação
const ReviewCard = ({ review }: { review: Review }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0 py-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black flex-shrink-0">
          {review.user.avatar ? (
            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            review.user.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800">{review.user.name}</h4>
              <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
          </div>

          <p className="text-gray-600 mb-4">{review.comment}</p>

          {/* Imagens da avaliação */}
          {review.images && review.images.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowImages(!showImages)}
                className="text-xs text-primary font-bold flex items-center gap-1 mb-2"
              >
                <Camera className="w-4 h-4" />
                {review.images.length} {review.images.length === 1 ? 'foto' : 'fotos'}
              </button>
              
              <AnimatePresence>
                {showImages && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 overflow-x-auto pb-2"
                  >
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Avaliação ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Botões de interação */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{review.likes + (liked ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => setDisliked(!disliked)}
              className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                disliked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{review.dislikes + (disliked ? 1 : 0)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Pergunta
const QuestionCard = ({ question, onAnswer }: { question: Question; onAnswer?: (questionId: number, answer: string) => void }) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [liked, setLiked] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSubmitAnswer = () => {
    if (answerText.trim() && onAnswer) {
      onAnswer(question.id, answerText);
      setShowAnswerForm(false);
      setAnswerText('');
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0 py-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-black flex-shrink-0">
          ?
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-800">{question.user.name}</p>
              <p className="text-xs text-gray-400">{formatDate(question.created_at)}</p>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{question.likes + (liked ? 1 : 0)}</span>
            </button>
          </div>

          <p className="text-gray-800 mb-4">{question.question}</p>

          {/* Resposta */}
          {question.answer ? (
            <div className="ml-8 pl-6 border-l-2 border-primary/30 bg-primary/5 rounded-r-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">Resposta da loja</span>
                <span className="text-[10px] text-gray-400">{formatDate(question.answer.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600">{question.answer.text}</p>
              <p className="text-xs text-gray-400 mt-2">
                - {question.answer.user.name}
              </p>
            </div>
          ) : (
            onAnswer && (
              <div>
                {!showAnswerForm ? (
                  <button
                    onClick={() => setShowAnswerForm(true)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Responder
                  </button>
                ) : (
                  <div className="mt-4">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!answerText.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar
                      </button>
                      <button
                        onClick={() => setShowAnswerForm(false)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Especificações Técnicas
const Specifications = ({ specs }: { specs: ProductSpecs }) => {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhuma especificação disponível</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {Object.entries(specs).map(([key, value], index) => (
        <div key={index} className="flex py-4">
          <dt className="w-1/3 text-sm font-bold text-gray-500">{key}</dt>
          <dd className="w-2/3 text-sm text-gray-800">{value}</dd>
        </div>
      ))}
    </div>
  );
};

// Componente Principal
export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  
  // Estados principais
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  
  // Estados de UI
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'questions'>('description');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Dados mockados (serão substituídos por chamadas reais à API)
  const [specs] = useState<ProductSpecs>({
    'Marca': 'Genérica',
    'Categoria': 'Não especificada',
    'Condição': 'Novo',
    'Garantia': '1 ano',
    'Origem': 'Importado',
    'Peso aproximado': '500g',
  });

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      user: { id: 1, name: 'João Silva' },
      rating: 5,
      comment: 'Excelente produto! Superou minhas expectativas. Entrega rápida e bem embalado.',
      created_at: new Date().toISOString(),
      likes: 12,
      dislikes: 1,
    },
    {
      id: 2,
      user: { id: 2, name: 'Maria Santos' },
      rating: 4,
      comment: 'Muito bom, mas poderia ter mais cores disponíveis. De resto, perfeito!',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      likes: 8,
      dislikes: 0,
      images: ['https://picsum.photos/200/200?random=1']
    },
  ]);

  const [questions] = useState<Question[]>([
    {
      id: 1,
      user: { id: 3, name: 'Pedro Costa' },
      question: 'Este produto tem garantia?',
      answer: {
        text: 'Sim, possui 1 ano de garantia contra defeitos de fabricação.',
        created_at: new Date().toISOString(),
        user: { id: 999, name: 'Suporte HSE' }
      },
      created_at: new Date(Date.now() - 172800000).toISOString(),
      likes: 5
    },
    {
      id: 2,
      user: { id: 4, name: 'Ana Pereira' },
      question: 'Qual o prazo de entrega para Luanda?',
      created_at: new Date().toISOString(),
      likes: 3
    },
  ]);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Extrair ID do slug
  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    const productId = extractIdFromSlug(slug);
    if (!productId) {
      setError('Produto não encontrado');
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📦 Carregando produto ID:', productId);
        const data = await productsService.getById(productId);
        console.log('✅ Produto carregado:', data);
        setProduct(data);
        
        // Processar imagens
        const productImages: ProductImage[] = [];
        
        // Adicionar imagens adicionais
        if (data.additional_images && data.additional_images.length > 0) {
          productImages.push(...data.additional_images);
        }
        
        // Adicionar imagem principal se não estiver nas adicionais
        if (data.image_url && !productImages.some(img => img.url === data.image_url)) {
          productImages.unshift({
            id: 0,
            url: data.image_url,
            is_primary: true,
            order: 0
          });
        }
        
        setImages(productImages);
        
        // Atualizar especificações com dados reais
        if (data.category_name) {
          specs['Categoria'] = data.category_name;
        }
        if (data.company_name) {
          specs['Marca'] = data.company_name;
        }
        
        // Carregar produtos relacionados (mesma categoria)
        await loadRelatedProducts(data.category, data.id);
      } catch (error: any) {
        console.error('❌ Erro ao carregar produto:', error);
        setError(error?.response?.data?.message || 'Não foi possível carregar o produto. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate]);

  // Carregar produtos relacionados
  const loadRelatedProducts = async (categoryId: number, currentProductId: number) => {
    setLoadingRelated(true);
    try {
      const related = await productsService.getRelatedProducts(currentProductId, categoryId, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Erro ao carregar produtos relacionados:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      setToast({
        message: `${quantity} ${quantity === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho!`,
        type: 'success'
      });
      
      // Feedback visual (opcional)
      const event = new CustomEvent('cartUpdated', { 
        detail: { action: 'add', productId: product.id, quantity } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      setToast({
        message: 'Erro ao adicionar ao carrinho',
        type: 'error'
      });
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const url = `${window.location.origin}/product/${createProductSlug(product.name, product.id)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Confira este produto incrível: ${product.name}`,
          url: url,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback - copiar link
      navigator.clipboard.writeText(url);
      setToast({
        message: 'Link copiado para a área de transferência!',
        type: 'success'
      });
    }
  };

  const isWishlisted = product ? wishlist.includes(product.id) : false;

  // Calcular desconto
  const discount = product?.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  // Estatísticas de avaliações
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const ratingCounts = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-400">Carregando produto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">
          {error || 'Produto não encontrado'}
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          O produto que você está procurando pode ter sido removido ou está indisponível.
        </p>
        <Link 
          to="/" 
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Link to="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-sm text-gray-300">/</span>
          <Link 
            to={`/category/${product.category}`} 
            className="text-sm text-gray-400 hover:text-primary transition-colors"
          >
            {product.category_name}
          </Link>
          <span className="text-sm text-gray-300">/</span>
          <span className="text-sm text-gray-600 font-medium truncate max-w-[200px]">
            {product.name}
          </span>

          {/* Botão de compartilhar */}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-primary transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-bold">Compartilhar</span>
          </button>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galeria de Imagens com Zoom */}
          <ImageGallery images={images} productName={product.name} />

          {/* Informações do Produto */}
          <div className="flex flex-col">
            {/* Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                product.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                product.status === 'out_of_stock' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {product.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                {product.status_display}
              </span>
              
              {product.company_name && (
                <Link 
                  to={`/company/${product.company}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold hover:bg-primary/20 transition-colors"
                >
                  <Store className="w-3 h-3" />
                  {product.company_name}
                </Link>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Avaliação Rápida */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-gray-400 hover:text-primary font-medium"
              >
                {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
              </button>
            </div>

            {/* Preço */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-black text-primary">
                Kz {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    Kz {product.oldPrice.toLocaleString()}
                  </span>
                  {discount && (
                    <span className="bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Descrição Curta */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed line-clamp-3">
                {product.description || 'Descrição não disponível para este produto.'}
              </p>
              <button
                onClick={() => setActiveTab('description')}
                className="text-primary text-sm font-bold hover:underline mt-2"
              >
                Ver descrição completa
              </button>
            </div>

            {/* Estoque */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Disponibilidade:</span>
                <span className={`font-bold ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} unidades em estoque` : 'Fora de estoque'}
                </span>
              </div>
              {product.stock > 0 && product.stock < 5 && (
                <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Apenas {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'} restantes! Compre logo.
                </p>
              )}
            </div>

            {/* Ações */}
            {product.status === 'active' && product.stock > 0 && (
              <div className="space-y-6 mt-auto">
                <div className="flex items-center gap-4">
                  {/* Controle de Quantidade */}
                  <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden h-14">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-4 h-full hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-4 h-full hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Botão Adicionar ao Carrinho */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary text-white h-14 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar
                  </button>

                  {/* Botão Favoritos */}
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                      isWishlisted 
                        ? 'bg-red-50 border-red-100 text-red-500' 
                        : 'border-gray-100 text-gray-400 hover:border-primary hover:text-primary'
                    }`}
                    title={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {product.status !== 'active' && (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-bold">Produto indisponível</p>
                <p className="text-sm text-gray-400 mt-1">
                  Este produto não está disponível para compra no momento.
                </p>
              </div>
            )}

            {/* Benefícios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-500">Entrega Grátis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-500">Garantia de 1 Ano</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-500">30 Dias Retorno</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas de Informação */}
        <div className="mt-16">
          <div className="border-b border-gray-100">
            <nav className="flex gap-8 overflow-x-auto pb-4 no-scrollbar">
              <button
                onClick={() => setActiveTab('description')}
                className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === 'description' 
                    ? 'text-primary border-b-2 border-primary pb-4' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Descrição
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === 'specs' 
                    ? 'text-primary border-b-2 border-primary pb-4' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Especificações
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === 'reviews' 
                    ? 'text-primary border-b-2 border-primary pb-4' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Avaliações ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === 'questions' 
                    ? 'text-primary border-b-2 border-primary pb-4' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Perguntas ({questions.length})
              </button>
            </nav>
          </div>

          <div className="py-8">
            {/* Descrição */}
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose max-w-none"
              >
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Nenhuma descrição disponível para este produto.'}
                </p>
              </motion.div>
            )}

            {/* Especificações */}
            {activeTab === 'specs' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <Specifications specs={specs} />
              </motion.div>
            )}

            {/* Avaliações */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Resumo das Avaliações */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-gray-800 mb-4">Avaliações dos Clientes</h3>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Média */}
                    <div className="text-center">
                      <div className="text-5xl font-black text-primary">{averageRating.toFixed(1)}</div>
                      <div className="flex gap-0.5 justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{reviews.length} avaliações</p>
                    </div>

                    {/* Barras de distribuição */}
                    <div className="flex-1 space-y-2">
                      {[5,4,3,2,1].map((star) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-8">{star} ★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ 
                                width: `${reviews.length > 0 ? (ratingCounts[star] || 0) / reviews.length * 100 : 0}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-12">{ratingCounts[star] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all">
                    Escrever uma avaliação
                  </button>
                </div>

                {/* Lista de Avaliações */}
                <div className="divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Perguntas e Respostas */}
            {activeTab === 'questions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Formulário de Pergunta */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-gray-800 mb-4">Tem alguma dúvida?</h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        placeholder="Digite sua pergunta..."
                        rows={2}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all self-end">
                      Perguntar
                    </button>
                  </div>
                </div>

                {/* Lista de Perguntas */}
                <div className="divide-y divide-gray-100">
                  {questions.map((question) => (
                    <QuestionCard 
                      key={question.id} 
                      question={question}
                      onAnswer={(id, answer) => {
                        console.log('Responder pergunta', id, answer);
                        // Implementar lógica de resposta
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-800 mb-8">Produtos Relacionados</h2>
            
            {loadingRelated ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${createProductSlug(relatedProduct.name, relatedProduct.id)}`}
                    className="group bg-white border border-gray-100 rounded-xl p-3 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3">
                      {relatedProduct.image_url ? (
                        <img 
                          src={relatedProduct.image_url} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 line-clamp-2 mb-2 h-8">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm font-black text-primary">
                      Kz {relatedProduct.price.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}