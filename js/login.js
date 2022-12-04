
 function login(){
    let userName = document.getElementById('user').value
    let password = document.getElementById('pass').value
    console.log(`User: ${userName}, Password: ${password}`)
    let success
    $.ajax({
        url: '/login',
        type: 'POST',
        data: {
            user: userName,
            pass: password
        },
        success: function(data){
            document.getElementById('result').innerHTML=''
            success = true;
            console.log(data);
            sessionStorage.setItem("planner-username", data)
            window.location.href = '/dashboard/'+userName
        },
        statusCode: {
            401: function(data){
                document.getElementById('result').innerHTML='incorrect password'
                success = false;
            }
        }
    })
    console.log(success)
    return false;
    
}
