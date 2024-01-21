from collections import defaultdict

from django.http import HttpResponse
from django.views import View


class RobotsConfig:
    def __init__(self):
        self._allowed = defaultdict(set)
        self._disallowed = defaultdict(set)

    def allow(self, url: str, user_agent: str = '*'):
        self._allowed[user_agent].add(url)
        return self

    def disallow(self, url: str, user_agent: str = '*'):
        self._disallowed[user_agent].add(url)
        return self

    def disallow_all(self):
        return self.disallow('/')

    def allow_all(self):
        return self.allow('/')

    def __str__(self):
        user_agents = set(self._allowed)
        user_agents.update(self._disallowed)

        lines = []
        for user_agent in sorted(user_agents):
            lines.append(f'User-Agent: {user_agent}')
            for disallowed in self._disallowed.get(user_agent, ()):
                lines.append(f'Disallow: {disallowed}')

            for allowed in self._allowed.get(user_agent, ()):
                lines.append(f'Allow: {allowed}')

            lines.append('')

        return '\n'.join(lines)


class RobotsView(View):
    config: RobotsConfig = None

    def get(self, request):
        robots = b''
        if self.config is not None:
            robots = str(self.config).encode('utf8')

        return HttpResponse(robots, content_type='text/plain')
