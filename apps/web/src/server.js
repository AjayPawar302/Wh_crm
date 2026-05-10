import http from 'http';
const html = `<!doctype html><html><head><title>WH CRM</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-950 text-white"><main class="max-w-3xl mx-auto p-10"><h1 class="text-3xl font-bold">WH CRM Dashboard Starter</h1><p class="mt-4 text-slate-300">React + Tailwind frontend placeholder. Connect to API for auth, contacts, and workflows.</p></main></body></html>`;
http.createServer((_, res) => { res.writeHead(200, {'Content-Type':'text/html'}); res.end(html); }).listen(5173, () => console.log('Web on 5173'));
