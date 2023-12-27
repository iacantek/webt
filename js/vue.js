const RequiredValidationMessage = Object.freeze(`Das Feld "%s" darf nicht leer sein!`);
const NegativeNumberValidationMessage = Object.freeze(`Der Wert darf nicht negativ sein!`);

Vue.createApp({
    data() {
        return {
            bmi: null,
            form: {
                name: "alan",
                birthday: new Date().toISOString().split('T')[0],
                gender: 0,
                height: {
                    value: 177,
                    unit: 0
                },
                weight: {
                    value: 85,
                    unit: 0
                }
            },
            validations: [],
            history: [],
            constant: {
                max: {
                    height: 300, // max height in cm
                    weight: 999 // max weight in kg
                },
                operand: {
                    weight: 2.2, // kg to lbs
                    height: 30.48 // cm to foot
                },
                unit: {
                    height: {
                        cm: 0,
                        ft: 1
                    },
                    weight: {
                        kg: 0,
                        lbs: 1
                    }
                },
                gender: {
                    male: 0,
                    female: 1
                },
                today: new Date().toISOString().split('T')[0]
            }
        }
    },
    mounted() {
        this.sendRequest('GET', 'backend.php', null)
            .then(response => {
                this.history = response;
            })
            .catch(error => {
                console.error(error);
            });
    },
    methods: {
        submit() {
            this.validateFields();
            if (this.hasValidations())
                return;

            this.sendRequest('POST', 'backend.php', this.form)
                .then(response => {
                    this.history.unshift(response);
                    this.bmi = response.bmi;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        validateFields() {
            let fieldNames = ["name", "birthday", "height", "weight"];
            fieldNames.forEach((fieldName) => this.validate(fieldName));
        },
        // Zusatztechnik: Reaktive Eingabevalidierung des Formulars mittels Vue.js
        validate(field) {
            switch (field) {
                case "name":
                    if (!this.form.name) { // check if name is empty
                        this.validations['name'] = RequiredValidationMessage.replace("%s", "Vollständiger Name");
                    } else {
                        delete this.validations['name'];
                    }
                    break;
                case "birthday":
                    if (!this.form.birthday) { // check if birthday is empty
                        this.validations['birthday'] = RequiredValidationMessage.replace("%s", "Geburtstag");
                    } else if (this.form.birthday > new Date()) { // check that birthday is not in the future
                        this.validations['birthday'] = "Geburtstag darf nicht in der Zukunft liegen."
                    } else {
                        delete this.validations['birthday'];
                    }
                    break;
                case "height":
                    if (!this.form.height.value) { // check if height is empty
                        this.validations['height'] = RequiredValidationMessage.replace("%s", "Grösse");
                    } else if (this.form.height.value < 0) {
                        this.validations['height'] = NegativeNumberValidationMessage
                    } else {
                        delete this.validations['height'];
                    }
                    break;
                case "weight":
                    if (!this.form.weight.value) { // check if weight is empty
                        this.validations['weight'] = RequiredValidationMessage.replace("%s", "Gewicht");
                    } else if (this.form.weight.value < 0) {
                        this.validations['weight'] = NegativeNumberValidationMessage;
                    } else {
                        delete this.validations['weight'];
                    }
                    break;
                default:
                    console.error(`${field} is not a valid field!`);
                    break;
            }
        },
        hasValidations() {
            return Boolean(Object.keys(this.validations).length);
        },
        sendRequest(method, url, body) {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            responseData = JSON.parse(xhr.responseText);
                            resolve(responseData); // Resolve the promise with response data
                        } catch (e) {
                            reject('Could not parse JSON.')
                        }
                    } else {
                        reject('Request failed with status: ' + xhr.status); // Reject with an error message
                    }
                };
                xhr.onerror = function () {
                    reject('Network request failed'); // Reject with an error message
                };
                if (body) {
                    xhr.send(JSON.stringify(body));
                } else {
                    xhr.send();
                }
            });
        }
    }
}).mount('#app');