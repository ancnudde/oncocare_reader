let jsonData;

function extractInclusionCriteria(answers) {
    document.querySelector(`.entities-pane__criteria-section__inclusion`).innerHTML = ""
    dataset = answers.answer.inclusion
    for (const [question, values] of Object.entries(dataset)) {
        const criteriaTag = document.createElement('div');
        criteriaTag.innerText = question
        criteriaTag.className = "entities-pane__criteria-section__criteria-bloc"
        if (String(values.is_true).toLowerCase() === 'true') {
            criteriaTag.classList.add(`entities-pane__criteria-section__criteria-bloc--inclusion-present`)
            for (const [queryType, query] of Object.entries(values)) {
                if (queryType === 'symptoms') {
                    criteriaTag.classList.add('entities-pane__criteria-section__criteria-bloc--symptom')
                    for (const symptom of query) {
                        let abstract = document.querySelector('.text-pane__text-area__abstract-element').innerHTML;
                        let title = document.querySelector('.text-pane__text-area__title-element').innerHTML;
                        highlightCriteria(abstract, title, 'symptom', symptom.symptom_name)
                    }
                } if (queryType === 'services') {
                    criteriaTag.classList.add('entities-pane__criteria-section__criteria-bloc--service')
                    for (const service of query) {
                        let abstract = document.querySelector('.text-pane__text-area__abstract-element').innerHTML;
                        let title = document.querySelector('.text-pane__text-area__title-element').innerHTML;
                        highlightCriteria(abstract, title, 'service', service.service)
                    }
                } if (queryType === 'side_effects') {
                    criteriaTag.classList.add('entities-pane__criteria-section__criteria-bloc--side-effect');
                    for (const side of query) {
                        let abstract = document.querySelector('.text-pane__text-area__abstract-element').innerHTML;
                        let title = document.querySelector('.text-pane__text-area__title-element').innerHTML;
                        highlightCriteria(abstract, title, 'side-effect', side.side_effect_name)
                    }
                } else if (queryType === "original_text") {
                    criteriaTag.classList.add('entities-pane__criteria-section__criteria-bloc--inclusion')
                    let abstract = document.querySelector('.text-pane__text-area__abstract-element').innerHTML;
                    let title = document.querySelector('.text-pane__text-area__title-element').innerHTML;
                    highlightCriteria(abstract, title, "inclusion", query)
                }
            }
        } else {
            criteriaTag.classList.add(`entities-pane__criteria-section__criteria-bloc--inclusion-absent`)
        }
        document.querySelector(`.entities-pane__criteria-section__inclusion`).appendChild(criteriaTag)
    }
}

function extractExclusionCriteria(answers) {
    document.querySelector(`.entities-pane__criteria-section__exclusion`).innerHTML = ""
    dataset = answers.answer.exclusion
    for (const [question, values] of Object.entries(dataset)) {
        const criteriaTag = document.createElement('div');
        criteriaTag.innerText = question
        criteriaTag.className = "entities-pane__criteria-section__criteria-bloc"
        if (String(values.is_true).toLowerCase() === 'true') {
            criteriaTag.classList.add(`entities-pane__criteria-section__criteria-bloc--exclusion-present`)
            for (const [queryType, query] of Object.entries(values)) {
                if (queryType === "original_text") {
                    criteriaTag.classList.add(`entities-pane__criteria-section__criteria-bloc--exclusion`)
                    let abstract = document.querySelector('.text-pane__text-area__abstract-element').innerHTML;
                    let title = document.querySelector('.text-pane__text-area__title-element').innerHTML;
                    highlightCriteria(abstract, title, "exclusion", query)
                }
            }
        } else {
            criteriaTag.classList.add(`entities-pane__criteria-section__criteria-bloc--exclusion-absent`)
        }
        document.querySelector(`.entities-pane__criteria-section__exclusion`).appendChild(criteriaTag)
    }
}

function highlightCriteria(abstract, title, queryType, query) {
    if (!query) return abstract;
    if (query === "NA") return abstract;
    const escapedSearch = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, 'gi');
    const newAbstract = abstract.replace(regex, match => `<div class="match-box match-box__match-${queryType}">${match}</div>`);
    document.querySelector('.text-pane__text-area__abstract-element').innerHTML = newAbstract;
    const newTitle = title.replace(regex, match => `<div class="match-box match-box__match-${queryType}">${match}</div>`);
    document.querySelector('.text-pane__text-area__title-element').innerHTML = newTitle;
}

function renderText(data) {
    document.querySelector('.text-pane__text-area').innerHTML = "";
    document.querySelector('.text-pane__text-area').innerHTML = "";
    const titleElement = document.createElement('div');
    titleElement.className = "text-pane__text-area__title-element";
    titleElement.innerText = data.title;

    const abstractElement = document.createElement('div');
    abstractElement.className = "text-pane__text-area__abstract-element";
    abstractElement.innerText = data.abstract;

    document.querySelector('.text-pane__text-area').appendChild(titleElement)
    document.querySelector('.text-pane__text-area').appendChild(abstractElement)
}


function importJsonFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                jsonData = JSON.parse(e.target.result);
                const documentSelection = document.querySelector('.document-selection')
                documentSelection.max = jsonData.articles.length - 1;
                renderPage(jsonData, 0)
            } catch (error) {
                alert(`Invalid JSON file: ${error}`);
                console.log(error)
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function renderPage(jsonData, pageIndex) {
    renderText(jsonData.articles[pageIndex])
    extractInclusionCriteria(jsonData.articles[pageIndex])
    extractExclusionCriteria(jsonData.articles[pageIndex])
}



window.onload = function () {
    document.getElementById('import_json').addEventListener('click', importJsonFile);
    document.getElementById('document_selection').addEventListener('change', function () {
        renderPage(jsonData, this.value)
    })
    const input = document.getElementById('document_selection');
    const decreaseButton = document.getElementById('decrease');
    const increaseButton = document.getElementById('increase');

    decreaseButton.addEventListener('click', () => {
        let value = parseInt(input.value, 10) || 0;
        let min = parseInt(input.min, 10) || Number.NEGATIVE_INFINITY;
        let step = parseInt(input.step, 10) || 1;
        if (value - step >= min) {
            input.value = value - step;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    increaseButton.addEventListener('click', () => {
        let value = parseInt(input.value, 10) || 0;
        let max = parseInt(input.max, 10) || Number.POSITIVE_INFINITY;
        let step = parseInt(input.step, 10) || 1;
        if (value + step <= max) {
            input.value = value + step;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

    });
}