window.onload = setup

function setup() {
    // Password fields
    document
        .querySelectorAll('.signupPass')
        .forEach(item => {
            const event = item.id == 'pass' ? 'change' : 'keyup'
            item.addEventListener(event, handlerValidatePassword)
        })

    // Remove group from table
    document
        .querySelectorAll('.groupItem')
        .forEach(item => {
            const groupName = item.querySelector('.groupName').textContent
            item.querySelector('button').addEventListener('click', () => handlerRemoveGroup(item, groupName, item.dataset.covidaGroupId))
        })

    // Add group from table
    const groupForm = document.querySelector('.groupForm')
    if (groupForm) {
        const name = groupForm.querySelector('#name')
        const description = groupForm.querySelector('#description')
        const button = groupForm.querySelector('button')
        button.addEventListener('click', () => handlerAddGroup(name, description))
        name.addEventListener('keyup', (event) => mapEnterToButton(event, button))
        description.addEventListener('keyup', (event) => mapEnterToButton(event, button))
    }

    // Edit group
    const editGroupForm = document.querySelector('#editGroupForm')
    if (editGroupForm) {
        const groupName = editGroupForm.querySelector('#editGroupName')
        const groupDescription = editGroupForm.querySelector('#editGroupDescription')
        const button = editGroupForm.querySelector('button')
        button.addEventListener('click', () => handlerEditGroup(groupName, groupDescription))
        groupDescription.addEventListener('keyup', (event) => mapEnterToButton(event, button))
        groupName.addEventListener('keyup', (event) => mapEnterToButton(event, button))
    }

    // Remove game from group
    document
        .querySelectorAll('.gameItem')
        .forEach(item => {
            const gameName = item.querySelector('.gameName').textContent
            item.querySelector('button').addEventListener('click', () => handlerRemoveGame(item, gameName, item.dataset.covidaGameId))
        })

    // Add game to group
    document.querySelectorAll('.groupSelectForm')
        .forEach(item => {
            const button = item.querySelector('button')
            const select = item.querySelector('select')
            button.addEventListener('click', () => handlerAddGame(select))
        })
}

function handlerValidatePassword() {
    var password = document.getElementById('pass')
    var confirm_password = document.getElementById('confirm-pass')

    if (password.value != confirm_password.value) {
        confirm_password.setCustomValidity('Passwords don\'t match!')
    } else {
        confirm_password.setCustomValidity('')
    }
}

function handlerEditGroup(groupName, groupDescription) {
    if (groupDescription.value.length == 0 && groupName.value.length == 0) {
        return alertMsg('You need to change at least one field')
    }
    const name = sanitizeInput(groupName.value)
    const description = sanitizeInput(groupDescription.value)

    const loc = document.location.href
    const path = loc.replace('/covida', '/api/covida')
    fetch(path, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: `name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`
    })
        .then(resp => {
            if (resp.status != 200) alert(resp.statusText)
            else {
                alertMsg('Group successfully edited.', 'success')
                groupName.value = ''
                groupDescription.value = ''
                $('.collapse').collapse('hide')
                if (name)
                    document.querySelector('#groupName').innerHTML = name
                if (description)
                    document.querySelector('#groupDescription').textContent = description
            } 

        })
        .catch(err => alertMsg(err))
}

function handlerRemoveGroup(item, groupName, groupId) {
    const loc = document.location.href

    fetch(loc.replace('/groups', '/user-info'))
        .then(resp => resp.json())
        .then(user => {
            if (user.status) {
                document.location.reload()
                return null
            }
            const path = `${loc.replace('/covida', '/api/covida')}/${groupId}`
            fetch(path, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: `username=${encodeURIComponent(user.username)}`
            })
                .then(resp => {
                    if (resp.status != 200) alert(resp.statusText)
                    else {
                        alertMsg(`Group "${sanitizeInput(groupName)}" successfully removed.`, 'success')
                        item.remove()
        
                        // Check if table is empty
                        if (document.querySelectorAll('tr').length == 0) {
                            document
                                .querySelector('.emptyMessage')
                                .innerHTML = '<hr>\n<h5 style="text-align: center;">You don\'t have any groups</h5>'
                        }
        
                    }
                })
        })
        .catch(err => alertMsg(err))
}

function handlerRemoveGame(item, gameName, gameId) {
    const loc = document.location.href
    const path =  `${loc.replace('/covida', '/api/covida')}/games/${gameId}`
    fetch(path, { method: 'DELETE' })
        .then(resp => {
            if (resp.status != 200) alert(resp.statusText)
            else {
                alertMsg(`Game "${gameName}" successfully removed.`, 'success')
                item.remove()

                // Check if table is empty
                if (document.querySelectorAll('tr').length == 0) {
                    document
                        .querySelector('.emptyMessage')
                        .innerHTML = '<hr>\n<h5 style="text-align: center;">This group has no games</h5>'
                }

            }
        })
        .catch(err => alertMsg(err))
}

/**
 * 
 * @param {Element} nameElement
 * @param {Element} descriptionElement
 */
function handlerAddGroup(nameElement, descriptionElement) {
    if (nameElement.reportValidity()) {
        const loc = document.location.href

        // Replace HTML tags
        const name = sanitizeInput(nameElement.value)
        const description = sanitizeInput(descriptionElement.value)
    
        fetch(loc.replace('/groups', '/user-info'))
            .then(resp => resp.json())
            .then(user => {
                if (user.status) {
                    document.location.reload()
                    return null
                }

                const path =  loc.replace('/covida', '/api/covida')
                fetch(path, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    body: `name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(user.username)}`
                })
                    .then(resp => {
                        if (resp.status != 201) alert(resp.statusText)
                        else {
                            resp.json()
                                .then(json => {
                                    const groupURL = json.groupDetails.replace('/api/covida', '/covida')
                                    const groupId = json.groupId
                                    
                                    
                                    addGroupToTable(groupId, groupURL, name, description)
                                    alertMsg(`Group "${name}" successfully added.`, 'success')
                                    descriptionElement.value = ''
                                    descriptionElement.blur()
                                    nameElement.value = ''
                                    nameElement.focus()
                                })
                        }
                    })
            })
            .catch(err => alertMsg(err))
    }
}

/**
 * 
 * @param {Element} select
 */
function handlerAddGame(select) {
    const id = select.value
    if (id) {
        const loc = document.location.href.split('?')[0]
        const path =  `${loc.replace('/covida/games/search', '/api/covida/groups')}/${id}/games`
        fetch(path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
            body: `id=${select.dataset.covidaGameId}`
        })
            .then(resp => {
                if (resp.status != 201) alert(resp.statusText)
                else {
                    resp.json()
                        .then(json => {
                            const gameName = json.matchName
                            alertMsg(`Game "${gameName}" successfully added.`, 'success')
                        })
                }
            })
            .catch(err => alertMsg(err))
    }
}

function addGroupToTable(groupId, groupURL, name, description) {
    document
        .querySelector('.emptyMessage')
        .innerHTML = ''

    document
        .querySelector('table')
        .insertAdjacentHTML('beforeend',  
            `<tr class="groupItem" data-covida-group-id=${groupId}>
                <td class="groupName"><b>${name}</b></td>
                <td><i>${description || 'No description available'}</i></td>
                <td><a href='${groupURL}' class="btn btn-primary btn-block">See group details</a></td>
                <td><button class="btn btn-danger btn-block">Delete Group</button></td>
            </tr>`
        )

    document
        .querySelectorAll('.groupItem')
        .forEach(item => {
            const id = item.dataset.covidaGroupId
            if (id == groupId) {
                const groupName = item.querySelector('.groupName').textContent
                item.querySelector('button').addEventListener('click', () => handlerRemoveGroup(item, groupName, id))
            }
        })
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

function mapEnterToButton(event, button) {
    if (event.key == 'Enter') {
        button.click()
    }
}