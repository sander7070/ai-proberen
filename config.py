import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-4-7")
MONITOR_INDEX = int(os.getenv("MONITOR_INDEX", "1"))
SCREENSHOT_INTERVAL = float(os.getenv("SCREENSHOT_INTERVAL", "3.0"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2048"))
AUTO_ACT = os.getenv("AUTO_ACT", "false").lower() == "true"

if not ANTHROPIC_API_KEY:
    raise EnvironmentError(
        "ANTHROPIC_API_KEY niet ingesteld. Maak een .env bestand aan op basis van .env.example"
    )
