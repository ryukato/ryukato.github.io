# 🧠 Ryukato's Blog

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fryukato.github.io%2Fblog)](https://ryukato.github.io/blog)
[![Powered by Docusaurus](https://img.shields.io/badge/Built%20with-Docusaurus-blue)](https://docusaurus.io/)
[![Deploy Status](https://github.com/ryukato/blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/ryukato/blog/actions)

> ✨ A technical blog on LLMs, backend architecture, prompt engineering, and developer identity — written and curated by [Yoonyoul Yoo](https://github.com/ryukato)

---

## 📌 About

This is a **Docusaurus-powered technical blog** authored by **Yoonyoul Yoo**, a senior backend engineer with 20+ years of experience in:

- Java/Kotlin (Spring WebFlux, R2DBC, Coroutine-based backends)
- AI/LLM-powered search systems (LangChain, Qdrant, Ollama)
- Prompt engineering, agent orchestration, and AI-driven APIs
- Data pipelines (Airflow, PostgreSQL, MongoDB) for pharmaceutical metadata

You’ll find articles on:

- 📚 Prompt chaining vs single prompt architecture
- ⚙️ Drug Master API Systems with RAG
- 🧪 Keyword extraction, metadata design, LLM embedding pipelines
- 💡 Personal branding and developer identity in the age of AI

🔗 Visit the blog: [**https://ryukato.github.io/blog/**](https://ryukato.github.io/blog/)

---

## 🛠️ Local Development

```bash
git clone https://github.com/ryukato/blog.git
cd blog
yarn install
yarn start
```

This will start a local dev server at [http://localhost:3000](http://localhost:3000) with hot-reload enabled.

---

## 📦 Build Static Site

```bash
yarn build
```

The static files will be output to the `build/` directory.

---

## 🚀 Deployment

Using GitHub Pages (default):

```bash
# If using SSH:
USE_SSH=true yarn deploy

# If using HTTPS:
GIT_USER=<your-github-username> yarn deploy
```

This will build and deploy the site to the `gh-pages` branch.

> ✅ GitHub Actions is configured for CI/CD auto-deploy on push to `main`.

---

## 📄 License

MIT License © [Yoonyoul Yoo (Ryukato)](https://github.com/ryukato)
