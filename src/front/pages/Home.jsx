import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear, faProjectDiagram, faUsers, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const Home = () => {
    return (
        <motion.div className="hero-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <div className="container">
                <motion.h1 className="hero-title" initial={{ y: -20 }} animate={{ y: 0 }}>Don’t Search. Ask. Find. Code.</motion.h1>
                <motion.p className="hero-subtitle" initial={{ y: -10 }} animate={{ y: 0 }} transition={{ delay: 0.1 }}>
                    GitWise is the future of social coding: build and ship software with the help of AI, collaborate, and grow your developer presence.
                </motion.p>

                <motion.div className="row mt-5 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="col-6 col-md-3 mb-4">
                        <div className="icon-box">
                            <FontAwesomeIcon icon={faUserGear} size="2x" className="mb-2 text-purple" />
                            <p>Create profiles</p>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 mb-4">
                        <div className="icon-box">
                            <FontAwesomeIcon icon={faProjectDiagram} size="2x" className="mb-2 text-purple" />
                            <p>Explore projects</p>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 mb-4">
                        <div className="icon-box">
                            <FontAwesomeIcon icon={faUsers} size="2x" className="mb-2 text-purple" />
                            <p>Follow devs</p>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 mb-4">
                        <div className="icon-box">
                            <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" className="mb-2 text-purple" />
                            <p>AI search</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="support-section mt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <h3 className="fw-bold mb-3">Why support GitWise?</h3>
                    <p>
                        GitWise is a next-gen platform for developers. Beyond version control, it’s a place to learn, connect, and grow.
                        Whether you're showcasing your portfolio, following trending devs, or discovering projects via AI — GitWise empowers you to level up.
                    </p>
                    <p>
                        As an open-source initiative, your support enables us to stay independent, ship features faster, and reach more developers worldwide.
                    </p>
                    <Link to="/donate" className="cta-btn mt-3">Donate & Support Innovation</Link>
                </motion.div>
            </div>
        </motion.div>
    );
};
