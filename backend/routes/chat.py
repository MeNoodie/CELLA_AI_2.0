from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from dotenv import load_dotenv
from typing import List, Optional
from service.utils import ( ChunkingService,VectorStoreService)
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

chunking_service = ChunkingService(chunk_size=500, chunk_overlap=100)
vector_service = VectorStoreService(index_name="celladocs")

app = FastAPI()
router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    top_k: int = 3


class QueryResponse(BaseModel):
    answer: str
    sources: list


load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment!")

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=groq_api_key,
    temperature=0.7
)

@router.post("/query", response_model=QueryResponse)
def query_knowledge_base(request: QueryRequest):
    """
    Query the knowledge base using RAG
    """
    try:
        if not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )
        
        # Step 1: Search for similar documents
        results = vector_service.similarity_search_with_score(
            query=request.question,
            k=request.top_k
        )
        
        if not results:
            return QueryResponse(
                answer="No relevant information found in the knowledge base.",
                sources=[]
            )
        
        # Step 2: Prepare context from retrieved documents
        context_parts = []
        sources = []
        
        for idx, (doc, score) in enumerate(results):
            context_parts.append(
                f"Source {idx+1} (Relevance: {score:.3f}):\n{doc.page_content}"
            )
            sources.append({
                "content": doc.page_content[:200] + "...",
                "score": float(score),
                "metadata": doc.metadata
            })
        
        context = "\n\n".join(context_parts)
        
        # Step 3: Generate answer using LLM
        system_prompt = """You are a friendly and helpful AI assistant designed to help users understand their documents. 

Your role is to:
- Answer questions in a warm, conversational, and approachable manner
- Provide clear, detailed explanations when needed
- Use simple language that's easy to understand
- Be patient and supportive with all questions
- If you're not sure about something, be honest and explain what you do know
- Break down complex information into easy-to-digest parts
- Use examples when helpful to clarify your points

Remember: Your goal is to make the user feel comfortable and help them get the most value from their documents."""

        user_prompt = f"""Based on the following information from the user's document, please answer their question in a friendly and helpful way.

Document Context:
{context}

User's Question: {request.question}

Please provide a clear, friendly answer. If the information isn't in the document, kindly let them know and offer to help in other ways if possible."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = llm.invoke(messages)
        answer = response.content
        
        return QueryResponse(
            answer=answer,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

