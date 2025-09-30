import React, { useEffect } from 'react';
import Footer from "../../components/Footer/Footer"
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import './Tearm.css';

const TermsAndConditions = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const navigate = useNavigate();



    return (
        <div className="terms-container">
            <header>
                <button className="back-bt" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <h2 className='brand-name'>Pankhudi</h2>
            </header>
            <div className="terms-header">
                <h1 className="terms-title">Terms & Conditions</h1>
                <p className="terms-effective-date">Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
                <p className="terms-summary">Please read these Terms carefully before using our services</p>
            </div>

            <div className="terms-content">
                <section className="terms-section">
                    <h2>1. Introduction</h2>
                    <p className="text-medium">
                        Welcome to <strong>Pankhudi</strong> ("Company", "we", "our", "us"). These Terms and Conditions ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you ("User", "you") agree to be bound by these Terms and our Privacy Policy. This agreement constitutes a legally binding contract between you and Pankhudi under Indian law, including the Information Technology Act, 2000 and related rules.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>2. Eligibility</h2>
                    <p className="text-medium">
                        To use our Services, you must:
                    </p>
                    <ul className="text-small">
                        <li>Be at least 18 years of age</li>
                        <li>Have the legal capacity to enter into contracts under Indian law</li>
                        <li>Not be barred from receiving services under applicable laws</li>
                        <li>Provide accurate and complete registration information</li>
                    </ul>
                    <p className="text-medium">
                        By accessing our Services, you represent and warrant that you meet all eligibility requirements. We reserve the right to refuse service to anyone at our discretion.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>3. User Accounts</h2>
                    <p className="text-medium">
                        To access certain features, you must create an account:
                    </p>
                    <ul className="text-small">
                        <li>You are responsible for maintaining account confidentiality</li>
                        <li>You must promptly update account information if changes occur</li>
                        <li>You are liable for all activities under your account</li>
                        <li>We reserve the right to suspend or terminate accounts violating these Terms</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>4. Orders & Payments</h2>
                    <div className="text-medium">
                        <p>All orders are subject to product availability and our acceptance:</p>
                        <ul className="text-small">
                            <li>We may cancel orders for any reason, including suspected fraud</li>
                            <li>Prices are displayed in INR and include all applicable taxes</li>
                            <li>Payment must be completed before order processing</li>
                            <li>We accept various payment methods including credit/debit cards, UPI, and net banking</li>
                        </ul>
                        <p>We use PCI-DSS compliant payment gateways that adhere to RBI guidelines for secure transactions.</p>
                    </div>
                </section>

                <section className="terms-section">
                    <h2>5. Pricing & Product Information</h2>
                    <p className="text-medium">
                        While we strive for accuracy:
                    </p>
                    <ul className="text-small">
                        <li>Product images may differ slightly from actual items</li>
                        <li>Prices may change without notice</li>
                        <li>Descriptions are for informational purposes only</li>
                        <li>We are not responsible for typographical errors</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>6. Returns & Refunds</h2>
                    <div className="text-medium">
                        <p>Our return policy includes:</p>
                        <ul className="text-small">
                            <li>7-day return window from delivery date</li>
                            <li>Products must be unused with original packaging</li>
                            <li>Refunds processed within 7-10 business days</li>
                            <li>Certain items may be non-returnable (e.g., perishables)</li>
                        </ul>
                        <p>Please see our detailed <a href="/return-policy">Return Policy</a> for complete information.</p>
                    </div>
                </section>

                <section className="terms-section">
                    <h2>7. Intellectual Property</h2>
                    <p className="text-medium">
                        All content on Pankhudi is protected under:
                    </p>
                    <ul className="text-small">
                        <li>Copyright Act, 1957 for creative works</li>
                        <li>Trademarks Act, 1999 for brand identifiers</li>
                        <li>Designs Act, 2000 for product designs</li>
                    </ul>
                    <p className="text-medium">
                        Unauthorized use may result in legal action under Indian laws.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>8. Data Security & Privacy</h2>
                    <div className="data-security">
                        <h3>8.1 Data Collection</h3>
                        <p className="text-medium">We collect:</p>
                        <ul className="text-small">
                            <li>Personal identification information</li>
                            <li>Transaction details</li>
                            <li>Device and usage data</li>
                            <li>Location information (with consent)</li>
                        </ul>

                        <h3>8.2 Data Protection</h3>
                        <p className="text-medium">Our security measures include:</p>
                        <ul className="text-small">
                            <li>256-bit SSL encryption</li>
                            <li>Regular security audits</li>
                            <li>PCI-DSS compliance for payment data</li>
                            <li>Employee confidentiality agreements</li>
                        </ul>

                        <h3>8.3 Data Retention</h3>
                        <p className="text-medium">We retain data:</p>
                        <ul className="text-small">
                            <li>As required by Indian law (typically 5+ years for financial records)</li>
                            <li>For ongoing business needs</li>
                            <li>Until account deletion requests are processed</li>
                        </ul>

                        <h3>8.4 International Data Transfers</h3>
                        <p className="text-medium">When data crosses borders:</p>
                        <ul className="text-small">
                            <li>We ensure adequate protection measures</li>
                            <li>We comply with Indian data localization requirements</li>
                            <li>We use standard contractual clauses where applicable</li>
                        </ul>
                    </div>
                </section>

                <section className="terms-section">
                    <h2>9. User Conduct</h2>
                    <p className="text-medium">Prohibited activities include:</p>
                    <ul className="text-small">
                        <li>Violating any applicable laws</li>
                        <li>Infringing intellectual property rights</li>
                        <li>Distributing malware or harmful code</li>
                        <li>Engaging in fraudulent activities</li>
                        <li>Attempting unauthorized access to our systems</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>10. Third-Party Links</h2>
                    <p className="text-medium">
                        Our Services may contain links to third-party websites. We:
                    </p>
                    <ul className="text-small">
                        <li>Do not endorse these external sites</li>
                        <li>Are not responsible for their content</li>
                        <li>Recommend reviewing their privacy policies</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>11. Limitation of Liability</h2>
                    <p className="text-medium">
                        To the maximum extent permitted by Indian law:
                    </p>
                    <ul className="text-small">
                        <li>We exclude all implied warranties</li>
                        <li>We are not liable for consequential damages</li>
                        <li>Our total liability is limited to the amount you paid for services</li>
                        <li>We are not responsible for third-party actions</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>12. Governing Law & Dispute Resolution</h2>
                    <div className="text-medium">
                        <p>These Terms are governed by Indian law. Dispute resolution process:</p>
                        <ol className="text-small">
                            <li>Informal negotiation (30 days)</li>
                            <li>Mediation through recognized Indian mediation center</li>
                            <li>Legal proceedings in [Your City] courts</li>
                        </ol>
                        <p>You waive the right to participate in class actions.</p>
                    </div>
                </section>

                <section className="terms-section">
                    <h2>13. Changes to Terms</h2>
                    <p className="text-medium">
                        We may modify these Terms by:
                    </p>
                    <ul className="text-small">
                        <li>Posting updated Terms on our website</li>
                        <li>Sending email notifications for material changes</li>
                        <li>Updating the "Last Updated" date</li>
                    </ul>
                    <p className="text-medium">
                        Continued use after changes constitutes acceptance.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>14. Termination</h2>
                    <p className="text-medium">
                        We may terminate or suspend access:
                    </p>
                    <ul className="text-small">
                        <li>For violations of these Terms</li>
                        <li>For unlawful or harmful conduct</li>
                        <li>If required by law enforcement</li>
                        <li>Upon 30 days notice for business reasons</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>15. Contact Information</h2>
                    <div className="contact-details">
                        <p className="text-medium">Grievance Officer:</p>
                        <p className="text-small">Mr./Ms. [Name]</p>
                        <p className="text-small"><a href="mailto:grievance@pankhudi.in">grievance@pankhudi.in</a></p>
                        <p className="text-small">[Company Address]</p>
                        <p className="text-small">[City, State, PIN Code]</p>
                        <p className="text-small">India</p>
                        <p className="text-small">Phone: [Contact Number]</p>
                        <p className="text-small">Hours: Mon-Fri, 10AM-6PM IST</p>
                    </div>
                </section>

                <div className="terms-acknowledgement">
                    <p className="text-medium"><strong>By using our Services, you acknowledge that:</strong></p>
                    <ul className="text-small">
                        <li>You have read and understood these Terms</li>
                        <li>You agree to be legally bound by them</li>
                        <li>You consent to our Privacy Policy</li>
                        <li>You meet all eligibility requirements</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsAndConditions;