import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import './styles/home-page-styles.css';

const products = [
    {
        id: 1,
        name: "Roselle Bloom Midi Dress",
        price: 45,
        tag: "Out of Stock",
        color: "#c9c9c9",
        description: "Romantic layered floral embroidery with puff sleeves",
        img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
        category: "Dresses",
    },
    {
        id: 2,
        name: "Sable Tailored Coat",
        price: 60,
        tag: "New",
        color: "#7a6a5a",
        description: "Clean lines, minimal buttons, structured shoulders",
        img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
        category: "Outerwear",
    },
    {
        id: 3,
        name: "Horizon Stretch Long Sleeve",
        price: 68,
        tag: "Bestseller",
        color: "#c07a3a",
        description: "Lightweight and flexible, chasing every horizon",
        img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
        category: "Tops",
    },
    {
        id: 4,
        name: "Sage Elegance Wrap Top",
        price: 28,
        tag: "Popular",
        color: "#7a8c6a",
        description: "Calming sage tone with adjustable waist tie",
        img: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&q=80",
        category: "Tops",
    },
    {
        id: 5,
        name: "Earthline Box Pants",
        price: 99,
        tag: "New",
        color: "#8c7a5a",
        description: "High-waisted square-cut trouser in warm brown tones",
        img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
        category: "Bottoms",
    },
    {
        id: 6,
        name: "Morning Light Shorts",
        price: 78,
        tag: "Limited",
        color: "#a09070",
        description: "Golden-brown hue, subtle pleating detail",
        img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=600&q=80",
        category: "Bottoms",
    },
];

const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear"];

const heroSlides = [
    {
        headline: "Dressed in\nDiscipline.",
        sub: "Fall / Winter Collection 2025",
        accent: "#c8b89a",
        bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",
    },
    {
        headline: "Wear Your\nStory.",
        sub: "Curated Essentials for the Modern Woman",
        accent: "#a8b8aa",
        bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
    },
    {
        headline: "Effortless\nElegance.",
        sub: "Timeless Pieces, Thoughtful Design",
        accent: "#c0a898",
        bg: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80",
    },
];

export const HomePage = () => {
    const [activeCategory, setActiveCategory] = useState("All");
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroVisible, setHeroVisible] = useState(true);
    const intervalRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setHeroVisible(false);
            setTimeout(() => {
                setHeroIndex((i) => (i + 1) % heroSlides.length);
                setHeroVisible(true);
            }, 600);
        }, 5000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const filtered =
        activeCategory === "All"
            ? products
            : products.filter((p) => p.category === activeCategory);

    const slide = heroSlides[heroIndex];

    return (
        <React.Fragment>
            <div className="ec-root">
                {/* NAV */}
                <nav className="ec-nav">
                    <div className="ec-nav-logo">Estrada <span>Closet</span> Co.</div>
                    <ul className="ec-nav-links">
                        {["New In", "Collections", "Dresses", "Tops", "Bottoms"].map((l) => (
                            <li key={l}><a href="/main">{l}</a></li>
                        ))}
                    </ul>
                    <div className="ec-nav-right">
                        <button className="ec-cart-btn" onClick={() => navigate('/cart')}>
                            🛒
                        </button>
                    </div>
                </nav>

                {/* HERO */}
                <section className="ec-hero">
                    <div
                        className="ec-hero-bg"
                        style={{
                            backgroundImage: `url(${slide.bg})`,
                            opacity: heroVisible ? 1 : 0,
                        }}
                    />
                    <div className="ec-hero-overlay" />
                    <div
                        className="ec-hero-content"
                        style={{
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                        }}
                    >
                        <p className="ec-hero-eyebrow">{slide.sub}</p>
                        <h1 className="ec-hero-headline">{slide.headline}</h1>
                        <button className="ec-hero-cta" onClick={() => navigate('/main')}>
                            Shop the Look &nbsp;→
                        </button>
                    </div>

                    <div className="ec-hero-dots">
                        {heroSlides.map((_, i) => (
                            <div
                                key={i}
                                className={`ec-hero-dot ${i === heroIndex ? "active" : ""}`}
                                onClick={() => {
                                    setHeroVisible(false);
                                    setTimeout(() => { setHeroIndex(i); setHeroVisible(true); }, 400);
                                }}
                            />
                        ))}
                    </div>

                    <div className="ec-hero-scroll">Scroll</div>
                </section>

                {/* MARQUEE */}
                <div className="ec-marquee-wrap">
                    <div className="ec-marquee-track">
                        {Array(8).fill(["New Arrivals", "Free Shipping Over ₱500", "Sustainably Made", "Estrada Closet Co.", "Fall Collection 2025"]).flat().map((t, i) => (
                            <span className="ec-marquee-item" key={i}>{t}</span>
                        ))}
                    </div>
                </div>

                {/* FEATURED PRODUCTS */}
                <section className="ec-section">
                    <div className="ec-section-header">
                        <div>
                            <p className="ec-section-label">Curated for You</p>
                            <h2 className="ec-section-title">Featured <em>Pieces</em></h2>
                        </div>
                        <button className="ec-view-all">View All Collection</button>
                    </div>

                    <div className="ec-filters">
                        {categories.map((c) => (
                            <button
                                key={c}
                                className={`ec-filter-btn ${activeCategory === c ? "active" : ""}`}
                                onClick={() => setActiveCategory(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="ec-grid">
                        {filtered.map((p) => (
                            <div key={p.id} className="ec-card">
                                <div className="ec-card-img-wrap">
                                    <img
                                        className="ec-card-img"
                                        src={p.img}
                                        alt={p.name}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.parentNode.style.background = p.color + "55";
                                        }}
                                    />
                                    <div className="ec-card-overlay">
                                        <button className="ec-card-quick" onClick={() => navigate('/main')}>
                                            View Product
                                        </button>
                                    </div>
                                    <span className={`ec-card-tag ${p.tag === "Out of Stock" ? "out" :
                                            p.tag === "Bestseller" ? "bestseller" :
                                                p.tag === "Limited" ? "limited" :
                                                    p.tag === "Popular" ? "popular" : "new"
                                        }`}>{p.tag}</span>
                                </div>
                                <div className="ec-card-body">
                                    <span className="ec-card-category">{p.category}</span>
                                    <div className="ec-card-name">{p.name}</div>
                                    <p className="ec-card-desc">{p.description}</p>
                                    <div className="ec-card-footer">
                                        <span className="ec-card-price">₱{p.price}.00</span>
                                        <button
                                            className="ec-card-add"
                                            onClick={() => navigate('/main')}
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* EDITORIAL BANNER */}
                <div className="ec-editorial">
                    <div className="ec-editorial-img">
                        <img
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                            alt="Editorial"
                        />
                    </div>
                    <div className="ec-editorial-text">
                        <p className="ec-editorial-eyebrow">The Estrada Edit</p>
                        <h3 className="ec-editorial-headline">
                            Clothes That<br /><em>Move With You</em>
                        </h3>
                        <p className="ec-editorial-body">
                            Every piece in our collection is designed with the modern woman in mind — versatile, refined, and built to last beyond the season.
                        </p>
                        <button className="ec-editorial-btn" onClick={() => navigate('/main')}>
                            Explore the Story →
                        </button>
                    </div>
                </div>

                {/* LOOKBOOK */}
                <section className="ec-lookbook">
                    <div className="ec-section-header">
                        <div>
                            <p className="ec-section-label">Visual Stories</p>
                            <h2 className="ec-section-title">The <em>Lookbook</em></h2>
                        </div>
                        <button className="ec-view-all">See All Looks</button>
                    </div>
                    <div className="ec-lookbook-grid">
                        {[
                            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
                            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
                            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
                            "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80",
                            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
                        ].map((src, i) => (
                            <div key={i} className="ec-look-item" onClick={() => navigate('/main')}>
                                <img src={src} alt={`Look ${i + 1}`} />
                                <div className="ec-look-overlay">
                                    <span className="ec-look-label">Look {i + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* NEWSLETTER */}
                <section className="ec-newsletter">
                    <p className="ec-newsletter-label">Stay in the loop</p>
                    <h2 className="ec-newsletter-title">Join the Inner Circle</h2>
                    <p className="ec-newsletter-sub">
                        Be the first to know about new arrivals, exclusive offers, and style notes from the Estrada team.
                    </p>
                    <div className="ec-newsletter-form">
                        <input
                            className="ec-newsletter-input"
                            type="email"
                            placeholder="Your email address"
                        />
                        <button className="ec-newsletter-submit">Subscribe</button>
                    </div>
                </section>

                {/* FOOTER */}
                <footer>
                    <div className="ec-footer">
                        <div>
                            <div className="ec-footer-brand">Estrada Closet Co.</div>
                            <p className="ec-footer-tagline">
                                Timeless Filipino fashion, crafted for the woman who moves with intention.
                            </p>
                        </div>
                        {[
                            { title: "Shop", links: ["New Arrivals", "Dresses", "Tops", "Bottoms", "Outerwear", "Sale"] },
                            { title: "Help", links: ["Size Guide", "Returns", "Shipping Info", "Contact Us", "FAQ"] },
                            { title: "Company", links: ["About Us", "Sustainability", "Careers", "Press", "Stockists"] },
                        ].map((col) => (
                            <div key={col.title}>
                                <p className="ec-footer-col-title">{col.title}</p>
                                <ul className="ec-footer-links">
                                    {col.links.map((l) => <li key={l}><a href="/main">{l}</a></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="ec-footer-bottom">
                        <span className="ec-footer-copy">© 2025 Estrada Closet Co. All rights reserved.</span>
                        <span className="ec-footer-copy">Made with love in the Philippines 🇵🇭</span>
                    </div>
                </footer>

                {/* TOAST */}
                <div className="ec-toast">Enjoy viewing our Estrada Closet Co.</div>
            </div>
        </React.Fragment>
    );
}