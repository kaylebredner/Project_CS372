function getData() {
    const username = sessionStorage.getItem('planner-username')
    $.ajax({
        url: '/eventsAmount/' + username,
        success: function (data) {
            const finalString = `You have ${data} events scheduled!`
            const welcomeString = `Welcome ${username}!`
            document.getElementById('welcomeUsername').innerHTML = welcomeString
            document.getElementById('eventString').innerHTML = finalString
        }
    })
    $.ajax({
        url: '/notesAmount/' + username,
        success: function (data) {
            console.log(data)
            const notesString = `You have ${data} notes!`
            document.getElementById('notesBox').innerHTML = notesString
        }
    })
} // end getData
function navCalandar() {
    const user = sessionStorage.getItem('planner-username')
    $.ajax({
        url: '/calendar/' + user,
        success: function (data) {
            window.location.href = '/calendar/' + user
        },
        statusCode: {
            401: function (data) {
                window.location.href = '/'
            }
        }
    })
}

function navNotes() {
    const user = sessionStorage.getItem('planner-username')
    $.ajax({
        url: '/calendar/' + user,
        success: function (data) {
            window.location.href = '/notes/' + user
        },
        statusCode: {
            401: function (data) {
                window.location.href = '/'
            }
        }
    })
}

function navHome() {
    const user = sessionStorage.getItem('planner-username')
    $.ajax({
        url: '/dashboard/' + user,
        success: function (data) {
            window.location.href = '/dashboard/' + user
        },
        statusCode: {
            401: function (data) {
                window.location.href = '/'
            }
        }
    })
}