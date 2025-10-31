from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.get("/healthz")
def health_check():
    return {"health": "healthy"}


if __name__ == "__main__":
    # Local fallback for running via `python main.py`
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
