const base_address = "/api/"

async function logIn(credentials) {
    let bodyToSend = {
        username: credentials.username,
        password: credentials.password
    }
    let response = await fetch(base_address + "login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyToSend),
    })
    let json = await response.json();
    return json;
}

async function logOut() {
    let response = await fetch(base_address + 'logout/', {method: 'DELETE'});
    let json = await response.json();
    return json;
}

async function getUserInfo() {
    const response = await fetch(base_address + 'login/');
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}

export {logIn, logOut, getUserInfo};