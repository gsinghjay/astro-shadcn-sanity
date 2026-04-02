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

COMMANDS = [
    {
        "name": "ping",
        "description": "Check if Capstone Bot is online and get uptime info",
        "type": 1,
    },
    {
        "name": "project-status",
        "description": "Get the status, sponsor, and tech stack of a project from Sanity",
        "type": 1,
        "options": [
            {
                "name": "project-name",
                "description": "The name of the project to look up",
                "type": 3,
                "required": True,
            }
        ],
    },
    {
        "name": "upcoming-events",
        "description": "List upcoming events from Sanity",
        "type": 1,
        "options": [
            {
                "name": "limit",
                "description": "Number of events to return (default 5, max 15)",
                "type": 4,
                "required": False,
                "min_value": 1,
                "max_value": 15,
            }
        ],
    },
    {
        "name": "sponsor-info",
        "description": "Look up a sponsor or list all sponsors",
        "type": 1,
        "options": [
            {
                "name": "sponsor-name",
                "description": "The name of the sponsor to look up (omit to list all)",
                "type": 3,
                "required": False,
            }
        ],
    },
]

url = f"https://discord.com/api/v10/applications/{APPLICATION_ID}/commands"

headers = {
    "Authorization": f"Bot {TOKEN}",
    "Content-Type": "application/json",
}

response = httpx.put(url, headers=headers, json=COMMANDS)
if response.status_code in (200, 201):
    for command in response.json():
        print(f"✓ Registered command: /{command['name']}")
else:
    print(f"✗ Failed: {response.status_code} {response.text}")