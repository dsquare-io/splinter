def parse_int(value: str, default: int | None = None) -> int:
    if value and value.isdigit():
        return int(value)

    return default


def parse_float(value: str, default: float | None = None) -> float:
    if value:
        try:
            return float(value)
        except ValueError:
            pass

    return default


def parse_bool(value: str, default: bool | None = None) -> bool:
    if not value:
        return default

    value = value.lower()
    if value in ['1', 't', 'true']:
        return True

    elif value in ['0', 'f', 'false']:
        return False

    return default
