# Splinter

# [![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

The ultimate expense-sharing app. Easily split bills, track group expenses, and settle debts seamlessly,
making financial harmony a breeze.


## Getting Started

### Running the app locally

- Copy `.env-example` as `.env`
- Start docker container using docker-compose

      docker-compose up


### Generating Fake Data

```shell
docker exec -it splinter-primary splinter generate_fake_transactions
```
