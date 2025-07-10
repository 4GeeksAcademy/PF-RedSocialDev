// File: src/front/router.jsx
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { SinglePost } from "./pages/SinglePost";
import { Demo } from "./pages/Demo";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Posts } from "./pages/Posts";
import { PostForm } from "./pages/PostForm";
import { AdminPosts } from "./pages/AdminPosts";
import { UserProfile } from "./pages/UserProfile";
import { AISearch } from "./pages/AISearch";
import { Contact } from "./pages/Contact";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      {/* ✅ Página pública */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/post/:theId" element={<SinglePost />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/posts" element={<Posts />} />
        <Route path="/post-form" element={<PostForm />} />
        <Route path="/admin" element={<AdminPosts />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/AI-search" element={<AISearch />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Route>
  )
);