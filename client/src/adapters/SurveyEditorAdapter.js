import {questionType} from "../components/SurveyEditor";
import * as dayjs from 'dayjs';

const base_address = "/api/"

/*
    Structure of survey_data at the moment is
    {
        surveyName: any string,
        questions: [
            {
                type: "Open"/"Close"
                questionName: any string
                questionID: int
                min: int
                max: int
                numberAlternatives: int
                alternatives: [... strings ... ]
                deleted: boolean
                }
                .....
            }
        ]
    }
 */

async function submitSurvey(survey_data) {
    for (let i = 0; i < survey_data.questions.length; i++) {
        delete survey_data.questions[i].deleted;
        survey_data.questions[i].questionID = i + 1;
        let question_content = {};
        switch (survey_data.questions[i].type) {
            case questionType[0]:
                question_content = {
                    questionName: survey_data.questions[i].questionName,
                    required: survey_data.questions[i].required,
                };
                delete survey_data.questions[i].questionName;
                delete survey_data.questions[i].required;
                break;
            case questionType[1]:
                question_content = {
                    questionName: survey_data.questions[i].questionName,
                    min: survey_data.questions[i].min,
                    max: survey_data.questions[i].max,
                    numberAlternatives: survey_data.questions[i].numberAlternatives,
                    alternatives: [...survey_data.questions[i].alternatives],
                };
                delete survey_data.questions[i].questionName;
                delete survey_data.alternatives;
                delete survey_data.min;
                delete survey_data.min;
                delete survey_data.min;
                break;
        }
        survey_data.questions[i].content = question_content;
    }
    survey_data.creationDate = dayjs().format('MM-DD-YYYY HH:mm:ss');

    const response = await fetch(base_address + "survey/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(survey_data)
    });
    const json = await response.json();
    return json;
}

export {submitSurvey}