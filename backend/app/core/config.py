"""KavachTrust Backend — Application configuration via Pydantic Settings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Application ──
    app_env: str = "development"
    app_name: str = "KavachTrust"

    # ── Database ──
    database_url: str = "sqlite+aiosqlite:///./dev.db"

    # ── JWT ──
    jwt_secret: str = "CHANGE-ME-dev-only-not-for-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # ── CORS ──
    cors_origins: str = "http://localhost:8443,http://localhost:5173"

    # ── Blockchain ──
    blockchain_mode: str = "MOCK"  # MOCK | TEST | LIVE
    sepolia_rpc_url: str = ""
    sepolia_chain_id: int = 11155111
    nft_contract_address: str = ""

    # ── Storage ──
    storage_provider: str = "local"
    storage_path: str = "./uploads"

    # ── Logging ──
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
