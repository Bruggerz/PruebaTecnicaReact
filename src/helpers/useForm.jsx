import { useState } from "react";

/**
 * Configuración de hook inicial para rescatar valores del formulario
 */

export const useForm = (initialState)=>{
    const [values, setValues] = useState(initialState)
    const handleInputChange=({target})=>{
        setValues({...values,[target.name]: target.value})
    };
    return [values,handleInputChange, setValues]
};