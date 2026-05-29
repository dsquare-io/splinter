import os


def _file_ext(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()
