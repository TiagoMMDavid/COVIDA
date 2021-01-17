window.onload = setup

function setup() {
    document
        .querySelectorAll('.signupPass')
        .forEach(item => {
            item.addEventListener('change', handlerValidatePassword)
        })

    document
        .querySelectorAll('.groupItem')
        .forEach(item => {
            const groupName = item.querySelector('.groupName').textContent
            item.querySelector('button').addEventListener('click', () => handlerRemoveGroup(item, groupName, item.dataset.covidaGroupId))
        })
}

function handlerValidatePassword() {
    var password = document.getElementById("pass")
    var confirm_password = document.getElementById("confirm-pass");

    if (password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Passwords don't match!");
    } else {
        confirm_password.setCustomValidity('');
    }
}

function handlerRemoveGroup(item, groupName, groupId) {
    const loc = document.location.href
    const path =  loc.replace('/covida', '/api/covida') + '/' + groupId
    fetch(path, { method: 'DELETE' })
        .then(resp => {
            if (resp.status != 200) alert(resp.statusText)
            else {
                alertMsg(groupName + ' successfully removed.', 'success')
                item.remove()
            }
        })
        .catch(err => alertMsg(err))
}

function alertMsg(message, kind) {
    if(!kind) kind = 'danger'
    document
        .querySelector('.messages')
        .innerHTML = 
            `<br><div class="alert alert-${kind} alert-dismissible" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                ${message}
            </div>`
}