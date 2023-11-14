import Joi from 'joi';

//Users registration
export const validationSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
})

//Users login
export const loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) 
})


//This is used to format the message sent to the browser when there is an error
export const option = {
    abortearly: false,
    errors:{
        wrap:{
            label:''
        }
    }
}