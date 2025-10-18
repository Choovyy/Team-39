from sentence_transformers import SentenceTransformer
import numpy as np
import logging

logger = logging.getLogger(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")  # Fast and compact
#AI Type: Natural Language Processing (NLP) model

def generate_embedding(text: str):
    try:
        # Ensure input is not None and is a string
        if text is None:
            logger.error("Cannot generate embedding for None text")
            return None
            
        # Add additional validation for empty strings
        if isinstance(text, str) and text.strip() == "":
            logger.error("Cannot generate embedding for empty text")
            return None
            
        # Handle default/unknown personality values
        if text.strip().lower() == "unknown":
            logger.warning("Generating embedding for 'Unknown' value - this may impact matching quality")
            # Use a generic description instead of just "Unknown"
            text = "Balanced team member with mixed traits"
            
        # Generate the embedding
        embedding = model.encode(text)
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        return None
