import logging

from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)


def get_validated_product(*, data: dict, klass: type[BaseModel]) -> dict | None:
    try:
        validated = klass(**data).model_dump()

        logger.info(f"Product data after validation: {validated}")

        return validated

    except ValidationError as e:
        logger.warning(f"Validation failed: {e.errors()}")

    except Exception as e:
        logger.error(f"Unexpected error while validating: {e}")

    return None
