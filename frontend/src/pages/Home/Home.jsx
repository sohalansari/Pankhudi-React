import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ChatBot from '../../components/chatbot';
import './Home.css';

// Helper functions for images
const getCategoryImage = (category) => {
    const categoryImages = {
        dresses: 'https://img.kwcdn.com/product/enhanced_images/4bd92b3ed9fadfea0c9752692a9e19a1_enhanced.jpg?imageView2/2/w/800/q/70',
        tops: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&auto=format&fit=crop',
        skirts: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop',
        ethnicwear: 'https://www.lavanyathelabel.com/cdn/shop/files/LBL101KS62_1_1200x.jpg?v=1740035852',
        winterwear: 'https://hulaglobal.com/wp-content/uploads/2024/11/Classic-wool-coat-683x1024.webp',
        accessories: 'https://miro.medium.com/v2/resize:fit:1200/1*w2ZtNewCRB7uakMLKuME6A.jpeg',
        lehengas: 'https://i.etsystatic.com/25647034/r/il/39b3f5/5232058934/il_1080xN.5232058934_29m2.jpg',
        suits: 'https://d17a17kld06uk8.cloudfront.net/products/N6MMXXW/CI8C43E7-original.jpg'
    };
    return categoryImages[category] || 'https://via.placeholder.com/300x200?text=Category+Image';
};

const getFallbackProductImage = (category) => {
    const fallbackImages = {
        dresses: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb595d?w=500&auto=format&fit=crop',
        tops: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop',
        skirts: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop',
        ethnicwear: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop',
        winterwear: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop',
        accessories: 'https://images.unsplash.com/photo-1607602132863-4c6c92a1e20e?w=500&auto=format&fit=crop',
        lehengas: 'https://www.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/w/sw-l-10465-maroon-and-golden-embroidered-net-lehenga-choli.jpg',
        suits: 'https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg'
    };
    return fallbackImages[category] || 'https://via.placeholder.com/300x200?text=Product+Image';
};

const convertToINR = (usdPrice) => {
    const conversionRate = 83.5;
    return Math.round(usdPrice * conversionRate);
};

const manualProducts = [
    {
        id: 1,
        name: 'Floral Summer Dress',
        price: convertToINR(14.99),
        images: ['https://assets.myntassets.com/dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2024/JULY/25/6fLiiEYH_6c261927f7fd4270a9060e769ebbab0b.jpg'],
        rating: 4.5,
        discount: 20,
        category: 'dresses',
        pattern: 'floral',
        brand: 'Pankhudi',
        stock: 15,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 2,
        name: 'Party Gown with Sequins',
        price: convertToINR(24.99),
        images: ['https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=500&auto=format&fit=crop'],
        rating: 4.7,
        discount: 0,
        category: 'dresses',
        pattern: 'sequins',
        brand: 'GlamourWear',
        stock: 8,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 3,
        name: 'Cotton Casual Dress',
        price: convertToINR(9.99),
        images: ['https://i5.walmartimages.com/asr/4d8598c6-2488-42b6-8f8f-dfbf9b6d2769.5c5d1aca409d9588f46e909c2e2c4bbe.jpeg'],
        rating: 4.2,
        discount: 10,
        category: 'dresses',
        pattern: 'solid',
        brand: 'CasualCloth',
        stock: 20,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 4,
        name: 'Striped Summer Dress',
        price: convertToINR(12.99),
        images: ['https://i.pinimg.com/originals/56/45/58/56455805102cb325429c575bf9c3d8fd.jpg'],
        rating: 4.3,
        discount: 0,
        category: 'dresses',
        pattern: 'striped',
        brand: 'SummerStyle',
        stock: 12,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 5,
        name: 'Denim Pinafore Dress',
        price: convertToINR(19.99),
        images: ['https://i.pinimg.com/originals/4f/1c/7e/4f1c7edd51fb92222f282d03f0871936.jpg'],
        rating: 4.4,
        discount: 0,
        category: 'dresses',
        pattern: 'denim',
        brand: 'DenimWear',
        stock: 10,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 6,
        name: 'Printed Cotton T-Shirt',
        price: convertToINR(7.99),
        images: ['https://assets.myntassets.com/h_200,w_200,c_fill,g_auto/h_1440,q_100,w_1080/v1/assets/images/29490844/2024/5/11/55863cee-6c8c-4c6c-8e81-60c2f0d573c91715423030221MonteCarloPrintTop1.jpg'],
        rating: 4.3,
        discount: 15,
        category: 'tops',
        pattern: 'printed',
        brand: 'MonteCarlo',
        stock: 25,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 7,
        name: 'Ruffled Blouse',
        price: convertToINR(12.99),
        images: ['https://cdnb.lystit.com/photos/2012/07/07/brooks-brothers-white-noniron-cotton-ruffle-blouse-with-xla-product-1-4115777-803265422.jpeg'],
        rating: 4.5,
        discount: 0,
        category: 'tops',
        pattern: 'ruffled',
        brand: 'Brooks Brothers',
        stock: 18,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 8,
        name: 'Sleeveless Crop Top',
        price: convertToINR(8.99),
        images: ['https://academy.scene7.com/is/image/academy/20891745?$pdp-gallery-ng$'],
        rating: 4.1,
        discount: 10,
        category: 'tops',
        pattern: 'solid',
        brand: 'TrendyFit',
        stock: 22,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 9,
        name: 'Striped Off-Shoulder Top',
        price: convertToINR(11.99),
        images: ['http://img.shein.com/images/shein.com/201609/43/14748542626230334483.jpg'],
        rating: 4.4,
        discount: 0,
        category: 'tops',
        pattern: 'striped',
        brand: 'SheIn',
        stock: 14,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 10,
        name: 'Plaid Button-Down Shirt',
        price: convertToINR(14.99),
        images: ['https://i.pinimg.com/originals/0f/be/1c/0fbe1ca641a8e65e647b84dbc0cb04e4.png'],
        rating: 4.6,
        discount: 10,
        category: 'tops',
        pattern: 'plaid',
        brand: 'ClassicWear',
        stock: 16,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 11,
        name: 'Geometric Pattern Blouse',
        price: convertToINR(16.99),
        images: ['https://m.media-amazon.com/images/I/61Jk8gZ+nIL._AC_UY1100_.jpg'],
        rating: 4.3,
        discount: 0,
        category: 'tops',
        pattern: 'geometric',
        brand: 'GeoStyle',
        stock: 20,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 12,
        name: 'Pleated School Skirt',
        price: convertToINR(14.99),
        images: ['https://m.media-amazon.com/images/I/61fSRtbAFNL._AC_UY1100_.jpg'],
        rating: 4.6,
        discount: 0,
        category: 'skirts',
        pattern: 'pleated',
        brand: 'SchoolWear',
        stock: 30,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 13,
        name: 'Denim Mini Skirt',
        price: convertToINR(11.99),
        images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop'],
        rating: 4.2,
        discount: 12,
        category: 'skirts',
        pattern: 'denim',
        brand: 'DenimStyle',
        stock: 18,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 14,
        name: 'Tiered Floral Skirt',
        price: convertToINR(17.99),
        images: ['https://m.media-amazon.com/images/I/71Hn7QOZfEL._AC_UY1100_.jpg'],
        rating: 4.5,
        discount: 0,
        category: 'skirts',
        pattern: 'floral',
        brand: 'FloralWear',
        stock: 14,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 15,
        name: 'Tartan Pattern Skirt',
        price: convertToINR(15.99),
        images: ['https://m.media-amazon.com/images/I/71KjHf0YJKL._AC_UY1100_.jpg'],
        rating: 4.3,
        discount: 5,
        category: 'skirts',
        pattern: 'tartan',
        brand: 'ClassicWear',
        stock: 12,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 16,
        name: 'Anarkali Suit Set',
        price: convertToINR(29.99),
        images: ['https://images.unsplash.com/photo-1595341595379-cf0f2a7ab4a4?w=500&auto=format&fit=crop'],
        rating: 4.8,
        discount: 0,
        category: 'ethnicwear',
        pattern: 'embroidered',
        brand: 'EthnicElegance',
        stock: 8,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 17,
        name: 'Lehenga Choli Set',
        price: convertToINR(49.99),
        images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop'],
        rating: 4.9,
        discount: 15,
        category: 'lehengas',
        pattern: 'zari',
        brand: 'RoyalLehenga',
        stock: 5,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 18,
        name: 'Kurta with Palazzo',
        price: convertToINR(19.99),
        images: ['https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=500&auto=format&fit=crop'],
        rating: 4.5,
        discount: 0,
        category: 'suits',
        pattern: 'printed',
        brand: 'ComfortWear',
        stock: 12,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 19,
        name: 'Banarasi Silk Saree',
        price: convertToINR(59.99),
        images: ['https://www.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/w/sw-l-10465-maroon-and-golden-embroidered-net-lehenga-choli.jpg'],
        rating: 4.9,
        discount: 0,
        category: 'ethnicwear',
        pattern: 'banarasi',
        brand: 'Banarasi',
        stock: 7,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 20,
        name: 'Kalamkari Printed Suit',
        price: convertToINR(24.99),
        images: ['https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg'],
        rating: 4.7,
        discount: 10,
        category: 'suits',
        pattern: 'kalamkari',
        brand: 'HandCrafted',
        stock: 10,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 21,
        name: 'Bandhani Lehenga',
        price: convertToINR(39.99),
        images: ['https://www.utsavfashion.com/media/catalog/product/cache/1/image/500x/040ec09b1e35df139433887a97daa66f/s/w/sw-l-10465-maroon-and-golden-embroidered-net-lehenga-choli.jpg'],
        rating: 4.8,
        discount: 0,
        category: 'lehengas',
        pattern: 'bandhani',
        brand: 'RoyalLehenga',
        stock: 5,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 22,
        name: 'Phulkari Dupatta Set',
        price: convertToINR(17.99),
        images: ['https://5.imimg.com/data5/SELLER/Default/2021/12/QO/YD/JA/3033183/women-s-printed-suit.jpg'],
        rating: 4.6,
        discount: 0,
        category: 'ethnicwear',
        pattern: 'phulkari',
        brand: 'EthnicElegance',
        stock: 10,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 23,
        name: 'Woolen Sweater',
        price: convertToINR(22.99),
        images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4iZ7RHloK-eEUU-EVu1rd7KzNgTM_CStu88RMOuVRVvrz2sy_x5F3KkItuIr-SGZhq5I&usqp=CAU'],
        rating: 4.3,
        discount: 10,
        category: 'winterwear',
        pattern: 'cable-knit',
        brand: 'WinterCozy',
        stock: 12,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 24,
        name: 'Padded Jacket',
        price: convertToINR(34.99),
        images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&auto=format&fit=crop'],
        rating: 4.6,
        discount: 0,
        category: 'winterwear',
        pattern: 'quilted',
        brand: 'WinterCozy',
        stock: 8,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 25,
        name: 'Fair Isle Pattern Sweater',
        price: convertToINR(27.99),
        images: ['https://m.media-amazon.com/images/I/71KjHf0YJKL._AC_UY1100_.jpg'],
        rating: 4.5,
        discount: 0,
        category: 'winterwear',
        pattern: 'fair-isle',
        brand: 'WinterCozy',
        stock: 10,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 26,
        name: 'Houndstooth Coat',
        price: convertToINR(39.99),
        images: ['https://m.media-amazon.com/images/I/61vHX6TlTPL._AC_UY1100_.jpg'],
        rating: 4.7,
        discount: 15,
        category: 'winterwear',
        pattern: 'houndstooth',
        brand: 'WinterCozy',
        stock: 7,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 27,
        name: 'Hair Clips Set',
        price: convertToINR(4.99),
        images: ['https://images.unsplash.com/photo-1607602132700-0681204692c5?w=500&auto=format&fit=crop'],
        rating: 4.2,
        discount: 0,
        category: 'accessories',
        pattern: 'floral',
        brand: 'TrendyHair',
        stock: 50,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 28,
        name: 'Printed Scrunchies',
        price: convertToINR(3.99),
        images: ['https://images.unsplash.com/photo-1607602132863-4c6c92a1e20e?w=500&auto=format&fit=crop'],
        rating: 4.0,
        discount: 5,
        category: 'accessories',
        pattern: 'printed',
        brand: 'TrendyHair',
        stock: 45,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 29,
        name: 'Polka Dot Party Dress',
        price: convertToINR(22.99),
        images: ['https://m.media-amazon.com/images/I/61DvVQH5VCL._AC_UY1100_.jpg'],
        rating: 4.6,
        discount: 15,
        category: 'dresses',
        pattern: 'polka-dot',
        brand: 'PartyWear',
        stock: 8,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 30,
        name: 'Tie-Dye Maxi Dress',
        price: convertToINR(18.99),
        images: ['https://m.media-amazon.com/images/I/71Hn7QOZfEL._AC_UY1100_.jpg'],
        rating: 4.3,
        discount: 0,
        category: 'dresses',
        pattern: 'tie-dye',
        brand: 'SummerStyle',
        stock: 10,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 31,
        name: 'Chevron Pattern Dress',
        price: convertToINR(16.99),
        images: ['https://m.media-amazon.com/images/I/61Jk8gZ+nIL._AC_UY1100_.jpg'],
        rating: 4.5,
        discount: 10,
        category: 'dresses',
        pattern: 'chevron',
        brand: 'FashionHub',
        stock: 12,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 32,
        name: 'Animal Print Dress',
        price: convertToINR(21.99),
        images: ['https://m.media-amazon.com/images/I/61vHX6TlTPL._AC_UY1100_.jpg'],
        rating: 4.4,
        discount: 0,
        category: 'dresses',
        pattern: 'animal-print',
        brand: 'WildStyle',
        stock: 9,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 33,
        name: 'Designer Handbag',
        price: convertToINR(39.99),
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop'],
        rating: 4.4,
        discount: 0,
        category: 'accessories',
        pattern: 'embossed',
        brand: 'LuxuryBag',
        stock: 15,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 34,
        name: 'Paisley Print Scarf',
        price: convertToINR(8.99),
        images: ['https://m.media-amazon.com/images/I/61Jk8gZ+nIL._AC_UY1100_.jpg'],
        rating: 4.3,
        discount: 0,
        category: 'accessories',
        pattern: 'paisley',
        brand: 'FashionScarf',
        stock: 20,
        status: 'Active',
        isApiProduct: false
    },
    {
        id: 35,
        name: 'Zigzag Pattern Socks',
        price: convertToINR(5.99),
        images: ['https://m.media-amazon.com/images/I/61f+4SdZbIL._AC_UY1100_.jpg'],
        rating: 4.1,
        discount: 10,
        category: 'accessories',
        pattern: 'zigzag',
        brand: 'HappyFeet',
        stock: 30,
        status: 'Active',
        isApiProduct: false
    }

];

const sliderItems = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop',
        title: 'Summer Collection',
        subtitle: 'Up to 50% off on dresses & tops',
        link: '/summer-sale',
        buttonText: 'Shop Now',
        theme: 'summer'
    },
    {
        id: 2,
        image: 'https://i.pinimg.com/736x/d0/78/70/d078705c172a131d88c67bd19986172d.jpg',
        title: 'Ethnic Wear',
        subtitle: 'New traditional designs for festive season',
        link: '/ethnic-wear',
        buttonText: 'Explore',
        theme: 'ethnic'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&auto=format&fit=crop',
        title: 'Winter Special',
        subtitle: 'Cozy winter outfits to keep you warm',
        link: '/winter-collection',
        buttonText: 'View Collection',
        theme: 'winter'
    },
    {
        id: 4,
        image: 'https://www.andindia.com/on/demandware.static/-/Sites-AND-Library/default/dwf51e2df3/images/May%202025/PLP%20New%20Arrivals.jpg',
        title: 'New Arrivals',
        subtitle: 'Fresh styles for the season',
        link: '/new-arrivals',
        buttonText: 'Discover Now',
        theme: 'new'
    },
    {
        id: 5,
        image: 'https://cdn.shopify.com/s/files/1/0341/4805/7228/files/Bakra_Eid.jpg?v=1746708452',
        title: 'Festive Special',
        subtitle: 'Exclusive festive collection with 30% off',
        link: '/festive-collection',
        buttonText: 'Shop Festive',
        theme: 'festive'
    },
    {
        id: 6,
        image: 'https://www.fashiongonerogue.com/wp-content/uploads/2021/12/Mannequins-Womens-Clothing-Store-Red-Palette.jpg',
        title: 'Pattern Paradise',
        subtitle: 'Explore our vibrant patterned collection',
        link: '/patterned-collection',
        buttonText: 'Explore Patterns',
        theme: 'patterns'
    }
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [apiProducts, setApiProducts] = useState([]);
    const [mergedProducts, setMergedProducts] = useState([]);
    const navigate = useNavigate();
    const testimonialsScrollRef = useRef(null);
    const API = "http://localhost:5000"; // backend URL

    // ✅ Product image formatter
    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].startsWith("http")
                ? product.images[0]
                : `${API}${product.images[0]}`;
        }
        if (product.image) {
            return product.image.startsWith("http")
                ? product.image
                : `${API}${product.image}`;
        }
        return "https://via.placeholder.com/300x300?text=No+Image";
    };

    useEffect(() => {
        axios
            .get(`${API}/api/products`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    const sanitized = res.data.map((p, index) => {
                        const productImage =
                            Array.isArray(p.images) && p.images.length > 0
                                ? p.images[0] // ✅ backend se first image
                                : getFallbackProductImage(p.category);

                        return {
                            id: p.id || `api-${index}`,
                            name: p.name || "No Name",
                            description: p.description || "",
                            price: Number(p.price) || 0,
                            category: p.category || "General",
                            pattern: p.pattern || "N/A",
                            rating: p.rating || 0,
                            discount: p.discount || 0,
                            stock: p.stock || 0,
                            brand: p.brand || "Unknown",
                            status: p.status || "active",
                            image: productImage, // ✅ sirf ek image
                            images: p.images || [], // ✅ detail page ke liye pura array
                            isApiProduct: true,
                        };
                    });
                    setApiProducts(sanitized);
                }
            })
            .catch((err) => {
                console.error("❌ Fetch error:", err);
                setApiProducts([]);
            });
    }, []);

    // ✅ Merge API + Manual Products
    useEffect(() => {
        if (apiProducts.length > 0) {
            const filteredManual = manualProducts.filter(
                (manualP) =>
                    !apiProducts.some(
                        (apiP) =>
                            apiP.name.toLowerCase() === manualP.name.toLowerCase() &&
                            apiP.category.toLowerCase() === manualP.category.toLowerCase()
                    )
            );

            const combined = [
                ...apiProducts.map((p) => ({
                    ...p,
                    image: p.image || getFallbackProductImage(p.category), // ✅ direct image
                })),
                ...filteredManual.map((p) => ({
                    ...p,
                    image: p.image || getFallbackProductImage(p.category),
                    isApiProduct: false,
                })),
            ];

            setMergedProducts(combined);

            const uniqueCategories = [...new Set(combined.map((p) => p.category))];
            setCategories(uniqueCategories);
        } else {
            const fallbackManual = manualProducts.map((p) => ({
                ...p,
                image: p.image || getFallbackProductImage(p.category),
                isApiProduct: false,
            }));

            setMergedProducts(fallbackManual);

            const uniqueCategories = [...new Set(fallbackManual.map((p) => p.category))];
            setCategories(uniqueCategories);
        }
    }, [apiProducts]);

    // Scroll functions
    const scrollLeft = () => {
        if (testimonialsScrollRef.current) {
            testimonialsScrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (testimonialsScrollRef.current) {
            testimonialsScrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    // Image loading and progress
    useEffect(() => {
        const totalImages = mergedProducts.length + sliderItems.length + categories.length;
        if (totalImages === 0) return;

        let loaded = 0;

        const onLoad = () => {
            loaded++;
            setProgress(Math.round((loaded / totalImages) * 100));
            if (loaded >= totalImages) {
                setImagesLoaded(true);
            }
        };

        categories.forEach(category => {
            const img = new Image();
            img.src = getCategoryImage(category);
            img.onload = onLoad;
            img.onerror = onLoad;
        });

        mergedProducts.forEach(product => {
            const img = new Image();
            img.src = product.image;
            img.onload = onLoad;
            img.onerror = () => {
                img.src = getFallbackProductImage(product.category);
                onLoad();
            };
        });

        sliderItems.forEach(item => {
            const img = new Image();
            img.src = item.image;
            img.onload = onLoad;
            img.onerror = onLoad;
        });
    }, [mergedProducts, categories]);

    useEffect(() => {
        if (!imagesLoaded) return;

        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [imagesLoaded]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        if (!autoPlay || isLoading) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [autoPlay, isLoading]);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % sliderItems.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length);
    }, []);

    const goToSlide = useCallback(index => {
        setCurrentSlide(index);
    }, []);

    const toggleAutoPlay = useCallback(() => {
        setAutoPlay(prev => !prev);
    }, []);

    const navigateTo = useCallback(path => {
        navigate(path);
    }, [navigate]);

    const handleAddToCart = (product) => {
        if (!isLoggedIn) {
            alert('Please login to add items to the cart.');
            navigate('/login');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.id === product.id);

        if (index !== -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    };

    const filterProducts = (pattern) => {
        setActiveFilter(pattern);
    };

    const getFilteredProducts = () => {
        if (activeFilter === 'all') return mergedProducts;
        return mergedProducts.filter(product => product.pattern === activeFilter);
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <h1 className="brand-name">Pankhudi</h1>
                    <div className="loading-spinner"></div>
                    <div className="loading-progress-bar">
                        <div className="loading-progress" style={{ width: `${progress}%` }} />
                    </div>
                    <p>Loading your fashion world... {progress}%</p>
                    {progress < 100 && (
                        <p className="slow-internet-warning">Loading images... This may take longer on slow connections.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="home-main">
                <section className="hero-section">
                    <div className="slider-container">
                        <button className="slider-btn left" onClick={prevSlide} aria-label="Previous slide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                            </svg>
                        </button>

                        <div className="slider-wrapper">
                            <div
                                className="slider-track"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {sliderItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`slide ${index === currentSlide ? 'active' : ''} ${item.theme}`}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            onClick={() => navigateTo(item.link)}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/1200x500?text=Pankhudi+Banner';
                                            }}
                                        />
                                        <div className="slide-content">
                                            <h2>{item.title}</h2>
                                            <p>{item.subtitle}</p>
                                            <button
                                                className="slide-button"
                                                onClick={() => navigateTo(item.link)}
                                            >
                                                {item.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="slider-btn right" onClick={nextSlide} aria-label="Next slide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                        </button>
                    </div>

                    <div className="slider-dots">
                        {sliderItems.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button className="auto-play-toggle" onClick={toggleAutoPlay}>
                        {autoPlay ? '❚❚' : '▶'}
                    </button>
                </section>

                <section id="categories-section" className="categories-section">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <button
                            className="view-all-btn"
                            onClick={() => navigateTo('/categories')}
                        >
                            View All
                            <span className="arrow-icon">→</span>
                        </button>
                    </div>
                    <div className="categories-container">
                        <div className="categories-grid">
                            {categories.map((category, index) => (
                                <div
                                    key={index}
                                    className="category-card"
                                    onClick={() => navigateTo(`/category/${category}`)}
                                >
                                    <div className="category-image-container">
                                        <img
                                            src={getCategoryImage(category)}
                                            alt={category}
                                            loading="lazy"
                                            className="category-image"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Category+Image';
                                            }}
                                        />
                                        <div className="category-overlay">
                                            <button className="shop-now-btn">
                                                Shop Now
                                                <span className="btn-arrow">→</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="pattern-filter-section">
                    <h3>Shop by Pattern</h3>
                    <div className="pattern-filters">
                        <button
                            className={`pattern-filter ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => filterProducts('all')}
                        >
                            All
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'floral' ? 'active' : ''}`}
                            onClick={() => filterProducts('floral')}
                        >
                            Floral
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'striped' ? 'active' : ''}`}
                            onClick={() => filterProducts('striped')}
                        >
                            Striped
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'polka-dot' ? 'active' : ''}`}
                            onClick={() => filterProducts('polka-dot')}
                        >
                            Polka Dot
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'geometric' ? 'active' : ''}`}
                            onClick={() => filterProducts('geometric')}
                        >
                            Geometric
                        </button>
                        <button
                            className={`pattern-filter ${activeFilter === 'embroidered' ? 'active' : ''}`}
                            onClick={() => filterProducts('embroidered')}
                        >
                            Ethnic
                        </button>
                    </div>
                </section>

                <section className="featured-section">
                    <div className="section-header">
                        <h2>All Products</h2>
                        <button className="view-all" onClick={() => navigateTo("/products")}>
                            View All
                        </button>
                    </div>

                    <div className="products-grid">
                        {getFilteredProducts().map((product, index) => (
                            <div
                                key={index}
                                className={`product-card ${product.isApiProduct ? "api-product" : ""}`}
                                onMouseEnter={() => setHoveredProduct(product.id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                {/* 🔥 Badges */}
                                {product.isApiProduct && <span className="api-badge">New</span>}
                                {product.discount && (
                                    <span className="discount-badge">-{product.discount}%</span>
                                )}

                                {/* 🔥 Product Image */}
                                <div className="product-image">
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = getFallbackProductImage(product.category);
                                        }}
                                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                    />

                                    <button
                                        className={`quick-view ${hoveredProduct === product.id ? "visible" : ""
                                            }`}
                                        onClick={() => navigate(`/ProductDetail/${product.id}`)}
                                    >
                                        Quick View
                                    </button>
                                    {product.pattern && (
                                        <span className="product-pattern">{product.pattern}</span>
                                    )}
                                </div>

                                {/* 🔥 Product Info */}
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="brand">Brand: {product.brand || "N/A"}</p>

                                    {/* Price Section */}
                                    <div className="price-container">
                                        {product.discount ? (
                                            <>
                                                <span className="original-price">₹{product.price}</span>
                                                <span className="discounted-prices">
                                                    ₹
                                                    {Math.round(
                                                        product.price * (1 - product.discount / 100)
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="prices">₹{product.price}</span>
                                        )}
                                    </div>

                                    {/* Ratings */}
                                    <div className="product-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={
                                                    i < Math.floor(product.rating) ? "star filled" : "star"
                                                }
                                            >
                                                {i < Math.floor(product.rating) ? "★" : "☆"}
                                            </span>
                                        ))}
                                        <span>({product.rating?.toFixed(1) || "0.0"})</span>
                                    </div>

                                    {/* Stock and Status */}
                                    <div className="product-meta">
                                        <p className="stock">
                                            <span className="meta-label">Stock:</span>
                                            <span
                                                className={`stock-value ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}
                                            >
                                                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                                            </span>
                                        </p>
                                        <p className="status">
                                            <span className="meta-label">Status:</span>
                                            <span className={`status-value ${product.status === "Active" ? "active" : "inactive"}`}>
                                                {product.status || "Active"}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        className={`add-to-cart ${product.stock <= 0 ? "disabled" : ""}`}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock <= 0}
                                    >
                                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>




                <section className="offer-banner">
                    <div className="offer-content">
                        <h3>Limited Time Offer</h3>
                        <h2>Get 30% Off On All Ethnic Wear</h2>
                        <p>Use code: PANKHUDI30</p>
                        <button
                            className="offer-button"
                            onClick={() => navigateTo('/special-offer')}
                        >
                            Shop Now
                        </button>
                    </div>
                </section>

                <section className="trending-section">
                    <div className="section-header">
                        <h2>Trending Now</h2>
                        <button
                            className="view-all"
                            onClick={() => navigateTo('/trending')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="trending-grid">
                        {mergedProducts
                            .filter(p => p.rating >= 3.5)
                            .slice(0, 5)
                            .map((product, index) => (
                                <div key={index} className="trending-card">
                                    <div className="trending-image">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = getFallbackProductImage(product.category);
                                            }}
                                            onClick={() => navigateTo(`/ProductDetail/${product.id}`)}
                                        />
                                        <span className="trending-pattern">{product.pattern}</span>
                                    </div>
                                    <div className="trending-info">
                                        <h3>{product.name}</h3>
                                        <div className="trending-price">
                                            {product.discount ? (
                                                <>
                                                    <span className="original">₹{product.price}</span>
                                                    <span>₹{Math.round(product.price * (1 - product.discount / 100))}</span>
                                                </>
                                            ) : (
                                                <span>₹{product.price}</span>
                                            )}
                                        </div>
                                        <div className="trending-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                                                >
                                                    {i < Math.floor(product.rating) ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>

                <section className="pattern-showcase">
                    <div className="pattern-header">
                        <h2>Our Pattern Collection</h2>
                        <p>Discover beautiful Indian patterns</p>
                    </div>

                    <div className="pattern-slider">
                        <div className="pattern-slide" onClick={() => filterProducts('floral')}>
                            <div className="slide-content">
                                <h3>Floral</h3>
                                <p>Elegant flower designs</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('geometric')}>
                            <div className="slide-content">
                                <h3>Geometric</h3>
                                <p>Modern shapes & patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('ethnic')}>
                            <div className="slide-content">
                                <h3>Ethnic</h3>
                                <p>Traditional Indian motifs</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('striped')}>
                            <div className="slide-content">
                                <h3>Striped</h3>
                                <p>Classic stripe patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('polka-dot')}>
                            <div className="slide-content">
                                <h3>Polka Dot</h3>
                                <p>Playful dot patterns</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('paisley')}>
                            <div className="slide-content">
                                <h3>Paisley</h3>
                                <p>Traditional teardrop motifs</p>
                            </div>
                        </div>

                        <div className="pattern-slide" onClick={() => filterProducts('ikat')}>
                            <div className="slide-content">
                                <h3>Ikat</h3>
                                <p>Resist dyeing technique</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="testimonials-section">
                    <div className="testimonials-header">
                        <h2>What Our Customers Say</h2>
                        <p>Hear from our satisfied customers across India</p>
                    </div>

                    <div className="testimonials-container">
                        <button className="scroll-btn scroll-left" onClick={scrollLeft}>
                            ‹
                        </button>

                        <div className="testimonials-scroll-container">
                            <div className="testimonials-scroll" ref={testimonialsScrollRef}>
                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"The floral dress I bought is absolutely beautiful! The quality exceeded my expectations and the fit was perfect for Indian weddings."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW5kaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
                                            alt="Priya Sharma"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Priya Sharma</span>
                                            <span className="author-location">Mumbai, Maharashtra</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Great collection of ethnic wear. The delivery was fast and the packaging was excellent. Perfect for festival season!"</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1516726817505-5ed934c485c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGluZGlhbiU20wd29tYW58ZW58MHx8MHx8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Ananya Patel"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Ananya Patel</span>
                                            <span className="author-location">Ahmedabad, Gujarat</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★☆
                                        <span className="rating-text">4.5</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Love the variety of patterns available. The customer service is top-notch! Will definitely shop again."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVyc29ufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Meera Gupta"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Meera Gupta</span>
                                            <span className="author-location">Delhi, NCR</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"The silk sarees are absolutely authentic and the embroidery work is exquisite. Perfect for traditional occasions!"</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGluZGlhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Sneha Reddy"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Sneha Reddy</span>
                                            <span className="author-location">Hyderabad, Telangana</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★☆
                                        <span className="rating-text">4.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Amazing quality and authentic Indian designs. The colors are vibrant and the fabric is comfortable."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aW5kaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
                                            alt="Divya Singh"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Divya Singh</span>
                                            <span className="author-location">Lucknow, Uttar Pradesh</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="testimonial-card">
                                    <div className="testimonial-rating">
                                        ★★★★★
                                        <span className="rating-text">5.0</span>
                                    </div>
                                    <div className="testimonial-content">
                                        <p>"Fast shipping and excellent customer support. The products are exactly as shown in the pictures."</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <img
                                            src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGluZGlhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                                            alt="Riya Malhotra"
                                        />
                                        <div className="author-info">
                                            <span className="author-name">Riya Malhotra</span>
                                            <span className="author-location">Chandigarh, Punjab</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="scroll-btn scroll-right" onClick={scrollRight}>
                            ›
                        </button>
                    </div>
                </section>

                <section className="newsletter-section">
                    <div className="newsletter-container">
                        <div className="newsletter-text">
                            <h3>Subscribe to Our Newsletter</h3>
                            <p>Get updates on special offers and new collections</p>
                            <div className="newsletter-benefits">
                                <span>✔ Exclusive discounts</span>
                                <span>✔ Early access to sales</span>
                                <span>✔ Style tips & trends</span>
                            </div>
                        </div>
                        <form
                            className="newsletter-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Thank you for subscribing!');
                            }}
                        >
                            <input
                                type="email"
                                placeholder="Your email address"
                                required
                            />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </section>

            </main>
            <Footer />
            <ChatBot isPremium={true} />
        </>
    );
};

export default Home;