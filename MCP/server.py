#!/usr/bin/env python3
"""
Basic MCP Server for RegScale_Demo_Demo
Provides simple tools for testing MCP functionality
"""

import asyncio
from mcp.server import Server
from mcp.types import Tool, TextContent
import mcp.server.stdio

from Tools.Utility import get_utility_tools, handle_utility_tool

# Initialize the MCP server
server = Server("regscale_demo_demo_mcp")

def get_tool_names(tool_function):
    """Get list of tool names from a tool function"""
    tools = tool_function()
    return [tool.name for tool in tools]


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    # Get all tool categories
    utility_tools = get_utility_tools()
    sqlite_tools = get_sqlite_tools()
    
    return utility_tools + sqlite_tools


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls"""
    
    # Handle utility tools
    if name in get_tool_names(get_utility_tools):
        return await handle_utility_tool(name, arguments)
    
    else:
        raise ValueError(f"Unknown tool: {name}")


async def main():
    """Run the MCP server"""
    print("RegScale Demo Demo Server Started")
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())