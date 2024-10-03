import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import './App.css'; 

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");  
  const [newTaskTime, setNewTaskTime] = useState(""); 
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(task => ({
          ...task,
          timeLeft: calculateTimeLeft(task.date, task.time)
        }))
      );
    }, 60000); 

    return () => clearInterval(timer);
  }, []);

  const handleTaskChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleDateChange = (e) => {
    setNewTaskDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setNewTaskTime(e.target.value);
  };

  const addTask = () => {
    if (newTask.trim() && newTaskDate.trim() && newTaskTime.trim()) {
      const newTaskItem = {
        id: Date.now(),  
        text: newTask,
        date: newTaskDate,
        time: newTaskTime,
        completed: false,
        timeLeft: calculateTimeLeft(newTaskDate, newTaskTime)
      };
      setTasks(prevTasks => [...prevTasks, newTaskItem]);
      setNewTask(""); 
      setNewTaskDate(""); 
      setNewTaskTime(""); 
    }
  };

  const toggleTaskCompletion = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour, 10);
    const ampm = hourInt >= 12 ? "PM" : "AM";
    const formattedHour = hourInt % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const calculateTimeLeft = (taskDate, taskTime) => {
    const currentTime = new Date();
    const taskDateTime = new Date(`${taskDate}T${taskTime}`);

    const timeDifference = taskDateTime - currentTime; 
    const totalMinutesLeft = Math.floor(timeDifference / 60000); 
    const totalHoursLeft = Math.floor(totalMinutesLeft / 60); 
    const daysLeft = Math.floor(totalHoursLeft / 24); 

    if (daysLeft >= 1) {
      return `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
    }

    const hoursLeft = totalHoursLeft % 24;
    const minutesLeft = totalMinutesLeft % 60;

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`;
    }

    if (minutesLeft > 0) {
      return `${minutesLeft}m left`;
    }

    if (totalMinutesLeft < 0) {
      return `${Math.abs(totalMinutesLeft)}m overdue`;
    }

    return "0m left";
  };

  const isTimeUrgent = (taskDate, taskTime) => {
    const currentTime = new Date();
    const taskDateTime = new Date(`${taskDate}T${taskTime}`);

    const timeDifference = taskDateTime - currentTime;
    return timeDifference <= 3600000 && timeDifference > 0;
  };

  const isTimePassed = (taskDate, taskTime) => {
    const currentTime = new Date();
    const taskDateTime = new Date(`${taskDate}T${taskTime}`);

    return taskDateTime < currentTime;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "active") return !task.completed;
    return true;
  });

  return (
    <div className="todo-container">
      <h1 className="todo-title">Todo List</h1>
      <div className="input-section">
        <div className="input-group">
          <input
            type="text"
            value={newTask}
            onChange={handleTaskChange}
            placeholder="Add a new task"
            className="task-input"
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={handleDateChange}
            className="date-input"
          />
          <input
            type="time"
            value={newTaskTime}
            onChange={handleTimeChange}
            className="time-input"
          />
          <button
            onClick={addTask}
            className="add-button"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="filter-buttons">
          <button
            onClick={() => setFilter("all")}
            className={`filter-button ${filter === "all" ? "active" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`filter-button ${filter === "active" ? "active" : ""}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`filter-button ${filter === "completed" ? "active" : ""}`}
          >
            Completed
          </button>
        </div>
      </div>
      <ul className="task-list">
        {filteredTasks
          .slice()  
          .reverse() 
          .map((task) => (
          <li
            key={task.id}  
            className={`task-item ${
              task.completed ? "completed" : 
              isTimeUrgent(task.date, task.time) ? "urgent" : 
              isTimePassed(task.date, task.time) ? "overdue" : "active"
            }`}
          >
            <div className="task-info">
              <button
                onClick={() => toggleTaskCompletion(task.id)}  
                className={`completion-button ${task.completed ? "completed" : ""}`}
              >
                {task.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
              </button>
              <span className={task.completed ? "completed-text" : ""}>
                {formatDate(task.date)} {formatTime(task.time)} - {task.text}
              </span>
            </div>
            <div className="task-actions">
              <span className="time-left">{task.timeLeft}</span>
              <button
                onClick={() => deleteTask(task.id)}  
                className="delete-button"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filteredTasks.length === 0 && (
        <div className="empty-message">
          <AlertCircle className="alert-icon" />
          <span>
            {filter === "all"
              ? "No tasks yet. Add a task to get started!"
              : filter === "active"
              ? "No active tasks. All tasks are completed!"
              : "No completed tasks yet. Keep working on your tasks!"}
          </span>
        </div>
      )}
      <footer className="footer">
        &copy; 2024 Dawit. All rights reserved.
      </footer>
    </div>
  );
};

export default TodoList;
