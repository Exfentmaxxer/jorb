# Jorb Android SDK

Official Kotlin SDK for Jorb Core - Build intelligent Android apps powered by agentic AI.

## Features

- 🔐 Secure authentication with JWT
- 📝 Full task lifecycle management
- 💾 Memory operations (store, search, retrieve)
- 🔧 Tool execution
- ⚡ Real-time task updates via WebSocket
- 🎯 Type-safe Kotlin API
- 🔄 Coroutines and Flow support
- 📦 Maven Central distribution

## Requirements

- Android API 24+ (Android 7.0+)
- Kotlin 1.9+
- Gradle 8.0+

## Installation

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("ai.jorb:jorb-android-sdk:1.0.0")

    // Required dependencies
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")
}
```

### Gradle (Groovy)

```groovy
dependencies {
    implementation 'ai.jorb:jorb-android-sdk:1.0.0'
}
```

## Quick Start

### 1. Initialize the Client

```kotlin
import ai.jorb.sdk.JorbClient

val client = JorbClient(
    apiUrl = "https://api.jorb.ai",
    apiKey = "your-api-key" // or use authentication
)
```

### 2. Authenticate (Optional)

```kotlin
lifecycleScope.launch {
    try {
        val authResponse = client.auth.login(
            email = "user@example.com",
            password = "password"
        )

        println("Logged in: ${authResponse.user.email}")
        // Token is automatically stored and used for subsequent requests
    } catch (e: Exception) {
        println("Login failed: ${e.message}")
    }
}
```

### 3. Create a Task

```kotlin
lifecycleScope.launch {
    try {
        val task = client.tasks.create(
            title = "Analyze quarterly sales data",
            description = "Generate insights and visualizations for Q1 2024",
            priority = 5
        )

        println("Task created: ${task.id}")
        println("Status: ${task.status}")
    } catch (e: Exception) {
        println("Error: ${e.message}")
    }
}
```

### 4. Monitor Task Progress with Flow

```kotlin
lifecycleScope.launch {
    client.tasks.subscribeToUpdates(taskId)
        .collect { update ->
            println("Progress: ${update.progress}%")
            println("Status: ${update.status}")

            if (update.status == TaskStatus.COMPLETED) {
                println("Task completed!")
                println("Result: ${update.result}")
            }
        }
}
```

### 5. Work with Memory

```kotlin
lifecycleScope.launch {
    // Store a memory
    val memory = client.memory.store(
        type = MemoryType.SEMANTIC,
        content = "User prefers dark mode visualizations",
        metadata = mapOf("category" to "preferences")
    )

    // Search memories
    val results = client.memory.search(
        query = "What are user preferences for charts?",
        limit = 5
    )

    results.forEach { result ->
        println("${result.content} (similarity: ${result.similarityScore})")
    }
}
```

### 6. Execute Tools

```kotlin
lifecycleScope.launch {
    val result = client.tools.execute(
        toolName = "calculator",
        input = mapOf("expression" to "2 + 2 * 10")
    )

    println("Result: $result")
}
```

## API Reference

### Authentication

#### Login
```kotlin
suspend fun login(email: String, password: String): AuthResponse
```

#### Register
```kotlin
suspend fun register(email: String, password: String, name: String? = null): User
```

### Tasks

#### Create Task
```kotlin
suspend fun create(
    title: String,
    description: String? = null,
    priority: Int? = null,
    sessionId: String? = null
): Task
```

#### Get Task
```kotlin
suspend fun get(taskId: String): Task
```

#### List Tasks
```kotlin
suspend fun list(
    status: TaskStatus? = null,
    limit: Int? = null
): List<Task>
```

#### Pause/Resume/Cancel
```kotlin
suspend fun pause(taskId: String)
suspend fun resume(taskId: String)
suspend fun cancel(taskId: String)
```

#### Subscribe to Updates (Flow)
```kotlin
fun subscribeToUpdates(taskId: String): Flow<TaskUpdate>
```

### Memory

#### Store Memory
```kotlin
suspend fun store(
    type: MemoryType,
    content: String,
    metadata: Map<String, Any>? = null
): Memory
```

#### Search Memories
```kotlin
suspend fun search(
    query: String,
    limit: Int? = null,
    types: List<MemoryType>? = null,
    minScore: Double? = null
): List<MemorySearchResult>
```

#### Get Memory
```kotlin
suspend fun get(memoryId: String): Memory
```

#### Delete Memory
```kotlin
suspend fun delete(memoryId: String)
```

### Tools

#### List Tools
```kotlin
suspend fun list(): List<Tool>
```

#### Execute Tool
```kotlin
suspend fun execute(
    toolName: String,
    input: Map<String, Any>
): ToolExecutionResult
```

## Models

### Task
```kotlin
data class Task(
    val id: String,
    val title: String,
    val description: String?,
    val status: TaskStatus,
    val priority: Int,
    val progress: Double,
    val createdAt: Instant,
    val completedAt: Instant?,
    val result: TaskResult?
)

enum class TaskStatus {
    PENDING, PLANNING, EXECUTING, PAUSED, COMPLETED, FAILED, CANCELLED
}
```

### Memory
```kotlin
data class Memory(
    val id: String,
    val type: MemoryType,
    val content: String,
    val metadata: Map<String, Any>,
    val score: Double,
    val createdAt: Instant
)

enum class MemoryType {
    SHORT_TERM, MID_TERM, LONG_TERM, SEMANTIC, EPISODIC, PROCEDURAL
}
```

## Jetpack Compose Integration

### Task Creation Screen

```kotlin
@Composable
fun TaskCreationScreen(
    viewModel: TaskViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        var title by remember { mutableStateOf("") }
        var description by remember { mutableStateOf("") }

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                viewModel.createTask(title, description)
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !uiState.isLoading
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Create Task")
            }
        }

        uiState.currentTask?.let { task ->
            TaskCard(task = task)
        }
    }
}
```

### Task Progress Screen

```kotlin
@Composable
fun TaskProgressScreen(
    taskId: String,
    viewModel: TaskViewModel = hiltViewModel()
) {
    val taskUpdate by viewModel.getTaskUpdates(taskId)
        .collectAsState(initial = null)

    taskUpdate?.let { update ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            LinearProgressIndicator(
                progress = (update.progress / 100).toFloat(),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Status: ${update.status.name}",
                style = MaterialTheme.typography.headlineSmall
            )

            Text(
                text = "Progress: ${update.progress.toInt()}%",
                style = MaterialTheme.typography.bodyLarge
            )

            if (update.status == TaskStatus.COMPLETED) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Result",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = update.result.toString(),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }
    }
}
```

### ViewModel Example

```kotlin
@HiltViewModel
class TaskViewModel @Inject constructor(
    private val client: JorbClient
) : ViewModel() {
    private val _uiState = MutableStateFlow(TaskUiState())
    val uiState: StateFlow<TaskUiState> = _uiState.asStateFlow()

    fun createTask(title: String, description: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            try {
                val task = client.tasks.create(
                    title = title,
                    description = description
                )

                _uiState.update {
                    it.copy(
                        currentTask = task,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        error = e.message,
                        isLoading = false
                    )
                }
            }
        }
    }

    fun getTaskUpdates(taskId: String): Flow<TaskUpdate> {
        return client.tasks.subscribeToUpdates(taskId)
    }
}

data class TaskUiState(
    val currentTask: Task? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)
```

## Error Handling

```kotlin
try {
    val task = client.tasks.create(title = "My Task")
} catch (e: UnauthorizedException) {
    println("Authentication required")
} catch (e: RateLimitException) {
    println("Rate limit exceeded")
} catch (e: ServerException) {
    println("Server error: ${e.message}")
} catch (e: NetworkException) {
    println("Network error: ${e.message}")
} catch (e: Exception) {
    println("Unexpected error: ${e.message}")
}
```

## Testing

### Unit Tests

```kotlin
class JorbSDKTest {
    private lateinit var client: JorbClient

    @Before
    fun setUp() {
        client = JorbClient(
            apiUrl = "http://localhost:3000",
            apiKey = "test-key"
        )
    }

    @Test
    fun testTaskCreation() = runTest {
        val task = client.tasks.create(
            title = "Test Task",
            description = "Test Description"
        )

        assertNotNull(task.id)
        assertEquals("Test Task", task.title)
    }
}
```

### Instrumented Tests

```kotlin
@RunWith(AndroidJUnit4::class)
class JorbSDKInstrumentedTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testTaskCreationFlow() {
        composeTestRule.setContent {
            TaskCreationScreen()
        }

        composeTestRule.onNodeWithText("Title").performTextInput("Test Task")
        composeTestRule.onNodeWithText("Create Task").performClick()

        composeTestRule.waitUntil {
            composeTestRule.onAllNodesWithText("PENDING").fetchSemanticsNodes().isNotEmpty()
        }
    }
}
```

## Advanced Usage

### Custom Configuration

```kotlin
val config = JorbClientConfiguration(
    apiUrl = "https://api.jorb.ai",
    timeout = 30_000,
    retryAttempts = 3,
    logLevel = LogLevel.DEBUG
)

val client = JorbClient(configuration = config)
```

### Dependency Injection (Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object JorbModule {
    @Provides
    @Singleton
    fun provideJorbClient(): JorbClient {
        return JorbClient(
            apiUrl = BuildConfig.JORB_API_URL,
            apiKey = BuildConfig.JORB_API_KEY
        )
    }
}
```

## ProGuard Rules

```proguard
# Jorb SDK
-keep class ai.jorb.sdk.** { *; }
-keep interface ai.jorb.sdk.** { *; }

# Moshi
-keep class kotlin.Metadata { *; }
-keepclassmembers class ** {
    @com.squareup.moshi.* <methods>;
}

# Retrofit
-keepattributes Signature
-keepattributes Exceptions
```

## Support

- Documentation: https://docs.jorb.ai/android-sdk
- Issues: https://github.com/jorb-ai/jorb-android-sdk/issues
- Discord: https://discord.gg/jorbcore
- Email: android-support@jorb.ai

## License

MIT License - see LICENSE file for details.

---

Made with ❤️ by the Jorb team
