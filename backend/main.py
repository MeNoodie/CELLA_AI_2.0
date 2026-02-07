from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
from routes.upload import router as upload_router
from routes.chat import router as query_router

app = FastAPI(title="CELLA_AI_2.0 API", version="2.0.0")
# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "CELLA_AI_2.0 - Your Intelligent Document Assistant",
        "status": "running",
        "version": "2.0.0",
        "endpoints": ["/upload", "/query", "/health"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "pinecone": "connected",
        "embeddings": "ready"
    }

app.include_router(upload_router)
app.include_router(query_router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )