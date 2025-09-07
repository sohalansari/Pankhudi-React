import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

const About = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        // Check local storage or system preference for dark mode
        const savedMode = localStorage.getItem("darkMode");
        return savedMode ? JSON.parse(savedMode) : window.matchMedia("(prefers-color-scheme: dark)").matches;
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const sectionRefs = useRef([]);

    // Set dark mode preference in localStorage
    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

    // Intersection Observer for scroll animations
    useEffect(() => {
        setIsVisible(true);

        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.15
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        sectionRefs.current.forEach(section => {
            if (section) observer.observe(section);
        });

        // Add scroll event listener for parallax effect
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll(".parallax");
            parallaxElements.forEach((elem) => {
                const speed = 0.4;
                elem.style.transform = `translateY(${scrolled * speed}px)`;
            });
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }
        if (!formData.message.trim()) errors.message = "Message is required";

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);

        // Simulate form submission
        try {
            // In a real application, you would make an API call here
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert("Thank you for your message! We'll get back to you soon.");
            setFormData({ name: "", email: "", message: "" });
        } catch (error) {
            alert("There was an error sending your message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add ref to each section
    const addToRefs = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    return (
        <div className={`about-container ${darkMode ? "dark-mode" : ""}`}>
            {/* Back Button */}
            <button className="back-btn" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> Back
            </button>

            {/* Dark Mode Toggle */}
            <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                {darkMode ? " Light Mode" : " Dark Mode"}
            </button>

            {/* Hero Section with Parallax Effect */}
            <header className="about-header parallax">
                <div className="header-overlay">
                    <h1 className="header-title">About Pankhudi</h1>
                    <p className="header-subtitle">
                        Your trusted e-commerce destination
                    </p>
                    <div className="scroll-indicator">
                        <span></span>
                    </div>
                </div>
            </header>

            <main className="about-content">
                {/* Story */}
                <section
                    className="about-section story"
                    ref={addToRefs}
                >
                    <div className="section-content">
                        <div className="text-content">
                            <h2 className="section-title">
                                <span className="title-number">01</span>
                                Our Story
                            </h2>
                            <p className="section-text">
                                Pankhudi was founded with a vision to provide high-quality
                                products at affordable prices. Our goal is to bring the best
                                shopping experience to our customers by combining convenience,
                                trust, and variety.
                            </p>
                            <button className="cta-button">Learn More</button>
                        </div>
                        <div className="image-content">
                            <div className="floating-image">
                                <img
                                    src="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                                    alt="Our Story"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section
                    className="about-section mission"
                    ref={addToRefs}
                >
                    <div className="section-content reversed">
                        <div className="image-content">
                            <div className="floating-image">
                                <img
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                                    alt="Our Mission"
                                />
                            </div>
                        </div>
                        <div className="text-content">
                            <h2 className="section-title">
                                <span className="title-number">02</span>
                                Our Mission
                            </h2>
                            <p className="section-text">
                                To deliver happiness at your doorstep with products that are
                                reliable, trendy, and budget-friendly. We believe in making
                                quality products accessible to everyone without compromising
                                on style or functionality.
                            </p>
                            <button className="cta-button">Our Products</button>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section
                    className="about-section values"
                    ref={addToRefs}
                >
                    <h2 className="section-title centered">
                        <span className="title-number">03</span>
                        Our Values
                    </h2>
                    <div className="values-grid">
                        {[
                            {
                                title: "Customer Satisfaction First",
                                text: "We prioritize our customers' needs and ensure their complete satisfaction.",
                                icon: "fas fa-heart"
                            },
                            {
                                title: "Transparency & Trust",
                                text: "We believe in building trust through complete transparency in all our dealings.",
                                icon: "fas fa-handshake"
                            },
                            {
                                title: "Quality Assurance",
                                text: "Every product undergoes rigorous quality checks to meet our high standards.",
                                icon: "fas fa-award"
                            },
                            {
                                title: "Affordable Pricing",
                                text: "We offer premium products at prices that provide real value to our customers.",
                                icon: "fas fa-tag"
                            },
                        ].map((val, i) => (
                            <div className="value-card" key={i}>
                                <div className="value-icon">
                                    <i className={val.icon}></i>
                                </div>
                                <h3>{val.title}</h3>
                                <p>{val.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team */}
                <section
                    className="about-section team"
                    ref={addToRefs}
                >
                    <h2 className="section-title centered">
                        <span className="title-number">04</span>
                        Meet Our Team
                    </h2>
                    <div className="team-cards">
                        {[
                            {
                                name: "Mohd. Sohal Ansari",
                                role: "Founder & CEO",
                                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                                bio: "Visionary leader with expertise in e-commerce and business strategy.",
                                social: [
                                    { icon: "fab fa-linkedin", link: "#" },
                                    { icon: "fab fa-twitter", link: "#" },
                                    { icon: "fas fa-envelope", link: "#" }
                                ]
                            },
                            {
                                name: "Naveen",
                                role: "CTO",
                                image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                                bio: "Technology expert driving innovation and digital transformation.",
                                social: [
                                    { icon: "fab fa-linkedin", link: "#" },
                                    { icon: "fab fa-github", link: "#" },
                                    { icon: "fas fa-envelope", link: "#" }
                                ]
                            },
                            {
                                name: "Sohal Ansari",
                                role: "Lead Designer",
                                image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                                bio: "Creative designer with an eye for aesthetics and user experience.",
                                social: [
                                    { icon: "fab fa-behance", link: "#" },
                                    { icon: "fab fa-dribbble", link: "#" },
                                    { icon: "fas fa-envelope", link: "#" }
                                ]
                            }
                        ].map((member, i) => (
                            <div className="team-card" key={i}>
                                <div className="card-inner">
                                    <div className="card-front">
                                        <div className="team-image">
                                            <img src={member.image} alt={member.name} />
                                            <div className="image-overlay"></div>
                                        </div>
                                        <h3>{member.name}</h3>
                                        <p>{member.role}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>{member.name}</h3>
                                        <p>{member.bio}</p>
                                        <div className="social">
                                            {member.social.map((social, idx) => (
                                                <a key={idx} href={social.link} aria-label={social.icon}>
                                                    <i className={social.icon}></i>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section
                    className="about-section contact"
                    ref={addToRefs}
                >
                    <div className="contact-container">
                        <div className="contact-info">
                            <h2 className="section-title">
                                <span className="title-number">05</span>
                                Contact Us
                            </h2>
                            <div className="contact-details">
                                <div className="contact-item">
                                    <i className="fas fa-envelope"></i>
                                    <div>
                                        <h4>Email</h4>
                                        <p>support@pankhudi.com</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-phone"></i>
                                    <div>
                                        <h4>Phone</h4>
                                        <p>+91 8574814934</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <h4>Address</h4>
                                        <p>123 Heritage Lane, Kurla, Maharashtra 400072, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form">
                            <h3>Send us a Message</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={formErrors.name ? "error" : ""}
                                    />
                                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Your Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={formErrors.email ? "error" : ""}
                                    />
                                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <textarea
                                        name="message"
                                        placeholder="Your Message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className={formErrors.message ? "error" : ""}
                                    ></textarea>
                                    {formErrors.message && <span className="error-text">{formErrors.message}</span>}
                                </div>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message <i className="fas fa-paper-plane"></i>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="about-footer">
                <p>&copy; {new Date().getFullYear()} Pankhudi. All rights reserved.</p>
                <div className="footer">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Shipping Information</a>
                </div>
            </footer>
        </div>
    );
};

export default About;