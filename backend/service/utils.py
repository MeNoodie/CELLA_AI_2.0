import os
from typing import List, Dict, Any
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    UnstructuredExcelLoader,
    UnstructuredFileLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
import time
import logging
from dotenv import load_dotenv

load_dotenv()   

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_key = os.getenv("PINECONE_API_KEY")
if not api_key:
    raise ValueError("PINECONE_API_KEY not found in environment!")

class DocumentService:
    """Service for loading documents from various file types"""
    
    def load_documents(self, file_path: str) -> List[Document]:
        """
        Load documents from file using appropriate loader
        
        Args:
            file_path: Path to the file
            
        Returns:
            List of LangChain Document objects
        """
        path = file_path.lower()

        if path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif path.endswith(".docx"):
            loader = Docx2txtLoader(file_path)
        elif path.endswith(".txt"):
            loader = TextLoader(file_path, encoding="utf-8")
        elif path.endswith(".xlsx"):
            loader = UnstructuredExcelLoader(file_path)
        else:
            loader = UnstructuredFileLoader(file_path)

        docs = loader.load()
        logger.info(f"Loaded {len(docs)} documents from {file_path}")
        return docs

    def extract_docs(self, docs: List[Document]) -> List[Dict[str, Any]]:
        """
        Extract text and metadata from LangChain documents
        
        Args:
            docs: List of LangChain Document objects
            
        Returns:
            List of dictionaries with text and metadata
        """
        extracted = []
        for doc in docs:
            extracted.append({
                "text": doc.page_content,
                "metadata": doc.metadata
            })
        
        logger.info(f"Extracted {len(extracted)} documents")
        return extracted


class ChunkingService:
    """Service for splitting documents into chunks"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        """
        Initialize the chunking service
        
        Args:
            chunk_size: Maximum size of each chunk
            chunk_overlap: Overlap between chunks
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def split_documents(self, docs: List[Document]) -> List[Document]:
        """
        Split documents into smaller chunks
        
        Args:
            docs: List of LangChain Document objects
            
        Returns:
            List of chunked Document objects
        """
        chunks = self.text_splitter.split_documents(docs)
        logger.info(f"Split {len(docs)} documents into {len(chunks)} chunks")
        return chunks


class EmbeddingsService:
    """Service for generating embeddings"""
    
    def __init__(self, model_name: str = "BAAI/bge-large-en-v1.5"):
        """
        Initialize the embeddings service
        
        Args:
            model_name: HuggingFace model name for embeddings
        """
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        logger.info(f"Initialized embeddings model: {model_name}")
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings
            
        Returns:
            List of embedding vectors
        """
        embeddings = self.embeddings.embed_documents(texts)
        logger.info(f"Generated embeddings for {len(texts)} texts")
        return embeddings
    
    def embed_query(self, text: str) -> List[float]:
        """
        Generate embedding for a single query
        
        Args:
            text: Query text
            
        Returns:
            Embedding vector
        """
        embedding = self.embeddings.embed_query(text)
        return embedding


class VectorStoreService:
    """Service for managing Pinecone vector store using LangChain"""
    
    def __init__(self, index_name: str = "celladocs", dimension: int = 384):
        """
        Initialize Pinecone vector store
        
        Args:
            index_name: Name of the Pinecone index
            dimension: Dimension of embeddings (384 for all-MiniLM-L6-v2)
        """
        
        
        self.pc = Pinecone(api_key=api_key)
        self.index_name = index_name
        self.dimension = dimension
        
        # Create or connect to index
        self._initialize_index()
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize LangChain vector store
        self.vector_store = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )
        
        logger.info(f"✅ Pinecone vector store ready: {self.index_name}")
    
    def _initialize_index(self):
        """Create Pinecone index if it doesn't exist"""
        existing_indexes = [idx.name for idx in self.pc.list_indexes()]
        
        if self.index_name not in existing_indexes:
            logger.info(f"🔨 Creating Pinecone index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric='cosine',
                spec=ServerlessSpec(cloud='aws', region='us-east-1')
            )
            
            # Wait for index to be ready
            while not self.pc.describe_index(self.index_name).status['ready']:
                time.sleep(1)
            logger.info("✅ Index created and ready!")
    
    def add_documents(self, documents: List[Document]) -> List[str]:
        """
        Add documents to vector store
        
        Args:
            documents: List of LangChain Document objects
            
        Returns:
            List of document IDs
        """
        ids = self.vector_store.add_documents(documents)
        logger.info(f"Added {len(ids)} documents to vector store")
        return ids
    
    def similarity_search(
        self, 
        query: str, 
        k: int = 5
    ) -> List[Document]:
        """
        Search for similar documents
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of similar Document objects
        """
        results = self.vector_store.similarity_search(query, k=k)
        logger.info(f"Found {len(results)} similar documents")
        return results
    
    def similarity_search_with_score(
        self, 
        query: str, 
        k: int = 5
    ) -> List[tuple[Document, float]]:
        """
        Search for similar documents with relevance scores
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of tuples (Document, score)
        """
        results = self.vector_store.similarity_search_with_score(query, k=k)
        logger.info(f"Found {len(results)} similar documents with scores")
        return results
    
    def clear_index(self):
        """Delete all vectors from the index"""
        index = self.pc.Index(self.index_name)
        index.delete(delete_all=True)
        logger.info("✅ Cleared all vectors from index")


# Example usage
if __name__ == "__main__":
    # Initialize services
    doc_service = DocumentService()
    chunk_service = ChunkingService()
    vector_service = VectorStoreService()
    
    # Load documents
    file_path = "example.pdf"  # Change to your file
    docs = doc_service.load_documents(file_path)
    
    # Split into chunks
    chunks = chunk_service.split_documents(docs)
    
    # Add to vector store (embedding happens automatically!)
    ids = vector_service.add_documents(chunks)
    print(f"Added {len(ids)} chunks to vector store")
    
    # Search
    query = "What is the revenue?"
    results = vector_service.similarity_search_with_score(query, k=5)
    
    for doc, score in results:
        print(f"\nScore: {score:.4f}")
        print(f"Content: {doc.page_content[:200]}...")
        print(f"Metadata: {doc.metadata}")