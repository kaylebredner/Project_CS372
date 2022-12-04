function getData() {
    const username = "alex"
    $.ajax({
        url: '/eventsAmount/' + username,
        success: function (data) {
            const finalString = `You have ${data} events scheduled!`
            console.log(finalString)
            document.getElementById('eventString').innerHTML = finalString
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