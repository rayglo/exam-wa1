const base_address = "/api/"

async function getAllSurveys() {
    const response = await fetch(base_address + "survey/", {method: "GET"});
    const json = await response.json();
    return json;
}

async function deleteSurvey(surveyID) {
    const response = await fetch(base_address + "survey/" + surveyID, {method: "DELETE"});
    const json = await response.json();
    return json;
}

export {getAllSurveys, deleteSurvey}