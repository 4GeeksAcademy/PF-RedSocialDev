// File: src/front/pages/Home.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear, faProjectDiagram, faUsers, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export const Home = () => {
    return (
        <div className="">
            <div className="pt-3">
                <div className="container text-center py-5">
                    <h1 className="main-title">Don’t Search. Ask. Find. Code.</h1>
                    <p className="main-subtitle">
                        <strong>A social network for developers</strong> inspired by GitHub, where you can share projects, collaborate, and explore ideas with <strong>AI-powered guidance</strong>.
                    </p>
                    <p className="main-description">
                        What makes it unique? An <strong>AI-powered search engine</strong> that understands natural language and gives contextual suggestions.
                    </p>
                    <div className="container py-5">
                        <div className="row text-center text-light">
                            <div className="col-6 col-md-3 mb-4">
                                <FontAwesomeIcon icon={faUserGear} className="feature-icon" />
                                <p className="mt-2 fw-semibold">Create & manage developer profiles</p>
                            </div>
                            <div className="col-6 col-md-3 mb-4">
                                <FontAwesomeIcon icon={faProjectDiagram} className="feature-icon" />
                                <p className="mt-2 fw-semibold">Publish & explore community projects</p>
                            </div>
                            <div className="col-6 col-md-3 mb-4">
                                <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                                <p className="mt-2 fw-semibold">Follow developers & discover trends</p>
                            </div>
                            <div className="col-6 col-md-3 mb-4">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="feature-icon" />
                                <p className="mt-2 fw-semibold">Search projects using AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container py-5">
                <h2 className="section-title text-center fw-bold mb-1">CHOOSE THE BEST PLAN FOR YOU</h2>
                <p className="section-subtitle text-center mb-5">SAVE UP TO 30%</p>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-5 mb-4">
                        <div className="plan-card text-center">
                            <h5 className="plan-title-1">FREE</h5>
                            <ul className="plan-features list-unstyled mt-3 mb-4 text-start mx-auto">
                                <li>• Unlimited repositories (basic public or private)</li>
                                <li>• Community and collaborative support</li>
                                <li>• Up to 2,000 minutes of CI/CD per month</li>
                                <li className="pb-2">• Basic AI search (limited)</li>
                            </ul>
                            <p className="plan-price mt-5">12x $0.00/month</p>
                            <button className="plan-button btn btn-outline-primary">CHOOSE THIS PLAN</button>
                        </div>
                    </div>
                    <div className="col-12 col-md-5 mb-4">
                        <div className="plan-card text-center">
                            <h5 className="plan-title-2">PREMIUM</h5>
                            <ul className="plan-features list-unstyled mt-3 mb-4 text-start mx-auto">
                                <li>• All Free plan features</li>
                                <li>• Unlimited CI/CD minutes</li>
                                <li>• Advanced AI (GPT-4 or Claude)</li>
                                <li>• Advanced repo insights and metrics</li>
                                <li>• Priority support</li>
                            </ul>
                            <p className="plan-price">12x $5.99/month</p>
                            <button className="plan-button btn btn-outline-primary">CHOOSE THIS PLAN</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};