"""
Run this script once to register slash commands with Discord.
Usage: python register_commands.py
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
APPLICATION_ID = os.getenv("DISCORD_APPLICATION_ID")

if not TOKEN or not APPLICATION_ID:
    raise RuntimeError("DISCORD_TOKEN and DISCORD_APPLICATION_ID must be set in .env")

COMMAND = {
    "name": "ping",
    "description": "Check if Capstone Bot is online and get uptime info",
    "type": 1,
}

url = f"https://discord.com/api/v10/applications/{APPLICATION_ID}/commands"

headers = {
    "Authorization": f"Bot {TOKEN}",
    "Content-Type": "application/json",
}

response = httpx.post(url, headers=headers, json=COMMAND)
if response.status_code in (200, 201):
    command = response.json()
    print(f"✓ Registered command: /{command['name']}")
else:
    print(f"✗ Failed: {response.status_code} {response.text}")