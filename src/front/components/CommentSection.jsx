import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaHeart, FaTrashAlt } from "react-icons/fa";

export const CommentSection = ({ postId }) => {
  const { store } = useGlobalReducer();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  // Obtener comentarios desde la API
  const fetchComments = async () => {
    if (!postId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/post/${postId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      } else {
        toast.error(data.msg || "Error loading comments");
      }
    } catch (err) {
      toast.error("Server error fetching comments");
    }
  };

  // Cargar comentarios al montar componente o cambiar usuario/token
  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, store.token]);

  // ➕ Enviar nuevo comentario
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/post/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setNewComment("");
      } else {
        toast.error(data.msg || "Failed to add comment");
      }
    } catch (err) {
      toast.error("Server error posting comment");
    } finally {
      setLoading(false);
    }
  };

  // Dar o quitar like
  const handleLike = async (commentId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        fetchComments(); // Actualizar likes
      } else {
        toast.error(data.msg || "Error toggling like");
      }
    } catch (err) {
      toast.error("Server error toggling like");
    }
  };

  // Borrar comentario
  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Comment deleted");
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        toast.error(data.msg || "Failed to delete comment");
      }
    } catch (err) {
      toast.error("Server error deleting comment");
    }
  };

  const isAdmin = store?.user?.is_admin;

  return (
    <div className="mt-5">
      <h5 className="mb-4 text-light">Comments</h5>

      {/* Formulario de nuevo comentario */}
      {store.token ? (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-control bg-dark text-light border-secondary"
            rows="3"
            placeholder="Write a comment..."
          ></textarea>
          <button
            className="btn btn-primary mt-2"
            onClick={handleAddComment}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <p className="text-light">You must be logged in to leave a comment.</p>
      )}

      {/* Lista de comentarios */}
      <ul className="list-group border-0 bg-transparent">
        {comments.length === 0 && (
          <li className="list-group-item bg-dark text-center text-light">
            No comments yet.
          </li>
        )}

        {comments.map((comment) => (
          <li
            key={comment.id}
            className="list-group-item bg-dark text-light border-secondary mb-2 rounded"
          >
            <div className="d-flex" style={{ width: "100%" }}>
              {/* Avatar y username */}
              <div className="me-3 text-center" style={{ width: "60px" }}>
                <img
                  src={
                    comment.author?.avatar_url ||
                    "https://avatars.githubusercontent.com/u/000000?v=4"
                  }
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                />
                <Link
                  to="/profile"
                  className="text-info text-decoration-none fw-semibold d-block mt-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  @{comment.author?.username}
                </Link>
              </div>

              {/* Texto del comentario */}
              <div className="flex-grow-1 d-flex justify-content-between align-items-start">
                <p className="mb-0">{comment.text}</p>

                {/* Botones */}
                <div className="ms-3 d-flex flex-column align-items-center">
                  <button
                    className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center mb-2"
                    style={{ width: "40px", height: "40px" }}
                    onClick={() => handleLike(comment.id)}
                    disabled={!store.token}
                    title="Like"
                  >
                    <FaHeart />
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      onClick={() => handleDelete(comment.id)}
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
