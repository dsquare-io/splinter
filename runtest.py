#!/usr/bin/env python
import os
import sys
from argparse import ArgumentParser

import django
from django.conf import settings
from django.test.utils import get_runner

PROJECT_ROOT = os.path.dirname(__file__)


def main():
    parser = ArgumentParser()
    parser.add_argument('targets', metavar='target', nargs='*', default=['tests'])
    args = parser.parse_args()

    targets = []
    for target in args.targets:
        if os.path.splitext(target)[1] == '.py':
            target = os.path.splitext(os.path.relpath(target, PROJECT_ROOT))[0].replace('/', '.')

        targets.append(target)

    os.chdir(PROJECT_ROOT)
    os.environ['DJANGO_SETTINGS_MODULE'] = 'splinter.settings'
    os.environ['WITHIN_TEST_SUITE'] = 'True'

    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(targets)
    sys.exit(bool(failures))


if __name__ == '__main__':
    main()
