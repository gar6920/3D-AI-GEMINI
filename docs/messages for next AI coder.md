## environment details that will help the AI coder
- **PowerShell Execution Issues**: When running scripts via terminal, you may encounter execution policy errors. Use `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` for the current session only.
- **Command Issues**: Always use full paths when running commands instead of relative paths to avoid directory issues.
- **Editor Configuration**: Make sure your editor treats the files as JavaScript, not TypeScript, to avoid incorrect error highlighting.
- **Line Endings**: Ensure CRLF line endings for Windows compatibility with the push scripts.
- **Deploy Server**: Running the server requires Node.js; use `npm run dev` in the server directory.
- **PlayCanvas Development**:
  - Scripts are edited locally but must be uploaded to PlayCanvas via push.bat
  - Always check the console for errors after pushing changes
  - Type annotations are not supported in PlayCanvas scripts
  - Use `pc.createScript()` pattern for all scripts
  - PlayCanvas coordinate system: -Z is forward, +Z is backward, +X is right, -X is left

## Key Components:
- **Client (PlayCanvas)**: Handles rendering, input processing, and client-side prediction
  - NetworkManager: Manages communication with the Colyseus server
  - PlayerMovement: Processes input and handles movement prediction
- **Server (Colyseus)**: Manages game state and player synchronization
  - GameRoom: Coordinates the multiplayer experience
  - Player schema: Contains position, movement, and rotation data

## PlayCanvas Specifics:
- Scripts are added to entities in the PlayCanvas editor but edited locally
- Use the `pc.createScript()` pattern for all scripts
- Define attributes with `ScriptName.attributes.add()`
- PlayCanvas coordinate system: -Z is forward (into screen), +Z is backward, +X is right, -X is left
- Use `push.bat` in the playcanvas-sync directory to push local changes to the PlayCanvas project

## Common Issues & Solutions:
2. **Attribute initialization**: Never reassign attributes in `initialize()`, use the proper attribute system
3. **Movement direction**: Use world-space translation (`entity.translate()`) instead of local-space (`entity.translateLocal()`) for predictable WASD behavior
4. **Rotation handling**: Prefer Euler angles for simple rotations to avoid quaternion-related issues
5. **Finding scripts/entities**: Build robust search methods that try multiple approaches to find dependencies

## workflow
1. Edit scripts locally in your preferred code editor
2. Push changes to PlayCanvas using `push.bat` in the playcanvas-sync directory
3. Test in the PlayCanvas editor's preview mode
4. Debug using console logs (set script.debug = true)
5. Commit working changes to GitHub
6. For networked features, test with both client and server running

## Recent Progress:
- Fixed player movement issues in the PlayerMovement script
- Converted the script to standard PlayCanvas script pattern with proper attribute initialization
- Implemented proper world-space movement with WASD controls
- Fixed rotation handling to avoid NaN errors by using Euler angles instead of quaternions
- Added extensive debugging output to help diagnose movement issues

## Any other tidbids the future AI coder should know
- The NetworkManager must be found by the PlayerMovement script at runtime - we implemented a robust search function
- PlayCanvas scripts are different from standard JS classes - they use the pc.createScript() pattern
- For debugging, you can use this._dumpSceneHierarchy() to view the entire scene graph with entities and scripts

## Next Steps to Consider:

