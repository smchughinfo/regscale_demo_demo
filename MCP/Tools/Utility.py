"""
Utility tools for RegScale_Demo_Demo MCP server
"""

from datetime import datetime
from mcp.types import Tool, TextContent
import subprocess

def get_utility_tools():
    """Return list of utility tools"""
    return [
        Tool(
            name="echo",
            description="Echo back the input text",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to echo back"
                    }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="get_time",
            description="Get the current date and time",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="show_screen_numbers",
            description="Display screen numbers on the users screen",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="take_screenshot",
            description="Take a screenshot of a specific screen",
            inputSchema={
                "type": "object",
                "properties": {
                    "screen_number": {
                        "type": "integer",
                        "description": "Screen number to capture (0, 1, 2, etc.)"
                    }
                },
                "required": ["screen_number"]
            }
        )
    ]

async def handle_utility_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle utility tool calls"""
    
    if name == "echo":
        return await echo(arguments)
    elif name == "get_time":
        return await get_time(arguments)
    elif name == "show_screen_numbers":
        return await show_screen_numbers(arguments)
    elif name == "take_screenshot":
        return await take_screenshot(arguments)
    else:
        return [TextContent(type="text", text=f"Unknown utility tool: {name}")]

####################################################################################################
####### TOOL IMPLEMENTATIONS #######################################################################
####################################################################################################

async def echo(arguments: dict) -> list[TextContent]:
    """Echo back the input text"""
    text = arguments.get("text", "")
    return [TextContent(type="text", text=f"Echo: {text}")]

async def get_time(arguments: dict) -> list[TextContent]:
    """Get the current date and time"""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return [TextContent(type="text", text=f"Current time: {current_time}")]

async def show_screen_numbers(arguments: dict) -> list[TextContent]:
    """Show screen numbers using PowerShell with DPI awareness"""
    ps_script = '''
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    [System.Windows.Forms.Application]::SetHighDpiMode([System.Windows.Forms.HighDpiMode]::SystemAware)
    
    $screens = [System.Windows.Forms.Screen]::AllScreens
    $forms = @()
    
    for ($i = 0; $i -lt $screens.Count; $i++) {
        $screen = $screens[$i]
        
        $form = New-Object System.Windows.Forms.Form
        $form.BackColor = [System.Drawing.Color]::FromArgb(255, 0, 0, 0)
        $form.Size = New-Object System.Drawing.Size(300, 200)
        $form.StartPosition = "Manual"
        $form.FormBorderStyle = "None"
        $form.TopMost = $true
        $form.ShowInTaskbar = $false
        
        $x = $screen.WorkingArea.X + ($screen.WorkingArea.Width - 300) / 2
        $y = $screen.WorkingArea.Y + ($screen.WorkingArea.Height - 200) / 2
        $form.Location = New-Object System.Drawing.Point($x, $y)
        
        $label = New-Object System.Windows.Forms.Label
        $label.Text = "$i"
        $label.Font = New-Object System.Drawing.Font("Arial", 72, [System.Drawing.FontStyle]::Bold)
        $label.ForeColor = [System.Drawing.Color]::White
        $label.BackColor = [System.Drawing.Color]::FromArgb(255, 0, 0, 0)
        $label.TextAlign = "MiddleCenter"
        $label.Dock = "Fill"
        
        $form.Controls.Add($label)
        $form.Show()
        $forms += $form
    }
    
    Start-Sleep 5
    
    foreach ($form in $forms) {
        $form.Close()
        $form.Dispose()
    }
    '''
    
    try:
        subprocess.run(["powershell.exe", "-Command", ps_script])
        return [TextContent(type="text", text="Screen numbers displayed for 5 seconds")]
    except Exception as e:
        return [TextContent(type="text", text=f"Error displaying screen numbers: {str(e)}")]

async def take_screenshot(arguments: dict) -> list[TextContent]:
    """Take a screenshot of a specific screen and return the file path"""
    screen_number = arguments.get("screen_number", 0)
    
    # Generate timestamp for unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Use Windows temp directory but return WSL accessible path
    windows_temp_path = f"$env:TEMP\\screenshot_screen{screen_number}_{timestamp}.png"
    # For WSL access, we need to determine the actual temp path at runtime
    wsl_temp_base = "/mnt/c/Users/seanm/AppData/Local/Temp"  # Typical Windows temp location
    wsl_accessible_path = f"{wsl_temp_base}/screenshot_screen{screen_number}_{timestamp}.png"
    
    ps_script = f'''
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    [System.Windows.Forms.Application]::SetHighDpiMode([System.Windows.Forms.HighDpiMode]::SystemAware)
    
    $screens = [System.Windows.Forms.Screen]::AllScreens
    
    if ({screen_number} -ge $screens.Count) {{
        Write-Host "ERROR: Screen {screen_number} not found. Available screens: 0 to $($screens.Count - 1)"
        exit 1
    }}
    
    $screen = $screens[{screen_number}]
    $bounds = $screen.Bounds
    
    $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
    
    # Use Windows temp directory (it already exists)
    $tempPath = "{windows_temp_path}"
    
    $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    $graphics.Dispose()
    
    Write-Host "Screenshot saved to: $tempPath"
    '''
    
    try:
        result = subprocess.run(
            ["powershell.exe", "-Command", ps_script], 
            capture_output=True, 
            text=True
        )
        
        if result.returncode == 0:
            return [TextContent(type="text", text=f"Screenshot taken of screen {screen_number}: {wsl_accessible_path}")]
        else:
            return [TextContent(type="text", text=f"Error taking screenshot: {result.stderr}")]
    except Exception as e:
        return [TextContent(type="text", text=f"Error taking screenshot: {str(e)}")]