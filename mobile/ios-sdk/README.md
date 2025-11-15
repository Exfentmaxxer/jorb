# Jorb iOS SDK

Official Swift SDK for Jorb Core - Build intelligent iOS apps powered by agentic AI.

## Features

- 🔐 Secure authentication with JWT
- 📝 Full task lifecycle management
- 💾 Memory operations (store, search, retrieve)
- 🔧 Tool execution
- ⚡ Real-time task updates via WebSocket
- 📱 Native Swift async/await support
- 🎯 Type-safe API
- 📦 Swift Package Manager support

## Requirements

- iOS 15.0+
- Xcode 14.0+
- Swift 5.7+

## Installation

### Swift Package Manager

Add the following to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/jorb-ai/jorb-ios-sdk.git", from: "1.0.0")
]
```

Or in Xcode:
1. File > Add Packages
2. Enter: `https://github.com/jorb-ai/jorb-ios-sdk.git`
3. Select version and add to your target

## Quick Start

### 1. Initialize the Client

```swift
import JorbSDK

let client = JorbClient(
    apiUrl: "https://api.jorb.ai",
    apiKey: "your-api-key" // or use authentication
)
```

### 2. Authenticate (Optional)

```swift
do {
    let authResponse = try await client.auth.login(
        email: "user@example.com",
        password: "password"
    )

    print("Logged in: \\(authResponse.user.email)")
    // Token is automatically stored and used for subsequent requests
} catch {
    print("Login failed: \\(error)")
}
```

### 3. Create a Task

```swift
Task {
    do {
        let task = try await client.tasks.create(
            title: "Analyze quarterly sales data",
            description: "Generate insights and visualizations for Q1 2024",
            priority: 5
        )

        print("Task created: \\(task.id)")
        print("Status: \\(task.status)")
    } catch {
        print("Error: \\(error)")
    }
}
```

### 4. Monitor Task Progress

```swift
// Subscribe to real-time updates
client.tasks.subscribe(taskId: taskId) { update in
    print("Progress: \\(update.progress)%")
    print("Status: \\(update.status)")

    if update.status == .completed {
        print("Task completed!")
        print("Result: \\(update.result)")
    }
}
```

### 5. Work with Memory

```swift
// Store a memory
let memory = try await client.memory.store(
    type: .semantic,
    content: "User prefers dark mode visualizations",
    metadata: ["category": "preferences"]
)

// Search memories
let results = try await client.memory.search(
    query: "What are user preferences for charts?",
    limit: 5
)

for result in results {
    print("\\(result.content) (similarity: \\(result.similarityScore))")
}
```

### 6. Execute Tools

```swift
let result = try await client.tools.execute(
    toolName: "calculator",
    input: ["expression": "2 + 2 * 10"]
)

print("Result: \\(result)")
```

## API Reference

### Authentication

#### Login
```swift
func login(email: String, password: String) async throws -> AuthResponse
```

#### Register
```swift
func register(email: String, password: String, name: String?) async throws -> User
```

### Tasks

#### Create Task
```swift
func create(
    title: String,
    description: String?,
    priority: Int?,
    sessionId: String?
) async throws -> Task
```

#### Get Task
```swift
func get(taskId: String) async throws -> Task
```

#### List Tasks
```swift
func list(status: TaskStatus?, limit: Int?) async throws -> [Task]
```

#### Pause/Resume/Cancel
```swift
func pause(taskId: String) async throws
func resume(taskId: String) async throws
func cancel(taskId: String) async throws
```

#### Subscribe to Updates
```swift
func subscribe(taskId: String, onUpdate: @escaping (TaskUpdate) -> Void)
func unsubscribe(taskId: String)
```

### Memory

#### Store Memory
```swift
func store(
    type: MemoryType,
    content: String,
    metadata: [String: Any]?
) async throws -> Memory
```

#### Search Memories
```swift
func search(
    query: String,
    limit: Int?,
    types: [MemoryType]?,
    minScore: Double?
) async throws -> [MemorySearchResult]
```

#### Get Memory
```swift
func get(memoryId: String) async throws -> Memory
```

#### Delete Memory
```swift
func delete(memoryId: String) async throws
```

### Tools

#### List Tools
```swift
func list() async throws -> [Tool]
```

#### Execute Tool
```swift
func execute(
    toolName: String,
    input: [String: Any]
) async throws -> ToolExecutionResult
```

## Models

### Task
```swift
struct Task: Codable {
    let id: String
    let title: String
    let description: String?
    let status: TaskStatus
    let priority: Int
    let progress: Double
    let createdAt: Date
    let completedAt: Date?
    let result: TaskResult?
}

enum TaskStatus: String, Codable {
    case pending, planning, executing, paused, completed, failed, cancelled
}
```

### Memory
```swift
struct Memory: Codable {
    let id: String
    let type: MemoryType
    let content: String
    let metadata: [String: Any]
    let score: Double
    let createdAt: Date
}

enum MemoryType: String, Codable {
    case shortTerm, midTerm, longTerm, semantic, episodic, procedural
}
```

## SwiftUI Integration

### Task Creation View

```swift
struct TaskCreationView: View {
    @StateObject private var viewModel = TaskViewModel()
    @State private var title = ""
    @State private var description = ""

    var body: some View {
        Form {
            TextField("Title", text: $title)
            TextEditor(text: $description)

            Button("Create Task") {
                Task {
                    await viewModel.createTask(
                        title: title,
                        description: description
                    )
                }
            }
        }
    }
}

@MainActor
class TaskViewModel: ObservableObject {
    private let client = JorbClient(apiUrl: "...", apiKey: "...")
    @Published var currentTask: JorbTask?
    @Published var isLoading = false

    func createTask(title: String, description: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            currentTask = try await client.tasks.create(
                title: title,
                description: description
            )
        } catch {
            print("Error: \\(error)")
        }
    }
}
```

### Task Progress View

```swift
struct TaskProgressView: View {
    let taskId: String
    @State private var progress: Double = 0
    @State private var status: TaskStatus = .pending

    var body: some View {
        VStack {
            ProgressView(value: progress, total: 100)
            Text("Status: \\(status.rawValue)")
        }
        .onAppear {
            JorbClient.shared.tasks.subscribe(taskId: taskId) { update in
                self.progress = update.progress
                self.status = update.status
            }
        }
        .onDisappear {
            JorbClient.shared.tasks.unsubscribe(taskId: taskId)
        }
    }
}
```

## Example App

A complete example iOS app is included in `mobile/example-ios/`.

Features:
- User authentication
- Task creation and management
- Real-time progress tracking
- Memory browser
- Voice input support

## Error Handling

```swift
do {
    let task = try await client.tasks.create(title: "My Task")
} catch JorbError.unauthorized {
    print("Authentication required")
} catch JorbError.rateLimited {
    print("Rate limit exceeded")
} catch JorbError.serverError(let message) {
    print("Server error: \\(message)")
} catch {
    print("Unexpected error: \\(error)")
}
```

## Testing

```swift
import XCTest
@testable import JorbSDK

class JorbSDKTests: XCTestCase {
    var client: JorbClient!

    override func setUp() {
        client = JorbClient(
            apiUrl: "http://localhost:3000",
            apiKey: "test-key"
        )
    }

    func testTaskCreation() async throws {
        let task = try await client.tasks.create(
            title: "Test Task",
            description: "Test Description"
        )

        XCTAssertNotNil(task.id)
        XCTAssertEqual(task.title, "Test Task")
    }
}
```

## Advanced Usage

### Custom Configuration

```swift
let config = JorbClientConfiguration(
    apiUrl: "https://api.jorb.ai",
    timeout: 30,
    retryAttempts: 3,
    logLevel: .debug
)

let client = JorbClient(configuration: config)
```

### Batch Operations

```swift
// Create multiple tasks
let tasks = try await withThrowingTaskGroup(of: Task.self) { group in
    for title in taskTitles {
        group.addTask {
            try await client.tasks.create(title: title)
        }
    }

    return try await group.reduce(into: []) { $0.append($1) }
}
```

## Support

- Documentation: https://docs.jorb.ai/ios-sdk
- Issues: https://github.com/jorb-ai/jorb-ios-sdk/issues
- Discord: https://discord.gg/jorbcore
- Email: ios-support@jorb.ai

## License

MIT License - see LICENSE file for details.

---

Made with ❤️ by the Jorb team
