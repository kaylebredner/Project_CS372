function validate(){
    //ensure pass and confpass are the same, return true if so, false if not
    //required tag in form takes care of the rest of the validation
    if(document.forms.signUp.pass.value!==document.forms.signUp.confPass.value){
        console.log(document.forms.signUp.pass.value)
        return false
    }
    console.log('called')
    return true
}