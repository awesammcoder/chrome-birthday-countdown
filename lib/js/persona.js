(function(){
    body = document.querySelector('body');

    class countdownModule {
        constructor(date){
            this.deadline = new Date(Date.parse(date));
            this.initializeClock('clockdiv', this.deadline);
        }

        getTimeRemaining(endtime) {
            var t = Date.parse(endtime) - Date.parse(new Date());
            var seconds = Math.floor((t / 1000) % 60);
            var minutes = Math.floor((t / 1000 / 60) % 60);
            var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
            var days = Math.floor(t / (1000 * 60 * 60 * 24));
            return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        initializeClock(id, endtime) {
            var clock = document.getElementById(id);
            var daysSpan = clock.querySelector('.days');
            var hoursSpan = clock.querySelector('.hours');
            var minutesSpan = clock.querySelector('.minutes');
            var secondsSpan = clock.querySelector('.seconds');

            function updateClock(_this) {
                var t = _this.getTimeRemaining(endtime);

                daysSpan.innerHTML = t.days;
                hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
                minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
                secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

                if (t.total <= 0) {
                    clearInterval(_this.timeinterval);
                }
            }

            updateClock(this);
            this.timeinterval = setInterval(()=>{
                updateClock(this);
            }, 1000);
        }
    }

    class helper {
        constructor(){
            this.persona_input, this.persona_form, this.persona_prompt;
        }

        prompt(title, placeholder, submit_caption = 'Submit', type, callback){
            switch(type){
                case 'text': {
                    type = `<input type="text" name="persona_input" placeholder="${placeholder}">`;
                    break;
                }
                case 'date': {
                    type = `<input type="date" name="persona_input" placeholder="${placeholder}">`;
                }
            }
            body.innerHTML += `<div id="persona_prompt">
            <div class="overlay"></div>
                <div class="persona-prompt">
                    <div class="promp-container">
                        <p class="prompt-title">${title}</p>
                        <form id="persona_form">
                            ${type}
                            <button type="submit" class="prompt-submit">${submit_caption}</button>
                        </form>
                    </div>
                </div>
            </div>`;
            this.persona_prompt = document.getElementById('persona_prompt');
            this.persona_input = document.querySelector('[name=persona_input]');
            this.persona_input.focus();

            this.persona_form = document.getElementById('persona_form').addEventListener('submit', (e)=>{
                e.preventDefault();
                if(this.persona_input.value.trim()){
                    this.persona_prompt.remove();
                    callback(this.persona_input.value.trim());
                }else{
                    callback(false);
                }
            });
        }
    }

    class persona extends helper {
        constructor(){
            super();
            this.document = document.querySelector('html');

            this.isConfigured((configured)=>{
                if(configured){
                    this.initBackground();
                    this.showCountdown();
                }else{
                    this.document.innerHTML = '';
                    this.document.style['background'] = '#333';
                }
            });
        }

        isConfigured(callback){
            this.user_data = {};

            if(!localStorage.personaSetup){
                localStorage.personaSetup = btoa(JSON.stringify(this.user_data));
            }else{
                this.user_data = JSON.parse(atob(localStorage.personaSetup));
            }

            if(!this.user_data.name){
                this.prompt('Hi! What is your name?', 'Enter your name', 'Next', 'text',(name)=>{
                    if(!name){
                        callback(false);
                    }else{
                        this.user_data.name = name;
                        if(!this.user_data.email){
                            this.prompt('What is your email address?', 'Enter your email address', 'Next', 'text', (email)=>{
                                if(!email){
                                    callback(false);
                                }else{
                                    this.user_data.email = email;
                                    this.prompt('When is your birthday?', 'Select your birthday', 'Next', 'date', (birthday)=>{
                                        this.user_data.birthday = birthday;
                                        if(!birthday){
                                            callback(false);
                                        }else{
                                            this.saveUserData();
                                            callback(true);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }

            if(this.user_data.name && this.user_data.email && this.user_data.email){
                callback(true);
            }
        }

        saveUserData(){
            localStorage.personaSetup = btoa(JSON.stringify(this.user_data));
        }

        initBackground(){
            var image =`img/backgrounds/${Math.round(Math.random() * 23)}.jpg?id=${Math.random()}`; 
            body.style['background-image'] = `url('${image}')`;
            body.style['background-size'] = 'cover';
            body.style['background-attachment'] = 'fixed';
        }      

        showCountdown(){
            var message = document.getElementById('message');
            var year = new Date().getFullYear();    
            var birthday = Date.parse(year + this.user_data.birthday.substr(4));
            var today = Date.parse(new Date());
            
            if(birthday < today){
                birthday = Date.parse((+year + 1) + this.user_data.birthday.substr(4));
            }

            message.innerHTML = `<h5>"Hi ${this.user_data.name},</h5><h6 style="margin-bottom:20px;"> your birthday countdown."</h6>`;
            new countdownModule(new Date(birthday));
        } 
    }

    return new persona;
})();