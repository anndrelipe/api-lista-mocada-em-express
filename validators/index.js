export function inList(lista, item) {
    return lista.includes(item) 
}

export const requiredParams = (...params) => {
    let result = false
    params.map((item) => {
        if (!item === true) {
            result = true
        } 
    })
    return result
} 
