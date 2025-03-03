// src/utils/validator.js
import Joi from 'joi';


const schema = {

    userSchema : Joi.object({

      id: Joi.number().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required()
      
    }),

    postSchema : Joi.object({
        id: Joi.number().required(),
        title: Joi.string().required(),
        content: Joi.string().allow('') // ou Joi.string().required() selon vos besoins
    })

}

export default schema
