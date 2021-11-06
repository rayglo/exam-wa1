import * as dayjs from 'dayjs';

const base_address = "/api/"

async function getSurvey(id) {
    const response = await fetch(base_address + "survey/" + id);
    const json = await response.json();
    console.log(json);
    for (let q of json.questions) {
        q.Content = JSON.parse(q.Content);
    }
    return json;
}

async function submitFilledSurvey(id, values) {
    values.submitDate = dayjs().format('MM-DD-YYYY HH:mm:ss');
    const response = await fetch(base_address + "survey/" + id + "/answers/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values),
        });
    const json = await response.json();
    return json;
}

export {getSurvey, submitFilledSurvey}