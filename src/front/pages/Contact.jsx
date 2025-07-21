// File: src/front/pages/Contact.jsx

import React, { useState } from "react";
import isotipo from "../assets/img/isotipo.png";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Accordion from "react-bootstrap/Accordion";

export const Contact = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("https://fantastic-doodle-pjw4647v49p936xwr-3001.app.github.dev/api/contact", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(() => {
        alert("Message sent successfully!");
        setFormData({ fullname: "", email: "", subject: "", message: "" });
      })
      .catch((err) => {
        console.error("Failed to send message:", err);
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <div className="min-vh-100 w-100 d-flex flex-lg-row flex-column align-items-stretch overflow-hidden">
      <div className="w-100 w-lg-50">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80"
          alt="contact illustration"
          className="img-fluid h-100 w-100 object-fit-cover"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="w-100 w-lg-50 d-flex align-items-center justify-content-center p-4 bg-black text-white">
        <motion.form
          onSubmit={handleSubmit}
          className="w-100"
          style={{ maxWidth: "500px" }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-4">
            <img src={isotipo} alt="GitWise logo" width="60" />
            <h3 className="mt-2 fw-bold">Contact Us</h3>
          </div>

          {["fullname", "email", "subject"].map((field) => (
            <div className="form-group mb-3 text-start" key={field}>
              <label className="text-white text-capitalize">
                {field === "fullname" ? "Full name" : field}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                className="form-control bg-dark text-white border-secondary"
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                required
              />
            </div>
          ))}

          <div className="form-group mb-3 text-start">
            <label className="text-white">Your message</label>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            ></textarea>
          </div>

          <button className="btn btn-gitwise w-100 fw-bold">Send</button>

          <div className="text-white text-center mt-4 small">
            <p className="mb-1">📍 GitWise HQ — Colombia, Uruguay & Venezuela</p>
            <div className="d-flex justify-content-center gap-3">
              <a href="https://github.com/gitwise-ai" target="_blank" rel="noreferrer" className="text-white">
                <i className="fab fa-github fa-lg"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white">
                <i className="fab fa-linkedin fa-lg"></i>
              </a>
              <a href="mailto:hello@gitwise.ai" className="text-white">
                <i className="fas fa-envelope fa-lg"></i>
              </a>
            </div>
          </div>

          <div className="text-white text-center mt-5">
            <div className="row g-4">
              {["Users", "Projects", "Commits"].map((label, i) => (
                <div className="col-md-4" key={label}>
                  <h2 className="fw-bold">
                    <CountUp end={[4321, 987, 27650][i]} duration={3} separator="," />
                  </h2>
                  <p className="text-uppercase small text-white">{label}</p>
                </div>
              ))}
            </div>

            <div className="my-4">
              <h4 className="fw-bold mb-3">FAQs</h4>
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Why choose GitWise?</Accordion.Header>
                  <Accordion.Body>
                    GitWise is built for developers, by developers. Open source, collaborative and powerful.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Can I submit feedback?</Accordion.Header>
                  <Accordion.Body>
                    Absolutely! Reach out to us through this form or join our community on GitHub.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};