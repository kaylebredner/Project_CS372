function validate(){
    //ensure pass and confpass are the same, return true if so, false if not
    //required tag in form takes care of the rest of the validation
    const userName = document.forms.signUp.user.value;
    const password = document.forms.signUp.pass.value;
    const email = document.forms.signUp.email.value;
    if(document.forms.signUp.pass.value!==document.forms.signUp.confPass.value){
        return false
    }
    $.ajax({
    url: '/signUp',
    type: 'POST',
    data: {
        user: userName,
        pass: password,
        email: email
    },
    success: function(data){
        console.log(data)
        document.getElementById('result').innerHTML=''
        sessionStorage.setItem("planner-username", data)
       window.location.href = '/dashboard/'+userName
    },
    statusCode: {
        401: function(data){
            console.log(data);
            document.getElementById('result').innerHTML='User already exists'
        }
    }})
    return false;
}