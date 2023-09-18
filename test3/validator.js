function Validator(options){

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules = {};
    function Validate (inputElement, rule){
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;
        var rules = selectorRules[rule.selector];
        for(var i = 0; i < rules.length; i++){   
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }
        if(errorMessage){
            errorElement.innerText= errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText= '';
            inputElement.parentElement.classList.remove('invalid');
        }
    }
    var fromElement = document.querySelector(options.form)

    if(fromElement){
        fromElement.onsubmit = function (e){
            e.preventDefault(); 
            var isFormValid = true;
            options.rules.forEach(function (rule) {
                var inputElement = fromElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if(!isValid){  
                    isFormValid = false 
                }
            })

            
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = fromElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function (values, input){
                        values[input.name] = input.value
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
            }
        }
        options.rules.forEach(function (rule) {

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = fromElement.querySelector(rule.selector); 
            if(inputElement){
                inputElement.onblur = function (){
                    Validate(inputElement, rule) 
                } 
                inputElement.oninput = function (){
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText= '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            }
        });
    }
}
Validator.isRequired = function (selector){
    return {
        selector: selector, 
        test: function (value){
            return value.trim() ? undefined : 'Vui lòng nhập trường này';
        }
    }
} 
Validator.isEmail = function (selector){
    return {
        selector: selector, 
        test: function (value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        }
    }
}
Validator.minLength = function (selector, min){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }
} 
Validator.isConfirmed = function (selector, getConfirmValue, message){
    return {
        selector: selector, 
        test: function (value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}