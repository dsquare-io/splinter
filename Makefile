lint:
	yapf . -rd
	isort . --check-only

lint-fix:
	yapf . -ri
	isort .

test:
	python runtest.py

test-coverage:
	coverage run --source='splinter' runtest.py

test-coverage-report: test-coverage
	coverage report
	coverage html
