import React from 'react';
import './App.css';

class App extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false,
      },
      editing: false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.strikeUnstrike = this.strikeUnstrike.bind(this)
  };

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount(){
    this.fetchTasks()
  }

  fetchTasks(){
    console.log('fetching......')

    fetch('http://192.168.0.144:8000/api/todo/')
        .then(response => response.json())
        .then(data =>
          this.setState({
            todoList:data
          })
        )
  }

  handleChange(e){
    var name = e.target.name
    var value = e.target.value
    console.log('Name: ', name)
    console.log('Value: ', value)

    this.setState({
      activeItem:{
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()
    console.log('ITEM: ', this.state.activeItem)

    var csrftoken = this.getCookie('csrftoken')

    var url = 'http://192.168.0.144:8000/api/todo/'

    var method_type = 'POST'

    if (this.state.editing === true){
      url = `http://192.168.0.144:8000/api/todo/${this.state.activeItem.id}/`
      method_type = 'PATCH'
      this.setState({
        editing: false
      })
    }

    fetch(url, {
      method: method_type,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed: false,
        }
      })
    }).catch(function(error){
      console.log('ERROR: ', error)
    })
  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task){
    var csrftoken = this.getCookie('csrftoken')

    fetch(`http://192.168.0.144:8000/api/todo/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    }).then((response) => {
      this.fetchTasks()
    })
  }

  strikeUnstrike(task){
    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://192.168.0.144:8000/api/todo/${task.id}/`

    fetch(url, {
      method: 'PATCH',
      headers:{
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({'completed': task.completed})
    }).then(() => {
      this.fetchTasks()
    })

    console.log('TASK: ', task.completed)
  }

  render() {
    var tasks = this.state.todoList
    var self = this
    return(
        <div className="container">
          <div id="task-container">
            <div id="form-wrapper">
              <form id="form" onSubmit={this.handleSubmit}>
                <div className="flex-wrapper">
                  <div style={{flex: 6}}>
                    <input onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItem.title} type="text" name="title" placeholder="Add Task Title"/>
                  </div>
                  <div style={{flex: 1}}>
                    <input className="btn btn-outline-success" id="submit" type="submit" name="Add"/>
                  </div>
                </div>
              </form>
            </div>
            <div id="list-wrapper">
              {tasks.map(function (task, index){
                return(
                    <div key={index} className="task-wrapper flex-wrapper">
                      <div onClick={() => self.strikeUnstrike(task)} style={{flex: 7}}>
                        {task.completed === false ? (
                            <span>{task.title}</span>
                        ) : (
                            <strike>{task.title}</strike>
                        )}
                      </div>
                      <div style={{flex: 1}}>
                        <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                      </div>
                      <div style={{flex: 1}}>
                        <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-danger delete" style={{marginLeft: 5}}>-</button>
                      </div>
                    </div>
                )
              })}
            </div>
          </div>
        </div>
    )
  }
}

export default App;
