function getData() {
    const username = "alex"
    $.ajax({
        url: '/eventsAmount/' + username,
        success: function(data) {
            const finalString = `You have ${data} events scheduled!`
            Document.getElementByID('eventString').innerHTML = finalString
        }
    })
} // end getData