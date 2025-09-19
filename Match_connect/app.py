from fastapi import FastAPI, Request, HTTPException
from ai.embedding import generate_embedding
from ai.faiss_index import add_user_profile, get_top_matches
import logging

#Buhata sa ni una
# Step 1: venv\Scripts\activate

# Step 2: ayaw kalimot install sa dependencies // pip install -r requirements.txt
# Step 3: uvicorn app:app --reload // to run the server

# if it doesn't work delete the venv folder and create a new one // python -m venv venv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Match Connect Python backend. Use /add_profile to add and /match to find compatible teammates."
    }

@app.get("/status")
async def get_status():
    from ai.faiss_index import index, user_profiles
    try:
        return {
            "indexSize": index.ntotal,
            "profilesCount": len(user_profiles),
            "isHealthy": index.ntotal == len(user_profiles)
        }
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not get status")

@app.post("/add_profile")
async def add_profile(request: Request):
    try:
        data = await request.json()
        logger.info(f"Received add_profile for {data.get('email')}")

        required = ["email", "name", "technicalSkills", "preferredRoles", "projectInterests", "personality"]
        for field in required:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                raise HTTPException(status_code=400, detail=f"Missing field: {field}")
            if data[field] is None:
                logger.warning(f"Field {field} is null, using empty value")
                if field == "personality":
                    data[field] = "Unknown"
                elif isinstance(data[field], list):
                    data[field] = []
                else:
                    data[field] = ""

        # Additional validation for personality
        if not data['personality'] or data['personality'].strip() == "":
            logger.warning(f"Empty personality for {data.get('email')}, using 'Unknown'")
            data['personality'] = "Unknown"

        profile_text = f"{data['technicalSkills']} {data['preferredRoles']} {data['projectInterests']}"
        personality_text = data['personality']

        logger.info(f"Generating embedding for profile: {profile_text[:100]}...")
        logger.info(f"Generating embedding for personality: {personality_text}")

        profile_embedding = generate_embedding(profile_text)
        personality_embedding = generate_embedding(personality_text)

        # Check if embedding generation was successful
        if profile_embedding is None or personality_embedding is None:
            logger.error("Embedding generation failed")
            raise HTTPException(status_code=500, detail="Embedding generation failed")

        user_info = {
            "email": data["email"],
            "name": data["name"],
            "technicalSkills": data["technicalSkills"],
            "preferredRoles": data["preferredRoles"],
            "projectInterests": data["projectInterests"],
            "personality": data["personality"]
        }

        if not add_user_profile(profile_embedding, personality_embedding, user_info):
            logger.error("Failed to store user profile")
            raise HTTPException(status_code=500, detail="Failed to store user profile")

        logger.info(f"Profile successfully added for {data.get('email')}")
        return {"message": "Profile added successfully"}

    except Exception as e:
        logger.error(f"Error in /add_profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/match")
async def match_profile(request: Request):
    try:
        data = await request.json()
        logger.info(f"Received /match request for {data.get('email', 'anonymous')}")

        required = ["technicalSkills", "preferredRoles", "projectInterests", "personality"]
        for field in required:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                raise HTTPException(status_code=400, detail=f"Missing field: {field}")
            if data[field] is None:
                logger.warning(f"Field {field} is null, using empty value")
                if field == "personality":
                    data[field] = "Unknown"
                elif isinstance(data[field], list):
                    data[field] = []
                else:
                    data[field] = ""        # Additional validation for personality
        if not data['personality'] or data['personality'].strip() == "":
            logger.warning(f"Empty personality for matching request, using 'Unknown'")
            data['personality'] = "Unknown"
            
        query_text = f"{data['technicalSkills']} {data['preferredRoles']} {data['projectInterests']}"
        personality_text = data["personality"]

        logger.info(f"Generating embedding for query: {query_text[:100]}...")
        logger.info(f"Generating embedding for personality: {personality_text}")
        
        query_embedding = generate_embedding(query_text)
        personality_embedding = generate_embedding(personality_text)

        # Check if embedding generation was successful
        if query_embedding is None or personality_embedding is None:
            logger.error("Embedding generation failed")
            raise HTTPException(status_code=500, detail="Embedding generation failed")        # Pass the full data to get_top_matches so it has access to the projectInterests
        project_interests = data.get("projectInterests", [])
        preferred_roles = data.get("preferredRoles", [])
        logger.info(f"Project interests from request: {project_interests}")
        logger.info(f"Preferred roles from request: {preferred_roles}")
        
        matches = get_top_matches(
            query_embedding, 
            personality_embedding, 
            exclude_email=data.get("email"),
            query_project_interests=project_interests,
            query_preferred_roles=preferred_roles
        )

        logger.info(f"Found {len(matches)} matches")
        return {"matches": matches}

    except Exception as e:
        logger.error(f"Error in /match: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
