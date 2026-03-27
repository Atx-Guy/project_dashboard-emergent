import sys
from pathlib import Path

# Make the backend directory importable
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from server import app  # noqa: E402 – must come after sys.path manipulation
from mangum import Mangum

handler = Mangum(app, lifespan="off")
