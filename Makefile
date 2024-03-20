lint:
	black . --check --quiet
	isort . --check-only

lint-fix:
	black .
	isort .

test:
	python runtest.py

test-coverage:
	coverage run --source='splinter' runtest.py

test-coverage-report: test-coverage
	coverage report
	coverage html
