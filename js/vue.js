const requiredValidationMessage = `Das Feld "%s" darf nicht leer sein!`

Vue.createApp({
    data() {
        return {
            bmi: null,
            form: {
                name: null,
                birthday: new Date().toISOString().split('T')[0],
                gender: 0,
                height: 0, // cm
                weight: 0 // kg
            },
            validations: [],
            history: [],
            max: {
                height: 300, // max height in cm
                weight: 999 // max weight in kg
            },
            operand: {
                weight: 2.2, // kg to lbs
                height: 30.48 // cm to foot
            }
        }
    },
    methods: {
        round: function (val) {
            return Math.round(val * 100) / 100;
        },
        // Zusatztechnik: Reaktive Eingabevalidierung des Formulars mittels Vue.js
        validate: function (field) {
            switch (field) {
                case "name":
                    this.validations['name'] = this.form.name ? '' : requiredValidationMessage.replace("%s", "Vollständiger Name");
                    break;
                case "birthday":
                    this.validations['birthday'] = this.form.birthday ? '' : requiredValidationMessage.replace("%s", "Geburtstag");

                    // check that birthday is not in the future
                    if (this.form.birthday > new Date()) {
                        this.validations['birthday'] = "Geburtstag darf nicht in der Zukunft liegen."
                    }
                    break;
                case "gender":
                    this.validations['gender'] = this.form.gender ? '' : requiredValidationMessage.replace("%s", "Geschlecht");
                    break;
                case "height":
                    this.validations['height'] = this.form.height ? '' : requiredValidationMessage.replace("%s", "Zentimeter");
                    break;
                case "weight":
                    this.validations['weight'] = this.form.weight ? '' : requiredValidationMessage.replace("%s", "Kilogramm");
                    break;
                default:
                    console.error(`${field} is not a valid field!`);
                    break;
            }
        },
        submit: function () {
            // TODO: Implementation
        }
    },
    computed: {
        foot: function () {
            return this.round(this.form.height / this.operand.height);
        },
        pound: function () {
            return this.round(this.form.weight * this.operand.weight);
        }
    }
}).mount('#app');