install:
	pip install -r requirements.txt
	npm install

run:
	flask run --host=localhost --port=3000
