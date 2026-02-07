import os 
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from service.utils import (
    DocumentService,
    ChunkingService,
    VectorStoreService
)
router = APIRouter()

document_service = DocumentService()
chunking_service = ChunkingService(chunk_size=500, chunk_overlap=100)
vector_service = VectorStoreService(index_name="celladocs")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file and process it into vector store
    Supports: PDF, DOCX, TXT, XLSX
    """
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.txt', '.xlsx', '.doc', '.csv']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {allowed_extensions}"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Load documents using LangChain loaders
        docs = document_service.load_documents(tmp_path)
        
        if not docs:
            raise HTTPException(
                status_code=400,
                detail="No content found in file"
            )
        
        # Step 2: Split into chunks
        chunks = chunking_service.split_documents(docs)
        
        # Step 3: Add to vector store (embeddings happen automatically!)
        ids = vector_service.add_documents(chunks)
        
        return {
            "status": "success",
            "filename": file.filename,
            "documents_loaded": len(docs),
            "chunks_created": len(chunks),
            "vectors_stored": len(ids)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )
    
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)