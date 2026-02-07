# CELLA_AI
## RAG Based Document Chatbot 🤖📚

A modern, AI-powered document chatbot that lets you upload documents and chat with them using advanced RAG (Retrieval-Augmented Generation) technology. Built with React and FastAPI.

![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=flat-square&logo=python)

## ✨ Features

- 📤 **Drag & Drop Upload** - Easily upload PDF, DOCX, TXT, XLSX, and CSV files
- 💬 **AI-Powered Chat** - Ask questions about your documents in natural language
- 📚 **Source Citations** - See exactly where answers come from with relevance scores
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations
- ⚡ **Fast Responses** - Powered by Groq's LLaMA 3.1 model
- 🔒 **Secure** - Vector embeddings stored in Pinecone

## 🎥 Demo

Upload any document and start asking questions! The AI will provide detailed answers with source citations showing exactly where the information came from.

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **CSS3** - Glassmorphism design with custom animations
- **Fetch API** - RESTful backend communication

### Backend
- **FastAPI** - High-performance Python web framework
- **LangChain** - RAG orchestration and document processing
- **Pinecone** - Vector database for semantic search
- **Groq** - Fast LLM inference (LLaMA 3.1 8B)
- **HuggingFace** - Sentence embeddings (all-MiniLM-L6-v2)

## 📁 Project Structure

```
CUBA_AI/
├── backend/
│   ├── routes/
│   │   ├── upload.py      # Document upload & processing
│   │   └── chat.py        # Chat & query handling
│   ├── service/
│   │   └── utils.py       # RAG services (chunking, embeddings, vector store)
│   └── main.py            # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── DocumentUpload.js
│   │   │   ├── ChatInterface.js
│   │   │   └── MessageBubble.js
│   │   ├── App.js         # Main application
│   │   └── index.css      # Design system
│   └── public/
└── requirements.txt
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 16+
- Pinecone API Key ([Get one here](https://www.pinecone.io/))
- Groq API Key ([Get one here](https://console.groq.com/))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd CUBA_AI
```

2. **Set up Backend**
```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

3. **Configure Environment Variables**

Create a `.env` file in the `backend` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
```

4. **Set up Frontend**
```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
.venv\Scripts\activate
python backend\main.py
```
Backend runs on: **http://localhost:8000**

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: **http://localhost:3000**

## 📖 How It Works

1. **Document Upload** - Files are processed and split into chunks
2. **Embedding** - Chunks are converted to vector embeddings
3. **Storage** - Vectors are stored in Pinecone for fast retrieval
4. **Query** - User questions are embedded and matched with relevant chunks
5. **Generation** - LLM generates answers based on retrieved context
6. **Citation** - Sources are displayed with relevance scores

## 🎨 UI Features

- **Glassmorphism Design** - Frosted glass effect with backdrop blur
- **Smooth Animations** - Fade-in effects and hover transitions
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Real-time Feedback** - Upload progress and typing indicators
- **Source Expansion** - Click to view full source content and metadata

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLM inference | Yes |
| `PINECONE_API_KEY` | Pinecone vector database key | Yes |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [LangChain](https://langchain.com/)
- Powered by [Groq](https://groq.com/) and [Pinecone](https://www.pinecone.io/)
- UI design inspired by modern glassmorphism trends
- Learned from [Sunny Savita YouTube Channel](https://www.youtube.com/@sunnysavita)⭐

---

**Made with ❤️ using React and FastAPI**
