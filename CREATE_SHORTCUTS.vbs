' Jorb Core - Desktop Shortcut Creator
' Double-click this file to create desktop shortcuts for Jorb Core

Set WshShell = WScript.CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get current directory and desktop path
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
desktopPath = WshShell.SpecialFolders("Desktop")

' Create Install shortcut
Set installShortcut = WshShell.CreateShortcut(desktopPath & "\Install Jorb Core.lnk")
installShortcut.TargetPath = currentDir & "\INSTALL.bat"
installShortcut.WorkingDirectory = currentDir
installShortcut.Description = "Install and setup Jorb Core"
installShortcut.IconLocation = "%SystemRoot%\System32\SHELL32.dll,13"
installShortcut.Save

' Create Launch shortcut
Set launchShortcut = WshShell.CreateShortcut(desktopPath & "\Launch Jorb Core.lnk")
launchShortcut.TargetPath = currentDir & "\LAUNCH.bat"
launchShortcut.WorkingDirectory = currentDir
launchShortcut.Description = "Launch Jorb Core Agentic OS"
launchShortcut.IconLocation = "%SystemRoot%\System32\SHELL32.dll,165"
launchShortcut.Save

' Show success message
MsgBox "Desktop shortcuts created successfully!" & vbCrLf & vbCrLf & _
       "You can now use:" & vbCrLf & _
       "  - 'Install Jorb Core' to run installation" & vbCrLf & _
       "  - 'Launch Jorb Core' to start the application" & vbCrLf & vbCrLf & _
       "Check your desktop for the shortcuts.", _
       vbInformation, "Jorb Core Shortcuts Created"

' Cleanup
Set installShortcut = Nothing
Set launchShortcut = Nothing
Set WshShell = Nothing
Set fso = Nothing
