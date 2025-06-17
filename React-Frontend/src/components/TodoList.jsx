import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Trash2, Plus, CheckCircle2 } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function TodoList() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/todos`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Failed to fetch tasks. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (newTask.trim() !== "") {
      try {
        setError(null)
        const response = await fetch(`${API_URL}/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newTask.trim() }),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTasks([data, ...tasks])
        setNewTask("")
      } catch (error) {
        console.error("Error adding task:", error)
        setError("Failed to add task. Please try again.")
      }
    }
  }

  const toggleTask = async (id) => {
    try {
      setError(null)
      const task = tasks.find((t) => t.id === id)
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !task.completed }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const updatedTask = await response.json()
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)))
    } catch (error) {
      console.error("Error updating task:", error)
      setError("Failed to update task. Please try again.")
    }
  }

  const deleteTask = async (id) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Failed to delete task. Please try again.")
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              Todo App
            </CardTitle>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
            {totalCount > 0 && (
              <p className="text-sm text-gray-600">
                {completedCount} of {totalCount} tasks completed
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Add Task Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask()
                  }
                }}
                className="flex-1 text-base"
              />
              <Button onClick={addTask} size="icon" className="shrink-0 h-10 w-10">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add task</span>
              </Button>
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks yet. Add one above!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      task.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="shrink-0"
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 text-base cursor-pointer select-none ${
                        task.completed ? "line-through text-gray-500" : "text-gray-800"
                      }`}
                    >
                      {task.text}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete task</span>
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 