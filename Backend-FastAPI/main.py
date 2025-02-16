from fastapi import FastAPI

app = FastAPI()

@app.get("/test-route")
async def test():
    return "hello world"
