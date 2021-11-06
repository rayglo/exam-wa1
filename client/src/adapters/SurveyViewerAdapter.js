const base_address = "/api/"

async function getSurveyAnswer(surveyID, cs_id) {
    const response = await fetch(base_address + "survey/" + surveyID + "/answers/" + cs_id);
    const json = await response.json();
    json.Content = JSON.parse(json.Content.toString());
    return json;
}

async function getSurveyModel(surveyID) {
    const response = await fetch(base_address + "survey/" + surveyID, {method: "GET"});
    const json = await response.json();
    for (let q of json.questions) {
        q.Content = JSON.parse(q.Content);
    }
    return json;
}

export {getSurveyAnswer, getSurveyModel}