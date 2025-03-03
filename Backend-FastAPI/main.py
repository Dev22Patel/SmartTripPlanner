from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.predict_india import router as india_router
from api.predict_not_india import router as not_india_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://smart-trip-planner-v1.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(india_router, prefix="/api/predict/india")
app.include_router(not_india_router, prefix="/api/predict/not-india")

@app.get("/")
async def root():
    return {"message": "Welcome to the Smart Trip Planner API"}
