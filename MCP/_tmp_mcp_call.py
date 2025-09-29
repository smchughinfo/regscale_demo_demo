import sys
from pathlib import Path
import anyio
from mcp.client.session import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

SERVER_DIR = Path(r"/mnt/c/Users/seanm/Desktop/MedBotAlpha/MCP")

async def main():
    server_params = StdioServerParameters(
        command=str(SERVER_DIR / ".venv/bin/python"),
        args=[str(SERVER_DIR / "server.py")],
        cwd=str(SERVER_DIR),
    )
    async with stdio_client(server=server_params) as (read_stream, write_stream):
        session = ClientSession(read_stream, write_stream)
        init = await session.initialize()
        server_info = init.serverInfo
        print(f"Initialized with server: {server_info.name} v{server_info.version}")

        tools = await session.list_tools()
        tool_names = [tool.name for tool in tools.tools]
        print("Available tools:", ", ".join(tool_names))

        result = await session.call_tool("show_screen_numbers", {})
        if result.content:
            print("Tool call text:")
            for item in result.content:
                if item.type == "text":
                    print(item.text)
        else:
            print("Tool call returned no textual content.")

anyio.run(main)
