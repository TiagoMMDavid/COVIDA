window.onload = setup

function setup() {
    // Password fields
    document
        .querySelectorAll('.signupPass')
        .forEach(item => {
            item.addEventListener('keyup', handlerValidatePassword)
        })

    // Remove group from table
    document
        .querySelectorAll('.groupItem')
        .forEach(item => {
            const groupName = item.querySelector('.groupName').textContent
            const button = item.querySelector('button')
            button.addEventListener('click', () => handlerRemoveGroup(button, item, groupName, item.dataset.covidaGroupId, button.dataset.covidaUsername))
        })

    // Add group to table
    const groupForm = document.querySelector('#addGroupForm')
    if (groupForm) {
        const name = groupForm.querySelector('#name')
        const description = groupForm.querySelector('#description')
        const button = groupForm.querySelector('button')
        button.addEventListener('click', () => handlerAddGroup(button, name, description, button.dataset.covidaUsername))
        name.addEventListener('keyup', (event) => mapEnterToButton(name, event, button))
        description.addEventListener('keyup', (event) => mapEnterToButton(description, event, button))
    }

    // Edit group
    const editGroupForm = document.querySelector('#editGroupForm')
    if (editGroupForm) {
        const groupName = editGroupForm.querySelector('#editGroupName')
        const groupDescription = editGroupForm.querySelector('#editGroupDescription')
        const button = editGroupForm.querySelector('button')
        button.addEventListener('click', () => handlerEditGroup(button, groupName, groupDescription, button.dataset.covidaUsername))
        groupDescription.addEventListener('keyup', (event) => mapEnterToButton(groupDescription, event, button))
        groupName.addEventListener('keyup', (event) => mapEnterToButton(groupName, event, button))
    }

    // Remove game from group
    document
        .querySelectorAll('.gameItem')
        .forEach(item => {
            const gameName = item.querySelector('.gameName').textContent
            const button = item.querySelector('button')
            button.addEventListener('click', () => handlerRemoveGame(button, item, gameName, item.dataset.covidaGameId))
        })

    // Add game to group
    document.querySelectorAll('.groupSelectForm')
        .forEach(item => {
            const button = item.querySelector('button')
            const select = item.querySelector('select')
            button.addEventListener('click', () => handlerAddGame(button, select))
        })
    
    // Delete account
    const deleteAccountButton = document.querySelector('#deleteAccount')
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', () => handlerDeleteAccountShow())
        document.querySelector('#noDeleteAccount').addEventListener('click', () => handlerDeleteAccountClose())
        document.querySelector('#yesDeleteAccount').addEventListener('click', () => handlerDeleteAccount())
    }

    // Close alert
    const closeAlertButton = document.querySelector('#closeAlertButton')
    if (closeAlertButton) {
        closeAlertButton.addEventListener('click', () => dismissAlert())
    }
}

function handlerValidatePassword() {
    const password = document.getElementById('pass')
    const confirm_password = document.getElementById('confirm-pass')
    const button = document.getElementById('button')

    if (password.value != confirm_password.value || confirm_password.value.length == 0) {
        button.setAttribute('disabled', '')
        confirm_password.classList.remove('is-valid')
        confirm_password.classList.add('is-invalid')
    } else {
        button.removeAttribute('disabled', '')
        confirm_password.classList.remove('is-invalid')
        confirm_password.classList.add('is-valid')
    }
}

function handlerEditGroup(elem, groupName, groupDescription, username) {
    elem.blur()
    if (groupDescription.value.length == 0 && groupName.value.length == 0) {
        return alertMsg('You need to change at least one field.')
    }
    const name = sanitizeInput(groupName.value)
    const description = sanitizeInput(groupDescription.value)
    
    if (name.length > 64) {
        return alertMsg('Name too long.')
    }
    if (description.length > 256) {
        return alertMsg('Description too long.')
    }

    startLoadingMsg()
    const loc = document.location.href
    const path = loc.replace('/covida', '/api/covida')
    fetch(path, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: `name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}`
    })
        .then(resp => {
            finishLoadingMsg()
            if (resp.status != 200) alert(resp.statusText)
            else {
                $('#editGroupForm').collapse('hide')
                alertMsg('Group successfully edited.', 'success')
                groupName.value = ''
                groupDescription.value = ''
                if (name) {
                    document.querySelector('#groupName').innerHTML = name
                    groupName.placeholder = name
                }
                if (description) {
                    document.querySelector('#groupDescription').innerHTML = description
                    groupDescription.placeholder = description
                }
            } 

        })
        .catch(err => alertMsg(err))
}

function handlerRemoveGroup(elem, item, groupName, groupId, username) {
    elem.blur()
    startLoadingMsg()
    const loc = document.location.href
    const path = `${loc.replace('/covida', '/api/covida')}/${groupId}`
    
    fetch(path, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: `username=${encodeURIComponent(username)}`
    })
        .then(resp => {
            finishLoadingMsg()
            if (resp.status != 200) alert(resp.statusText)
            else {
                alertMsg(`Group "${sanitizeInput(groupName)}" successfully removed.`, 'success')
                item.remove()

                // Check if table is empty
                if (document.querySelectorAll('td').length == 0) {
                    document
                        .querySelector('.emptyMessage')
                        .innerHTML = '<h5 style="text-align: center;">You don\'t have any groups</h5>'
                }

            }
        })
        .catch(err => alertMsg(err))
}

function handlerRemoveGame(elem, item, gameName, gameId) {
    elem.blur()
    startLoadingMsg()
    const loc = document.location.href.split('?')[0]
    const path =  `${loc.replace('/covida', '/api/covida')}/games/${gameId}`
    fetch(path, { method: 'DELETE' })
        .then(resp => {
            finishLoadingMsg()
            if (resp.status != 200) alert(resp.statusText)
            else {
                alertMsg(`Game "${gameName}" successfully removed.`, 'success')
                item.remove()

                // Check if table is empty
                if (document.querySelectorAll('td').length == 0) {
                    document
                        .querySelector('.emptyMessage')
                        .innerHTML = '<h5 style="text-align: center;">This group has no games</h5>'
                }

            }
        })
        .catch(err => alertMsg(err))
}

function handlerAddGroup(elem, nameElement, descriptionElement, username) {
    elem.blur()
    if (nameElement.reportValidity()) {
        const loc = document.location.href

        // Replace HTML tags
        const name = sanitizeInput(nameElement.value)
        const description = sanitizeInput(descriptionElement.value)

        if (name.length > 64) {
            return alertMsg('Name too long.')
        }
        if (description.length > 256) {
            return alertMsg('Description too long.')
        }

        startLoadingMsg()
        const path =  loc.replace('/covida', '/api/covida')
        fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: `name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}`
        })
            .then(resp => {
                finishLoadingMsg()
                if (resp.status != 201) {
                    alert(resp.statusText)
                    return null
                } else {
                    return resp.json()
                }
            })
            .then(json => {
                if (json) {
                    const groupURL = json.groupDetails.replace('/api/covida', '/covida')
                    const groupId = json.groupId

                    addGroupToTable(groupId, groupURL, name, description, username)
                    $('#addGroupForm').collapse('hide')
                    alertMsg(`Group "${name}" successfully added.`, 'success')
                    descriptionElement.value = ''
                    nameElement.value = ''
                }
            })
            .catch(err => alertMsg(err))
    }
}

function handlerAddGame(elem, select) {
    elem.blur()
    const id = select.value
    if (id) {
        startLoadingMsg()
        const loc = document.location.href.split('?')[0]
        const path =  `${loc.replace(/\/covida\/games\/.*/, '/api/covida/groups')}/${id}/games`
        fetch(path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: `id=${select.dataset.covidaGameId}`
        })
            .then(resp => {
                finishLoadingMsg()
                if (resp.status != 201) {
                    alert(resp.statusText)
                    return null
                } else {
                    return resp.json()
                }
            })
            .then(json => {
                if (json) {
                    const gameName = json.matchName
                    const groupUrl = json.groupDetails.replace('/api/covida', '/covida')

                    alertMsg(`Game "${gameName}" successfully added. See <a href=${groupUrl}> here.</a>`, 'success')
                }
            })
            .catch(err => alertMsg(err))
    }
}

function handlerDeleteAccountShow() {
    $('.navbar-collapse').collapse('hide')
    const overlay = document.querySelector('#deleteOverlay')
    overlay.classList.remove('slide-out')
    overlay.classList.add('slide-in')
    overlay.style.display = 'flex'
}

function handlerDeleteAccount() {
    handlerDeleteAccountClose()
    startLoadingMsg()
    const loc = document.location.href
    window.location.href = loc.replace(/\/covida.*/, '/covida/account/delete?confirm=true')
}

function handlerDeleteAccountClose() {
    const overlay = document.querySelector('#deleteOverlay')
    overlay.classList.remove('slide-in')
    overlay.classList.add('slide-out')
    setTimeout(() => overlay.style.display = 'none', 200)
}

function addGroupToTable(groupId, groupURL, name, description, username) {
    document
        .querySelector('.emptyMessage')
        .innerHTML = ''

    document
        .querySelector('tbody')
        .insertAdjacentHTML('beforeend',  
            `<tr class="groupItem" data-covida-group-id="${groupId}">
                <td class="groupName" style="vertical-align: middle;"><b>${name}</b></td>
                <td style="vertical-align: middle;"><i>${description || 'No description available'}</i></td>
                <td><a href="${groupURL}" class="btn btn-outline-primary btn-block">View group details</a></td>
                <td><button class="btn btn-danger btn-block" data-covida-username="${username}">Delete Group</button></td>
            </tr>`
        )

    document
        .querySelectorAll('.groupItem')
        .forEach(item => {
            const id = item.dataset.covidaGroupId
            if (id == groupId) {
                const groupName = item.querySelector('.groupName').textContent
                const button = item.querySelector('button')
                button.addEventListener('click', () => handlerRemoveGroup(button, item, groupName, id, username))
            }
        })
}

function alertMsg(message, kind) {
    if(!kind) kind = 'danger'
    document
        .querySelector('.messages')
        .innerHTML = 
            `<div class="shadow-sm alert alert-${kind} slide-in">
                <button type="button" id="closeAlertButton" class="close">
                    <i class="fas fa-times"></i>
                </button>
                ${message}
            </div>`
    document.querySelector('#closeAlertButton').addEventListener('click', () => dismissAlert())
}

function dismissAlert() {
    const overlay = document.querySelector('.alert')
    overlay.classList.remove('slide-in')
    overlay.classList.add('slide-out')
    setTimeout(() => overlay.style.display = 'none', 200)
}

function startLoadingMsg() {
    const overlay = document.querySelector('#loadingOverlay')
    overlay.classList.remove('slide-out')
    overlay.classList.add('slide-in')
    overlay.style.display = 'flex'
}

function finishLoadingMsg() {
    const overlay = document.querySelector('#loadingOverlay')
    overlay.classList.remove('slide-in')
    overlay.classList.add('slide-out')
    setTimeout(() => overlay.style.display = 'none', 200)
}

function sanitizeInput(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#x27;',
        '/': '&#x2F;',
    }
    const reg = /[&<>"'/]/ig
    return input.replace(reg, (match)=>(map[match]))
}

function mapEnterToButton(elem, event, button) {
    if (event.key == 'Enter') {
        elem.blur()
        button.click()
    }
}