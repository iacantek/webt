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
                genders: ["männlich", "weiblich"],
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
                    this.drawCanvas(this.getEmotion(this.bmi)); // draw face
                })
                .catch(error => {
                    console.error(error);
                });
        },
        drawCanvas(expression) {
            const canvas = document.getElementById('faceExpression');
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw face (circle)
            ctx.beginPath();
            ctx.arc(100, 100, 50, 0, Math.PI * 2);
            ctx.fillStyle = this.getBMIColor(this.bmi);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw eyes
            function drawEye(x, y) {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();
                ctx.closePath();
            }

            drawEye(85, 85); // Left eye
            drawEye(115, 85); // Right eye

            ctx.beginPath();
            switch (expression) {
                case 'happy':
                    ctx.arc(100, 95, 30, 0.2 * Math.PI, 0.8 * Math.PI);
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    break;
                case 'neutral':
                    ctx.moveTo(75, 115);
                    ctx.lineTo(125, 115);
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    break;
                case 'sad':
                    ctx.arc(100, 140, 30, 1.2 * Math.PI, 1.8 * Math.PI); // Adjusted coordinates for a sad mouth
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    break;
                default:
                    console.error('Unknown expression');
            }
            ctx.closePath();
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
                    } else { // clear validation
                        delete this.validations['name'];
                    }
                    break;
                case "birthday":
                    if (!this.form.birthday) { // check if birthday is empty
                        this.validations['birthday'] = RequiredValidationMessage.replace("%s", "Geburtstag");
                    } else if (this.form.birthday > new Date()) { // check if birthday is not in the future
                        this.validations['birthday'] = "Geburtstag darf nicht in der Zukunft liegen."
                    } else { // clear validation
                        delete this.validations['birthday'];
                    }
                    break;
                case "height":
                    if (!this.form.height.value) { // check if height is empty
                        this.validations['height'] = RequiredValidationMessage.replace("%s", "Grösse");
                    } else if (this.form.height.value < 0) { // check if height is a negative number
                        this.validations['height'] = NegativeNumberValidationMessage
                    } else { // clear validation
                        delete this.validations['height'];
                    }
                    break;
                case "weight":
                    if (!this.form.weight.value) { // check if weight is empty
                        this.validations['weight'] = RequiredValidationMessage.replace("%s", "Gewicht");
                    } else if (this.form.weight.value < 0) { // check if weight is a negative number
                        this.validations['weight'] = NegativeNumberValidationMessage;
                    } else { // clear validation
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
        },
        getBMIColor(bmi) {
            return bmi < 18.5 ? "#1e9ad6" // blue
                : bmi < 25 ? "#30a248" // green
                    : bmi < 30 ? "#f6ca35" // yellow
                        : bmi < 40 ? "#f78a1f" // orange
                            : "#b92a30"; // red
        },
        getEmotion(bmi) {
            return 18.5 <= bmi && bmi < 25 ? "happy" // happy expression
                : bmi > 40 ? "sad" // sad expression
                    : "neutral"; // neutral expression
        }
    }
}).mount('#app');