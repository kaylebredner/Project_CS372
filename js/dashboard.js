function getData() {
    const username = "alex"
    $.ajax({
        url: '/eventsAmount/' + username,
        success: function(data) {
            const finalString = `You have ${data} events scheduled!`
            document.getElementById('welcomeUsername').innerHTML=`Welcome ${username}!`
            document.getElementById('eventString').innerHTML=finalString
        }
    })
} // end getData

function eventsNav() {
    $.ajax({
        url: '/calendar'
    })
}