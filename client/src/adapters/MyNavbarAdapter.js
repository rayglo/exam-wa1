const base_address = "/api/"

async function logOut() {
    let response = await fetch(base_address + 'logout/', {method: 'DELETE'});
    let json = await response.json();
    return json;
}

export {logOut};