# AI Zendesk Quickstart

A Node.js example app to download your zendesk ticket data and analyze it with AI.

## Prerequisite

- Create a [cohere.ai](https://dashboard.cohere.ai/welcome/register) account
- Node.js version >= 18.15.0
- Yarn version 1.x

## Setup

1. Clone this repository

2. Navigate into the project directory

```bash
cd ai-zendesk-quickstart
```

3. Install the requirements

```bash
yarn
```

4. Make a copy of the example environment variables file

```bash
cp .env.example .env
```

5. Add your [Cohere API Key](https://dashboard.cohere.ai/api-keys) to the newly created `.env` file

6. Run the NPM scripts (as needed)

## Fine-Tuning a Model

After you have downloaded your zendesk data and ran scripts to generate training and validating data it's time to finetune a model. This can be easily done within the [Cohere dashboard](https://dashboard.cohere.ai/models).

## Scripts

- Download MCS Tickets

```bash
yarn mcs:download
```

- Download SD Tickets

```bash
yarn sd:download
```
