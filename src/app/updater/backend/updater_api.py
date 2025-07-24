from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

updater_api = FastAPI()

# Enable CORS for local development or public access
updater_api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exact changelog entries
changelogs = [
    {
        "version": "v1.2.3",
        "date": "2025-06-10",
        "details": [
            "Improved automatic update process for better reliability.",
            "Fixed minor bugs in mod synchronization.",
            "Updated UI with clearer status messages.",
        ],
    },
    {
        "version": "v1.2.2",
        "date": "2025-05-25",
        "details": [
            "Added manual update button.",
            "Fixed issue with GitHub link.",
            "Optimized download speed.",
        ],
    },
    # Add more changelog entries here as needed
]

@updater_api.get("/api/changelogs")
def get_changelogs():
    return changelogs
