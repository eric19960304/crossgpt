This project is built on top of an open source project https://github.com/ChatGPTNextWeb/NextChat, where it combine several LLM chatbot api into one platform.

The modification I made to this project are as following:

- remove unwanted components like Mask, deployment features created by the original authors to their partnership vendors, etc.
- change the UI look and feel.
- removed unwanted models, only keeping OpenAI, Gemini, and Grok.

Currently the website is hosted at https://chat.ericlauchiho.me/ on my personal Raspberry Pi 4B (running Raspberry Pi OS, a Debian GNU/Linux system) without any Login authentication and account management, so basically everyone can access and use the website for free, which bring a risk that the website can be exploited by malicious access to use up all my credits for the LLM API. A login feature with Google SSO is wanted at highest priority at this moment.

The website is deployed using docker compose with configuration file located at [docker-compose.yml](/docker-compose.yml).
The bash script used at my Raspberry Pi 4B to deploy and execute the website is following:

```bash
git -C /home/eric/projects/crossgpt pull
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build
```

All the API Key for accessing the LLM chatbot API are stored at the environment variables at the Raspberry Pi 4B.
