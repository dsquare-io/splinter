import math
from datetime import timedelta


def timedelta_to_string(delta: timedelta) -> str:
    seconds = delta.total_seconds()

    days = math.floor(seconds / 86400)
    hours = math.floor((seconds % 86400) / 3600)
    minutes = math.floor((seconds % 3600) / 60)
    seconds = math.floor(seconds % 60)

    components = []

    if days > 0:
        components.append(f'{days} days' if days > 1 else '1 day')

    if hours > 0:
        components.append(f'{hours} hours' if hours > 1 else '1 hour')

    if minutes > 0:
        components.append(f'{minutes} minutes' if minutes > 1 else '1 minute')

    if seconds > 0:
        components.append(f'{seconds} seconds' if seconds > 1 else '1 second')

    last_component = components.pop()
    if components:
        return f'{", ".join(components)} and {last_component}'

    return last_component
