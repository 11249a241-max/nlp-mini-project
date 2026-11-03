<<<<<<< HEAD
# CampusMind AI 🎓
> *"Making University Life Smarter with Artificial Intelligence"*

CampusMind AI is a full-stack, enterprise-grade academic intelligence SaaS platform engineered for modern universities. It combines classical computational linguistics with cutting-edge dense embeddings to provide automated project originality auditing, circular intelligence with grounded page citations, aspect-based grievance sentiment analytics, and peer knowledge discovery.

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │          CampusMind AI Web Portal             │
                    │   React 18 • Vite • Tailwind CSS • Recharts  │
                    └──────────────────────┬───────────────────────┘
                                           │ REST API / JWT
                    ┌──────────────────────▼───────────────────────┐
                    │             FastAPI Backend Core              │
                    │      Pydantic v2 • SQLAlchemy • PyJWT        │
                    └──────┬───────────────┬───────────────┬───────┘
                           │               │               │
        ┌──────────────────┴──┐     ┌──────┴──────┐   ┌────┴─────────────────┐
        │   NLP & Vector Engine│     │  Database   │   │ Document Processing  │
        │ • Sentence-BERT      │     │ PostgreSQL  │   │ • PyMuPDF (fitz)     │
        │ • TF-IDF + Cosine    │     │ / SQLite3   │   │ • pypdf              │
        │ • FAISS Dense Index  │     └─────────────┘   │ • Tokenizers         │
        │ • NLTK & Lemmatizer  │                       └──────────────────────┘
        └──────────────────────┘
```

---

## 🚀 Key Modules & NLP Capabilities

### 1. 🤖 AI Academic Assistant (Module 1)
- **RAG Architecture**: Ingests multi-page academic PDFs (syllabi, course guidelines, university regulations).
- **Dense Vector Search**: Semantic search over text chunks indexed using FAISS `IndexFlatIP`.
- **Verified Citations**: Displays exact source document titles, page numbers, and cosine match confidence.
- **Hallucination Prevention**: Explicitly informs the student if an answer is absent from indexed records.

### 2. 🔬 Smart Project Similarity & Innovation Detector (Module 2 — Signature Feature)
- **Hybrid Similarity Engine**: Combines 40% lexical TF-IDF n-gram overlap with 60% semantic `all-MiniLM-L6-v2` Sentence-BERT embeddings.
- **Top 5 Matching Projects**: Displays historical student project titles, abstracts, and matching keywords.
- **Automated Innovation Suggestions**: Analyzes technical domains to suggest concrete, high-novelty extensions (e.g. Edge AI, Explainable AI Grad-CAM, Federated Learning, IoT sensor telemetry).
- **Academic Disclaimer**: Clearly marks similarity scores as indicators for faculty review rather than automated plagiarism accusations.
- **Faculty Review Interface**: Allows professors to audit submissions and record approval or revision requests.

### 3. 📊 Student Feedback & Complaint Analyzer (Module 3)
- **Multi-Class Text Classification**: Automatically categorizes unstructured student grievances into 9 campus domains:
  - *Academics, Faculty, Infrastructure, Laboratories, Library, Transportation, Hostel, Internet and Wi-Fi, Administration*.
- **Aspect-Based Sentiment Analysis**: Extracts granular sentiment per domain component (e.g., teaching vs equipment vs connectivity).
- **Urgency Priority Mapping**: Computes priority levels (*Low, Medium, High, Critical*) using sentiment polarity and urgency indicators.
- **Faculty Command Center**: Interactive charts powered by Recharts (Sentiment Donut, Domain Bar Charts, Recurring Keywords).

### 4. 📢 AI University Notice Intelligence (Module 4)
- **PDF Circular Extraction**: Automatically extracts text from uploaded administrative PDFs.
- **Extractive Summarization**: Computes sentence salience via positional TF-IDF scoring.
- **Named Entity Recognition (NER)**: Extracts examination fees, circular registration codes, and academic departments.
- **Important Deadlines**: Scans dates and isolates critical registration cut-offs.
- **Natural Language Querying**: Allows students to query deadlines and requirements in natural English with grounded citations.

### 5. 🤝 Student Knowledge Sharing Platform (Module 5)
- **Academic Discussion Feed**: Peer-to-peer technical inquiry platform.
- **Automatic Domain Categorization**: Automatically detects topic tags (AI, Programming, DB, Math, Networks, OS).
- **NLP Thread Summarization**: Compresses lengthy technical threads into concise summaries.
- **Faculty Verified Answers**: Highlights answers confirmed by departmental professors with green verification badges.

### 6. 🧭 AI Research Topic Discovery (Module 6)
- **Curated Abstract Corpus**: Explores state-of-the-art research across AI, Healthcare, Agriculture, Cybersecurity, NLP, and EdTech.
- **Semantic Exploration**: Matches student research interests against scientific abstracts.
- **Investigative Direction Guidelines**: Outlines prospective research extensions while reminding students to verify global uniqueness.

---

## 🔐 User Authentication & Roles

The platform provides role-based access control (RBAC) enforced via cryptographic JWT tokens:

| Role | Default Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campusmind.edu` | `password123` | Submit projects, test similarity, file feedback, ask AI assistant, explore notices & research |
| **Faculty** | `faculty@campusmind.edu` | `password123` | Audit projects, review similarity reports, manage circulars, analyze student grievance trends |

*Both accounts are pre-seeded in the database for instant testing.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React, Recharts, Axios.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy ORM, PyJWT, Bcrypt.
- **NLP & AI Engine**:
  - `sentence-transformers` (`all-MiniLM-L6-v2`, 384 dimensions)
  - `faiss-cpu` (Facebook AI Similarity Search)
  - `scikit-learn` (TF-IDF Vectorizer, Cosine Similarity)
  - `nltk` (punkt, stopwords, WordNet lemmatizer)
  - `pypdf` & `PyMuPDF` (PDF extraction)
- **Database**:
  - Local Development: SQLite (`campusmind.db`) with zero external service dependencies.
  - Production Deployment: PostgreSQL (`postgresql://...`) via standard SQLAlchemy connection string.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.11+ or 3.12
- Node.js LTS (v20+) & npm

### 2. Backend Setup
```bash
# Navigate to project directory
cd "11249A241 NLPLAB"

# Install Python dependencies
pip install -r backend/requirements.txt

# Run initial database seed (creates tables & demo records)
python -c "import sys; sys.path.insert(0, 'backend'); from app.seed import seed_database; seed_database()"

# Start FastAPI server
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*Backend API and Swagger Documentation will be available at:*
- API Root / Web App: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup (Development Mode)
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```
*Frontend will launch at:* `http://localhost:5173`

*(Note: The FastAPI backend is configured to also serve the production build directly from `frontend/dist`, allowing you to run the entire application using just `uvicorn app.main:app`!)*

---

## 🧪 Automated Testing

### 1. Run NLP Unit Tests
Verifies text cleaning, tokenization, TF-IDF cosine similarity, S-BERT embeddings, complaint classification, sentiment scoring, and FAISS indexing:
```bash
python tests/test_nlp.py
```

### 2. Run API Integration Tests
Verifies authentication, JWT authorization, role permission guards (403 for unauthorized routes), project similarity analysis, grievance submission, notice Q&A, and dashboards:
```bash
python tests/test_api.py
```

---

## 🌐 Production & Cloud Deployment Guidelines

1. **Environment Variables**:
   Copy `.env.example` to `.env` and set:
   ```env
   DATABASE_URL=postgresql://user:password@db-host:5432/campusmind_prod
   SECRET_KEY=generate_a_secure_256bit_random_key
   ```
2. **Build Frontend**:
   ```bash
   cd frontend && npm run build
   ```
3. **Deploy with Gunicorn/Uvicorn**:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```

---

## 📄 License
Academic & Educational Use Only — Developed for CampusMind AI Lab.
=======
# @vitejs/plugin-react [![npm](https://img.shields.io/npm/v/@vitejs/plugin-react.svg)](https://npmjs.com/package/@vitejs/plugin-react)

The default Vite plugin for React projects.

- enable [Fast Refresh](https://www.npmjs.com/package/react-refresh) in development (requires react >= 16.9)
- use the [automatic JSX runtime](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- use custom Babel plugins/presets
- small installation size

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

## Options

### include/exclude

Includes `.js`, `.jsx`, `.ts` & `.tsx` by default. This option can be used to add fast refresh to `.mdx` files:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'

export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx() },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
  ],
})
```

> `node_modules` are never processed by this plugin (but esbuild will)

### jsxImportSource

Control where the JSX factory is imported from. Default to `'react'`

```js
react({ jsxImportSource: '@emotion/react' })
```

### jsxRuntime

By default, the plugin uses the [automatic JSX runtime](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html). However, if you encounter any issues, you may opt out using the `jsxRuntime` option.

```js
react({ jsxRuntime: 'classic' })
```

### babel

The `babel` option lets you add plugins, presets, and [other configuration](https://babeljs.io/docs/en/options) to the Babel transformation performed on each included file.

```js
react({
  babel: {
    presets: [...],
    // Your plugins run before any built-in transform (eg: Fast Refresh)
    plugins: [...],
    // Use .babelrc files
    babelrc: true,
    // Use babel.config.js files
    configFile: true,
  }
})
```

Note: When not using plugins, only esbuild is used for production builds, resulting in faster builds.

#### Proposed syntax

If you are using ES syntax that are still in proposal status (e.g. class properties), you can selectively enable them with the `babel.parserOpts.plugins` option:

```js
react({
  babel: {
    parserOpts: {
      plugins: ['decorators-legacy'],
    },
  },
})
```

This option does not enable _code transformation_. That is handled by esbuild.

**Note:** TypeScript syntax is handled automatically.

Here's the [complete list of Babel parser plugins](https://babeljs.io/docs/en/babel-parser#ecmascript-proposalshttpsgithubcombabelproposals).

### reactRefreshHost

The `reactRefreshHost` option is only necessary in a module federation context. It enables HMR to work between a remote & host application. In your remote Vite config, you would add your host origin:

```js
react({ reactRefreshHost: 'http://localhost:3000' })
```

Under the hood, this simply updates the React Fash Refresh runtime URL from `/@react-refresh` to `http://localhost:3000/@react-refresh` to ensure there is only one Refresh runtime across the whole application. Note that if you define `base` option in the host application, you need to include it in the option, like: `http://localhost:3000/{base}`.

## Middleware mode

In [middleware mode](https://vite.dev/config/server-options.html#server-middlewaremode), you should make sure your entry `index.html` file is transformed by Vite. Here's an example for an Express server:

```js
app.get('/', async (req, res, next) => {
  try {
    let html = fs.readFileSync(path.resolve(root, 'index.html'), 'utf-8')

    // Transform HTML using Vite plugins.
    html = await viteServer.transformIndexHtml(req.url, html)

    res.send(html)
  } catch (e) {
    return next(e)
  }
})
```

Otherwise, you'll probably get this error:

```
Uncaught Error: @vitejs/plugin-react can't detect preamble. Something is wrong.
```

### disableOxcRecommendation

If set, disables the recommendation to use `@vitejs/plugin-react-oxc` (which is shown when `rolldown-vite` is detected and `babel` is not configured).

## Consistent components exports

For React refresh to work correctly, your file should only export React components. You can find a good explanation in the [Gatsby docs](https://www.gatsbyjs.com/docs/reference/local-development/fast-refresh/#how-it-works).

If an incompatible change in exports is found, the module will be invalidated and HMR will propagate. To make it easier to export simple constants alongside your component, the module is only invalidated when their value changes.

You can catch mistakes and get more detailed warning with this [eslint rule](https://github.com/ArnaudBarre/eslint-plugin-react-refresh).
>>>>>>> d0c912f4440469e3c1a4990afbd3d2ba6f7b00d5
