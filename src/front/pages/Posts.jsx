import React, { useEffect, useState } from "react";

const Posts = () => {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/posts`);
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error("Error al cargar los repositorios:", error);
      }
    };

    loadRepos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#4A38F4] mb-6 text-center">Explora proyectos destacados</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <h2 className="text-xl font-semibold text-[#4A38F4] mb-2">{repo.title}</h2>
            <p className="text-gray-600 mb-3">{repo.description}</p>
            <div className="flex flex-wrap gap-2 text-sm mb-4">
              {repo.tags?.map((tag, i) => (
                <span key={i} className="bg-[#e5e5ff] text-[#4A38F4] px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-2">Lenguaje: {repo.language}</p>
            <p className="text-sm text-gray-500 mb-2">Nivel: {repo.level}</p>
            <div className="flex justify-between items-center mt-4">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A38F4] hover:underline text-sm font-medium"
              >
                Ver en GitHub
              </a>
              <span className="text-gray-500 text-sm">❤️ {repo.likes || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;