"""
Run this script once to register slash commands with Discord.
Usage: python register_commands.py
"""

import os
import httpx
from dotenv import load_dotenv


def main():
    """Register all slash commands with Discord."""
    load_dotenv()

    token = os.getenv("DISCORD_TOKEN")
    application_id = os.getenv("DISCORD_APPLICATION_ID")

    if not token or not application_id:
        raise RuntimeError("DISCORD_TOKEN and DISCORD_APPLICATION_ID must be set in .env")

    commands = [
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
                    "description": "Number of events to return (default 5, max 10)",
                    "type": 4,
                    "required": False,
                    "min_value": 1,
                    "max_value": 10,
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

    url = f"https://discord.com/api/v10/applications/{application_id}/commands"
    headers = {
        "Authorization": f"Bot {token}",
        "Content-Type": "application/json",
    }

    response = httpx.put(url, headers=headers, json=commands)
    if response.status_code in (200, 201):
        for command in response.json():
            print(f"✓ Registered command: /{command['name']}")
    else:
        print(f"✗ Failed: {response.status_code} {response.text}")


if __name__ == "__main__":
    main()