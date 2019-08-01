.PHONY: run dev test

run:
	gunicorn --log-level=info relayer.server:app

dev:
	export FLASK_APP=relayer/server.py flask run

test:
	pytest --disable-pytest-warnings
