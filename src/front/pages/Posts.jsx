// File: src/front/pages/Posts.jsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LikeButton } from "../components/LikeButton";
import { FavoriteButton } from "../components/FavoriteButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

export const Posts = () => {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    stack: "",
    level: "",
    repo_URL: "",
  });

  const fetchPosts = async () => {
    try {
      const resp = await fetch("/api/posts");
      if (!resp.ok) throw new Error("Failed to fetch posts");
      const data = await resp.json();
      setPosts(data.posts);
    } catch (err) {
      console.error(err);
      setPosts(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Not implemented yet
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      const resp = await fetch(`/api/user/post/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      });

      const data = await resp.json();
      if (resp.ok) {
        setToastMsg("Project created successfully!");
        fetchPosts();
        setShowModal(false);
      } else {
        throw new Error(data.error || "Post creation failed");
      }
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to create project");
    } finally {
      setShowToast(true);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const mockProjects = [
    {
      id: 1,
      title: "React Portfolio",
      description: "A personal portfolio built with React and Tailwind CSS.",
      stack: "React",
      level: "Intermediate",
      repo_URL: "https://github.com/example/react-portfolio",
    },
    {
      id: 2,
      title: "Fullstack Blog",
      description: "MERN stack blog platform with Markdown editor.",
      stack: "MERN",
      level: "Advanced",
      repo_URL: "https://github.com/example/fullstack-blog",
    },
    {
      id: 3,
      title: "DevConnect",
      description: "A dev community platform to connect and share projects.",
      stack: "Next.js",
      level: "Beginner",
      repo_URL: "https://github.com/example/devconnect",
    },
  ];

  return (
    <div className="container-fluid min-vh-100 p-5 hero-bg text-center">
      <div className="container">
        <h2 className="hero-title mb-2">AI Search & Explore</h2>
        <p className="hero-subtitle mb-4">
          Discover and contribute open-source projects powered by AI. Find ideas,
          publish your work, and connect with fellow developers.
        </p>

        <div className="mb-4">
          <Button className="btn-gitwise fw-bold px-4 py-2" onClick={() => setShowModal(true)}>
            + Create New Project
          </Button>
        </div>

        <Form
          onSubmit={handleSearch}
          className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mb-5"
        >
          <input
            type="text"
            placeholder="e.g., Build a portfolio with React and Tailwind"
            className="form-control bg-dark text-white border-secondary w-75"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <Button type="submit" className="btn-gitwise px-4">
            Search
          </Button>
        </Form>

        <div className="row justify-content-center g-4">
          {(loading ? mockProjects : posts).map((post) => (
            <motion.div key={post.id} className="col-12 col-sm-6 col-md-4 d-flex">
              <div className="card" style={{ backgroundColor: "#161b22" }}>
                <div className="card-body d-flex flex-column text-white">
                  <h5 className="card-title fw-bold text-white">{post.title}</h5>
                  <p className="card-text flex-grow-1">{post.description}</p>
                  <div className="mb-3">
                    <span className="badge bg-secondary me-2">{post.stack}</span>
                    <span className="badge bg-info text-dark">{post.level}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <a
                      href={post.repo_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-gitwise"
                    >
                      View GitHub
                    </a>
                    <div className="d-flex gap-2">
                      <LikeButton postId={post.id} />
                      <FavoriteButton postId={post.id} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreatePost}>
          <Modal.Body>
            {Object.keys(newPost).map((field) => (
              <Form.Group className="mb-2" key={field}>
                <Form.Label className="text-dark text-capitalize">
                  {field.replace("_", " ")}
                </Form.Label>
                <Form.Control
                  className="bg-light"
                  value={newPost[field]}
                  onChange={(e) => setNewPost({ ...newPost, [field]: e.target.value })}
                  required
                />
              </Form.Group>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button className="btn-gitwise" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer className="p-3" position="top-center">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg="dark"
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};