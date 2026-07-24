const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add import
if (!code.includes("import { useNavigate, useLocation } from 'react-router-dom';")) {
  code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useNavigate, useLocation } from 'react-router-dom';");
}

// 2. Replace state
const oldState = `  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'panel';
  });`;

const newState = `  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'panel';
  
  const setCurrentPage = (page: string) => {
    if (page === 'panel') {
      navigate('/');
    } else {
      navigate(\`/\${page}\`);
    }
  };`;

if (code.includes(oldState)) {
  code = code.replace(oldState, newState);
} else {
  console.log("Could not find oldState in App.tsx");
}

// 3. Remove useEffect for url
const oldEffect = `  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage === 'panel') {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', currentPage);
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentPage]);`;

if (code.includes(oldEffect)) {
  code = code.replace(oldEffect, "");
} else {
  console.log("Could not find oldEffect in App.tsx");
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched");
