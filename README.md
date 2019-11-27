<h1 align="center">:smile_cat:<tt>octochat</tt></h1>

<blockquote align="center">Privately message with your GitHub followers</blockquote>

## Usage

<img width="1072" alt="example-octochat" src="https://user-images.githubusercontent.com/27806/69747446-020e6900-110c-11ea-9a4b-41fc59a9bb6f.png">

[Login with your GitHub account](https://octochat.dev/login) to start messaging privately with your GitHub followers.

## About

This app is intended _for demonstration use only_, and is deployed using [Amazon Web Services](https://aws.amazon.com/). The architecture is explained at a high-level [here](docs/ARCHITECTURE.md).

## Development

Create a `.env` file based on [the included example template](.env.example).

Build a development image from [`Dockerfile.develop`](Dockerfile.develop):

```shell
docker build -t octochat -f Dockerfile.develop .
```

Use the included [`server.sh`](script/server.sh) script to run the development server in a container:

```shell
./script/server.sh
```

The application will be available at [http://localhost:49160/](http://localhost:49160/).

## Contributions

We welcome contributions! See how to [contribute](docs/CONTRIBUTING.md).

## License

[MIT](LICENSE.md)