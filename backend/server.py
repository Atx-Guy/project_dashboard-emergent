from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    description: str = ""
    tags: List[str] = []
    status: str = "Not Started"  # Not Started, In Progress, Completed, On Hold
    url: str = ""
    lastUpdated: str
    notes: str = ""
    priority: str = "Medium"  # Low, Medium, High
    archived: bool = False
    createdAt: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    tags: Optional[List[str]] = []
    status: Optional[str] = "Not Started"
    url: Optional[str] = ""
    notes: Optional[str] = ""
    priority: Optional[str] = "Medium"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None


class ArchiveUpdate(BaseModel):
    archived: bool


class BuildResponse(BaseModel):
    message: str
    project_id: str
    project_name: str


# Helper function to generate ID
def generate_id():
    from uuid import uuid4
    return str(uuid4())


# Routes
@api_router.get("/")
async def root():
    return {"message": "Project Logger API"}


@api_router.post("/projects", response_model=Project)
async def create_project(project_input: ProjectCreate):
    now = datetime.now(timezone.utc).isoformat()
    
    project_data = {
        "id": generate_id(),
        "name": project_input.name,
        "description": project_input.description,
        "tags": project_input.tags,
        "status": project_input.status,
        "url": project_input.url,
        "lastUpdated": now,
        "notes": project_input.notes,
        "priority": project_input.priority,
        "archived": False,
        "createdAt": now
    }
    
    await db.projects.insert_one(project_data)
    return Project(**project_data)


@api_router.get("/projects", response_model=List[Project])
async def get_projects(search: Optional[str] = None, tag: Optional[str] = None, status: Optional[str] = None):
    query = {}
    
    # Build search query
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"notes": {"$regex": search, "$options": "i"}}
        ]
    
    if tag:
        query["tags"] = tag
    
    if status:
        query["status"] = status
    
    projects = await db.projects.find(query, {"_id": 0}).to_list(1000)
    
    # Sort by lastUpdated (newest first)
    projects.sort(key=lambda x: x.get("lastUpdated", ""), reverse=True)
    
    return projects


@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return Project(**project)


@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_update: ProjectUpdate):
    # Check if project exists
    existing_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Build update data
    update_data = {k: v for k, v in project_update.model_dump().items() if v is not None}
    
    if update_data:
        update_data["lastUpdated"] = datetime.now(timezone.utc).isoformat()
        
        await db.projects.update_one(
            {"id": project_id},
            {"$set": update_data}
        )
    
    # Fetch updated project
    updated_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return Project(**updated_project)


@api_router.patch("/projects/{project_id}/archive", response_model=Project)
async def toggle_archive(project_id: str, archive_data: ArchiveUpdate):
    # Check if project exists
    existing_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "archived": archive_data.archived,
            "lastUpdated": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Fetch updated project
    updated_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return Project(**updated_project)


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully", "id": project_id}


@api_router.post("/projects/{project_id}/build", response_model=BuildResponse)
async def build_project(project_id: str):
    # Check if project exists
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update lastUpdated timestamp when building
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"lastUpdated": datetime.now(timezone.utc).isoformat()}}
    )
    
    return BuildResponse(
        message=f"Building project: {project['name']}",
        project_id=project_id,
        project_name=project['name']
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
