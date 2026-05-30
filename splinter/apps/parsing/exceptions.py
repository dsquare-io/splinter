class ParseError(Exception):
    """Non-recoverable parsing failure (bad input, unsupported model output)."""


class ParseTransientError(ParseError):
    """Transient failure (network/provider hiccup) — safe to retry."""
